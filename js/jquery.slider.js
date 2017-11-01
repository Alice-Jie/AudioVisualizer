/*!
 * jQuery Slider plugin v0.0.20
 * project:
 * - https://github.com/Alice-Jie/AudioVisualizer
 * - https://gitee.com/Alice_Jie/circleaudiovisualizer
 * - http://steamcommunity.com/sharedfiles/filedetails/?id=921617616
 * @license MIT licensed
 * @author Alice
 * @date 2017/10/23
 */

(function (global, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], function ($) {
            return factory($, global, global.document, global.Math);
        });
    } else if (typeof exports === 'object' && exports) {
        module.exports = factory(require('jquery'), global, global.document, global.Math);
    } else if (global.layui && layui.define) {
        /* global layui:true */
        layui.define('jquery', function (exports) {
            exports(factory(layui.jquery, global, global.document, global.Math));
        });
    } else {
        factory(jQuery, global, global.document, global.Math);
    }
})(typeof window !== 'undefined' ? window : this, function ($, window, document, Math) {

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

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (callback) {
                let currTime = new Date().getTime();
                let timeToCall = Math.max(0, 16 - (currTime - lastTime));
                let id = window.setTimeout(function () {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
        }
    }());

    //私有变量
    //--------------------------------------------------------------------------------------------------------------

    let canvas;                     // canvas对象
    let context;                    // context对象
    let canvasWidth, canvasHeight;  // canvas宽度和高度
    let originX, originY;           // 原点位置

    // 图像、canvas
    let prevImg = new Image(),        // 上张图片对象
        currantImg = new Image();     // 当前图片对象
    let prevCanvas, currantCanvas;    // 离屏Canvas
    let prevContext, currantContext;  // 离屏Context

    // 索引
    let imgList = [];  // 绝对路径数组
    let imgIndex = 0,  // 当前索引
        oldIndex = 0;  // 旧的索引

    // 计时器
    let timer = null,        // 切换计时器
        effectTimer = null;  // 特效计时器

    let audioAverage = 0;  // 音频平均值

    // 用户颜色、线性渐变和图像
    let userColor = '255,255,255',         // 用户自定义颜色
        userGradientDeg = '120',           // 用户自定义线性角度
        userGradientColor1 = '189,253,0',  // 用户自定义线性颜色1
        userGradientColor2 = '255,255,0';  // 用户自定义线性颜色2
    let userImg = '';                      // 用户自定义图片路径

    // 视频
    let video = document.createElement('video');  // 视频对象
    let videoList = [];                           // 视频数组
    let videoIndex = 0;                           // 视频索引
    let userVideo = '';                           // 用户视频

    // 音频
    let audio = document.createElement('audio');  // 音频对象
    let audioList = [];                           // 音频数组
    let audioIndex = 0;                           // 音频索引
    let userAudio = '';                           // 用户音频


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
     *  @param  {Array<*>} array    数组
     *  @param  {int}      index    当前数组索引
     *  @param  {boolean}  isRandom 是否随机读取
     *  @return {int} 更新的索引值
     */
    function upDateIndex(array, index, isRandom) {
        if (!array || array.length <= 0) {
            // 如果数组不存在或者为空
            return -1;
        } else if (array.length === 1) {
            // 如果数组长度只有1
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
                if (index + 1 < array.length) {
                    index++;
                } else {
                    index = 0;
                }
            }
            return index;
        }
    }

    /**
     * 获取数组顺序索引
     * 根据数组长度、当前数组索引，（按顺序）返回包含上一个、当前、下一个索引对象
     *
     *  @param  {Array<*>} array    数组
     *  @param  {int}      index    当前数组索引
     *  @return {!Object} 索引对象
     */
    function getArrayIndex(array, index) {
        if (array.length <= 0) {
            return {
                prevIndex: -1,
                currantIndex: -1,
                nextIndex: -1
            };
        } else if (array.length === 1) {
            return {
                prevIndex: 0,
                currantIndex: 0,
                nextIndex: 0
            };
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
     * 根据中心点坐标获取图片左上角坐标
     * 返回图片的XY坐标对象
     *
     * @param  {(int | float)} centerX 中心点坐标X
     * @param  {(int | float)} centerY 中心点坐标Y
     * @param  {(int | float)} width   image宽度
     * @param  {(int | float)} height  image高度
     * @return {Object} 坐标对象
     */
    function getXY(centerX, centerY, width, height) {
        return {
            x: centerX - width / 2,
            y: centerY - height / 2
        };
    }

    /** 停止切换特效计时器 */
    function stopEffectTimer() {
        if (effectTimer) {
            context.globalAlpha = 1;
            cancelAnimationFrame(effectTimer);
        }
    }

    /**
     * 均值函数
     *
     * @param  {Array|float} array 数组
     * @return {(int | float)} 平均值
     */
    function mean(array) {
        if (!array) {
            return 0.0;
        }
        let count = 0.0;
        for (let i = 0; i < array.length; i++) {
            count += array[i];
        }
        count /= array.length;
        return count;
    }

    // Canvas
    //-------

    /**
     * 绘制离屏canvas
     *
     * @param {string}  fitStr   自适应字符串
     * @param {!Object} img      image对象
     * @param {!Object} ctx      context对象
     * @param {string}  colorStr 颜色字符串
     */
    function drawOffScreenCanvas(fitStr, img, ctx, colorStr) {
        if (!img.src) {
            console.error('img.src is null!');
            return;
        }
        if (!ctx) {
            console.error('ctx is null!');
            return;
        }
        let x = 0,
            y = 0,
            centerX = canvasWidth / 2 || 960,
            centerY = canvasHeight / 2 || 540;
        let width = img.width || 0,
            height = img.height || 0;
        let scale = 1.00;
        ctx.fillStyle = 'rgb(' + colorStr || '255, 255, 255' + ')';
        switch (fitStr) {
            case 'fill':
                if (width <= canvasWidth && height <= canvasHeight) {
                    scale = Math.max(canvasWidth / width, canvasHeight / height);
                } else if (width < canvasWidth && height >= canvasHeight) {
                    scale = canvasWidth / width;
                } else if (width >= canvasWidth && height < canvasHeight) {
                    scale = canvasWidth / height;
                } else {
                    scale = Math.max(canvasWidth / width, canvasHeight / height);
                }
                ctx.drawImage(img, x, y, width * scale, height * scale);
                break;
            case 'fit':
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                if (width < canvasWidth && height < canvasHeight) {
                    scale = Math.min(canvasWidth / width, canvasHeight / height);
                } else if (width < canvasWidth && height >= canvasHeight) {
                    scale = canvasHeight / height;
                } else if (width >= canvasWidth && height < canvasHeight) {
                    scale = canvasWidth / width;
                } else {
                    scale = Math.min(canvasWidth / width, canvasHeight / height);
                }
                x = getXY(centerX, centerY, width * scale, height * scale).x;
                y = getXY(centerX, centerY, width * scale, height * scale).y;
                ctx.drawImage(img, x, y, width * scale, height * scale);
                break;
            case 'stretch':
                ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
                break;
            case 'center':
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                if (width <= canvasWidth && height <= canvasHeight) {
                    scale = 1.00;
                } else if (width < canvasWidth && height > canvasHeight) {
                    scale = Math.max(canvasWidth / width, height / canvasHeight);
                } else if (width > canvasWidth && height < canvasHeight) {
                    scale = Math.max(width / canvasWidth, canvasHeight / height);
                } else {
                    scale = Math.max(width / canvasWidth, height / canvasHeight);
                }
                x = getXY(centerX, centerY, width * scale, height * scale).x;
                y = getXY(centerX, centerY, width * scale, height * scale).y;
                ctx.drawImage(img, x, y, width * scale, height * scale);
                break;
            default:
                console.error('canvasFit is null.');
        }
    }

    /** 覆盖特效 */
    function canvasCover(fitStr, colorStr) {
        let currantWidth = 0; // 当前图片宽度
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                // 重置不透明属性
                drawOffScreenCanvas(fitStr, prevImg, prevContext, colorStr);
                drawOffScreenCanvas(fitStr, currantImg, currantContext, colorStr);
                // 开始绘制动画
                context.save();
                effectTimer = requestAnimationFrame(function animal() {
                    if (currantWidth < canvasWidth) {
                        // 绘制上张图片和当前图片
                        context.drawImage(prevCanvas, 0, 0, canvasWidth, canvasHeight);
                        context.drawImage(currantCanvas,
                            0, 0, currantWidth, canvasHeight,
                            0, 0, currantWidth, canvasHeight);
                        // 更新当前图片宽度
                        currantWidth += Math.floor(canvasWidth / 50);
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        currantContext.globalAlpha = prevContext.globalAlpha = 1;
                        context.drawImage(currantCanvas, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
                context.restore();
            };
        };
    }

    /** 渐显特效 */
    function canvasFadeIn(fitStr, colorStr) {
        let opacity = 100;  // 不透明值
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                drawOffScreenCanvas(fitStr, prevImg, prevContext, colorStr);
                drawOffScreenCanvas(fitStr, currantImg, currantContext, colorStr);
                // 开始绘制动画
                context.save();
                effectTimer = requestAnimationFrame(function animal() {
                    if (opacity >= 0) {
                        // 清空prevCanvas内容
                        prevContext.clearRect(0, 0, canvasWidth, canvasHeight);
                        // 绘制prevCanvas
                        prevContext.globalAlpha = opacity / 100;
                        drawOffScreenCanvas(fitStr, prevImg, prevContext, colorStr);
                        // 绘制当前图片和上张图片
                        context.drawImage(currantCanvas, 0, 0, canvasWidth, canvasHeight);
                        context.drawImage(prevCanvas, 0, 0, canvasWidth, canvasHeight);
                        // 更新不透明值
                        opacity -= 2;
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        currantContext.globalAlpha = prevContext.globalAlpha = 1;
                        context.drawImage(currantCanvas, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
                context.restore();
            };
        };
    }

    /** 渐隐特效 */
    function canvasFadeOut(fitStr, colorStr) {
        let opacity = 0;  // 不透明值
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                drawOffScreenCanvas(fitStr, prevImg, prevContext, colorStr);
                drawOffScreenCanvas(fitStr, currantImg, currantContext, colorStr);
                // 开始绘制动画
                context.save();
                effectTimer = requestAnimationFrame(function animal() {
                    if (opacity < 100) {
                        // 清空currantCanvas内容
                        currantContext.clearRect(0, 0, canvasWidth, canvasHeight);
                        // 绘制currantCanvas
                        currantContext.globalAlpha = opacity / 100;
                        drawOffScreenCanvas(fitStr, currantImg, currantContext, colorStr);
                        // 绘制上张图片和当前图片
                        context.drawImage(prevCanvas, 0, 0, canvasWidth, canvasHeight);
                        context.drawImage(currantCanvas, 0, 0, canvasWidth, canvasHeight);
                        // 更新透明值
                        opacity += 2;
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        currantContext.globalAlpha = prevContext.globalAlpha = 1;
                        context.drawImage(currantCanvas, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
                context.restore();
            };
        };
    }

    /** 洗牌特效 */
    function canvasShuffle(fitStr, colorStr) {
        let prevWidth = 0, currantWidth = 0;  // 上张图片和当前图片宽度
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                drawOffScreenCanvas(fitStr, prevImg, prevContext, colorStr);
                drawOffScreenCanvas(fitStr, currantImg, currantContext, colorStr);
                // 开始绘制动画
                context.save();
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
                        prevWidth += Math.floor(canvasWidth / 50);
                        currantWidth += Math.floor(canvasWidth / 50);
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        currantContext.globalAlpha = prevContext.globalAlpha = 1;
                        context.drawImage(currantCanvas, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
                context.restore();
            };
        };
    }

    /** 滑动特效 */
    function canvasSlider(fitStr, colorStr) {
        let prevWidth = 0, currantWidth = 0;  // 上张图片和当前图片宽度
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                drawOffScreenCanvas(fitStr, prevImg, prevContext, colorStr);
                drawOffScreenCanvas(fitStr, currantImg, currantContext, colorStr);
                // 开始绘制动画
                context.save();
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
                        prevWidth += Math.floor(canvasWidth / 50);
                        currantWidth += Math.floor(canvasWidth / 50);
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        currantContext.globalAlpha = prevContext.globalAlpha = 1;
                        context.drawImage(currantCanvas, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
                context.restore();
            };
        };
    }

    /** 拉伸特效 */
    function canvasVerticalIn(fitStr, colorStr) {
        let currantWidth = 0;  // 当前图片宽度
        let currantX = getXY(originX, originY, currantWidth, canvasHeight).x;  // 当前图片X坐标
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                drawOffScreenCanvas(fitStr, prevImg, prevContext, colorStr);
                drawOffScreenCanvas(fitStr, currantImg, currantContext, colorStr);
                // 开始绘制动画
                context.save();
                effectTimer = requestAnimationFrame(function animal() {
                    if (currantWidth <= canvasWidth) {
                        // 绘制上张图片和当前图片
                        context.drawImage(prevCanvas, 0, 0, canvasWidth, canvasHeight);
                        context.drawImage(currantCanvas, currantX + currantWidth / 2, 0, currantWidth, canvasHeight);
                        // 更新当前图片宽度和坐标X
                        currantWidth += Math.floor(canvasWidth / 50);
                        currantX -= Math.floor(canvasWidth / 50);
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        currantContext.globalAlpha = prevContext.globalAlpha = 1;
                        context.drawImage(currantCanvas, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
                context.restore();
            };
        };
    }

    /** 收缩特效 */
    function canvasVerticalOut(fitStr, colorStr) {
        let currantWidth = canvasWidth;  // 当前图片宽度
        let currantX = getXY(originX, originY, currantWidth, canvasHeight).x;  // 当前图片X坐标
        // 图片预加载
        prevImg.src = 'file:///' + imgList[oldIndex];
        currantImg.src = 'file:///' + imgList[imgIndex];
        prevImg.onload = function () {
            currantImg.onload = function () {
                drawOffScreenCanvas(fitStr, prevImg, prevContext, colorStr);
                drawOffScreenCanvas(fitStr, currantImg, currantContext, colorStr);
                // 开始绘制动画
                context.save();
                effectTimer = requestAnimationFrame(function animal() {
                    if (currantWidth > 0) {
                        // 绘制当前图片和上张图片
                        context.drawImage(currantCanvas, 0, 0, canvasWidth, canvasHeight);
                        context.drawImage(prevCanvas, currantX, 0, currantWidth, canvasHeight);
                        // 更新当前图片宽度和坐标X
                        currantWidth -= Math.floor(canvasWidth / 50);
                        currantX += Math.floor(originX / 50);
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        currantContext.globalAlpha = prevContext.globalAlpha = 1;
                        context.drawImage(currantCanvas, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
                context.restore();
            };
        };
    }

    /** 放大特效 */
    function canvasZoomIn(fitStr, colorStr) {
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
                drawOffScreenCanvas(fitStr, prevImg, prevContext, colorStr);
                drawOffScreenCanvas(fitStr, currantImg, currantContext, colorStr);
                // 开始绘制动画
                context.save();
                effectTimer = requestAnimationFrame(function animal() {
                    if (currantWidth <= canvasWidth && currantHeight <= canvasWidth) {
                        // 绘制上张图片和当前图片
                        context.drawImage(prevCanvas, 0, 0, canvasWidth, canvasHeight);
                        context.drawImage(currantCanvas, currantX + currantWidth / 2, currantY + currantHeight / 2, currantWidth, currantHeight);
                        // 更新当前图片宽度和XY坐标
                        currantX -= Math.floor(canvasWidth / 50);
                        currantY -= Math.floor(canvasHeight / 50);
                        currantWidth += Math.floor(canvasWidth / 50);
                        currantHeight += Math.floor(canvasHeight / 50);
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        currantContext.globalAlpha = prevContext.globalAlpha = 1;
                        context.drawImage(currantCanvas, 0, 0, canvasWidth, canvasHeight);
                        cancelAnimationFrame(effectTimer);
                    }
                });
                context.restore();
            };
        };
    }

    /** 缩小特效 */
    function canvasZoomOut(fitStr, colorStr) {
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
                drawOffScreenCanvas(fitStr, prevImg, prevContext, colorStr);
                drawOffScreenCanvas(fitStr, currantImg, currantContext, colorStr);
                // 开始绘制动画
                effectTimer = requestAnimationFrame(function animal() {
                    if (currantWidth > 0 && currantHeight > 0) {
                        // 绘制当前图片和上张图片
                        context.drawImage(currantCanvas, 0, 0, canvasWidth, canvasHeight);
                        context.drawImage(prevCanvas, currantX, currantY, currantWidth, currantHeight);
                        // 更新当前图片宽度和XY坐标
                        currantX += Math.floor(originX / 50);
                        currantY += Math.floor(originY / 50);
                        currantWidth -= Math.floor(canvasWidth / 50);
                        currantHeight -= Math.floor(canvasHeight / 50);
                        effectTimer = requestAnimationFrame(animal);
                    } else {
                        currantContext.globalAlpha = prevContext.globalAlpha = 1;
                        context.drawImage(currantCanvas, 0, 0, canvasWidth, canvasHeight);
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

    /**
     * 不规则/非整体特效原理：
     * prevIMG获取获取当前src地址，样式属性保持不变
     * currantImg获取下一张src地址：以蒙版的形式，按某种方法从部分逐渐过渡至整体
     * CSS3：SVG clip-path or mask
     * http://www.zhangxinxu.com/wordpress/2011/04/css-clip-rect/
     * 以SVG动画作为蒙版载体(clip-path)，间接利用SVG动画创建过渡特效
     * http://www.zhangxinxu.com/wordpress/2014/08/so-powerful-svg-smil-animation/
     */

    //构造函数和公共方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     * @class Slider
     *
     * @param {!Object} el      被选中的节点
     * @param {Object}  options 参数对象
     */
    let Slider = function (el, options) {
        this.$el = $(el);

        this.sliderMode = options.sliderMode;              // 背景模式
        this.isLinearGradient = options.isLinearGradient;  // 线性背景开关
        // 幻灯片参数
        this.sliderStyle = options.sliderStyle;            // 背景切换模式
        this.readStyle = options.readStyle;                // 读取模式
        this.effect = options.effect;                      // 时间单位
        this.timeUnits = options.timeUnits;                // 切换特效
        this.pauseTime = options.pauseTime;                // 动画切换速度
        this.imgFit = options.imgFit;                      // IMG适应方式
        this.imgBGColor = options.imgBGColor;              // IMG背景颜色
        this.canvasFit = options.canvasFit;                // canvas适应方式
        this.canvasBGColor = options.canvasBGColor;        // canvas背景颜色
        // video参数
        this.videoProgress = options.videoProgress;        // Video进度
        this.isVideoPlay = options.isVideoPlay;            // 是否播放Video
        this.videoVolume = options.videoVolume;            // Video音量
        this.playbackRate = options.playbackRate;          // Video播放速度
        this.videoFit = options.videoFit;                  // Video适应方式
        this.videoBGColor = options.videoBGColor;          // Video背景颜色
        // audio参数
        this.audioProgress = options.audioProgress;        // Audio进度
        this.isAudioPlay = options.isAudioPlay;            // 是否播放Audio
        this.isAudioLoop = options.isAudioLoop;            // 是否循环播放
        this.audioVolume = options.audioVolume;            // Audio音量
        // 滤镜参数
        this.isBackgourndBlur = options.isBackgourndBlur;  // 是否背景模糊
        // 变换参数
        this.isRotate3D = options.isRotate3D;              // 是否3D旋转

        this.isBackgroundZoom = options.isBackgroundZoom;  // 是否背景缩放

        // 创建并初始化canvas
        canvas = document.createElement('canvas');
        canvas.id = 'canvas-slider'; // canvas ID
        $(canvas).css({
            'position': 'fixed',
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

        // 初始化图片源
        prevImg.src = 'img/bg.png';
        currantImg.src = 'img/bg.png';

        // 初始化prevImg、currantImg属性
        prevImg.id = 'img-prev';
        currantImg.id = 'img-currant';
        $(prevImg).css({
            'position': 'fixed',
            'top': 0,
            'left': 0,
            'width': canvasWidth,
            'height': canvasHeight,
            'object-fit': this.imgFit,
            'background-color': 'rgb(' + this.imgBGColor + ')',
            'z-index': -2
        });  // prevImg CSS
        $(currantImg).css({
            'position': 'fixed',
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
        video.autoplay = true;
        video.loop = 'loop';
        $(video).css({
            'position': 'fixed',
            'top': 0,
            'left': 0,
            'object-fit': this.videoFit,
            'background-color': 'rgb(' + this.videoBGColor + ')',
            'z-index': 0
        });  // Video CSS

        // 初始化Audio属性
        audio.autoplay = false;
        audio.loop = false;

        // 默认开启
        this.setupPointerEvents();
        this.initSlider();
    };

    // 默认参数
    Slider.DEFAULTS = {
        sliderMode: 'wallpaper',       // 背景模式
        isLinearGradient: false,       // 线性背景开关
        // 幻灯片参数
        sliderStyle: 'css',            // 背景切换模式
        readStyle: 'sequential',       // 读取模式
        timeUnits: 'sec',              // 时间单位
        pauseTime: 30,                 // 背景停留时间
        effect: 'none',                // 切换特效
        imgFit: 'fill',                // IMG适应方式
        imgBGColor: '255,255,255',     // IMG背景颜色
        canvasFit: 'fill',             // canvas适应方式
        canvasBGColor: '255,255,255',  // canvas背景颜色
        // video参数
        videoProgress: 0,              // Video进度
        isVideoPlay: true,             // 是否播放Video
        videoVolume: 0.75,             // Video音量
        playbackRate: 1.0,             // Video播放速度
        videoFit: 'fill',              // Video适应方式
        videoBGColor: '255,255,255',   // Video背景颜色
        // audio参数
        audioProgress: 0,              // Audio进度
        isAudioPlay: false,            // 是否播放Audio
        isAudioLoop: false,            // 是否循环播放
        audioVolume: 0.75,             // Audio音量
        // 滤镜参数
        isBackgroundBlur: false,       // 是否背景缩放
        // 变换参数
        perspective: 0,                // 透视效果
        width: 1.00,                   // 平面宽度(%)
        height: 1.00,                  // 平面高度(%)
        degSize: 5,                    // 角度大小
        isRotate3D: false,             // 是否3D旋转
        isBackgroundZoom: false        // 是否背景模糊

    };

    // 公共方法
    Slider.prototype = {

        // 面向内部方法
        //-----------------------------------------------------------

        /**
         * 获取停留时间
         * @private
         *
         */
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

        /**
         * 改变背景图片
         * @private
         */
        changeBackground: function () {
            if (imgList.length <= 0) {
                // 如果文件夹为空
                if (userImg) {
                    $(this.$el).css('background-image', 'url("file:///' + userImg + '")');
                } else {
                    $(this.$el).css('background-image', 'url(img/bg.png)');
                }
                imgIndex = 0;
            }
            else if (imgList.length === 1) {
                // 如果文件只有一张图片
                $(this.$el).css('background-image', 'url("file:///' + imgList[0] + '")');
                imgIndex = 0;
            } else {
                // 图片数量 > 1 读取下一张图片
                $(this.$el).css('background-image', 'url("file:///' + imgList[imgIndex] + '")');
            }
        },

        /**
         * 改变当前图片
         * @private
         */
        changeImage: function () {
            $(currantImg).css('z-index', -1);
            $(prevImg).css('z-index', -2);
            if (imgList.length <= 0) {
                // 如果文件夹为空
                if (userImg) {
                    $(this.$el).css('background-image', 'url("file:///' + userImg + '")');
                    prevImg.src = 'file:///' + userImg;
                    currantImg.src = 'file:///' + userImg;
                } else {
                    $(this.$el).css('background-image', 'url(img/bg.png)');
                    prevImg.src = 'img/bg.png';
                    currantImg.src = 'img/bg.png';
                }
                imgIndex = 0;
            }
            else if (imgList.length === 1) {
                // 如果文件只有一张图片
                imgIndex = 0;
                $(this.$el).css('background-image', 'url("file:///' + imgList[0] + '")');
                prevImg.src = 'file:///' + imgList[imgIndex];
                currantImg.src = 'file:///' + imgList[imgIndex];
            } else {
                // 图片数量 > 1 读取下一张图片
                $(this.$el).css('background-image', 'url("file:///' + imgList[imgIndex] + '")');
                prevImg.src = 'file:///' + imgList[oldIndex];
                currantImg.src = 'file:///' + imgList[imgIndex];
            }
        },

        /**
         * Canvas绘制背景图片
         * @private
         */
        drawBackground: function () {
            if (imgList.length <= 0) {
                // 如果文件夹为空
                if (userImg) {
                    $(this.$el).css('background-image', 'url("file:///' + userImg + '")');
                    prevImg.src = 'file:///' + userImg;
                    currantImg.src = 'file:///' + userImg;
                    let imgTimer = setInterval(
                        ()=> {
                            if (currantImg.complete) {
                                drawOffScreenCanvas(this.canvasFit, currantImg, context, this.canvasBGColor);
                                clearInterval(imgTimer);
                            }
                        }, 500);
                } else {
                    $(this.$el).css('background-image', 'url(img/bg.png)');
                    prevImg.src = 'img/bg.png';
                    currantImg.src = 'img/bg.png';
                    let imgTimer = setInterval(
                        ()=> {
                            if (currantImg.complete) {
                                drawOffScreenCanvas(this.canvasFit, currantImg, context, this.canvasBGColor);
                                clearInterval(imgTimer);
                            }
                        }, 500);
                }
                imgIndex = 0;
            }
            else if (imgList.length === 1) {
                // 如果文件只有一张图片
                imgIndex = 0;
                $(this.$el).css('background-image', 'url("file:///' + imgList[0] + '")');
                prevImg.src = 'file:///' + imgList[imgIndex];
                currantImg.src = 'file:///' + imgList[imgIndex];
                let imgTimer = setInterval(
                    ()=> {
                        if (currantImg.complete) {
                            drawOffScreenCanvas(this.canvasFit, currantImg, context, this.canvasBGColor);
                            clearInterval(imgTimer);
                        }
                    }, 500);
            } else {
                // 图片数量 > 1 读取下一张图片
                $(this.$el).css('background-image', 'url("file:///' + imgList[imgIndex] + '")');
                prevImg.src = 'file:///' + imgList[oldIndex];
                currantImg.src = 'file:///' + imgList[imgIndex];
                let imgTimer = setInterval(
                    ()=> {
                        if (currantImg.complete) {
                            drawOffScreenCanvas(this.canvasFit, currantImg, context, this.canvasBGColor);
                            clearInterval(imgTimer);
                        }
                    }, 500);
            }
        },

        /**
         * 选择图片切换特效
         * @private
         */
        selectImgEffects: function () {
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
        },

        /**
         * 选择Canvas切换特效
         * @private
         */
        selectCanvasEffects: function () {
            switch (this.effect) {
                case 'none':
                    stopEffectTimer();
                    break;
                case 'cover':
                    canvasCover(this.canvasFit, this.canvasBGColor);
                    break;
                case 'fadeIn':
                    canvasFadeIn(this.canvasFit, this.canvasBGColor);
                    break;
                case 'fadeOut':
                    canvasFadeOut(this.canvasFit, this.canvasBGColor);
                    break;
                case 'shuffle':
                    canvasShuffle(this.canvasFit, this.canvasBGColor);
                    break;
                case 'slider':
                    canvasSlider(this.canvasFit, this.canvasBGColor);
                    break;
                case 'vertIn':
                    canvasVerticalIn(this.canvasFit, this.canvasBGColor);
                    break;
                case 'vertOut':
                    canvasVerticalOut(this.canvasFit, this.canvasBGColor);
                    break;
                case 'zoomIn':
                    canvasZoomIn(this.canvasFit, this.canvasBGColor);
                    break;
                case 'zoomOut':
                    canvasZoomOut(this.canvasFit, this.canvasBGColor);
                    break;
                default:
                    stopEffectTimer();
            }
        },

        /**
         * 停止滤镜
         * @private
         */
        stopFilter: function () {
            $(this.$el).css('filter', 'none');
        },

        /**
         * 开始背景3D转换
         * @private
         *
         * @param {int | float} ex 鼠标X轴坐标
         * @param {int | float} ey 鼠标Y轴坐标
         */
        rotate3D: function (ex, ey) {
            /**
             * http://www.w3school.com.cn/css3/css3_3dtransform.asp
             * https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-function/rotate3d
             * 设(canvasWidth / 2, canvasHeight / 2)为原点(0, 0)
             * {x | 0 ≤ x ≤ 1}, {y | 0 ≤ x ≤ 1}, {deg | 0 ≤ x ≤ 1}
             * 第一象限：x * deg > 0, y * deg > 0;
             * 第二象限：x * deg < 0, y * deg < 0;
             * 第三象限：x * deg < 0, y * deg < 0;
             * 第四象限: x * deg > 0; y * deg > 0;
             * 距离原点(0, 0)越远，deg偏移越大
             */
            let mouseX = 0.00,
                mouseY = 0.00,
                centerX = canvasWidth / 2,
                centerY = canvasHeight / 2;
            // 获取mouseXY(0.00 ~ 1.00)
            if (ex > centerX) {
                mouseX = (ex - centerX) / (canvasWidth - centerX);
            } else {
                mouseX = -1 * (1 - ex / centerX);
            }
            if (ey > centerY) {
                mouseY = (ey - centerY) / (canvasHeight - centerY);
            } else {
                mouseY = -1 * (1 - ey / centerY);
            }
            // 获取deg
            let deg = Math.max(Math.abs(mouseX), Math.abs(mouseY)) * this.degSize;
            // 透视效果
            let perspective = this.perspective ? 'perspective(' + this.perspective + 'px) ' : '';
            $(this.$el).css({
                'transform-origin': '50% 50%',
                'transform': perspective
                + 'scale(' + this.width + ', ' + this.height + ')'
                + 'rotate3d(' + -mouseY + ',' + mouseX + ',0,' + deg + 'deg)'
            });
        },

        /**
         * 停止变换
         * @private
         */
        stopTransform: function () {
            $(this.$el).css({
                'transform-origin': '50% 50% 0',
                'transform': 'none'
            });
        },

        /**
         * 开始变换
         * @private
         */
        startTransform: function () {
            let perspective = this.perspective ? 'perspective(' + this.perspective + 'px) ' : '';
            $(this.$el).css({
                'transform-origin': '50% 50%',
                'transform': perspective
                + 'scale(' + this.width + ', ' + this.height + ')'
            });
        },


        /**
         * 设置交互事件
         * @private
         */
        setupPointerEvents: function () {

            let that = this;

            // 鼠标移动事件
            $(this.$el).on('mousemove', function (e) {
                if (that.isRotate3D) {
                    that.rotate3D(e.clientX, e.clientY);
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
         * 更新音频均值
         *
         * @param {Array|float} audioSamples 音频数组
         */
        updateAudioAverage: function (audioSamples) {
            audioAverage = mean(audioSamples);
            // 音频均值相关的函数
            this.isBackgroundBlur && this.backgroundBlur();
            this.isBackgroundZoom && this.backgroundZoom();
        },

        /** 背景模糊 */
        backgroundBlur: function () {
            if (!this.isRotate3D && this.isBackgroundBlur) {
                let blur = 3 * audioAverage;
                $(this.$el).css('filter', 'blur(' + blur + 'px)');
            }
        },

        /** 背景缩放 */
        backgroundZoom: function () {
            if (!this.isRotate3D && this.isBackgroundZoom) {
                let widthScale = this.width + audioAverage * 0.05,
                    heightScale = this.height + audioAverage * 0.05;
                $(this.$el).css('transform', 'scale(' + widthScale + ', ' + heightScale + ')');
            }
        },


        /**
         * 获取用户自定义的背景颜色
         * 如果颜色不存在默认为空字符串
         *
         * @param {string} color 用户背景颜色
         */
        setUserColor: function (color) {
            userColor = color || '255,255,255';
        },

        /**
         * 获取用户自定义线性背景
         *
         * @param {int}    deg    角度
         * @param {string} color1 颜色字符串1
         * @param {string} color2 颜色字符串2
         */
        setUserLinearGradient: function (deg, color1, color2) {
            userGradientDeg = deg || 0;
            userGradientColor1 = color1 || '189,253,0';
            userGradientColor2 = color2 || '255,255,0';
        },

        /**
         * 获取用户自定义的图片地址
         * 如果路径不存在默认为空字符串
         *
         * @param {string} img 用户图片路径
         */
        setUserImg: function (img) {
            userImg = img || '';
        },

        /**
         * 获取用户自定义的视频
         * 如果路径不存在默认为空字符串
         *
         * @param {string} video 用户视频路径
         */
        setUserVideo: function (video) {
            userVideo = video || '';
        },

        /**
         * 获取用户自定义的音频
         * 如果路径不存在默认为空字符串
         *
         * @param {string} audio 用户音频路径
         */
        setUserAudio: function (audio) {
            userAudio = audio || '';
        },

        // CSS
        //----

        /**
         * 设置背景填充样式
         *
         * @param {string} fillStyle 填充样式字符串
         */
        setFillStyle: function (fillStyle) {
            let position = '0% 0%';
            let size = '100% 100%';
            let repeat = 'no-repeat';
            switch (fillStyle) {
                // 填充
                case 'fill':
                    size = 'cover';
                    break;
                // 适应
                case 'fit':
                    position = '50% 50%';
                    size = 'contain';
                    break;
                // 拉伸
                case 'stretch':
                    size = '100% 100%';
                    break;
                // 平铺
                case 'tile':
                    size = 'initial';
                    repeat = 'repeat';
                    break;
                // 居中
                case 'center':
                    position = '50% 50%';
                    size = 'initial';
                    break;
                // 默认适应
                default:
                    size = 'contain';
            }
            this.$el.css({
                'background-position': position,
                'background-size': size,
                'background-repeat': repeat
            });
        },

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

        /** 设置background-image为线性渐变 */
        cssLinearGradient: function () {
            if (userGradientColor1 && userGradientColor2) {
                this.$el.css('background-image', 'linear-gradient(' + userGradientDeg + 'deg, '
                    + 'rgb(' + userGradientColor1 + ')' + ' , '
                    + 'rgb(' + userGradientColor2 + ')' + ')');
            } else {
                this.$el.css('background-image', 'linear-gradient(' + userGradientDeg + 'deg, '
                    + 'rgb(189, 253, 0)' + ' , '
                    + 'rgb(255, 255, 255)' + ')');
            }
        },

        /** 设置background-image为用户图片 */
        cssUserImg: function () {
            if (userImg) {
                this.$el.css({
                    'background-image': 'url("file:///' + userImg + '")',
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

        // Canvas
        //-------

        /** 清空Canvas内容 */
        clearCanvas: function () {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
        },

        // Directory
        //----------

        /**
         * 更新imgList
         * - 载入/删除/添加/修改（删除 - 添加）都会初始化状态
         * - 文件夹为空时使用用户自定义的图片路径
         * - 用户为自定义的图片时使用原始图片路径
         *
         *@param {Array<string>} currentFiles 当前文件路径数组
         */
        updateImgList: function (currentFiles) {
            if (currentFiles.length <= 0) {
                imgList = [];
            } else {
                imgList = currentFiles;
            }
            imgIndex = 0;  // 初始化图片索引
        },

        /** 改变滑动模式 */
        changeSliderStyle: function () {
            if (this.sliderMode === 'Directory') {
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
                    // no default
                }
            }
        },

        /** 使用imgList当前图片 */
        changeSlider: function () {
            if (this.sliderMode === 'Directory') {
                switch (this.sliderStyle) {
                    case 'css':
                        this.changeBackground();
                        break;
                    case 'image':
                        this.changeImage();
                        break;
                    case 'canvas':
                        this.drawBackground();
                        break;
                    // no default
                }
            }
        },

        /** 停止背景切换计时器 */
        stopSliderTimer: function () {
            timer && clearTimeout(timer);
            this.clearCanvas();
            this.delImg();
        },

        /** 开始背景切换计时器 */
        runSliderTimer: function () {
            clearTimeout(timer);
            timer = setTimeout(
                ()=> {
                    if (this.sliderMode === 'Directory' && imgList.length > 1) {
                        // 更新oldIndex
                        oldIndex = imgIndex;
                        // 按读取顺序更新imgIndex
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
                        // 选择背景切换特效
                        if (this.sliderStyle === 'image') {
                            this.selectImgEffects();
                        } else if (this.sliderStyle === 'canvas') {
                            this.selectCanvasEffects();
                        }
                    }
                    this.changeSlider();  // 绘制背景
                    this.runSliderTimer();
                }, this.getPauseTime());
        },

        /** 开始背景切换 */
        startSlider: function () {
            if (this.sliderMode === 'Directory') {
                this.changeSliderStyle();
                this.changeSlider();
                this.runSliderTimer();
            }
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
            /* global myVideoList:true */
            videoList = [].concat(myVideoList) || [];
            for (let i = 0; i < videoList.length; i++) {
                videoList[i] = 'video/' + videoList[i];
            }
        },

        /**
         * 读取视频源
         *
         * @param {int} index 视频列表索引
         */
        getVideoStr: function (index) {
            if (videoList) {
                if (index >= 0 && index < videoList.length) {
                    video.src = videoList[index];
                } else {
                    video.src = videoList[0] || 'video/test.webm';
                }
                video.load();
                this.isVideoPlay || this.pauseVideo();
            }
        },

        /** 设置当前视频为用户视频并添加至视频列表 */
        videoSrcUserVideo: function () {
            if (userVideo) {
                video.src = 'file:///' + userVideo;
                videoList.push(video.src);
                videoIndex = videoList.length - 1;
            } else {
                this.getVideoList();
                videoIndex = 0;
                video.src = videoList[0] || 'video/test.webm';
            }
        },

        /** 设置当前视频为默认视频 */
        videoSrcDefaultVideo: function () {
            this.getVideoList();
            videoIndex = 0;
            video.src = videoList[0] || 'video/test.webm';
        },

        /** 当前视频 */
        currentVideo: function () {
            if (videoList.length > 1) {
                videoIndex = getArrayIndex(videoList, videoIndex).currantIndex;
                this.getVideoStr(videoIndex);
            }
        },

        /** 上一个视频 */
        prevVideo: function () {
            if (videoList.length > 1) {
                videoIndex = getArrayIndex(videoList, videoIndex).prevIndex;
                this.getVideoStr(videoIndex);
            }
        },

        /** 下一个视频 */
        nextVideo: function () {
            if (videoList.length > 1) {
                videoIndex = getArrayIndex(videoList, videoIndex).nextIndex;
                this.getVideoStr(videoIndex);
            }
        },

        /**
         * 设置视频进度
         * 如果视频源存在且加载完成，则调节视频进度
         *
         * @param {float} progress 进度百分比
         */
        setVideoProgress: function (progress) {
            if (video.src && video.duration) {
                video.currentTime = video.duration * progress;
            }
        },

        /**
         * 设置视频播放速度
         * 如果视频源存在，则调节视频播放速度
         *
         * @param {float} backRate 播放速率
         */
        setVideoPlaybackRate: function (backRate) {
            if (video.src) {
                video.playbackRate = backRate;
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
         * 设置视频音量
         * 如果视频源存在，则调节视频音量
         *
         * @param {float} volume 音量
         */
        setVideoVolume: function (volume) {
            if (video.src) {
                video.volume = volume;
            }
        },

        // Audio
        //-------

        /** 读取audioList */
        getAudioList: function () {
            /* global myAudioList:true */
            audioList = [].concat(myAudioList) || [];
            for (let i = 0; i < audioList.length; i++) {
                audioList[i] = 'audio/' + audioList[i];
            }
        },

        /**
         * 读取音频源
         *
         * @param {int} index 音频列表索引
         */
        getAudioStr: function (index) {
            if (audioList) {
                if (index >= 0 && index < audioList.length) {
                    audio.setAttribute('src', audioList[index]);
                } else {
                    audio.setAttribute('src', audioList[0] || 'audio/test.ogg');
                }
                audio.load();
                this.isAudioPlay && this.playAudio();
            }
        },

        /** 设置当前音频为用户音频并添加至音频列表 */
        audioSrcUserAudio: function () {
            if (userAudio) {
                audio.setAttribute('src', 'file:///' + userAudio);
                audioList.push(audio.src);
                audioIndex = audioList.length - 1;
            } else {
                this.getAudioList();
                audioIndex = 0;
                audio.setAttribute('src', audioList[0] || 'audio/test.ogg');
            }
            audio.load();
            this.isAudioPlay && this.playAudio();
        },

        /** 设置当前音频为默认音频 */
        audioSrcDefaultAudio: function () {
            this.getAudioList();
            audioIndex = 0;
            audio.setAttribute('src', audioList[0] || 'audio/test.ogg');
            audio.load();
            this.isAudioPlay && this.playAudio();
        },

        /** 当前音频 */
        currentAudio: function () {
            if (audioList.length > 1) {
                audioIndex = getArrayIndex(audioList, audioIndex).currantIndex;
                this.getAudioStr(audioIndex);
            }
        },

        /** 上一个音频 */
        prevAudio: function () {
            if (audioList.length > 1) {
                audioIndex = getArrayIndex(audioList, audioIndex).prevIndex;
                this.getAudioStr(audioIndex);
            }
        },

        /** 下一个音频 */
        nextAudio: function () {
            if (audioList.length > 1) {
                audioIndex = getArrayIndex(audioList, audioIndex).nextIndex;
                this.getAudioStr(audioIndex);
            }
        },

        /**
         * 设置音频进度
         * 如果音频源存在且加载完成，则调节音频进度
         *
         * @param {float} progress 进度百分比
         */
        setAudioProgress: function (progress) {
            if (audio.src && audio.duration) {
                audio.currentTime = audio.duration * progress;
            }
        },

        /** 播放音频 */
        playAudio: function () {
            if (audio.src) {
                audio.play();
            }
        },

        /** 暂停音频 */
        pauseAudio: function () {
            if (audio.src) {
                audio.pause();
            }
        },

        /**
         * 设置音频音量
         * 如果音频源存在，则调节音频音量
         *
         * @param {float} volume 音量
         */
        setAudioVolume: function (volume) {
            if (audio.src) {
                audio.volume = volume;
            }
        },


        /** 初始化模式所需要的环境 */
        initSlider: function () {
            switch (this.sliderMode) {
                case 'Color':
                    this.delVideo();
                    this.stopSliderTimer();
                    this.isLinearGradient ? this.cssLinearGradient() : this.cssUserColor();
                    break;
                case 'Wallpaper':
                    this.delVideo();
                    this.stopSliderTimer();
                    userImg ? this.cssUserImg() : this.cssDefaultImg();
                    break;
                case 'Directory':
                    this.delVideo();
                    this.startSlider();
                    break;
                case 'Video':
                    this.stopSliderTimer();
                    this.addVideo();
                    userVideo ? this.videoSrcUserVideo() : this.videoSrcDefaultVideo();
                    break;
                // no default
            }
        },

        /** 移除canvas */
        destroy: function () {
            this.$el
                .off('#canvas-slider')
                .removeData('slider');

            this.cssDefaultImg();
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
                    this.imgFit = value;
                    $(prevImg).css('object-fit', this.imgFit);
                    $(currantImg).css('object-fit', this.imgFit);
                    break;
                case 'videoFit':
                    this.videoFit = value;
                    $(video).css('object-fit', this.videoFit);
                    break;
                case 'imgBGColor':
                    this.imgBGColor = value;
                    $(prevImg).css('background-color', 'rgb(' + this.imgBGColor + ')');
                    $(currantImg).css('background-color', 'rgb(' + this.imgBGColor + ')');
                    break;
                case 'videoBGColor':
                    this.videoBGColor = value;
                    $(video).css('background-color', 'rgb(' + this.videoBGColor + ')');
                    break;
                case 'readStyle':
                case 'effect':
                case 'degSize':
                    this[property] = value;
                    break;
                case 'sliderMode':
                    this.sliderMode = value;
                    this.initSlider();
                    break;
                case 'isLinearGradient':
                    this.isLinearGradient = value;
                    this.isLinearGradient ? this.cssLinearGradient() : this.cssUserColor();
                    break;
                case 'canvasFit':
                case 'canvasBGColor':
                    this[property] = value;
                    if (this.sliderMode === 'Directory' && this.sliderStyle === 'canvas') {
                        this.drawBackground();
                    }
                    break;
                case 'pauseTime':
                case 'timeUnits':
                    this[property] = value;
                    this.runSliderTimer();
                    break;
                case 'sliderStyle':
                    this.sliderStyle = value;
                    this.changeSliderStyle();
                    if (this.sliderMode === 'Directory') {
                        this.changeSlider();
                    }
                    break;
                case 'videoProgress':
                    this.videoProgress = value;
                    this.setVideoProgress(this.videoProgress);
                    break;
                case 'audioProgress':
                    this.audioProgress = value;
                    this.setAudioProgress(this.audioProgress);
                    break;
                case 'isVideoPlay':
                    this.isVideoPlay = value;
                    this.isVideoPlay ? this.playVideo() : this.pauseVideo();
                    break;
                case 'isAudioPlay':
                    this.isAudioPlay = value;
                    this.isAudioPlay ? this.playAudio() : this.pauseAudio();
                    break;
                case 'videoVolume':
                    this.videoVolume = value;
                    this.setVideoVolume(this.videoVolume);
                    break;
                case 'audioVolume':
                    this.audioVolume = value;
                    this.setAudioVolume(this.audioVolume);
                    break;
                case 'isAudioLoop':
                    this.isAudioLoop = value;
                    audio.loop = this.isAudioLoop;
                    break;
                case 'playbackRate':
                    this.playbackRate = value;
                    this.setVideoPlaybackRate(this.playbackRate);
                    break;
                case 'perspective':
                case 'width':
                case 'height':
                case 'isRotate3D':
                    this[property] = value;
                    this.startTransform();
                    this.isRotate3D && this.stopFilter();
                    this.isRotate3D || this.startTransform();
                    break;
                case 'isBackgroundZoom':
                    this.isBackgroundZoom = value;
                    this.startTransform();
                    break;
                case 'isBackgroundBlur':
                    this.isBackgroundBlur = value;
                    this.isBackgroundBlur || this.stopFilter();
                    break;
                // no default
            }
        }

    };

    // 定义Slider插件
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
