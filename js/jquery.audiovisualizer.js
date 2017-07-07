/*！
 * jQuery AudioVisualizer plugin v0.0.6
 * project:
 * - https://github.com/Alice-Jie/4K-Circle-Audio-Visualizer
 * - https://git.oschina.net/Alice_Jie/circleaudiovisualizer
 * - http://steamcommunity.com/sharedfiles/filedetails/?id=921617616
 * @license MIT licensed
 * @author Alice
 * @date 2017/07/05
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

    let canvas;                     // canvas对象
    let context;                    // context对象
    let canvasWidth, canvasHeight;  // canvas宽度和高度
    let originX, originY;           // 原点位置
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

    let runCount = 1;  // 绘制次数

    let timer = null;  // 音频圆环计时器

    //私有方法
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
        audioValue = Math.min(audioValue, peak);  // 溢出部分按值1.5处理
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
        return (Math.PI / 180) * ( 360 / point ) * ( index + angle / 3 );
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
            'x': Math.cos(deg) * radius + x,
            'y': Math.sin(deg) * radius + y
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

    //构造函数和公共方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     *  初始化AudioVisualizer
     *
     * @param {!Object} el      被选中的节点
     * @param {Object}  options 参数对象
     */
    let AudioVisualizer = function (el, options) {
        this.$el = $(el);

        // 全局参数
        this.opacity = options.opacity;               // 不透明度
        this.color = options.color;                   // 颜色
        this.shadowColor = options.shadowColor;       // 阴影颜色
        this.shadowBlur = options.shadowBlur;         // 模糊大小
        // 坐标参数
        this.offsetX = options.offsetX;               // X坐标偏移
        this.offsetY = options.offsetY;               // Y坐标偏移
        this.isClickOffset = options.isClickOffset;   // 鼠标坐标偏移
        // 音频参数
        this.amplitude = options.amplitude;           // 振幅
        this.decline = options.decline;               // 衰退值
        this.peak = options.peak;                     // 峰值
        // 圆环参数
        this.isRing = options.isRing;                 // 显示环
        this.isStaticRing = options.isStaticRing;     // 显示静态环
        this.isInnerRing = options.isInnerRing;       // 显示内环
        this.isOuterRing = options.isOuterRing;       // 显示外环
        this.radius = options.radius;                 // 半径
        this.ringRotation = options.ringRotation;     // 圆环旋转
        this.milliSec = options.milliSec;             // 绘制间隔(ms);
        // 线条参数
        this.isLineTo = options.isLineTo;             // 是否连线
        this.firstPoint = options.firstPoint;         // 始点
        this.secondPoint = options.secondPoint;       // 末点
        this.pointNum = options.pointNum;             // 点的数量
        this.innerDistance = options.innerDistance;   // 内环距离
        this.outerDistance = options.outerDistance;   // 外环距离
        this.lineWidth = options.lineWidth;           // 线条粗细
        // 小球参数
        this.isBall = options.isBall;                 // 显示小球
        this.ballSpacer = options.ballSpacer;         // 小球间隔
        this.ballDistance = options.ballDistance;     // 小球距离
        this.ballSize = options.ballSize;             // 小球大小
        this.ballRotation = options.ballRotation;     // 小球旋转


        // 创建并初始化canvas
        canvas = document.createElement('canvas');
        canvas.id = 'canvas-audio'; // canvas ID
        $(canvas).css({
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'z-index': 2,
            'opacity': this.opacity
        });  // canvas CSS
        canvasWidth = canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        canvasHeight = canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        // 获取最小宽度以及原点
        minLength = Math.min(canvasWidth, canvasHeight);

        // 创建并初始化绘图的环境
        context = canvas.getContext('2d');
        context.fillStyle = 'rgb(' + this.color + ')';
        // 线条属性
        context.lineWidth = this.lineWidth;
        context.strokeStyle = 'rgb(' + this.color + ')';
        // 阴影属性
        context.shadowColor = 'rgb(' + this.shadowColor + ')';
        context.shadowBlur = this.shadowBlur;

        $(this.$el).append(canvas);  // 添加canvas

        // 默认开启
        this.setupPointerEvents();
        this.updateAudioVisualizer(lastAudioSamples);
        this.drawAudioVisualizer();
    };

    // 默认参数
    AudioVisualizer.DEFAULTS = {
        // 全局参数
        opacity: 0.90,               // 不透明度
        color: '255,255,255',        // 颜色
        shadowColor: '255,255,255',  // 阴影颜色
        shadowBlur: 15,              // 模糊大小
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
        ringRotation: 0,             // 圆环旋转
        milliSec: 30,                // 重绘间隔（ms）
        // 线条参数
        isLineTo: false,             // 是否连线
        firstPoint: 'innerRing',     // 始点
        secondPoint: 'outerRing',    // 末点
        pointNum: 120,               // 点的数量
        innerDistance: 0,            // 内环距离
        outerDistance: 0,            // 外环距离
        lineWidth: 5,                // 线条粗细
        // 小球参数
        isBall: true,                // 显示小球
        ballSpacer: 3,               // 小球间隔
        ballDistance: 50,            // 小球距离
        ballSize: 3,                 // 小球大小
        ballRotation: 0              // 小球旋转
    };

    // 公共方法
    AudioVisualizer.prototype = {

        // 面向内部方法
        //-----------------------------------------------------------

        /**
         * 生成静态点的坐标集合
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
                pointArray.push({'x': point.x, 'y': point.y});
            }
            return pointArray;
        },

        /**
         * 生成音频圆环点的坐标集合
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
                pointArray.push({'x': point.x, 'y': point.y});
            }
            return pointArray;
        },

        /**
         * 生成音频小球坐标的集合
         *
         * @param  {Array<float>} audioSamples 音频数组
         * @return {Array<Object>} 坐标数组
         */
        setBall: function (audioSamples) {
            let pointArray = [];
            let ballArray = getBallArray(audioSamples, this.ballSpacer);
            // 将点数组转换成坐标数组
            for (let i = 0; i < ballArray.length; i++) {
                let deg = getDeg(ballArray.length, i, rotationAngle2);
                let audioValue = Math.min(audioSamples[i] ? audioSamples[i] : 0, 1);
                let radius = this.radius * (minLength / 2)
                    + (this.outerDistance + this.ballDistance)
                    + audioValue * 75;
                // 根据半径、角度、原点坐标获得坐标数组
                let point = getXY(radius, deg, originX, originY);
                pointArray.push({'x': point.x, 'y': point.y});
            }
            return pointArray;
        },


        /**
         * 绘制音频圆环
         *
         *  @param {Array<Object>} pointArray 坐标数组
         */
        drawRing: function (pointArray) {
            context.save();
            context.beginPath();
            context.moveTo(pointArray[0].x, pointArray[0].y);
            for (let i = 0; i < pointArray.length; i++) {
                context.lineTo(pointArray[i].x, pointArray[i].y);
            }
            context.closePath();
            context.stroke();
            context.restore();
        },

        /**
         * 绘制环与环连线
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
                    that.updateAudioVisualizer(lastAudioSamples);
                    that.drawAudioVisualizer();
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
                that.updateAudioVisualizer(lastAudioSamples);
                that.drawAudioVisualizer();
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
         * 更新内外圆环、音频小球坐标数组、偏移角度和原点坐标
         *
         * @param {Array<float>} audioSamples 音频数组
         */
        updateAudioVisualizer: function (audioSamples) {
            // 更新原点坐标
            originX = canvasWidth * this.offsetX;
            originY = canvasHeight * this.offsetY;
            // 更新坐标数组
            staticPointsArray = this.setStaticPoint(audioSamples);
            pointArray1 = this.setPoint(audioSamples, -1, this.innerDistance, true);
            pointArray2 = this.setPoint(audioSamples, 1, this.outerDistance, false);
            ballPointArray = this.setBall(audioSamples);
            // 更新偏移角度
            rotationAngle1 = rotation(rotationAngle1, this.ringRotation);
            rotationAngle2 = rotation(rotationAngle2, this.ballRotation);
        },

        /** 绘制音频圆环和小球 */
        drawAudioVisualizer: function () {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            // 绘制圆环
            if (this.isRing) {
                if (this.isStaticRing) {
                    this.drawRing(staticPointsArray);
                }
                if (this.isInnerRing) {
                    this.drawRing(pointArray1);
                }
                if (this.isOuterRing) {
                    this.drawRing(pointArray2);
                }
            }
            // 绘制连线
            let firstArray = getPointArray(this.firstPoint);
            let secondArray = getPointArray(this.secondPoint);
            if (this.isLineTo && this.firstPoint !== this.secondPoint) {
                this.drawLine(firstArray, secondArray);
            }
            // 绘制小球
            if (this.isBall) {
                this.drawBall(ballPointArray, this.ballSize);
            }
        },

        /**
         * 根据音频数组绘制音频圆环和音频小球
         * 当上次音频数组记录和当前音频数组不处于静默状态或旋转状态时，绘制音频圆环和音频小球
         *
         * @param  {Array<float>} audioSamples 音频数组
         */
        drawCanvas: function (audioSamples) {
            this.updateAudioVisualizer(audioSamples);
            if (isSilence(audioSamples)
                || isSilence(lastAudioSamples)
                || (this.ringRotation && this.isLineTo)
                || this.ballRotation) {
                this.drawAudioVisualizer();
                runCount = 1;
            } else if (runCount > 0) {
                this.drawAudioVisualizer();
                runCount--;
            }

        },


        /** 停止音频圆环计时器 */
        stopAudioVisualizerTimer: function () {
            if (timer) {
                clearTimeout(timer);
            }
        },

        /** 运行音频圆环计时器 */
        runAudioVisualizerTimer: function () {
            this.stopAudioVisualizerTimer();
            timer = setTimeout(
                ()=> {
                    this.drawAudioVisualizer();
                    this.runAudioVisualizerTimer();
                }, this.milliSec);
        },


        /** 移除canvas */
        destroy: function () {
            this.$el
                .off('#canvas-audio')
                .removeData('audiovisualizer');
            $('#canvas-audio').remove();
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
                    $(canvas).css(property, value);
                    break;
                case 'color':
                    context.fillStyle = 'rgb(' + value + ')';
                    context.strokeStyle = 'rgb(' + value + ')';
                    this.drawAudioVisualizer();
                    break;
                case 'shadowColor':
                    context.shadowColor = 'rgb(' + value + ')';
                    this.drawAudioVisualizer();
                    break;
                case 'shadowBlur':
                    context.shadowBlur = value;
                    this.drawAudioVisualizer();
                    break;
                case 'lineWidth':
                    context.lineWidth = value;
                    this.drawAudioVisualizer();
                    break;
                case 'isClickOffset':
                case 'amplitude':
                case 'decline':
                case 'peak':
                case 'milliSec':
                    this[property] = value;
                    break;
                case 'offsetX':
                case 'offsetY':
                case 'isRing':
                case 'isStaticRing':
                case 'isInnerRing':
                case 'isOuterRing':
                case 'ringRotation':
                case 'radius':
                case 'innerDistance':
                case 'outerDistance':
                case 'isLineTo':
                case 'firstPoint':
                case 'secondPoint':
                case 'pointNum':
                case 'isBall':
                case 'ballSpacer':
                case 'ballDistance':
                case 'ballSize':
                case 'ballRotation':
                    this[property] = value;
                    this.updateAudioVisualizer(lastAudioSamples);
                    this.drawAudioVisualizer();
                    break;
            }
        }

    };

    //定义AudioVisualizer插件
    //--------------------------------------------------------------------------------------------------------------

    let old = $.fn.audiovisualizer;

    $.fn.audiovisualizer = function (option) {
        let args = (arguments.length > 1) ? Array.prototype.slice.call(arguments, 1) : undefined;

        return this.each(function () {
            let $this = $(this);
            let data = $this.data('audiovisualizer');
            let options = $.extend({}, AudioVisualizer.DEFAULTS, $this.data(), typeof option === 'object' && option);

            if (!data && typeof option === 'string') {
                return;
            }
            if (!data) {
                $this.data('audiovisualizer', (data = new AudioVisualizer(this, options)));
            }
            else if (typeof option === 'string') {
                AudioVisualizer.prototype[option].apply(data, args);
            }
        });
    };

    $.fn.audiovisualizer.Constructor = AudioVisualizer;

    // 确保插件不冲突
    $.fn.audiovisualizer.noConflict = function () {
        $.fn.audiovisualize = old;
        return this;
    };

});