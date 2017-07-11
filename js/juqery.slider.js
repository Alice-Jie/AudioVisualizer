/*!
 * jQuery Slider plugin v0.1.0
 * project:
 * - https://github.com/Alice-Jie/4K-Circle-Audio-Visualizer
 * - https://git.oschina.net/Alice_Jie/circleaudiovisualizer
 * - http://steamcommunity.com/sharedfiles/filedetails/?id=921617616
 * @license MIT licensed
 * @author Alice
 * @date 2017/07/07
 */

(function (global, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], function ($) {
            return factory($, global, global.document, global.Math);
        });
    } else if (typeof exports === "object" && exports) {
        module.exports = factory(require('jquery'), global, global.document, global.Math);
    } else if (global.layui && layui.define) {
        layui.define('jquery', function (exports) {
            exports(factory(layui.jquery, global, global.document, global.Math));
        });
    } else {
        factory(jQuery, global, global.document, global.Math);
    }
})(typeof window !== 'undefined' ? window : this, function ($, window, document, Math, undefined) {

    'use strict';

    //兼容requestAnimFrame、cancelAnimationFrame
    //--------------------------------------------------------------------------------------------------------------

    (function () {
        let lastTime = 0;
        let vendors = ['ms', 'moz', 'webkit', 'o'];
        for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function (callback, element) {
                let currTime = new Date().getTime();
                let timeToCall = Math.max(0, 16 - (currTime - lastTime));
                let id = window.setTimeout(function () {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
    }());

    //私有变量
    //--------------------------------------------------------------------------------------------------------------

    let canvas;                       // canvas对象
    let context;                      // context对象
    let canvasWidth, canvasHeight;    // canvas宽度和高度
    let originX, originY;             // 原点位置

    let prevImg = new Image(),        // 上张图片对象
        currantImg = new Image();     // 当前图片对象
    let prevCanvas, currantCanvas;    // 离屏Canvas
    let prevContext, currantContext;  // 离屏Context

    let imgList = [];                 // 图片绝对路径数组
    let imgIndex = 0,                 // 图片索引
        oldIndex = 0;                 // 旧的索引
    let userColor = '255,255,255',    // 用户自定义颜色
        userImg = '';                 // 用户自定义图片路径

    let video = document.createElement('video');  // 视频对象
    let videoList = [];                            // 视频数组
    let videoIndex = 0;                            // 视频索引
    let userVideo = '';                            // 用户视频
    let myVideoListLength;                          // 视频列表长度


    let timer = null,        // 切换计时器
        effectTimer = null;  // 特效计时器

    //私有方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     * 随机数组索引
     * 在0 ~ array.length之内随机生成索引
     *
     * @param {int}            index 当前数组索引
     * @param {Array|<string>} array 字符串数组
     */
    function randomIndex(index, array) {
        let old = index ? index : 0;
        index = Math.floor(Math.random() * (array.length));
        if (index === old) {
            index = randomIndex(index, array);
        }
        return index;
    }

    /**
     *  更新数组索引
     *  根据顺序/随机读取模式更新数组索引
     *
     *  @param {Array<*>} array    数组
     *  @param {int}      index    当前数组索引
     *  @param {boolean}  isRandom 是否随机读取
     *  @return 更新的索引值
     */
    function upDateIndex(array, index, isRandom) {
        if (array.length <= 0) {
            return -1;
        } else if (array.length === 1) {
            return 0;
        } else {
            if (isRandom) {
                // 如果数组长度只有2
                if (array.length === 2 && index === 0) {
                    return 1;
                } else if (array.length === 2 && index === 1) {
                    return 0;
                }
                // 随机读取
                index = randomIndex(index, array);
            } else {
                // 顺序读取
                index + 1 < array.length ? index++ : index = 0;
            }
            return index;
        }
    }

    /**
     * 获取视频索引
     *
     *  @param {Array<*>} array    数组
     *  @param {int}      index    当前数组索引
     *  @return 索引对象
     */
    function getVideoIndex(array, index) {
        if (array.length <= 0) {
            return -1;
        } else if (array.length === 1) {
            return 0;
        } else {
            let prev = index, currant = index, next = index;
            prev === 0 ? prev = array.length - 1 : prev--;
            next === array.length - 1 ? next = 0 : next++;
            return {
                prevIndex: prev,
                currantIndex: currant,
                nextIndex: next
            };
        }
    }

    /**
     * 根据中心点坐标获取左上角坐标
     *
     * @param  {float} centerX 中心点坐标X
     * @param  {float} centerY 中心点坐标Y
     * @param  {float} width   image宽度
     * @param  {float} height  image高度
     * @return {Object} 坐标对象
     */
    function getXY(centerX, centerY, width, height) {
        return {
            'x': centerX - width / 2,
            'y': centerY - height / 2
        };
    }

    /**
     * 根据图片大小获取缩放
     *
     * @param  {Object} img image对象
     * @return {Object} 缩放对象
     */
    function getScaling(img) {
        return {
            'widthScaling': img.width / canvasWidth,
            'heightScaling': img.height / canvasHeight
        };
    }

    /** 停止切换特效计时器 */
    function stopEffectTimer() {
        if (effectTimer) {
            context.globalAlpha = 1;
            cancelAnimationFrame(effectTimer);
        }
    }

    // Canvas
    //-------

    /** 覆盖特效 */
    function canvasCover() {
        let currantWidth = 0; // 当前图片宽度
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                // 重置不透明属性
                prevContext.globalAlpha = 1;
                currantContext.globalAlpha = 1;
                prevContext.drawImage(prevImg, 0, 0, canvasWidth, canvasHeight);
                currantContext.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                // 开始绘制动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (currantWidth < canvasWidth) {
                        // 绘制上张图片和当前图片
                        context.drawImage(prevCanvas, 0, 0, canvasWidth, canvasHeight);
                        context.drawImage(currantCanvas,
                            0, 0, currantWidth, canvasHeight,
                            0, 0, currantWidth, canvasHeight);
                        // 更新当前图片宽度
                        currantWidth += ~~(0.5 + canvasWidth / 50);
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 渐显特效 */
    function canvasFadeIn() {
        let opacity = 100;  // 不透明值
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                // 重置不透明属性
                prevContext.globalAlpha = 1;
                currantContext.globalAlpha = 1;
                prevContext.drawImage(prevImg, 0, 0, canvasWidth, canvasHeight);
                currantContext.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                // 开始绘制动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (opacity >= 0) {
                        // 清空prevCanvas内容
                        prevContext.clearRect(0, 0, canvasWidth, canvasHeight);
                        // 绘制prevCanvas
                        prevContext.save();
                        prevContext.globalAlpha = opacity / 100;
                        prevContext.drawImage(prevImg, 0, 0, canvasWidth, canvasHeight);
                        prevContext.restore();
                        // 绘制当前图片和上张图片
                        context.drawImage(currantCanvas, 0, 0, canvasWidth, canvasHeight);
                        context.drawImage(prevCanvas, 0, 0, canvasWidth, canvasHeight);
                        // 更新不透明值
                        opacity -= 2;
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        prevContext.globalAlpha = 1;
                        currantContext.globalAlpha = 1;
                        context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 渐隐特效 */
    function canvasFadeOut() {
        let opacity = 0;  // 不透明值
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                // 重置不透明属性
                prevContext.globalAlpha = 1;
                currantContext.globalAlpha = 1;
                prevContext.drawImage(prevImg, 0, 0, canvasWidth, canvasHeight);
                currantContext.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                // 开始绘制动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (opacity < 100) {
                        // 清空currantCanvas内容
                        currantContext.clearRect(0, 0, canvasWidth, canvasHeight);
                        // 绘制currantCanvas
                        currantContext.save();
                        currantContext.globalAlpha = opacity / 100;
                        currantContext.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                        currantContext.restore();
                        // 绘制上张图片和当前图片
                        context.drawImage(prevCanvas, 0, 0, canvasWidth, canvasHeight);
                        context.drawImage(currantCanvas, 0, 0, canvasWidth, canvasHeight);
                        // 更新透明值
                        opacity += 2;
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        prevContext.globalAlpha = 1;
                        currantContext.globalAlpha = 1;
                        context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 洗牌特效 */
    function canvasShuffle() {
        let prevWidth = 0, currantWidth = 0;  // 上张图片和当前图片宽度
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                prevContext.drawImage(prevImg, 0, 0, canvasWidth, canvasHeight);
                currantContext.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                // 开始绘制动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (prevWidth < canvasWidth) {
                        if (prevWidth <= originX) {
                            // 当前图片“向右移”，上张图片“向左移”
                            context.drawImage(currantCanvas,
                                0, 0, canvasWidth - currantWidth, canvasHeight,
                                currantWidth, 0, canvasWidth - currantWidth, canvasHeight);
                            context.drawImage(prevCanvas,
                                prevWidth, 0, canvasWidth - prevWidth, canvasHeight,
                                0, 0, canvasWidth - prevWidth, canvasHeight);
                        } else {
                            // 上张图片“向右移”，当前图片“向左移”
                            context.drawImage(prevCanvas,
                                canvasWidth - prevWidth, 0, prevWidth, canvasHeight,
                                0, 0, prevWidth, canvasHeight);
                            context.drawImage(currantCanvas,
                                0, 0, currantWidth, canvasHeight,
                                canvasWidth - currantWidth, 0, currantWidth, canvasHeight);
                        }
                        // 更新上张图片和当前图片宽度
                        prevWidth += ~~(0.5 + canvasWidth / 50);
                        currantWidth += ~~(0.5 + canvasWidth / 50);
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 滑动特效 */
    function canvasSlider() {
        let prevWidth = 0, currantWidth = 0;  // 上张图片和当前图片宽度
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                prevContext.drawImage(prevImg, 0, 0, canvasWidth, canvasHeight);
                currantContext.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                // 开始绘制动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (currantWidth < canvasWidth) {
                        // 绘制上张图片和当前图片
                        context.drawImage(currantCanvas,
                            canvasWidth - currantWidth, 0, currantWidth, canvasHeight,
                            0, 0, currantWidth, canvasHeight);
                        context.drawImage(prevCanvas,
                            0, 0, canvasWidth - prevWidth, canvasHeight,
                            prevWidth, 0, canvasWidth - prevWidth, canvasHeight);
                        // 更新上张图片和当前图片宽度
                        prevWidth += ~~(0.5 + canvasWidth / 50);
                        currantWidth += ~~(0.5 + canvasWidth / 50);
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 拉伸特效 */
    function canvasVerticalIn() {
        let currantWidth = 0;  // 当前图片宽度
        let currantX = getXY(originX, originY, currantWidth, canvasHeight).x;  // 当前图片X坐标
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                prevContext.drawImage(prevImg, 0, 0, canvasWidth, canvasHeight);
                currantContext.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                // 开始绘制动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (currantWidth <= canvasWidth) {
                        // 绘制上张图片和当前图片
                        context.drawImage(prevCanvas, 0, 0, canvasWidth, canvasHeight);
                        context.drawImage(currantCanvas, currantX + currantWidth / 2, 0, currantWidth, canvasHeight);
                        // 更新当前图片宽度和坐标X
                        currantWidth += ~~(0.5 + canvasWidth / 50);
                        currantX -= ~~(0.5 + canvasWidth / 50);
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 收缩特效 */
    function canvasVerticalOut() {
        let currantWidth = canvasWidth;  // 当前图片宽度
        let currantX = getXY(originX, originY, currantWidth, canvasHeight).x;  // 当前图片X坐标
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                // 重置不透明属性
                prevContext.globalAlpha = 1;
                currantContext.globalAlpha = 1;
                prevContext.drawImage(prevImg, 0, 0, canvasWidth, canvasHeight);
                currantContext.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                // 开始绘制动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (currantWidth > 0) {
                        // 绘制当前图片和上张图片
                        context.drawImage(currantCanvas, 0, 0, canvasWidth, canvasHeight);
                        context.drawImage(prevCanvas, currantX, 0, currantWidth, canvasHeight);
                        // 更新当前图片宽度和坐标X
                        currantWidth -= ~~(0.5 + canvasWidth / 50);
                        currantX += ~~(0.5 + originX / 50);
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 放大特效 */
    function canvasZoomIn() {
        // 当前图片宽度和高度
        let currantWidth = 0, currantHeight = 0;
        // 当前图片XY坐标
        let currantX = getXY(originX, originY, currantWidth, currantHeight).x;
        let currantY = getXY(originX, originY, currantWidth, currantHeight).y;
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                prevContext.drawImage(prevImg, 0, 0, canvasWidth, canvasHeight);
                currantContext.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                // 开始绘制动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (currantWidth <= canvasWidth && currantHeight <= canvasWidth) {
                        // 绘制上张图片和当前图片
                        context.drawImage(prevCanvas, 0, 0, canvasWidth, canvasHeight);
                        context.drawImage(currantCanvas, currantX + currantWidth / 2, currantY + currantHeight / 2, currantWidth, currantHeight);
                        // 更新当前图片宽度和XY坐标
                        currantX -= ~~(0.5 + canvasWidth / 50);
                        currantY -= ~~(0.5 + canvasHeight / 50);
                        currantWidth += ~~(0.5 + canvasWidth / 50);
                        currantHeight += ~~(0.5 + canvasHeight / 50);
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 缩小特效 */
    function canvasZoomOut() {
        // 当前图片宽度和高度
        let currantWidth = canvasWidth, currantHeight = canvasHeight;
        // 图片XY坐标
        let currantX = 0;
        let currantY = 0;
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                prevContext.drawImage(prevImg, 0, 0, canvasWidth, canvasHeight);
                currantContext.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                // 开始绘制动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (currantWidth > 0 && currantHeight > 0) {
                        // 绘制当前图片和上张图片
                        context.drawImage(currantCanvas, 0, 0, canvasWidth, canvasHeight);
                        context.drawImage(prevCanvas, currantX, currantY, currantWidth, currantHeight);
                        // 更新当前图片宽度和XY坐标
                        currantX += ~~(0.5 + originX / 50);
                        currantY += ~~(0.5 + originY / 50);
                        currantWidth -= ~~(0.5 + canvasWidth / 50);
                        currantHeight -= ~~(0.5 + canvasHeight / 50);
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    // Image
    //------

    /** 覆盖特效 */
    function imgCover() {
        let currantLeft = -100; // 当前图片left值百分比
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                // 初始化CSS
                $(prevImg).css({
                    'top': 0,
                    'left': 0,
                    'opacity': 1,
                    'z-index': -2
                });
                $(currantImg).css({
                    'top': 0,
                    'left': 0 - canvasWidth,
                    'opacity': 1,
                    'z-index': -1
                });
                // 开始CSS动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (currantLeft <= 0) {
                        $(currantImg).css('left', currantLeft + '%');  // 当前图片向右移动
                        currantLeft += 2;  // 更新当前图片left值百分比
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        $(currantImg).css('left', 0 + 'px');
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 渐显特效 */
    function imgFadeIn() {
        let opacity = 100;  // 不透明值
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                // 初始化CSS
                $(prevImg).css({
                    'top': 0,
                    'left': 0,
                    'opacity': 0,
                    'z-index': -1
                });
                $(currantImg).css({
                    'top': 0,
                    'left': 0,
                    'opacity': 1,
                    'z-index': -2
                });
                // 开始CSS动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (opacity >= 0) {
                        $(prevImg).css('opacity', opacity / 100);  // 更新当前图片不透明值
                        opacity -= 2;  // 更新不透明值
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        $(currantImg).css('opacity', 1);
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 渐隐特效 */
    function imgFadeOut() {
        let opacity = 0;  // 不透明值
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                // 初始化CSS
                $(prevImg).css({
                    'top': 0,
                    'left': 0,
                    'opacity': 1,
                    'z-index': -2
                });
                $(currantImg).css({
                    'top': 0,
                    'left': 0,
                    'opacity': 0,
                    'z-index': -1
                });
                // 开始CSS动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (opacity <= 100) {
                        $(currantImg).css('opacity', opacity / 100);  // 更新上张图片不透明值
                        opacity += 2;  // 更新不透明值
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        $(currantImg).css('opacity', 1);
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 洗牌特效 */
    function imgShuffle() {
        // 上张图片和当前图片left值百分比
        let prevLeft = 0, currantLeft = 0;
        let animationStage = 1; // 动画状态
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                // 初始化CSS
                $(prevImg).css({
                    'top': 0,
                    'left': 0,
                    'opacity': 1,
                    'z-index': -1
                });
                $(currantImg).css({
                    'top': 0,
                    'left': 0,
                    'opacity': 1,
                    'z-index': -2
                });
                // 开始CSS动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (animationStage !== 3) {
                        if (animationStage === 1 && currantLeft < 50) {
                            // 第一阶段：当前图片向右移动，上张图片向左移动，当前动画left = 50%切换第二阶段
                            $(prevImg).css('left', prevLeft + '%');
                            $(currantImg).css('left', currantLeft + '%');
                            // 更新上张图片和当前图片left值百分比
                            prevLeft -= 2;
                            currantLeft += 2;
                        } else {
                            animationStage = 2;
                            // 交换上张图片和当前图片叠加顺序
                            $(prevImg).css('z-index', -2);
                            $(currantImg).css('z-index', -1);
                            if (animationStage === 2 && currantLeft > 0) {
                                // 第二阶段：当前图片向左移动，上张图片向右移动，当前图片left = 0%结束动画
                                $(prevImg).css('left', prevLeft + '%');
                                $(currantImg).css('left', currantLeft + '%');
                                // 更新上张图片和当前图片left值百分比
                                prevLeft += 2;
                                currantLeft -= 2;
                            } else {
                                animationStage = 3;
                            }
                        }
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        $(currantImg).css('left', 0 + 'px');
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 滑动特效 */
    function imgSlider() {
        // 上张图片和当前图片left值百分比
        let prevLeft = 0, currantLeft = -100;
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                // 初始化CSS
                $(prevImg).css({
                    'top': 0,
                    'left': 0,
                    'opacity': 1,
                    'z-index': -2
                });
                $(currantImg).css({
                    'top': 0,
                    'left': 0 - canvasWidth,
                    'opacity': 1,
                    'z-index': -1
                });
                // 开始CSS动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (currantLeft <= 0) {
                        // 上张图片和当前图片向右移动
                        $(prevImg).css('left', prevLeft + '%');
                        $(currantImg).css('left', currantLeft + '%');
                        // 更新上张图片和当前图片left值百分比
                        prevLeft += 2;
                        currantLeft += 2;
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        $(currantImg).css('left', 0 + 'px');
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 拉伸特效 */
    function imgVerticalIn() {
        let currantWidth = 0;  // 当前图片宽度
        let currantLeft = getXY(originX, originY, currantWidth, canvasHeight).x;  // 当前图片left值
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                // 初始化CSS
                $(prevImg).css({
                    'top': 0,
                    'left': 0,
                    'opacity': 1,
                    'z-index': -2
                });
                $(currantImg).css({
                    'top': 0,
                    'left': 0,
                    'opacity': 1,
                    'z-index': -1
                });
                // 开始CSS动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (currantWidth < canvasWidth) {
                        // 当前图片宽度从屏幕中央向左右拉伸
                        $(currantImg).css({
                            'width': currantWidth,
                            'left': currantLeft
                        });
                        // 更新当前图片宽度和left值
                        currantWidth += canvasWidth / 50;
                        currantLeft -= originX / 50;
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        $(currantImg).css({
                            'width': canvasWidth,
                            'left': 0
                        });
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 收缩特效 */
    function imgVerticalOut() {
        let prevWidth = canvasWidth;  // 上张图片宽度
        let prevLeft = getXY(originX, originY, prevWidth, canvasHeight).x;  // 上张图片left值
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                // 初始化CSS
                $(prevImg).css({
                    'top': 0,
                    'left': 0,
                    'opacity': 1,
                    'z-index': -1
                });
                $(currantImg).css({
                    'top': 0,
                    'left': 0,
                    'opacity': 1,
                    'z-index': -2
                });
                // 开始CSS动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (prevWidth > 0) {
                        // 上张图片宽度向中央收缩
                        $(prevImg).css({
                            'width': prevWidth,
                            'left': prevLeft
                        });
                        // 更新当前图片宽度和left值
                        prevWidth -= canvasWidth / 50;
                        prevLeft += originX / 50;
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        $(currantImg).css('z-index', -1);
                        $(prevImg).css({
                            'z-index': -2,
                            'width': canvasWidth,
                            'left': 0
                        });
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 放大特效 */
    function imgZoomIn() {
        // 当前图片宽度和高度
        let currantWidth = 0, currantHeight = 0;
        // 当前图片left值和top值
        let currantLeft = getXY(originX, originY, currantWidth, currantHeight).x;
        let currantTop = getXY(originX, originY, currantWidth, currantHeight).y;
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                // 初始化CSS
                $(prevImg).css({
                    'top': 0,
                    'left': 0,
                    'opacity': 1,
                    'z-index': -2
                });
                $(currantImg).css({
                    'top': 0,
                    'left': 0,
                    'opacity': 1,
                    'z-index': -1
                });
                // 开始CSS动画
                effectTimer = requestAnimationFrame(function animal() {
                    // 当前图片从屏幕中央向四周放大
                    if (currantWidth <= canvasWidth && currantHeight <= canvasWidth) {
                        $(currantImg).css({
                            'width': currantWidth,
                            'height': currantHeight,
                            'left': currantLeft,
                            'top': currantTop
                        });
                        // 更新当前图片宽度、left值和top值
                        currantLeft -= originX / 50;
                        currantTop -= originY / 50;
                        currantWidth += canvasWidth / 50;
                        currantHeight += canvasHeight / 50;
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        $(currantImg).css({
                            'width': currantWidth,
                            'height': currantHeight,
                            'left': 0,
                            'top': 0
                        });
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 缩小特效 */
    function imgZoomOut() {
        // 上张图片宽度和高度
        let prevWidth = canvasWidth, prevHeight = canvasHeight;
        // 上张图片left值和top值
        let prevLeft = 0;
        let prevTop = 0;
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                // 初始化CSS
                $(prevImg).css({
                    'top': 0,
                    'left': 0,
                    'opacity': 1,
                    'z-index': -1
                });
                $(currantImg).css({
                    'top': 0,
                    'left': 0,
                    'opacity': 1,
                    'z-index': -2
                });
                // 开始CSS动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (prevWidth + canvasWidth / 50 > 0 && prevHeight + canvasWidth / 50 > 0) {
                        // 当前图片向屏幕中央收缩
                        $(prevImg).css({
                            'width': prevWidth,
                            'height': prevHeight,
                            'left': prevLeft,
                            'top': prevTop
                        });
                        // 更新上张图片宽度、left值和top值
                        prevLeft += originX / 50;
                        prevTop += originY / 50;
                        prevWidth -= canvasWidth / 50;
                        prevHeight -= canvasHeight / 50;
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        $(currantImg).css('z-index', -1);
                        $(prevImg).css({
                            'z-index': -2,
                            'width': canvasWidth,
                            'height': canvasHeight,
                            'left': 0,
                            'top': 0
                        });
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    //构造函数和公共方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     *  初始化Slider
     *
     * @param {!Object} el      被选中的节点
     * @param {Object}  options 参数对象
     */
    let Slider = function (el, options) {
        this.$el = $(el);

        this.sliderStyle = options.sliderStyle;    // 背景切换模式
        this.readStyle = options.readStyle;        // 读取模式
        this.effect = options.effect;              // 时间单位
        this.timeUnits = options.timeUnits;        // 切换特效
        this.pauseTime = options.pauseTime;        // 动画切换速度
        this.imgFit = options.imgFit;              // IMG适应方式
        this.imgBGColor = options.imgBGColor;      // IMG背景颜色
        this.progress = options.progress;          // 视频进度
        this.isPlay = options.isPlay;              // 是否播放Video
        this.volume = options.volume;              // Video音量
        this.videoFit = options.videoFit;          // Video适应方式
        this.videoBGColor = options.videoBGColor;  // Video背景颜色
        this.isRotate3D = options.isRotate3D;      // 是否3D旋转

        // 初始化图片源
        prevImg.src = 'img/bg.png';
        currantImg.src = 'img/bg.png';

        // 创建并初始化canvas
        canvas = document.createElement('canvas');
        canvas.id = 'canvas-slider'; // canvas ID
        $(canvas).css({
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'z-index': -3
        });  // canvas CSS
        canvasWidth = canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        canvasHeight = canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        context = canvas.getContext('2d');
        $(this.$el).append(canvas);

        // 获取中心点位置
        originX = canvasWidth * 0.5;
        originY = canvasHeight * 0.5;

        // 创建并初始化离屏canvas
        prevCanvas = document.createElement('canvas');
        currantCanvas = document.createElement('canvas');
        prevCanvas.width = canvasWidth;
        currantCanvas.width = canvasWidth;
        prevCanvas.height = canvasHeight;
        currantCanvas.height = canvasHeight;
        prevContext = prevCanvas.getContext('2d');
        currantContext = currantCanvas.getContext('2d');

        // 初始化prevImg、currantImg属性
        prevImg.id = 'img-prev';
        currantImg.id = 'img-currant';
        $(prevImg).css({
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'width': canvasWidth,
            'height': canvasHeight,
            'object-fit': this.imgFit,
            'background-color': 'rgb(' + this.imgBGColor + ')',
            'z-index': -2
        });  // prevImg CSS
        $(currantImg).css({
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'width': canvasWidth,
            'height': canvasHeight,
            'object-fit': this.imgFit,
            'background-color': 'rgb(' + this.imgBGColor + ')',
            'z-index': -1
        });  // currantImg CSS

        // 初始化Video属性
        video.width = canvasWidth;
        video.height = canvasHeight;
        video.autoplay = 'video';
        video.loop = 'loop';
        $(video).css({
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'object-fit': this.videoFit,
            'background-color': 'rgb(' + this.videoBGColor + ')',
            'z-index': 0
        });  // Video CSS

        // 默认开启
        this.setupPointerEvents();
    };

    // 默认参数
    Slider.DEFAULTS = {
        sliderStyle: 'css',           // 背景切换模式
        readStyle: 'sequential',      // 读取模式
        timeUnits: 'sec',             // 时间单位
        pauseTime: 1,                 // 背景停留时间
        effect: 'none',               // 切换特效
        imgFit: 'fill',               // IMG适应方式
        imgBGColor: '255,255,255',    // IMG背景颜色
        progress: 0,                   // 视频进度
        isPlay: true,                 // 是否播放Video
        volume: 0.75,                   // Video音量
        videoFit: 'fill',             // Video适应方式
        videoBGColor: '255,255,255',  // Video背景颜色
        isRotate3D: false             // 是否3D旋转
    };

    // 公共方法
    Slider.prototype = {

        // 面向内部方法
        //-----------------------------------------------------------

        /** 获取停留时间 */
        getPauseTime: function () {
            if (this.sliderStyle === 'css' || this.effect === 'none') {
                switch (this.timeUnits) {
                    case 'sec':
                        return this.pauseTime * 1000;
                    case 'min':
                        return this.pauseTime * 1000 * 60;
                    case 'hour':
                        return this.pauseTime * 1000 * 60 * 60;
                    default:
                        return this.pauseTime * 1000;
                }
            } else {
                switch (this.timeUnits) {
                    case 'sec':
                        return 5000 + this.pauseTime * 1000;
                    case 'min':
                        return 5000 + this.pauseTime * 1000 * 60;
                    case 'hour':
                        return 5000 + this.pauseTime * 1000 * 60 * 60;
                    default:
                        return 5000 + this.pauseTime * 1000;
                }
            }
        },

        /** 改变背景图片 */
        changeBackgroud: function () {
            if (imgList.length <= 0) {
                // 如果文件夹为空
                if (userImg) {
                    $(this.$el).css("background-image", "url('file:///" + userImg + "')");
                } else {
                    $(this.$el).css("background-image", "url(img/bg.png)");
                }
                imgIndex = 0;
            }
            else if (imgList.length === 1) {
                // 如果文件只有一张图片
                $(this.$el).css("background-image", "url('file:///" + imgList[0] + "')");
                imgIndex = 0;
            } else {
                $(this.$el).css("background-image", "url('file:///" + imgList[imgIndex] + "')");
            }
        },

        /** 改变当前图片 */
        changeImage: function () {
            $(currantImg).css('z-index', -1);
            $(prevImg).css('z-index', -2);
            if (imgList.length <= 0) {
                // 如果文件夹为空
                if (userImg) {
                    $(this.$el).css("background-image", "url('file:///" + userImg + "')");
                    prevImg.src = 'file:///' + userImg;
                    currantImg.src = 'file:///' + userImg;
                } else {
                    $(this.$el).css("background-image", "url(img/bg.png)");
                    prevImg.src = 'img/bg.png';
                    currantImg.src = 'img/bg.png';
                }
                imgIndex = 0;
            }
            else if (imgList.length === 1) {
                // 如果文件只有一张图片
                imgIndex = 0;
                $(this.$el).css("background-image", "url('file:///" + imgList[0] + "')");
                prevImg.src = 'file:///' + imgList[imgIndex];
                currantImg.src = 'file:///' + imgList[imgIndex];
            } else {
                // 读取下一张图片
                $(this.$el).css("background-image", "url('file:///" + imgList[imgIndex] + "')");
                prevImg.src = 'file:///' + imgList[oldIndex];
                currantImg.src = 'file:///' + imgList[imgIndex];
            }
        },

        /** Canvas绘制背景图片 */
        drawBackgroud: function () {
            if (imgList.length <= 0) {
                // 如果文件夹为空
                if (userImg) {
                    $(this.$el).css("background-image", "url('file:///" + userImg + "')");
                    prevImg.src = 'file:///' + userImg;
                    currantImg.src = 'file:///' + userImg;
                    currantImg.onload = function () {
                        context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                    }
                } else {
                    $(this.$el).css("background-image", "url(img/bg.png)");
                    prevImg.src = 'img/bg.png';
                    currantImg.src = 'img/bg.png';
                    currantImg.onload = function () {
                        context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                    }
                }
                imgIndex = 0;
            }
            else if (imgList.length === 1) {
                // 如果文件只有一张图片
                imgIndex = 0;
                $(this.$el).css("background-image", "url('file:///" + imgList[0] + "')");
                prevImg.src = 'file:///' + imgList[imgIndex];
                currantImg.src = 'file:///' + imgList[imgIndex];
                currantImg.onload = function () {
                    context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                }
            } else {
                // 读取下一张图片
                $(this.$el).css("background-image", "url('file:///" + imgList[imgIndex] + "')");
                prevImg.src = 'file:///' + imgList[oldIndex];
                currantImg.src = 'file:///' + imgList[imgIndex];
                currantImg.onload = function () {
                    context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                }
            }
        },

        /**
         *  开始背景3D转换
         *
         *  @param {float} ex        鼠标X轴坐标
         *  @param {float} ey        鼠标Y轴坐标
         */
        startSliderRotate3D: function (ex, ey) {
            let x_multiple = (ex / canvasWidth) * 2 - 1;
            let y_multiple = (ey / canvasHeight) * 2 - 1;
            $(this.$el).css('transform',
                'scale(1.06, 1.06)'
                + 'perspective(' + (3 - Math.abs(x_multiple + y_multiple)) + 'em)'
                + 'translate(' + x_multiple + '%,' + y_multiple + '%)'
                + 'rotate3d(' + -y_multiple + ',' + x_multiple + ',0,' + 0.07 + 'deg)'
            );
        },

        /** 停止背景3D转换 */
        stopSliderRotate3D: function () {
            $(this.$el).css('transform', 'none');
        },

        /** 设置交互事件 */
        setupPointerEvents: function () {
            let that = this;

            /** 鼠标移动事件 */
            $(this.$el).on('mousemove', function (e) {
                if (that.isRotate3D) {
                    that.startSliderRotate3D(e.clientX, e.clientY);
                }
            });

            // 窗体改变事件
            $(window).on('resize', function () {
                // 改变宽度和高度
                canvasWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                canvasHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                // 获取最小宽度以及原点
                originX = canvasWidth * this.offsetX;
                originY = canvasHeight * this.offsetY;
            });

        },

        // 面向外部方法
        //-----------------------------------------------------------

        /**
         * 获取用户自定义的背景颜色
         * 如果颜色不存在默认为空字符串
         *
         * @param {string} color 用户背景颜色
         */
        setUserColor: function (color) {
            if (color) {
                userColor = color;
            } else {
                userColor = '255,255,255';
            }
        },

        /**
         * 获取用户自定义的图片地址
         * 如果路径不存在默认为空字符串
         *
         * @param {string} img 用户图片路径
         */
        setUserImg: function (img) {
            if (img) {
                userImg = img;
            } else {
                userImg = '';
            }
        },

        /**
         * 获取用户自定义的视频
         * 如果路径不存在默认为空字符串
         *
         * @param {string} video 用户视频路径
         */
        setUserVideo: function (video) {
            if (video) {
                userVideo = video;
            } else {
                userVideo = '';
            }
        },

        // CSS
        //----

        /** 设置background-color为用户颜色 */
        cssUserColor: function () {
            if (userColor) {
                this.$el.css({
                    'background-image': 'none',
                    'background-color': 'rgb(' + userColor + ')'
                });
            } else {
                this.$el.css({
                    'background-image': 'url(img/bg.png)',
                    'background-color': 'rgb(255, 255, 255)'
                });
            }
        },

        /** 设置background-image为用户图片 */
        cssUserImg: function () {
            if (userImg) {
                this.$el.css({
                    'background-image': "url('file:///" + userImg + "')",
                    'background-color': 'rgb(255, 255, 255)'
                });
            } else {
                this.$el.css({
                    'background-image': 'url(img/bg.png)',
                    'background-color': 'rgb(255, 255, 255)'
                });
            }
        },

        /** 设置background-image为默认图片 */
        cssDefaultImg: function () {
            this.$el.css({
                'background-image': 'url(img/bg.png)',
                'background-color': 'rgb(255, 255, 255)'
            });
        },

        // Image
        //------

        /** 添加上张图片和当前图片 */
        addImg: function () {
            $(this.$el).append(prevImg);
            $(this.$el).append(currantImg);
        },

        /** 删除上张图片和当前图片 */
        delImg: function () {
            $(prevImg).remove();
            $(currantImg).remove();
        },

        /** 设置当前图片为用户图片 */
        imgSrcUserImg: function () {
            if (userImg) {
                currantImg.src = 'file:///' + userImg;
            } else {
                currantImg.src = 'img/bg.png';
            }
        },

        /** 设置当前图片为默认图片 */
        imgSrcDefaultImg: function () {
            currantImg.src = 'img/bg.png';
        },

        // Canvas
        //-------

        /** 绘制用户图片 */
        drawUserImg: function () {
            if (userImg) {
                currantImg.src = 'file:///' + userImg;
                currantImg.onload = function () {
                    context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                };
            } else {
                currantImg.src = 'img/bg.png';
                currantImg.onload = function () {
                    context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                };
            }
        },

        /** 绘制默认图片 */
        drawDefaultImg: function () {
            currantImg.src = 'img/bg.png';
            currantImg.onload = function () {
                context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
            };
        },

        /** 清空Canvas内容 */
        clearCanvas: function () {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
        },


        /**
         * 更新imgList
         * - 载入/删除/添加/修改（删除 - 添加）都会初始化状态
         * - 文件夹为空时使用用户自定义的图片路径
         * - 用户为自定义的图片时使用原始图片路径
         *
         *@param {Array<string>} currentFiles 当前文件路径数组
         */
        updateImgList: function (currentFiles) {
            currentFiles.length <= 0 ? imgList = [] : imgList = currentFiles;
            imgIndex = 0;  // 初始化图片索引
        },

        /** 改变滑动模式 */
        changeSliderStyle: function () {
            switch (this.sliderStyle) {
                case 'css':
                    this.clearCanvas();
                    this.delImg();
                    break;
                case 'image':
                    this.clearCanvas();
                    this.addImg();
                    break;
                case 'canvas':
                    this.delImg();
                    break;
            }
        },

        /** 使用imgList当前图片 */
        changeSlider: function () {
            switch (this.sliderStyle) {
                case 'css':
                    this.changeBackgroud();
                    break;
                case 'image':
                    this.changeImage();
                    break;
                case 'canvas':
                    this.drawBackgroud();
                    break;
            }
        },

        /** 停止背景切换计时器 */
        stopSliderTimer: function () {
            if (timer) {
                clearTimeout(timer);
            }
            this.clearCanvas();
            this.delImg();
        },

        /** 开始背景切换计时器 */
        runSliderTimer: function () {
            clearTimeout(timer);
            timer = setTimeout(
                ()=> {
                    if (imgList.length > 1) {
                        // 更新图片列表
                        oldIndex = imgIndex;
                        switch (this.readStyle) {
                            case 'sequential':
                                imgIndex = upDateIndex(imgList, imgIndex, false);
                                break;
                            case 'random':
                                imgIndex = upDateIndex(imgList, imgIndex, true);
                                break;
                            default:
                                imgIndex = upDateIndex(imgList, imgIndex, false);
                        }
                        // 选择特效
                        if (this.sliderStyle === 'image') {
                            switch (this.effect) {
                                case 'none':
                                    stopEffectTimer();
                                    break;
                                case 'cover':
                                    imgCover();
                                    break;
                                case 'fadeIn':
                                    imgFadeIn();
                                    break;
                                case 'fadeOut':
                                    imgFadeOut();
                                    break;
                                case 'shuffle':
                                    imgShuffle();
                                    break;
                                case 'slider':
                                    imgSlider();
                                    break;
                                case 'vertIn':
                                    imgVerticalIn();
                                    break;
                                case 'vertOut':
                                    imgVerticalOut();
                                    break;
                                case 'zoomIn':
                                    imgZoomIn();
                                    break;
                                case 'zoomOut':
                                    imgZoomOut();
                                    break;
                                default:
                                    stopEffectTimer();
                            }
                        } else if (this.sliderStyle === 'canvas') {
                            switch (this.effect) {
                                case 'none':
                                    stopEffectTimer();
                                    break;
                                case 'cover':
                                    canvasCover();
                                    break;
                                case 'fadeIn':
                                    canvasFadeIn();
                                    break;
                                case 'fadeOut':
                                    canvasFadeOut();
                                    break;
                                case 'shuffle':
                                    canvasShuffle();
                                    break;
                                case 'slider':
                                    canvasSlider();
                                    break;
                                case 'vertIn':
                                    canvasVerticalIn();
                                    break;
                                case 'vertOut':
                                    canvasVerticalOut();
                                    break;
                                case 'zoomIn':
                                    canvasZoomIn();
                                    break;
                                case 'zoomOut':
                                    canvasZoomOut();
                                    break;
                                default:
                                    stopEffectTimer();
                            }
                        }
                    }
                    this.changeSlider();
                    this.runSliderTimer();
                }, this.getPauseTime());
        },

        /** 开始背景切换 */
        startSlider: function () {
            this.changeSliderStyle();
            this.changeSlider();
            this.runSliderTimer();
        },

        // Video
        //-------

        /** 添加视频 */
        addVideo: function () {
            $(this.$el).append(video);
            this.getVideoStr(videoIndex);
            $(video).css({
                'object-fit': this.videoFit,
                'background-color': 'rgb(' + this.videoBGColor + ')'
            });
        },

        /** 删除视频 */
        delVideo: function () {
            $(video).remove();
            video.src = '';
        },

        /** 读取videoList */
        getVideoList: function () {
            videoList = myVideoList;
            myVideoListLength = videoList.length;
            for (let i = 0; i < videoList.length; i++) {
                videoList[i] = 'video/' + videoList[i];
            }
        },

        /** 读取视频源 */
        getVideoStr: function (index) {
            if (videoList) {
                if (index >= 0 && index < videoList.length) {
                    video.src = videoList[index];
                } else {
                    video.src = videoList[0] || 'video/test.webm';
                }
            }
        },

        /** 设置当前视频为用户视频并添加至视频列表 */
        videoSrcUserVideo: function () {
            if (userVideo) {
                video.src = 'file:///' + userVideo;
                if (videoList.length === myVideoListLength + 1) {
                    videoList[videoList.length - 1] = video.src;
                } else if (videoList.length === myVideoListLength) {
                    videoList.push(video.src);
                    videoIndex = videoList.length - 1;
                }

            } else {
                video.src = videoList[0] || 'video/test.webm';
            }
        },

        /** 设置当前视频为默认视频 */
        videoSrcDefaultVideo: function () {
            video.src = videoList[0] || 'video/test.webm';
        },

        /** 上一个视频 */
        prevVideo: function () {
            if (videoList.length > 1) {
                videoIndex = getVideoIndex(videoList, videoIndex).prevIndex;
                this.getVideoStr(videoIndex);
            }
        },

        /** 下一个视频 */
        nextVideo: function () {
            if (videoList) {
                videoIndex = getVideoIndex(videoList, videoIndex).nextIndex;
                this.getVideoStr(videoIndex);
            }
        },

        /** 设置视频进度 */
        setVideoProgress: function (progress) {
            if (video.src && video.duration) {
                video.currentTime = video.duration * progress;
            }
        },

        /** 播放视频 */
        playVideo: function () {
            if (video.src) {
                video.play();
            }
        },

        /** 暂停视频 */
        pauseVideo: function () {
            if (video.src) {
                video.pause();
            }
        },

        /**
         *  设置视频音量
         *
         *  @param {float} volume 音量
         */
        setVideoVolume: function (volume) {
            if (video.src) {
                video.volume = volume;
            }
        },

        /** 移除canvas */
        destroy: function () {
            this.$el
                .off('#canvas-slider')
                .removeData('date');

            this.cssSrcDefaultImg();
            this.delImg();
            this.delVideo();
            $('#canvas-slider').remove();
        },

        /**
         * 修改参数
         * @param {string} property 属性名
         * @param {*}      value    属性对应值
         */
        set: function (property, value) {
            switch (property) {
                case 'imgFit':
                    this[property] = value;
                    $(prevImg).css('object-fit', this[property]);
                    $(currantImg).css('object-fit', this[property]);
                    break;
                case 'videoFit':
                    this[property] = value;
                    $(video).css('object-fit', this[property]);
                    break;
                case 'imgBGColor':
                    this[property] = value;
                    $(prevImg).css('background-color', 'rgb(' + this[property] + ')');
                    $(currantImg).css('background-color', 'rgb(' + this[property] + ')');
                    break;
                case 'videoBGColor':
                    this[property] = value;
                    $(video).css('background-color', 'rgb(' + this[property] + ')');
                    break;
                case 'readStyle':
                case 'effect':
                case 'pauseTime':
                case 'timeUnits':
                    this[property] = value;
                    break;
                case 'sliderStyle':
                    this[property] = value;
                    this.changeSliderStyle();
                    break;
                case 'progress':
                    this[property] = value;
                    this.setVideoProgress(this[property]);
                    break;
                case 'isPlay':
                    this[property] = value;
                    this.isPlay ? this.playVideo() : this.pauseVideo();
                    break;
                case 'volume':
                    this[property] = value;
                    this.setVideoVolume(this.volume);
                    break;
                case 'isRotate3D':
                    this[property] = value;
                    this.isRotate3D || this.stopSliderRotate3D();
                    break;
            }
        }

    };

    //定义Slider插件
    //--------------------------------------------------------------------------------------------------------------

    let old = $.fn.slider;

    $.fn.slider = function (option) {
        let args = (arguments.length > 1) ? Array.prototype.slice.call(arguments, 1) : undefined;

        return this.each(function () {
            let $this = $(this);
            let data = $this.data('slider');
            let options = $.extend({}, Slider.DEFAULTS, $this.data(), typeof option === 'object' && option);

            if (!data && typeof option === 'string') {
                return;
            }
            if (!data) {
                $this.data('slider', (data = new Slider(this, options)));
            }
            else if (typeof option === 'string') {
                Slider.prototype[option].apply(data, args);
            }
        });
    };

    $.fn.slider.Constructor = Slider;

    // 确保插件不冲突
    $.fn.slider.noConflict = function () {
        $.fn.slider = old;
        return this;
    };

});
