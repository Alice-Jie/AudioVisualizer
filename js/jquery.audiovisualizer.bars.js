/*！
 * jQuery AudioVisualizer Bars plugin v0.0.5
 * project:
 * - https://github.com/Alice-Jie/AudioVisualizer
 * - https://git.oschina.net/Alice_Jie/circleaudiovisualizer
 * - http://steamcommunity.com/sharedfiles/filedetails/?id=921617616
 * @license MIT licensed
 * @author Alice
 * @date 2017/08/19
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

    // 兼容requestAnimFrame、cancelAnimationFrame
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

    // 私有变量
    //--------------------------------------------------------------------------------------------------------------

    let canvas;                     // canvas对象
    let context;                    // context对象
    let canvasWidth, canvasHeight;  // canvas宽度和高度
    let originX, originY;           // 原点XY位置

    let minLength = 960;            // 最小宽度
    let startX, startY;             // 初始XY坐标

    // 坐标数组
    let pointArray1 = [],
        pointArray2 = [],
        staticPointsArray = [];

    // 上次音频数组记录
    let lastAudioSamples = [];
    for (let i = 0; i < 128; i++) {
        lastAudioSamples[i] = 0;
    }

    // 颜色变换
    let color1 = {
        R: 255,
        G: 255,
        B: 255
    }, color2 = {
        R: 255,
        G: 0,
        B: 0
    };
    let currantColor = '255,255,255';  // 当前颜色
    let colorDirection = 'left';       // 变化方向
    const incrementMAX = 255;          // 计数上限
    let incrementCount = 0;            // 增量计数
    // 颜色增量
    let R_Increment = (color1.R - color2.R) / incrementMAX,
        G_Increment = (color1.G - color2.G) / incrementMAX,
        B_Increment = (color1.B - color2.B) / incrementMAX;

    // 彩虹渐变对象数组
    let rainBowArray = [];        // 条形
    let gradientOffsetRange = 0;  // 偏移范围

    let RUN_COUNT = 1;  // 绘制次数

    let timer = null;  // 音频圆环计时器

    // 私有方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     *  检测音频数组静默状态
     *  数组所有值皆为0返回true,反之返回false
     * @method 检测音频数组静默状态
     * @param  {Array<float>} audioSamples 音频数组
     * @return {boolean} 静默状态布尔值
     */
    function isSilence(audioSamples) {
        if (!audioSamples) {
            return false;
        }
        for (let i = 0; i < audioSamples.length; i++) {
            if (audioSamples[i]) {
                return true;
            }
        }
        return false;
    }

    /**
     * 根据点的数量提取音频数组
     * 获取数组长度等于点的数量的音频数组
     *
     * @param  {Array<float>} audioSamples 音频数组
     * @param  {int}          num          点的数量
     * @return {Array<float>} AudioArray   抽取后的音频数组
     */
    function getBarsArray(audioSamples, num) {
        if (!audioSamples) {
            return [];
        }
        if (!num || num <= 0) {
            return [];
        } else if (num > audioSamples.length) {
            return audioSamples;
        }
        let AudioArray = [].concat(audioSamples);
        let max = AudioArray.length - num;
        let isfirst = true;  // 头尾元素指示器
        for (let i = 0; i < max; i++) {
            if (isfirst) {
                AudioArray.shift();
                isfirst = false;
            } else {
                AudioArray.pop();
                isfirst = true;
            }
        }
        return AudioArray;
    }

    /** 设置RGB增量 */
    function setRGBIncrement() {
        incrementCount = 0;
        R_Increment = (color1.R - color2.R) / incrementMAX;
        G_Increment = (color1.G - color2.G) / incrementMAX;
        B_Increment = (color1.B - color2.B) / incrementMAX;
    }

    /**
     * 通过RGB字符串更新RGB颜色对象
     * 字符串格式为"R,B,G"，例如："255,255,255"
     *
     * @param {!Object} colorObj RGB颜色对象
     * @param {string}  colorStr RGB颜色字符串
     */
    function setColorObj(colorObj, colorStr) {
        colorObj.R = parseInt(colorStr.split(",")[0]);
        colorObj.G = parseInt(colorStr.split(",")[1]);
        colorObj.B = parseInt(colorStr.split(",")[2]);
    }

    /**
     * 设置随机RGB颜色对象
     * 随机生成0-255范围内RGB颜色
     *
     * @param {!Object} colorObj RGB颜色对象
     */
    function setRandomColor(colorObj) {
        colorObj.R = Math.floor(255 * Math.random());
        colorObj.G = Math.floor(255 * Math.random());
        colorObj.B = Math.floor(255 * Math.random());
    }

    // 构造函数和公共方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     * @class VisualizerBars
     *
     * @param {!Object} el      被选中的节点
     * @param {Object}  options 参数对象
     */
    let VisualizerBars = function (el, options) {
        this.$el = $(el);

        // 全局参数
        this.opacity = options.opacity;                        // 不透明度
        this.colorMode = options.colorMode;                    // 颜色模式
        // 颜色模式-单色
        this.color = options.color;                            // 颜色
        this.shadowColor = options.shadowColor;                // 阴影颜色
        this.shadowBlur = options.shadowBlur;                  // 模糊大小
        // 颜色模式-颜色变换
        this.isRandomColor = options.isRandomColor;            // 随机颜色开关
        this.firstColor = options.firstColor;                  // 起始颜色
        this.secondColor = options.secondColor;                // 最终颜色
        this.isChangeBlur = options.isChangeBlur;              // 模糊变换开关
        // 颜色模式-彩虹
        this.hueRange = options.hueRange;                      // 色相范围
        this.saturationRange = options.saturationRange;        // 饱和度范围(%)
        this.lightnessRange = options.lightnessRange;          // 亮度范围(%)
        this.gradientOffset = options.gradientOffset;          // 旋转渐变效果
        // 坐标参数
        this.offsetX = options.offsetX;                        // X坐标偏移
        this.offsetY = options.offsetY;                        // Y坐标偏移
        this.isClickOffset = options.isClickOffset;            // 鼠标坐标偏移
        // 音频参数
        this.amplitude = options.amplitude;                    // 振幅
        this.decline = options.decline;                        // 衰退值
        this.peak = options.peak;                              // 峰值
        // 条形参数
        this.isBars = options.isBars;                          // 显示条形
        this.isLineTo = options.isLineTo;                      // 显示连线
        this.width = options.width;                            // 宽度比例
        this.height = options.height;                          // 基础高度
        this.pointNum = options.pointNum;                      // 点的数量
        this.barsRotation = options.barsRotation;              // 旋转角度
        this.barsDirection = options.barsDirection;            // 条形方向
        this.lineCap = options.lineCap;                        // 线帽类型
        this.lineJoin = options.lineJoin;                      // 交互类型
        this.lineWidth = options.lineWidth;                    // 线条粗细
        this.milliSec = options.milliSec;                      // 重绘间隔

        // 创建并初始化canvas
        canvas = document.createElement('canvas');
        canvas.id = 'canvas-visualizerbars'; // canvas ID
        $(canvas).css({
            'position': 'fixed',
            'top': 0,
            'left': 0,
            'z-index': 3,
            'opacity': this.opacity
        });  // canvas CSS
        canvasWidth = canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        canvasHeight = canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        // 获取最小宽度、原点XY坐标和初始XY坐标
        minLength = canvasWidth * this.width;
        originX = canvasWidth * this.offsetX;
        originY = canvasHeight * this.offsetY;
        startX = originX - minLength / 2;
        startY = originY;

        // 创建并初始化绘图的环境
        context = canvas.getContext('2d');
        context.fillStyle = 'rgb(' + this.color + ')';
        // 线条属性
        context.lineWidth = this.lineWidth;
        context.miterLimit = Math.max(10, this.lineWidth);
        context.lineCap = this.lineCap;
        context.lineJoin = this.lineJoin;
        context.strokeStyle = 'rgb(' + this.color + ')';
        // 阴影属性
        context.shadowColor = 'rgb(' + this.shadowColor + ')';
        context.shadowBlur = this.shadowBlur;
        // 颜色对象
        setColorObj(color1, this.firstColor);
        setColorObj(color2, this.secondColor);
        // 彩虹渐变对象数组
        rainBowArray = this.setRainBow(this.pointNum);

        $(this.$el).append(canvas);  // 添加canvas

        // 默认开启
        this.setupPointerEvents();
        this.updateVisualizerBars(lastAudioSamples);
        this.drawVisualizerBars();
    };

    // 默认参数
    VisualizerBars.DEFAULTS = {
        // 基础参数
        opacity: 0.90,               // 不透明度
        colorMode: 'monochrome',     // 颜色模式
        // 颜色模式-单色
        color: '255,255,255',        // 颜色
        shadowColor: '255,255,255',  // 阴影颜色
        shadowBlur: 0,               // 模糊大小
        // 颜色模式-颜色变换
        isRandomColor: true,         // 随机颜色变换
        firstColor: '255,255,255',   // 起始颜色
        secondColor: '255,0,0',      // 最终颜色
        isChangeBlur: false,         // 模糊颜色变换开关
        // 颜色模式-彩虹
        hueRange: 360,               // 色相范围
        saturationRange: 100,        // 饱和度范围(%)
        lightnessRange: 50,          // 亮度范围(%)
        gradientOffset: 0,           // 渐变效果偏移
        // 坐标参数
        offsetX: 0.5,                // X坐标偏移
        offsetY: 0.9,                // Y坐标偏移
        isClickOffset: false,        // 鼠标坐标偏移
        // 音频参数
        amplitude: 5,                // 振幅
        decline: 0.2,                // 衰退值
        peak: 1.5,                   // 峰值
        // 线条参数
        isBars: false,               // 显示条形
        isLineTo: false,             // 显示连线
        width: 0.5,                  // 宽度比例
        height: 2,                   // 基础高度
        pointNum: 120,               // 点的数量
        barsRotation: 0,             // 旋转角度
        barsDirection: 'two bars',   // 条形方向
        lineCap: 'butt',             // 线帽类型
        lineJoin: 'miter',           // 交汇类型
        lineWidth: 5,                // 线条粗细
        milliSec: 30                 // 重绘间隔
    };

    // 公共方法
    VisualizerBars.prototype = {

        // 面向内部方法
        //-----------------------------------------------------------

        /**
         * 比较并获取音频数组索引对应值
         * 若小于上一个点的音频数组索引对应值，则取上次记录对应值，反之取当前索引对应值
         * decline保证音频数组衰退时，音频圆环能平缓收缩。
         * decline越小过渡越缓慢，越大过渡越迅速（甚至失效）
         * @private
         *
         * @param  {Array<float>}   audioSamples 音频数组
         * @param  {int}            index        音频数组索引
         * @param  {boolean<float>} isUpdate     是否更新上次音频数组记录
         * @return {Array<float>} 音频取样值
         */
        getAudioSamples: function (audioSamples, index, isUpdate) {
            if (!audioSamples) {
                return [];
            }
            this.decline = this.decline || 0.01;
            let audioValue = audioSamples[index] ? audioSamples[index] : 0;
            audioValue = Math.max(audioValue, lastAudioSamples[index] - this.decline);
            audioValue = Math.min(audioValue, this.peak);
            if (isUpdate) {
                lastAudioSamples[index] = audioValue;
            }
            return audioValue;
        },


        /**
         * 生成静态点的坐标集合
         * 生成静态音频条形坐标数组
         * @private
         *
         * @param  {Array<float>}   audioSamples 音频数组
         * @return {Array<Object>} 坐标数组
         */
        setStaticPoint: function (audioSamples) {
            let pointArray = [];
            let barsArray = getBarsArray(audioSamples, this.pointNum);
            let spacing = minLength / (barsArray.length - 1);
            // 将barsArray.length点数组转换成中央左侧坐标数组
            for (let i = 0; i < barsArray.length; i++) {
                let x = startX + i * spacing;
                pointArray.push({x: x, y: originY});
            }
            return pointArray;
        },

        /**
         * 生成音频条形点的坐标集合
         * 根据音频数组值生成对应点坐标，并储存在坐标数组中
         * @private
         *
         * @param  {Array<float>}   audioSamples 音频数组
         * @param  {int}            direction    方向（1或则-1）
         * @param  {boolean<float>} isChange     更新lastAudioSamples[index]布尔值
         * @return {Array<Object>} 坐标数组
         */
        setPoint: function (audioSamples, direction, isChange) {
            let pointArray = [];
            let barsArray = getBarsArray(audioSamples, this.pointNum);
            let spacing = minLength / (barsArray.length - 1);
            // 将barsArray.length点数组转换成坐标数组
            for (let i = 0; i < barsArray.length; i++) {
                let audioValue = this.getAudioSamples(audioSamples, i, isChange);
                let x = startX + i * spacing;
                let y = originY + direction * (this.height + audioValue * this.amplitude * 15);
                pointArray.push({x: x, y: y});
            }
            return pointArray;
        },

        /**
         * 绘制音频连线
         * 根据坐标数组绘制音频条形
         * @private
         *
         * @param {Array<Object>} pointArray 坐标数组
         */
        drawLine: function (pointArray) {
            context.save();
            context.beginPath();
            context.moveTo(pointArray[0].x, pointArray[0].y);
            for (let i = 1; i < pointArray.length; i++) {
                context.lineTo(pointArray[i].x, pointArray[i].y);
            }
            context.stroke();
            context.closePath();
            context.restore();
        },

        /**
         * 绘制音频条形
         * 根据坐标数组绘制上条形、下条形以及静态条形之间连线
         * @private
         *
         * @param {Array<Object>} pointArray1 坐标数组1
         * @param {Array<Object>} pointArray2 坐标数组2
         */
        drawBars: function (pointArray1, pointArray2) {
            context.save();
            context.beginPath();
            let max = Math.min(pointArray1.length, pointArray2.length);
            for (let i = 0; i < max; i++) {
                context.moveTo(pointArray1[i].x, pointArray1[i].y);
                context.lineTo(pointArray2[i].x, pointArray2[i].y);
            }
            context.closePath();
            context.stroke();
            context.restore();
        },


        /**
         * 音频圆环和小球颜色变换
         * @private
         */
        colorTransformation: function () {
            if (incrementCount < incrementMAX) {
                // color1对象向color2对象变化
                color1.R -= R_Increment;
                color1.G -= G_Increment;
                color1.B -= B_Increment;
                incrementCount++;
                // 改变context颜色属性
                currantColor = Math.floor(color1.R) + ',' + Math.floor(color1.G) + ',' + Math.floor(color1.B);
                context.fillStyle = 'rgb(' + currantColor + ')';
                context.strokeStyle = 'rgb(' + currantColor + ')';
                // 如果绑定模糊颜色
                if (this.isChangeBlur) {
                    context.shadowColor = 'rgb(' + currantColor + ')';
                }
            } else if (colorDirection === 'left' && !this.isRandomColor) {
                // 反方向改变颜色
                setColorObj(color1, this.secondColor);
                setColorObj(color2, this.firstColor);
                setRGBIncrement();
                colorDirection = 'right';
            } else if (colorDirection === 'right' && !this.isRandomColor) {
                // 正方向改变颜色
                setColorObj(color1, this.firstColor);
                setColorObj(color2, this.secondColor);
                setRGBIncrement();
                colorDirection = 'left';
            } else if (this.isRandomColor) {
                // 随机生成目标颜色
                setColorObj(color1, currantColor);
                setRandomColor(color2);
                setRGBIncrement();
            }
        },

        /**
         * 生成彩虹颜色对象集合
         * @private
         */
        setRainBow: function (pointNum) {
            let rainBowArray = [];
            let H_Increment = this.hueRange / (pointNum * 2);
            let currantH = gradientOffsetRange || 0;
            for (let i = 0; i < pointNum; i++) {
                let startH = currantH;
                currantH += H_Increment;
                let endH = currantH;
                currantH += H_Increment;
                rainBowArray.push({startH: startH, endH: endH});
            }
            return rainBowArray;
        },

        /**
         * 根据线的宽度获取坐标
         * @private
         *
         * @param  {float} x         线的坐标x
         * @param  {float} y         线的坐标y
         * @param  {int}   lineWidth 线宽
         * @return {!Object} 两侧坐标XY对象
         */
        getLineXY: function (x, y, lineWidth) {
            return {
                x1: x - (lineWidth / 2),
                y1: y - (lineWidth / 2),
                x2: x + (lineWidth / 2),
                y2: y + (lineWidth / 2)
            };
        },

        /**
         * 生成彩虹线性渐变
         * @private
         *
         * @param {int}   rainBow rainBow对象
         * @param {float} x1      渐变开始点的 x 坐标
         * @param {float} y1      渐变开始点的 y 坐标
         * @param {float} x2      渐变结束点的 x 坐标
         * @param {float} y2      渐变结束点的 y 坐标
         * @return {!Object} 彩虹渐变对象
         */
        getRainBowGradient: function (rainBow, x1, y1, x2, y2) {
            let rainBowGradient = context.createLinearGradient(x1, y1, x2, y2);
            rainBowGradient.addColorStop(0, 'hsl(' + rainBow.startH + ',' + this.saturationRange + '%,' + this.lightnessRange + '%)');
            rainBowGradient.addColorStop(1, 'hsl(' + rainBow.endH + ',' + this.saturationRange + '%,' + this.lightnessRange + '%)');
            return rainBowGradient;
        },

        /**
         * 绘制彩虹音频连线
         * 根据坐标数组绘制彩虹音频条形
         * @private
         *
         * @param {Array<Object>} pointArray 坐标数组
         */
        drawRainBowLine: function (pointArray) {
            context.save();
            for (let i = 1; i < pointArray.length; i++) {
                context.beginPath();
                context.moveTo(pointArray[i - 1].x, pointArray[i - 1].y);
                context.lineTo(pointArray[i].x, pointArray[i].y);
                context.closePath();
                context.strokeStyle = this.getRainBowGradient(rainBowArray[i - 1], pointArray[i - 1].x, pointArray[i - 1].y, pointArray[i].x, pointArray[i].y);
                context.stroke();
            }
            context.restore();
        },

        /**
         * 绘制彩虹音频条形
         * 根据坐标数组绘制上条形、下条形以及静态条形之间彩虹连线
         * @private
         *
         * @param {Array<Object>} pointArray1 坐标数组1
         * @param {Array<Object>} pointArray2 坐标数组2
         */
        drawRainBowBars: function (pointArray1, pointArray2) {
            let XY = {};
            context.save();
            let max = Math.min(pointArray1.length, pointArray2.length);
            for (let i = 0; i < max; i++) {
                context.beginPath();
                context.moveTo(pointArray1[i].x, pointArray1[i].y);
                context.lineTo(pointArray2[i].x, pointArray2[i].y);
                XY = this.getLineXY(pointArray1[i].x, pointArray1[i].y, this.lineWidth);
                context.strokeStyle = this.getRainBowGradient(rainBowArray[i], XY.x1, XY.y1, XY.x2, XY.y2);
                context.closePath();
                context.stroke();
            }
            context.restore();
        },


        /**
         * 设置交互事件
         * @private
         */
        setupPointerEvents: function () {

            // 点击事件
            let that = this;
            $(this.$el).on('click', function (e) {
                if (that.isClickOffset) {
                    let x = e.clientX;
                    let y = e.clientY;
                    that.offsetX = x / canvasWidth;
                    that.offsetY = y / canvasHeight;
                    that.updateVisualizerBars(lastAudioSamples);
                    that.drawVisualizerBars();
                }
            });

            // 窗体改变事件
            $(window).on('resize', function () {
                // 改变宽度和高度
                canvasWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                canvasHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                // 获取最小宽度以及原点
                minLength = Math.min(canvasWidth, canvasHeight);
                originX = canvasWidth * this.offsetX;
                originY = canvasHeight * this.offsetY;
                that.updateVisualizerBars(lastAudioSamples);
                that.drawVisualizerBars();
            });

        },

        // 面向外部方法
        //-----------------------------------------------------------

        /** 清除Canvas内容 */
        clearCanvas: function () {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
        },

        /**
         * 更新音频条形参数
         * 更新条形坐标数组、偏移角度、原点坐标和音频条形颜色
         *
         * @param {Array<float>} audioSamples 音频数组
         */
        updateVisualizerBars: function (audioSamples) {
            // 更新宽度、原点坐标坐标以及初始XY坐标
            minLength = canvasWidth * this.width;
            originX = canvasWidth * this.offsetX;
            originY = canvasHeight * this.offsetY;
            startX = originX - minLength / 2;
            startY = originY;
            // 更新坐标数组
            staticPointsArray = this.setStaticPoint(audioSamples);
            pointArray1 = this.setPoint(audioSamples, -1, true);
            pointArray2 = this.setPoint(audioSamples, 1, false);
            // 更新音频圆环小球颜色
            if (this.colorMode === 'colorTransformation') {
                this.colorTransformation();
            }
            // 更新彩虹渐变参数
            if (this.colorMode === 'rainBow') {
                // 彩虹渐变偏移
                if (this.gradientOffset !== 0) {
                    gradientOffsetRange += this.gradientOffset || 0;
                    rainBowArray = this.setRainBow(this.pointNum);
                }
            }
        },

        /** 绘制音频条形 */
        drawVisualizerBars: function () {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            // 旋转canvas内容
            context.save();
            context.translate(startX + minLength / 2, startY);
            context.rotate((Math.PI / 180) * this.barsRotation);
            context.translate(-startX - minLength / 2, -startY);
            // 绘制连线
            if (this.isLineTo) {
                switch (this.barsDirection) {
                    case  'upper bars':
                        this.colorMode === 'rainBow' ? this.drawRainBowLine(pointArray1) : this.drawLine(pointArray1);
                        break;
                    case 'lower bars':
                        this.colorMode === 'rainBow' ? this.drawRainBowLine(pointArray2) : this.drawLine(pointArray2);
                        break;
                    case 'two bars':
                        this.colorMode === 'rainBow' ? this.drawRainBowLine(pointArray1) : this.drawLine(pointArray1);
                        this.colorMode === 'rainBow' ? this.drawRainBowLine(pointArray2) : this.drawLine(pointArray2);
                        break;
                    default:
                        this.colorMode === 'rainBow' ? this.drawRainBowLine(pointArray1) : this.drawLine(pointArray1);
                        this.colorMode === 'rainBow' ? this.drawRainBowLine(pointArray2) : this.drawLine(pointArray2);
                }
            }
            // 绘制条形
            if (this.isBars) {
                let firstArray = pointArray1;
                let secondArray = pointArray2;
                switch (this.barsDirection) {
                    case  'upper bars':
                        firstArray = pointArray1;
                        secondArray = staticPointsArray;
                        break;
                    case 'lower bars':
                        firstArray = staticPointsArray;
                        secondArray = pointArray2;
                        break;
                    case 'two bars':
                        firstArray = pointArray1;
                        secondArray = pointArray2;
                        break;
                    default:
                        firstArray = pointArray1;
                        secondArray = pointArray2;
                }
                this.colorMode === 'rainBow' ? this.drawRainBowBars(firstArray, secondArray) : this.drawBars(firstArray, secondArray);
            }
            context.restore();
        },

        /**
         * 根据音频数组绘制音频条形
         * 当上次音频数组记录和当前音频数组不处于静默状态、颜色变换状态、绘制条形
         *
         * @param  {Array<float>} audioSamples 音频数组
         */
        drawCanvas: function (audioSamples) {
            this.updateVisualizerBars(audioSamples);
            if (isSilence(audioSamples)
                || isSilence(lastAudioSamples)
                || this.colorMode === 'colorTransformation'
                || (this.colorMode === 'rainBow' && this.gradientOffset !== 0)) {
                this.drawVisualizerBars();
                RUN_COUNT = 1;
            } else if (RUN_COUNT > 0) {
                this.drawVisualizerBars();
                RUN_COUNT--;
            }
        },


        /** 停止音频圆环计时器 */
        stopVisualizerBarsTimer: function () {
            if (timer) {
                clearTimeout(timer);
            }
        },

        /** 运行音频圆环计时器 */
        runVisualizerBarsTimer: function () {
            this.stopVisualizerBarsTimer();
            timer = setTimeout(
                ()=> {
                    // 缺少静态判断
                    this.drawVisualizerBars();
                    this.runVisualizerBarsTimer();
                }, this.milliSec);
        },


        /** 移除canvas */
        destroy: function () {
            this.$el
                .off('#canvas-visualizerbars')
                .removeData('visualizerbars');
            $('#canvas-visualizerbars').remove();
        },

        /**
         * 修改参数
         *
         * @param {string} property 属性名
         * @param {*}      value    属性对应值
         */
        set: function (property, value) {
            switch (property) {
                case 'opacity':
                    $(canvas).css('opacity', value);
                    break;
                case 'color':
                    context.fillStyle = 'rgb(' + value + ')';
                    context.strokeStyle = 'rgb(' + value + ')';
                    this.drawVisualizerBars();
                    break;
                case 'shadowColor':
                    context.shadowColor = 'rgb(' + value + ')';
                    this.drawVisualizerBars();
                    break;
                case 'shadowBlur':
                    context.shadowBlur = value;
                    this.drawVisualizerBars();
                    break;
                case 'lineCap':
                    context.lineCap = value;
                    this.drawVisualizerBars();
                    break;
                case 'lineJoin':
                    context.lineJoin = value;
                    this.drawVisualizerBars();
                    break;
                case 'lineWidth':
                    context.lineWidth = value;
                    this.drawVisualizerBars();
                    break;
                case 'colorMode':
                case 'isRandomColor':
                case 'isChangeBlur':
                case 'gradientOffset':
                case 'isClickOffset':
                case 'amplitude':
                case 'decline':
                case 'peak':
                case 'milliSec':
                    this[property] = value;
                    break;
                case 'firstColor':
                    this.firstColor = value;
                    setColorObj(color1, this.firstColor);
                    setRGBIncrement();
                    break;
                case 'secondColor':
                    this.secondColor = value;
                    setColorObj(color2, this.secondColor);
                    setRGBIncrement();
                    break;
                case 'saturationRange':
                case 'lightnessRange':
                case 'offsetX':
                case 'offsetY':
                case 'isBars':
                case 'isLineTo':
                case 'width':
                case 'height':
                case 'barsRotation':
                case 'barsDirection':
                    this[property] = value;
                    this.updateVisualizerBars(lastAudioSamples);
                    this.drawVisualizerBars();
                    break;
                case 'hueRange':
                case 'pointNum':
                    this[property] = value;
                    rainBowArray = this.setRainBow(this.pointNum);
                    this.updateVisualizerBars(lastAudioSamples);
                    this.drawVisualizerBars();
                    break;
            }
        }

    };

    // 定义VisualizerBars插件
    //--------------------------------------------------------------------------------------------------------------

    let old = $.fn.visualizerbars;

    $.fn.visualizerbars = function (option) {
        let args = (arguments.length > 1) ? Array.prototype.slice.call(arguments, 1) : undefined;

        return this.each(function () {
            let $this = $(this);
            let data = $this.data('visualizerbars');
            let options = $.extend({}, VisualizerBars.DEFAULTS, $this.data(), typeof option === 'object' && option);

            if (!data && typeof option === 'string') {
                return;
            }
            if (!data) {
                $this.data('visualizerbars', (data = new VisualizerBars(this, options)));
            }
            else if (typeof option === 'string') {
                VisualizerBars.prototype[option].apply(data, args);
            }
        });
    };

    $.fn.visualizerbars.Constructor = VisualizerBars;

    // 确保插件不冲突
    $.fn.visualizerbars.noConflict = function () {
        $.fn.audiovisualize = old;
        return this;
    };

});
