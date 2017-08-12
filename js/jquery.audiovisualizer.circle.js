/*！
 * jQuery AudioVisualizer Circle plugin v0.1.0
 * project:
 * - https://github.com/Alice-Jie/4K-Circle-Audio-Visualizer
 * - https://git.oschina.net/Alice_Jie/circleaudiovisualizer
 * - http://steamcommunity.com/sharedfiles/filedetails/?id=921617616
 * @license MIT licensed
 * @author Alice
 * @date 2017/08/07
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
    let minLength = 300;            // 最小长度

    // 坐标数组
    let pointArray1 = [],
        pointArray2 = [],
        staticPointsArray = [],
        ballPointArray = [];

    // 上次音频数组记录
    let lastAudioSamples = [];
    for (let i = 0; i < 128; i++) {
        lastAudioSamples[i] = 0;
    }

    // 旋转角度
    let rotationAngle1 = 0,
        rotationAngle2 = 0;

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
    let ringRainBowArray = [],    // 圆环渐变数组
        ballRainBowArray = [];    // 小球渐变数组
    let gradientOffsetRange = 0;  // 偏移范围

    let runCount = 1;  // 绘制次数

    let timer = null;  // 音频圆环计时器

    // 私有方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     *  检测音频数组静默状态
     *  数组所有值皆为0返回true,反之返回false
     *
     * @param  {Array<float>} audioSamples 音频数组
     * @return {boolean} 静默状态布尔值
     */
    function isSilence(audioSamples) {
        if (!audioSamples) {
            return false;
        }
        for (let i = 0; i < audioSamples.length; i++) {
            if (audioSamples[i] !== 0) {
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
    function getRingArray(audioSamples, num) {
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

    /**
     * 根据小球间隔提取音频取样值
     * 获取数组长度等于audioSamples/spacer的音频数组
     *
     * @param  {Array<float>} audioSamples 音频数组
     * @param  {int}          spacer       小球间隔
     * @return {Array<float>} AudioArray   抽取后的音频数组
     */
    function getBallArray(audioSamples, spacer) {
        if (!audioSamples) {
            return [];
        }
        spacer = spacer || 1;
        if (!spacer || spacer <= 0) {
            spacer = 1;
        } else if (spacer > audioSamples) {
            return [];
        }
        let AudioArray = [];
        for (let i = 0; i < 120; i += spacer) {
            AudioArray.push(audioSamples[i] || 0);
        }
        return AudioArray;
    }

    /**
     * 比较并获取音频数组索引对应值
     * 若小于上一个点的音频数组索引对应值，则取上次记录对应值，反之取当前索引对应值
     * decline保证音频数组衰退时，音频圆环能平缓收缩，而不是突然变回圆形
     * 当然，decline越小过渡越缓慢，越大过渡越迅速（甚至失效）
     *
     * @param {Array<float>}   audioSamples 音频数组
     * @param {int}            index        音频数组索引
     * @param {float}          decline      衰退值
     * @param {float}          peak         峰值
     * @param {boolean<float>} isUpdate     是否更新上次音频数组记录
     * @return 音频取样值
     */
    function getAudioSamples(audioSamples, index, decline, peak, isUpdate) {
        if (!audioSamples) {
            return [];
        }
        decline = decline || 0.01;
        let audioValue = audioSamples[index] ? audioSamples[index] : 0;
        audioValue = Math.max(audioValue, lastAudioSamples[index] - decline);
        audioValue = Math.min(audioValue, peak);
        if (isUpdate) {
            lastAudioSamples[index] = audioValue;
        }
        return audioValue;
    }


    /**
     * 角度偏移
     * 获取当前角度偏移后的角度值
     *
     * @param  {int} rotationAngle 当前角度
     * @param  {int} deg           偏移角度
     * @return {int} 偏移后角度值
     */
    function rotation(rotationAngle, deg) {
        if (!deg || deg === 0) {
            return rotationAngle;
        }
        return rotationAngle += Math.PI / 180 * deg;
    }

    /**
     *  获取当前点对应的角度
     *
     * @param  {int} point 点的数量
     * @param  {int} index 音频数组索引
     * @param  {int} angle 当前角度
     * @return {float} 当前点对应的角度
     */
    function getDeg(point, index, angle) {
        return (Math.PI / 180) * (360 / point * (index + angle / 3) + 90);
    }

    /**
     * 角度转换至XY坐标
     * 根据当前点对应的角度、半径、圆心XY坐标获取点对应的XY坐标
     *
     * @param  {int} radius 角度
     * @param  {int} deg    半径
     * @param  {int} x      原点X轴坐标
     * @param  {int} y      原点Y轴坐标
     * @return {Object} 坐标对象
     */
    function getXY(radius, deg, x, y) {
        return {
            x: Math.cos(deg) * radius + x,
            y: Math.sin(deg) * radius + y
        };
    }

    /**
     * 获取点对应的坐标数组
     * 根据点所在的环获取对应坐标数组
     *
     * @param  {int} ring 点所在的环
     * @return {!Object} 坐标数组
     */
    function getPointArray(ring) {
        switch (ring) {
            // 静态环
            case 'staticRing':
                return staticPointsArray;
            // 内环
            case 'innerRing':
                return pointArray1;
            // 外环
            case 'outerRing':
                return pointArray2;
            default:
                console.error("ring is undefined.");
        }
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
     *  初始化VisualizerCircle
     *
     * @param {!Object} el      被选中的节点
     * @param {Object}  options 参数对象
     */
    let VisualizerCircle = function (el, options) {
        this.$el = $(el);

        // 全局参数
        this.opacity = options.opacity;                    // 不透明度
        this.colorMode = options.colorMode;                // 颜色模式
        // 颜色模式-单色
        this.color = options.color;                        // 颜色
        this.shadowColor = options.shadowColor;            // 阴影颜色
        this.shadowBlur = options.shadowBlur;              // 模糊大小
        this.isRandomColor = options.isRandomColor;        // 随机颜色开关
        // 颜色模式-颜色变换
        this.firstColor = options.firstColor;              // 起始颜色
        this.secondColor = options.secondColor;            // 最终颜色
        this.isChangeBlur = options.isChangeBlur;          // 模糊变换开关
        // 颜色模式-彩虹
        this.hueRange = options.hueRange;                  // 色相范围
        this.saturationRange = options.saturationRange;    // 饱和度范围(%)
        this.lightnessRange = options.lightnessRange;      // 亮度范围(%)
        this.gradientOffset = options.gradientOffset;      // 旋转渐变效果
        // 坐标参数
        this.offsetX = options.offsetX;                    // X坐标偏移
        this.offsetY = options.offsetY;                    // Y坐标偏移
        this.isClickOffset = options.isClickOffset;        // 鼠标坐标偏移
        // 音频参数
        this.amplitude = options.amplitude;                // 振幅
        this.decline = options.decline;                    // 衰退值
        this.peak = options.peak;                          // 峰值
        // 圆环参数
        this.isRing = options.isRing;                      // 显示环
        this.isStaticRing = options.isStaticRing;          // 显示静态环
        this.isInnerRing = options.isInnerRing;            // 显示内环
        this.isOuterRing = options.isOuterRing;            // 显示外环
        this.isWare = options.isWare;                      // 波浪模式
        this.radius = options.radius;                      // 半径
        this.ringRotation = options.ringRotation;          // 圆环旋转
        this.milliSec = options.milliSec;                  // 绘制间隔(ms);
        // 线条参数
        this.isLineTo = options.isLineTo;                  // 是否连线
        this.firstPoint = options.firstPoint;              // 始点
        this.secondPoint = options.secondPoint;            // 末点
        this.pointNum = options.pointNum;                  // 点的数量
        this.innerDistance = options.innerDistance;        // 内环距离
        this.outerDistance = options.outerDistance;        // 外环距离
        this.lineCap = options.lineCap;                    // 线帽类型
        this.lineJoin = options.lineJoin;                  // 交互类型
        this.lineWidth = options.lineWidth;                // 线条粗细
        // 小球参数
        this.isBall = options.isBall;                      // 显示小球
        this.ballSpacer = options.ballSpacer;              // 小球间隔
        this.ballDistance = options.ballDistance;          // 小球距离
        this.ballSize = options.ballSize;                  // 小球大小
        this.ballDistance = options.ballDirection;         // 小球方向
        this.bindRingRotation = options.bindRingRotation;  // 绑定圆环旋转
        this.ballRotation = options.ballRotation;          // 小球旋转


        // 创建并初始化canvas
        canvas = document.createElement('canvas');
        canvas.id = 'canvas-visualizercircle'; // canvas ID
        $(canvas).css({
            'position': 'fixed',
            'top': 0,
            'left': 0,
            'z-index': 2,
            'opacity': this.opacity
        });  // canvas CSS
        canvasWidth = canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        canvasHeight = canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        // 获取最小宽度以及原点XY坐标
        minLength = Math.min(canvasWidth, canvasHeight);
        originX = canvasWidth * this.offsetX;
        originY = canvasHeight * this.offsetY;

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
        ringRainBowArray = this.setRainBow(this.pointNum);
        ballRainBowArray = this.setRainBow(120 / this.ballSpacer);

        $(this.$el).append(canvas);  // 添加canvas

        // 默认开启
        this.setupPointerEvents();
        this.updateVisualizerCircle(lastAudioSamples);
        this.drawVisualizerCircle();
    };

    // 默认参数
    VisualizerCircle.DEFAULTS = {
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
        offsetY: 0.5,                // Y坐标偏移
        isClickOffset: false,        // 鼠标坐标偏移
        // 音频参数
        radius: 0.5,                 // 半径
        amplitude: 5,                // 振幅
        decline: 0.2,                // 衰退值
        peak: 1.5,                   // 峰值
        // 圆环参数
        isRing: true,                // 显示环
        isStaticRing: false,         // 显示静态环
        isInnerRing: true,           // 显示内环
        isOuterRing: true,           // 显示外环
        isWare: false,               // 波浪模式
        ringRotation: 0,             // 圆环旋转
        milliSec: 30,                // 重绘间隔（ms）
        // 线条参数
        isLineTo: false,             // 是否连线
        firstPoint: 'innerRing',     // 始点
        secondPoint: 'outerRing',    // 末点
        pointNum: 120,               // 点的数量
        innerDistance: 0,            // 内环距离
        outerDistance: 0,            // 外环距离
        lineCap: 'butt',             // 线帽类型
        lineJoin: 'miter',           // 交汇类型
        lineWidth: 5,                // 线条粗细
        // 小球参数
        isBall: true,                // 显示小球
        ballSpacer: 3,               // 小球间隔
        ballDistance: 50,            // 小球距离
        ballSize: 3,                 // 小球大小
        ballDirection: 1,            // 小球方向
        bindRingRotation: false,     // 绑定圆环旋转
        ballRotation: 0              // 小球旋转
    };

    // 公共方法
    VisualizerCircle.prototype = {

        // 面向内部方法
        //-----------------------------------------------------------

        /**
         * 生成静态点的坐标集合
         * 生成静态音频圆环坐标数组
         *
         * @param  {Array<float>}   audioSamples 音频数组
         * @return {Array<Object>} 坐标数组
         */
        setStaticPoint: function (audioSamples) {
            let pointArray = [];
            let ringArray = getRingArray(audioSamples, this.pointNum);
            // 将点数组转换成坐标数组
            for (let i = 0; i < ringArray.length; i++) {
                let deg = getDeg(ringArray.length, i, rotationAngle1);
                let radius = this.radius * (minLength / 2);
                // 根据半径、角度、原点坐标获得坐标数组
                let point = getXY(radius, deg, originX, originY);
                pointArray.push(point);
            }
            return pointArray;
        },

        /**
         * 生成音频圆环点的坐标集合
         * 根据音频数组值生成对应点坐标，并储存在坐标数组中
         *
         * @param  {Array<float>}   audioSamples 音频数组
         * @param  {int}            direction    方向（1或则-1）
         * @param  {int}            distance     与静态环之间距离
         * @param  {boolean<float>} isChange     更新lastAudioSamples[index]布尔值
         * @return {Array<Object>} 坐标数组
         */
        setPoint: function (audioSamples, direction, distance, isChange) {
            let pointArray = [];
            let ringArray = getRingArray(audioSamples, this.pointNum);
            // 将点数组转换成坐标数组
            for (let i = 0; i < ringArray.length; i++) {
                let deg = getDeg(ringArray.length, i, rotationAngle1);
                let audioValue = getAudioSamples(audioSamples, i, this.decline, this.peak, isChange);
                let radius = this.radius * (minLength / 2)
                    + direction * (distance + audioValue * (this.amplitude * 15));
                // 根据半径、角度、原点坐标获得坐标数组
                let point = getXY(radius, deg, originX, originY);
                pointArray.push(point);
            }
            return pointArray;
        },

        /**
         * 生成音频小球坐标的集合
         * 根据音频数组值生成对应小球坐标，并储存在坐标数组中
         *
         * @param  {Array<float>} audioSamples 音频数组
         * @param  {int}          direction    方向（1或则-1）
         * @return {Array<Object>} 坐标数组
         */
        setBall: function (audioSamples, direction) {
            let pointArray = [];
            let ballArray = getBallArray(audioSamples, this.ballSpacer);
            // 将点数组转换成坐标数组
            for (let i = 0; i < ballArray.length; i++) {
                let deg = getDeg(ballArray.length, i, rotationAngle2);
                let audioValue = Math.min(audioSamples[i] ? audioSamples[i] : 0, 1);
                let radius = this.radius * (minLength / 2)
                    + (this.outerDistance + this.ballDistance)
                    + direction * (audioValue * 75);
                // 根据半径、角度、原点坐标获得坐标数组
                let point = getXY(radius, deg, originX, originY);
                pointArray.push(point);
            }
            return pointArray;
        },

        /**
         * 绘制音频圆环
         * 根据坐标数组绘制音频圆环
         *
         *  @param {Array<Object>} pointArray 坐标数组
         */
        drawRing: function (pointArray) {
            context.save();
            context.beginPath();
            // 首尾之间的连线
            let end = pointArray.length - 1;
            context.beginPath();
            context.moveTo(pointArray[end].x, pointArray[end].y);
            context.lineTo(pointArray[0].x, pointArray[0].y);
            // 坐标数组之间连线
            for (let i = 1; i < pointArray.length; i++) {
                context.lineTo(pointArray[i].x, pointArray[i].y);
            }
            context.closePath();
            context.stroke();
            context.restore();
        },

        /**
         * 绘制环与环连线
         * 根据坐标数组绘制内环、外环以及静态环之间连线
         *
         *  @param {Array<Object>} pointArray1 坐标数组1
         *  @param {Array<Object>} pointArray2 坐标数组2
         */
        drawLine: function (pointArray1, pointArray2) {
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
         * 绘制音频小球
         * 根据坐标数组绘制音频小球
         *
         *  @param {Array<Object>} pointArray 坐标数组
         *  @param {int}           ballSize   小球大小
         */
        drawBall: function (pointArray, ballSize) {
            context.save();
            for (let i = 0; i < pointArray.length; i++) {
                context.beginPath();
                context.arc(pointArray[i].x - 0.5, pointArray[i].y - 0.5, ballSize, 0, 360, false);
                context.closePath();
                context.fill();
            }
            context.restore();
        },

        /**
         * 绘制音频波浪
         *
         *  @param {Array<Object>} pointArray1 坐标数组1
         *  @param {Array<Object>} pointArray2 坐标数组2
         */
        drawWave: function (pointArray1, pointArray2) {
            context.save();
            context.beginPath();
            // 圆环1首尾之间的连线
            let end1 = pointArray1.length - 1;
            context.beginPath();
            context.moveTo(pointArray1[end1].x, pointArray1[end1].y);
            context.lineTo(pointArray1[0].x, pointArray1[0].y);
            // 顺指针连接圆环1路径
            for (let i = 1; i < pointArray1.length; i++) {
                context.lineTo(pointArray1[i].x, pointArray1[i].y);
            }
            context.closePath();
            // 圆环2首尾之间的连线
            let end2 = pointArray2.length - 1;
            context.moveTo(pointArray2[0].x, pointArray2[0].y);
            context.lineTo(pointArray2[end2].x, pointArray2[end2].y);
            // 逆指针连接圆环2路径
            for (let i = pointArray2.length - 2; i >= 0; i--) {
                context.lineTo(pointArray2[i].x, pointArray2[i].y);
            }
            context.closePath();
            // 填充内部区域
            context.fill();
            context.restore();
        },


        /** 音频圆环和小球颜色变换 */
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
            } else if (colorDirection === 'left' && this.isRandomColor === false) {
                // 反方向改变颜色
                setColorObj(color1, this.secondColor);
                setColorObj(color2, this.firstColor);
                setRGBIncrement();
                colorDirection = 'right';
            } else if (colorDirection === 'right' && this.isRandomColor === false) {
                // 正方向改变颜色
                setColorObj(color1, this.firstColor);
                setColorObj(color2, this.secondColor);
                setRGBIncrement();
                colorDirection = 'left';
            } else if (this.isRandomColor === true) {
                // 随机生成目标颜色
                setColorObj(color1, currantColor);
                setRandomColor(color2);
                setRGBIncrement();
            }
        },

        /** 生成彩虹颜色对象集合 */
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
         * 绘制彩虹音频圆环
         * 根据坐标数组绘制彩虹音频圆环
         *
         *  @param {Array<Object>} pointArray 坐标数组
         */
        drawRainBowRing: function (pointArray) {
            context.save();
            // 首尾之间的连线
            let end = pointArray.length - 1;
            context.beginPath();
            context.moveTo(pointArray[end].x, pointArray[end].y);
            context.lineTo(pointArray[0].x, pointArray[0].y);
            context.closePath();
            context.strokeStyle = 'red';
            context.stroke();
            // 点与点之间的连线
            for (let i = 1; i < pointArray.length; i++) {
                context.beginPath();
                context.moveTo(pointArray[i - 1].x, pointArray[i - 1].y);
                context.lineTo(pointArray[i].x, pointArray[i].y);
                context.closePath();
                context.strokeStyle = this.getRainBowGradient(ringRainBowArray[i - 1], pointArray[i - 1].x, pointArray[i - 1].y, pointArray[i].x, pointArray[i].y);
                context.stroke();
            }
            context.restore();
        },

        /**
         * 绘制环与环彩虹连线
         * 根据坐标数组绘制内环、外环以及静态环之间彩虹连线
         *
         *  @param {Array<Object>} pointArray1 坐标数组1
         *  @param {Array<Object>} pointArray2 坐标数组2
         */
        drawRainBowLine: function (pointArray1, pointArray2) {
            let XY = {};
            context.save();
            let max = Math.min(pointArray1.length, pointArray2.length);
            for (let i = 0; i < max; i++) {
                context.beginPath();
                context.moveTo(pointArray1[i].x, pointArray1[i].y);
                context.lineTo(pointArray2[i].x, pointArray2[i].y);
                context.closePath();
                XY = this.getLineXY(pointArray1[i].x, pointArray1[i].y, this.lineWidth);
                context.strokeStyle = this.getRainBowGradient(ringRainBowArray[i], XY.x1, XY.y1, XY.x2, XY.y2);
                context.stroke();
            }
            context.restore();
        },

        /**
         * 绘制彩虹音频小球
         * 根据坐标数组绘制彩虹音频小球
         *
         *  @param {Array<Object>} pointArray 坐标数组
         *  @param {int}           ballSize   小球大小
         */
        drawRainBowBall: function (pointArray, ballSize) {
            let XY = {};
            context.save();
            for (let i = 0; i < pointArray.length; i++) {
                context.beginPath();
                context.arc(pointArray[i].x - 0.5, pointArray[i].y - 0.5, ballSize, 0, 360, false);
                context.closePath();
                XY = this.getLineXY(pointArray[i].x - 0.5, pointArray[i].y - 0.5, ballSize);
                context.fillStyle = this.getRainBowGradient(ballRainBowArray[i], XY.x1, XY.y1, XY.x2, XY.y2);
                context.fill();
            }
            context.restore();
        },

        /** 设置交互事件 */
        setupPointerEvents: function () {

            // 点击事件
            let that = this;
            $(this.$el).on('click', function (e) {
                if (that.isClickOffset) {
                    let x = e.clientX;
                    let y = e.clientY;
                    that.offsetX = x / canvasWidth;
                    that.offsetY = y / canvasHeight;
                    that.updateVisualizerCircle(lastAudioSamples);
                    that.drawVisualizerCircle();
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
                that.updateVisualizerCircle(lastAudioSamples);
                that.drawVisualizerCircle();
            });

        },

        // 面向外部方法
        //-----------------------------------------------------------

        /** 清除Canvas内容 */
        clearCanvas: function () {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
        },

        /**
         * 更新音频圆环参数
         * 更新内外圆环、音频小球坐标数组、偏移角度、原点坐标和音频圆环小球颜色
         *
         * @param {Array<float>} audioSamples 音频数组
         */
        updateVisualizerCircle: function (audioSamples) {
            // 更新原点XY坐标
            originX = canvasWidth * this.offsetX;
            originY = canvasHeight * this.offsetY;
            // 更新坐标数组
            staticPointsArray = this.setStaticPoint(audioSamples);
            pointArray1 = this.setPoint(audioSamples, -1, this.innerDistance, true);
            pointArray2 = this.setPoint(audioSamples, 1, this.outerDistance, false);
            ballPointArray = this.setBall(audioSamples, this.ballDirection);
            // 更新偏移角度
            rotationAngle1 = rotation(rotationAngle1, this.ringRotation);
            rotationAngle2 = rotation(rotationAngle2, this.bindRingRotation ? this.ringRotation : this.ballRotation);
            // 更新变换颜色
            if (this.colorMode === 'colorTransformation') {
                this.colorTransformation();
            }
            // 更新彩虹渐变参数
            if (this.colorMode === 'rainBow') {
                // 彩虹渐变偏移
                if (this.gradientOffset !== 0) {
                    gradientOffsetRange += this.gradientOffset || 0;
                    ringRainBowArray = this.setRainBow(this.pointNum);
                    ballRainBowArray = this.setRainBow(120 / this.ballSpacer);
                }
            }
        },

        /** 绘制音频圆环和小球 */
        drawVisualizerCircle: function () {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            // 绘制音频圆环
            if (this.isRing && this.colorMode !== 'rainBow') {
                if (this.isWare) {
                    // 非音频波浪模式
                    if (this.isStaticRing && this.isInnerRing && !this.isOuterRing) {
                        // 静态圆环和内环
                        this.drawWave(pointArray1, staticPointsArray);
                    } else if (this.isStaticRing && !this.isInnerRing && this.isOuterRing) {
                        // 静态圆环和外环
                        this.drawWave(staticPointsArray, pointArray2);
                    } else if (!this.isStaticRing && this.isInnerRing && this.isOuterRing) {
                        // 内环和外环
                        this.drawWave(pointArray1, pointArray2);
                    } else if (this.isStaticRing && this.isInnerRing && this.isOuterRing) {
                        // 静态圆环、内环和外环
                        this.drawWave(pointArray1, pointArray2);
                    }
                } else {
                    // 非音频波浪模式
                    this.isStaticRing && this.drawRing(staticPointsArray);
                    this.isInnerRing && this.drawRing(pointArray1);
                    this.isOuterRing && this.drawRing(pointArray2);
                }
            }
            // 绘制双环连线
            let firstArray = getPointArray(this.firstPoint);
            let secondArray = getPointArray(this.secondPoint);
            if (this.isLineTo && this.firstPoint !== this.secondPoint) {
                this.colorMode === 'rainBow' ? this.drawRainBowLine(firstArray, secondArray) : this.drawLine(firstArray, secondArray);
            }
            // 绘制音频小球
            if (this.isBall) {
                this.colorMode === 'rainBow' ? this.drawRainBowBall(ballPointArray, this.ballSize) : this.drawBall(ballPointArray, this.ballSize);
            }
        },

        /**
         * 根据音频数组绘制音频圆环和音频小球
         * 当上次音频数组记录和当前音频数组不处于静默状态、颜色变换状态、旋转状态时，绘制音频圆环和音频小球
         *
         * @param  {Array<float>} audioSamples 音频数组
         */
        drawCanvas: function (audioSamples) {
            this.updateVisualizerCircle(audioSamples);
            if (isSilence(audioSamples)
                || isSilence(lastAudioSamples)
                || this.colorMode === 'colorTransformation'
                || (this.colorMode === 'rainBow' && this.gradientOffset !== 0)
                || (this.ringRotation && this.isLineTo)
                || this.ballRotation) {
                this.drawVisualizerCircle();
                runCount = 1;
            } else if (runCount > 0) {
                this.drawVisualizerCircle();
                runCount--;
            }
        },


        /** 停止音频圆环计时器 */
        stopVisualizerCircleTimer: function () {
            if (timer) {
                clearTimeout(timer);
            }
        },

        /** 运行音频圆环计时器 */
        runVisualizerCircleTimer: function () {
            this.stopVisualizerCircleTimer();
            timer = setTimeout(
                ()=> {
                    // 缺少静态判断
                    this.drawVisualizerCircle();
                    this.runVisualizerCircleTimer();
                }, this.milliSec);
        },


        /** 移除canvas */
        destroy: function () {
            this.$el
                .off('#canvas-visualizercircle')
                .removeData('visualizercircle');
            $('#canvas-visualizercircle').remove();
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
                    this.drawVisualizerCircle();
                    break;
                case 'shadowColor':
                    context.shadowColor = 'rgb(' + value + ')';
                    this.drawVisualizerCircle();
                    break;
                case 'shadowBlur':
                    context.shadowBlur = value;
                    this.drawVisualizerCircle();
                    break;
                case 'lineCap':
                    context.lineCap = value;
                    this.drawVisualizerCircle();
                    break;
                case 'lineJoin':
                    context.lineJoin = value;
                    this.drawVisualizerCircle();
                    break;
                case 'lineWidth':
                    context.lineWidth = value;
                    this.drawVisualizerCircle();
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
                case 'ballDirection':
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
                case 'isRing':
                case 'isStaticRing':
                case 'isInnerRing':
                case 'isOuterRing':
                case 'isWare':
                case 'ringRotation':
                case 'radius':
                case 'innerDistance':
                case 'outerDistance':
                case 'isLineTo':
                case 'firstPoint':
                case 'secondPoint':
                case 'isBall':
                case 'ballDistance':
                case 'ballSize':
                case 'ballRotation':
                    this[property] = value;
                    this.updateVisualizerCircle(lastAudioSamples);
                    this.drawVisualizerCircle();
                    break;
                case 'hueRange':
                case 'pointNum':
                    this[property] = value;
                    ringRainBowArray = this.setRainBow(this.pointNum);
                    this.updateVisualizerCircle(lastAudioSamples);
                    this.drawVisualizerCircle();
                    break;
                case 'ballSpacer':
                    this.ballSpacer = value;
                    ballRainBowArray = this.setRainBow(120 / this.ballSpacer);
                    this.updateVisualizerCircle(lastAudioSamples);
                    this.drawVisualizerCircle();
                    break;
                case 'bindRingRotation':
                    this.bindRingRotation = value;
                    this.bindRingRotation && (rotationAngle2 = rotationAngle1);
                    break;
            }
        }

    };

    // 定义VisualizerCircle插件
    //--------------------------------------------------------------------------------------------------------------

    let old = $.fn.visualizercircle;

    $.fn.visualizercircle = function (option) {
        let args = (arguments.length > 1) ? Array.prototype.slice.call(arguments, 1) : undefined;

        return this.each(function () {
            let $this = $(this);
            let data = $this.data('visualizercircle');
            let options = $.extend({}, VisualizerCircle.DEFAULTS, $this.data(), typeof option === 'object' && option);

            if (!data && typeof option === 'string') {
                return;
            }
            if (!data) {
                $this.data('visualizercircle', (data = new VisualizerCircle(this, options)));
            }
            else if (typeof option === 'string') {
                VisualizerCircle.prototype[option].apply(data, args);
            }
        });
    };

    $.fn.visualizercircle.Constructor = VisualizerCircle;

    // 确保插件不冲突
    $.fn.visualizercircle.noConflict = function () {
        $.fn.audiovisualize = old;
        return this;
    };

});