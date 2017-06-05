/**
 * jQuery Slider plugin v0.0.6
 * project: http://steamcommunity.com/sharedfiles/filedetails/?id=921617616&searchtext=
 * @license MIT licensed
 * @author Alice
 * @date 2017/05/28
 */

(function (global, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], function ($) {
            return factory($, global, global.document, global.Math);
        });
    } else if (typeof exports === "object" && exports) {
        module.exports = factory(require('jquery'), global, global.document, global.Math);
    } else {
        factory(jQuery, global, global.document, global.Math);
    }
})(typeof window !== 'undefined' ? window : this, function ($, window, document, Math, undefined) {

    'use strict';

    //兼容requestAnimFrame、cancelAnimationFrame
    //--------------------------------------------------------------------------------------------------------------

    (function () {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function () {
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

    var isRun = false;  // 状态锁

    var prevImg = new Image();      // 上张图片对象
    var currantImg = new Image();   // 当前图片对象
    var prevCanvas, currantCanvas;  // 离屏Canvas
    var prevContext, currantContext;

    var imgList = [];       // 图片绝对路径数组
    var imgIndex = 0;       // 图片索引
    var oldIndex = 0;       // 旧的索引

    var userImg = '';  // 用户自定义图片路径

    var timer = null;        // 切换计时器
    var effectTimer = null;  // 特效计时器

    var canvas;                     // canvas对象
    var context;                    // context对象
    var canvasWidth, canvasHeight;  // canvas宽度和高度

    var originX, originY;           // 原点位置

    //私有方法
    //--------------------------------------------------------------------------------------------------------------

    // 数组操作方法
    //-----------------------------------------------------------

    /**
     * 获取字符串对应的索引
     *@param {Array<string>} array 字符串数组
     *@param {string}        str 字符串
     *@return 字符串对应索引
     */
    function getIndex(array, str) {
        if (array.length <= 0) {
            return -1;
        }
        for (var i = 0; i < array.length; i++) {
            if (array[i] === str) {
                return i;
            }
        }
        return 0;
    }

    /**
     *  更新数组索引值
     *
     *  @param {Array<*>} array    数组
     *  @param {int}      index    当前数组索引值
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
                index = Math.floor(Math.random() * (array.length));
                if (index === array.length) {
                    index = array.length - 1;
                }
                // 如果读取到当前索引，重新读取
                while (index === old) {
                    index = Math.floor(Math.random() * (array.length));
                    if (index === array.length) {
                        index = array.length - 1;
                    }
                }
            } else {
                // 顺序读取
                index + 1 < array.length ? index++ : index = 0;
            }
            return index;
        }
    }

    // Canvas方法
    //-----------------------------------------------------------

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
     *根据图片大小获取缩放
     * @param  {Object} img image对象
     * @return {Object} 缩放对象
     */
    function getScaling(img) {
        return {
            'widthScaling': img.width / canvasWidth,
            'heightScaling': img.height / canvasHeight
        };
    }

    /** 覆盖特效 */
    function canvasCover() {
        var currantWidth = 0; // 当前图片宽度
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
        var opacity = 100;  // 不透明值
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
        var opacity = 0;  // 不透明值
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
        var prevWidth = 0, currantWidth = 0;  // 上张图片和当前图片宽度
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
        var prevWidth = 0, currantWidth = 0;  // 上张图片和当前图片宽度
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
        var currantWidth = 0;  // 当前图片宽度
        var currantX = getXY(originX, originY, currantWidth, canvasHeight).x;  // 当前图片X坐标
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
        var currantWidth = canvasWidth;  // 当前图片宽度
        var currantX = getXY(originX, originY, currantWidth, canvasHeight).x;  // 当前图片X坐标
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
        var currantWidth = 0, currantHeight = 0;
        // 当前图片XY坐标
        var currantX = getXY(originX, originY, currantWidth, currantHeight).x;
        var currantY = getXY(originX, originY, currantWidth, currantHeight).y;
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
        var currantWidth = canvasWidth, currantHeight = canvasHeight;
        // 图片XY坐标
        var currantX = 0;
        var currantY = 0;
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

    // img方法
    //-----------------------------------------------------------

    /** 覆盖特效 */
    function imgCover() {
        var currantLeft = -100; // 当前图片left值百分比
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
        var opacity = 100;  // 不透明值
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
        var opacity = 0;  // 不透明值
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
        var prevLeft = 0, currantLeft = 0;
        var animationStage = 1; // 动画状态
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
        var prevLeft = 0, currantLeft = -100;
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
        var currantWidth = 0;  // 当前图片宽度
        var currantLeft = getXY(originX, originY, currantWidth, canvasHeight).x;  // 当前图片left值
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
                        $(currantImg).css('width', currantWidth + 'px');
                        $(currantImg).css('left', currantLeft + 'px');
                        // 更新当前图片宽度和left值
                        currantWidth += canvasWidth / 50;
                        currantLeft -= originX / 50;
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        $(currantImg).css('width', canvasWidth + 'px');
                        $(currantImg).css('left', 0 + 'px');
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 收缩特效 */
    function imgVerticalOut() {
        var prevWidth = canvasWidth;  // 上张图片宽度
        var prevLeft = getXY(originX, originY, prevWidth, canvasHeight).x;  // 上张图片left值
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
                        $(prevImg).css('width', prevWidth + 'px');
                        $(prevImg).css('left', prevLeft + 'px');
                        // 更新当前图片宽度和left值
                        prevWidth -= canvasWidth / 50;
                        prevLeft += originX / 50;
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        $(currantImg).css('z-index', -1);
                        $(prevImg).css('z-index', -2);
                        $(prevImg).css('width', canvasWidth + 'px');
                        $(prevImg).css('left', 0 + 'px');
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 放大特效 */
    function imgZoomIn() {
        // 当前图片宽度和高度
        var currantWidth = 0, currantHeight = 0;
        // 当前图片left值和top值
        var currantLeft = getXY(originX, originY, currantWidth, currantHeight).x;
        var currantTop = getXY(originX, originY, currantWidth, currantHeight).y;
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
                        $(currantImg).css('width', currantWidth + 'px');
                        $(currantImg).css('height', currantHeight + 'px');
                        $(currantImg).css('left', currantLeft + 'px');
                        $(currantImg).css('top', currantTop + 'px');
                        // 更新当前图片宽度、left值和top值
                        currantLeft -= originX / 50;
                        currantTop -= originY / 50;
                        currantWidth += canvasWidth / 50;
                        currantHeight += canvasHeight / 50;
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        $(currantImg).css('width', canvasWidth + 'px');
                        $(currantImg).css('height', canvasHeight + 'px');
                        $(currantImg).css('left', 0 + 'px');
                        $(currantImg).css('top', 0 + 'px');
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    /** 缩小特效 */
    function imgZoomOut() {
        // 上张图片宽度和高度
        var prevWidth = canvasWidth, prevHeight = canvasHeight;
        // 上张图片left值和top值
        var prevLeft = 0;
        var prevTop = 0;
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
                        $(prevImg).css('width', prevWidth + 'px');
                        $(prevImg).css('height', prevHeight + 'px');
                        $(prevImg).css('left', prevLeft + 'px');
                        $(prevImg).css('top', prevTop + 'px');
                        // 更新上张图片宽度、left值和top值
                        prevLeft += originX / 50;
                        prevTop += originY / 50;
                        prevWidth -= canvasWidth / 50;
                        prevHeight -= canvasHeight / 50;
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        $(currantImg).css('z-index', -1);
                        $(prevImg).css('z-index', -2);
                        $(prevImg).css('width', canvasWidth + 'px');
                        $(prevImg).css('height', canvasHeight + 'px');
                        $(prevImg).css('left', 0 + 'px');
                        $(prevImg).css('top', 0 + 'px');
                        context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
            };
        };
    }

    // 计时器方法
    //-----------------------------------------------------------

    /** 改变背景图片 */
    function changeBackgroud() {
        if (imgList.length <= 0) {
            // 如果文件夹为空
            if (userImg) {
                $('body').css("background-image", "url('file:///" + userImg + "')");
            } else {
                $('body').css("background-image", "url(img/bg.png)");
            }
            imgIndex = 0;
        }
        else if (imgList.length === 1) {
            // 如果文件只有一张图片
            $('body').css("background-image", "url('file:///" + imgList[0] + "')");
            imgIndex = 0;
        } else {
            $('body').css("background-image", "url('file:///" + imgList[imgIndex] + "')");
        }
    }

    /** 改变当前图片 */
    function changeImage() {
        $(currantImg).css('z-index', -1);
        $(prevImg).css('z-index', -2);
        if (imgList.length <= 0) {
            // 如果文件夹为空
            if (userImg) {
                $('body').css("background-image", "url('file:///" + userImg + "')");
                prevImg.src = 'file:///' + userImg;
                currantImg.src = 'file:///' + userImg;
            } else {
                $('body').css("background-image", "url(img/bg.png)");
                prevImg.src = 'img/bg.png';
                currantImg.src = 'img/bg.png';
            }
            imgIndex = 0;
        }
        else if (imgList.length === 1) {
            // 如果文件只有一张图片
            imgIndex = 0;
            $('body').css("background-image", "url('file:///" + imgList[0] + "')");
            prevImg.src = 'file:///' + imgList[imgIndex];
            currantImg.src = 'file:///' + imgList[imgIndex];
        } else {
            // 读取下一张图片
            $('body').css("background-image", "url('file:///" + imgList[imgIndex] + "')");
            prevImg.src = 'file:///' + imgList[oldIndex];
            currantImg.src = 'file:///' + imgList[imgIndex];
        }
    }

    /** Canvas绘制背景图片 */
    function drawBackgroud() {
        if (imgList.length <= 0) {
            // 如果文件夹为空
            if (userImg) {
                $('body').css("background-image", "url('file:///" + userImg + "')");
                prevImg.src = 'file:///' + userImg;
                currantImg.src = 'file:///' + userImg;
                currantImg.onload = function () {
                    context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                }
            } else {
                $('body').css("background-image", "url(img/bg.png)");
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
            $('body').css("background-image", "url('file:///" + imgList[0] + "')");
            prevImg.src = 'file:///' + imgList[imgIndex];
            currantImg.src = 'file:///' + imgList[imgIndex];
            currantImg.onload = function () {
                context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
            }
        } else {
            // 读取下一张图片
            $('body').css("background-image", "url('file:///" + imgList[imgIndex] + "')");
            prevImg.src = 'file:///' + imgList[oldIndex];
            currantImg.src = 'file:///' + imgList[imgIndex];
            currantImg.onload = function () {
                context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
            }
        }
    }

    /**
     * 获取停留时间
     *
     *@param  {int}    sliderStyle 切换样式
     *@param  {string} effect      切换特效
     *@param  {int}    pauseTime   持续时间
     *@param  {string} timeUnits   时间单位
     *@return {int} 停留时间
     */
    function getPauseTime(sliderStyle, effect, pauseTime, timeUnits) {
        if (sliderStyle === 1 || effect === 'none') {
            switch (timeUnits) {
                case 'sec':
                    return pauseTime * 1000;
                case 'min':
                    return pauseTime * 1000 * 60;
                case 'hour':
                    return pauseTime * 1000 * 60 * 60;
                default:
                    return pauseTime * 1000;
            }
        } else {
            switch (timeUnits) {
                case 'sec':
                    return 5000 + pauseTime * 1000;
                case 'min':
                    return 5000 + pauseTime * 1000 * 60;
                case 'hour':
                    return 5000 + pauseTime * 1000 * 60 * 60;
                default:
                    return 5000 + pauseTime * 1000;
            }
        }
    }

    /**
     * 开始背景切换计时器
     *
     * @param {int}      readStyle   读取样式
     * @param {int}      sliderStyle 滑动样式
     * @param {string}   effect      特效选项
     * @param {Function} func        调用方法
     * @param {int}      millisec    间隔时间（毫秒为单位）
     */
    function runSliderTimer(readStyle, sliderStyle, effect, func, millisec) {
        clearTimeout(timer);
        timer = setTimeout(function () {
            if (imgList.length > 1) {
                // 更新图片列表
                oldIndex = imgIndex;
                switch (readStyle) {
                    case 1:
                        imgIndex = upDateIndex(imgList, imgIndex, false);
                        break;
                    case 2:
                        imgIndex = upDateIndex(imgList, imgIndex, true);
                        break;
                    default:
                        imgIndex = upDateIndex(imgList, imgIndex, false);
                }
                // 选择特效
                if (sliderStyle === 2) {
                    switch (effect) {
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
                } else if (sliderStyle === 3) {
                    switch (effect) {
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
            func(); // 改变或则绘制背景
            runSliderTimer(readStyle, sliderStyle, effect, func, millisec);
        }, millisec);
    }

    /** 停止背景切换计时器 */
    function stopSliderTimer() {
        if (timer) {
            clearTimeout(timer);
        }
    }

    /** 停止切换特效计时器 */
    function stopEffectTimer() {
        context.globalAlpha = 1;
        if (effectTimer) {
            cancelAnimationFrame(effectTimer);
        }
    }

    //构造函数和公共方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     *  初始化Slider
     *
     * @param {!Object} el      被选中的节点
     * @param {Object}  options 参数对象
     */
    var Slider = function (el, options) {
        this.$el = $(el);

        this.sliderStyle = options.sliderStyle;  // 背景切换模式
        this.ReadStyle = options.ReadStyle;      // 读取模式
        this.effect = options.effect;            // 时间单位
        this.timeUnits = options.timeUnits;      // 切换特效
        this.pauseTime = options.pauseTime;      // 动画切换速度
        this.imgFit = options.imgFit;            // IMG适应方式
        this.imgBGColor = options.imgBGColor;    // IMG背景颜色

        // 初始化图片源
        prevImg.src = 'img/bg.png';
        currantImg.src = 'img/bg.png';

        // 创建并初始化canvas
        canvas = document.createElement('canvas');
        canvas.id = 'canvas-background'; // canvas ID
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
            'background-color':  'rgb(' + this.imgBGColor + ')',
            'z-index': -1
        });  // currantImg CSS

        // 添加交互事件
        this.setupPointerEvents();

    };

    // 公共方法
    Slider.prototype = {

        /** 设置交互事件 */
        setupPointerEvents: function () {

            // 窗体改变事件
            $(this.$el).resize(function () {
                // 重新设置宽度和高度
                canvasWidth = canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                canvasHeight = canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            });

            // 窗体改变事件
            $(window).on('resize', function() {
                // 改变宽度和高度
                canvasWidth =  window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                canvasHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                // 获取最小宽度以及原点
                originX = canvasWidth * this.offsetX;
                originY = canvasHeight * this.offsetY;
            });

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

        /** 添加上张图片和当前图片 */
        addImg: function () {
            if (isRun) {
                $(this.$el).append(prevImg);
                $(this.$el).append(currantImg);
            }
        },

        /** 删除上张图片和当前图片 */
        delImg: function () {
            $(prevImg).remove();
            $(currantImg).remove();
        },

        /** 设置当前图片为用户图片 */
        imgSrcUserImg: function () {
            currantImg.src =  'file:///' + userImg;
        },

        /** 设置当前图片为默认图片 */
        imgSrcDefaultImg: function () {
            currantImg.src = 'img/bg.png';
        },

        /** 绘制默认图片 */
        drawDefaultImg: function () {
            if (isRun) {
                currantImg.src = 'img/bg.png';
                currantImg.onload = function () {
                    context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                };
            }
        },

        /** 绘制用户图片 */
        drawUserImg: function () {
            if (isRun) {
                currantImg.src = 'file:///' + userImg;
                currantImg.onload = function () {
                    context.drawImage(currantImg, 0, 0, canvasWidth, canvasHeight);
                };
            }
        },

        /** 绘制imgList当前图片 */
        drawCanvas: function () {
            if (isRun) {
                drawBackgroud();
            }
        },

        /** 清空Canvas内容 */
        clearCanvas: function () {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
        },

        /**
         * 更新状态锁
         *
         * @param {boolean} isDirectory 幻灯片模式布尔值
         */
        setIsRun: function (isDirectory) {
            isRun = isDirectory;
        },

        /**
         * 开始背景切换
         * 只有状态锁开启情况下才开切换
         */
        startSlider: function () {
            stopSliderTimer();
            if (isRun) {
                var time = getPauseTime(this.sliderStyle, this.effect, this.pauseTime, this.timeUnits);
                switch (this.sliderStyle) {
                    // CSS
                    case 1:
                        stopEffectTimer();
                        this.clearCanvas();
                        runSliderTimer(this.readStyle, this.sliderStyle, 'none', changeBackgroud, time);
                        break;
                    // Img
                    case 2:
                        if (this.effect === 'none') {
                            runSliderTimer(this.readStyle, this.sliderStyle, this.effect, changeImage, time);
                        } else {
                            runSliderTimer(this.readStyle, this.sliderStyle, this.effect, $.noop, time);
                        }
                        break;
                    // Canvas
                    case 3:
                        if (this.effect === 'none') {
                            runSliderTimer(this.readStyle, this.sliderStyle, this.effect, drawBackgroud, time);
                        } else {
                            runSliderTimer(this.readStyle, this.sliderStyle, this.effect, $.noop, time);
                        }
                        break;
                    default:
                        stopEffectTimer();
                        this.clearCanvas();
                        runSliderTimer(this.readStyle, 'none', changeBackgroud, time);
                }
            }
        },

        /** 停止背景切换 */
        stopSlider: function () {
            stopSliderTimer();
        },

        /**
         * 修改参数
         * @param {string} property 属性名
         * @param {*}      value    属性对应值
         */
        set: function (property, value) {
            switch (property) {
                case 'imgFit':
                    $(prevImg).css('object-fit', value);
                    $(currantImg).css('object-fit', value);
                    break;
                case 'imgBGColor':
                    $(prevImg).css('background-color', 'rgb(' + value + ')');
                    $(currantImg).css('background-color', 'rgb(' + value + ')');
                    break;
                case'sliderStyle':
                case 'readStyle':
                case 'pauseTime':
                case 'timeUnits':
                case 'effect':
                    this[property] = value;
                    this.startSlider();
                    break;
            }
        }

    };

    // 默认参数
    Slider.DEFAULTS = {
        sliderStyle: 1,            // 背景切换模式
        ReadStyle: 1,              // 读取模式
        timeUnits: 'sec',          // 时间单位
        pauseTime: 1,              // 背景停留时间
        effect: 'none',            // 切换特效
        imgFit: 'fill',            // IMG适应方式
        imgBGColor: '255,255,255'  // IMG背景颜色
    };


    //定义Slider插件
    //--------------------------------------------------------------------------------------------------------------

    var old = $.fn.slider;

    $.fn.slider = function (option) {
        var args = (arguments.length > 1) ? Array.prototype.slice.call(arguments, 1) : undefined;

        return this.each(function () {
            var $this = $(this);
            var data = $this.data('slider');
            var options = $.extend({}, Slider.DEFAULTS, $this.data(), typeof option === 'object' && option);

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
