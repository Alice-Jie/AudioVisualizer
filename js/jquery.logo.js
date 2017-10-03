/*!
 * jQuery time plugin v0.0.5
 * project:
 * - https://github.com/Alice-Jie/AudioVisualizer
 * - https://gitee.com/Alice_Jie/circleaudiovisualizer
 * - http://steamcommunity.com/sharedfiles/filedetails/?id=921617616
 * @license MIT licensed
 * @author Alice
 * @date 2017/10/03
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
    let currantImg = new Image();   // 当前图片对象
    let currantCanvas;              // 离屏Canvas
    let currantContext;             // 离屏Context

    let userImg = '';               // 用户自定义图片路径

    let currantAngle = 0;           // 当前角度

    let timer = null;               // Logo计时器

    let audioAverage = 0,           // 音频平均值
        audioZoom = 1;              // 标志缩放值

    //私有方法
    //--------------------------------------------------------------------------------------------------------------

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

    //构造函数和公共方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     * @class Logo
     *
     * @param {!Object} el      被选中的节点
     * @param {Object}  options 参数对象
     */
    let Logo = function (el, options) {
        this.$el = $(el);

        this.isLogo = options.isLogo;                // 显示标志
        // 基础参数
        this.isCircular = options.isCircular;        // 圆形标志
        this.opacity = options.opacity;              // 不透明度
        this.shadowColor = options.shadowColor;      // 阴影颜色
        this.shadowBlur = options.shadowBlur;        // 阴影大小
        this.isStroke = options.isStroke;            // 描边开关
        this.strokeColor = options.strokeColor;      // 描边颜色
        this.lineWidth = options.lineWidth;          // 描边宽度
        // 坐标参数
        this.offsetX = options.offsetX;              // X坐标偏移
        this.offsetY = options.offsetY;              // Y坐标偏移
        this.isClickOffset = options.isClickOffset;  // 鼠标坐标偏移
        // 标志参数
        this.zoom = options.zoom;                    // 比例缩放
        this.isZoomFollow = options.isZoomFollow;    // 跟随音频
        this.zoomRate = options.zoomRate;            // 变化速率
        this.widthRatio = options.widthRatio;        // 宽度比例
        this.heightRatio = options.heightRatio;      // 高度比例
        this.initialAngle = options.initialAngle;    // 初始角度
        this.isRotation = options.isRotation;        // 是否旋转
        this.rotationAngle = options.rotationAngle;  // 旋转角度
        this.milliSec = options.milliSec;            // 重绘间隔
        // 标志滤镜
        this.blur = options.blur;                    // 模糊
        this.brightness = options.brightness;        // 亮度
        this.contrast = options.contrast;            // 对比度
        this.grayScale = options.grayScale;          // 灰度
        this.hueRotate = options.hueRotate;          // 色相翻转
        this.invert = options.invert;                // 反色
        this.saturate = options.saturate;            // 饱和度
        this.sepia = options.sepia;                  // 深褐色
        // 混合选项
        this.mixBlendMode = options.mixBlendMode;    // 混合选项

        // 创建并初始化canvas
        canvas = document.createElement('canvas');
        canvas.id = 'canvas-logo'; // canvas ID
        $(canvas).css({
            'position': 'fixed',
            'top': 0,
            'left': 0,
            'z-index': 1,
            'opacity': this.opacity,
            'mix-blend-mode': 'normal',
            'filter': 'none'
        });  // canvas CSS
        canvasWidth = canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        canvasHeight = canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        // 获取原点XY坐标
        originX = canvasWidth * this.offsetX;
        originY = canvasHeight * this.offsetY;

        // 创建并初始化绘图的环境
        context = canvas.getContext('2d');
        // 线条属性
        context.strokeStyle = 'rgb(' + this.strokeColor + ')';
        context.lineWidth = this.lineWidth;
        // 阴影属性
        context.shadowColor = 'rgb(' + this.shadowColor + ')';
        context.shadowBlur = this.shadowBlur;

        // 创建并初始化离屏canvas
        currantCanvas = document.createElement('canvas');
        currantCanvas.width = 500;
        currantCanvas.height = 500;
        currantContext = currantCanvas.getContext('2d');

        // 初始化图片源
        currantImg.src = 'img/logo.png';

        $(this.$el).append(canvas);  // 添加canvas

        // 默认开启
        this.setupPointerEvents();

    };

    // 默认参数
    Logo.DEFAULTS = {
        isLogo: false,               // 显示标志
        // 基础参数
        isCircular: true,            // 圆形标志
        opacity: 0.9,                // 不透明度
        shadowColor: '255,255,255',  // 阴影颜色
        shadowBlur: 0,               // 阴影大小
        isStroke: false,             // 描边开关
        strokeColor: '255,255,255',  // 描边颜色
        lineWidth: 1,                // 描边宽度
        // 坐标参数
        offsetX: 0.5,                // X坐标偏移
        offsetY: 0.5,                // Y坐标偏移
        isClickOffset: false,        // 鼠标坐标偏移
        // 标志参数
        zoom: 0.1,                   // 比例缩放
        isZoomFollow: false,         // 跟随音频
        zoomRate: 5,                 // 变化速率
        widthRatio: 1.0,             // 宽度比例
        heightRatio: 1.0,            // 高度比例
        initialAngle: 20,            // 初始角度
        isRotation: false,           // 是否旋转
        rotationAngle: 0.5,          // 旋转角度
        milliSec: 30,                // 重绘间隔
        // 标志滤镜
        blur: 0,                     // 模糊
        brightness: 100,             // 亮度
        contrast: 100,               // 对比度
        grayScale: 0,                // 灰度
        hueRotate: 0,                // 色相翻转
        invert: 0,                   // 反色
        saturate: 100,               // 饱和度
        sepia: 0,                    // 深褐色
        // 混合模式
        mixBlendMode: 'normal'       // 混合模式


    };

    // 公共方法
    Logo.prototype = {

        // 面向内部方法
        //-----------------------------------------------------------

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
                    that.drawCanvas();
                }
            });

            // 窗体改变事件
            $(window).on('resize', function () {
                // 改变宽度和高度
                canvasWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                canvasHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                // 获取原点
                originX = canvasWidth * this.offsetX;
                originY = canvasHeight * this.offsetY;
                that.drawCanvas();
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
        },

        /** 清空Canvas内容 */
        clearCanvas: function () {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
        },

        /**
         * 获取用户自定义的Logo地址
         * 如果路径不存在默认为空字符串
         *
         * @param {string} img Logo路径
         */
        setUserImg: function (img) {
            userImg = img || '';
            currantImg.src = userImg ? 'file:///' + userImg : 'img/logo.png';
            // 绘制离屏canvas并绘制logo
            let imgTimer = setInterval(
                ()=> {
                    if (currantImg.complete) {
                        currantCanvas.width = currantImg.width;
                        currantCanvas.height = currantImg.height;
                        currantContext.drawImage(currantImg, 0, 0, currantImg.width, currantImg.height);
                        this.drawLogo();  // 绘制canvas
                        clearInterval(imgTimer);
                    }
                }, 500);
        },

        /** 更新相关数据 */
        updateLogo: function () {
            // 更新原点坐标
            originX = canvasWidth * this.offsetX;
            originY = canvasHeight * this.offsetY;
            // 更新缩放比例
            audioZoom = 1 + (this.isZoomFollow ? audioAverage * this.zoomRate : 0);
            // 更新当前旋转角度
            if (this.isRotation) {
                currantAngle += this.rotationAngle;
            }
        },

        /** 绘制Logo */
        drawLogo: function () {
            if (this.isLogo) {
                let width = currantCanvas.width * this.zoom * audioZoom * this.widthRatio;
                let height = currantCanvas.height * this.zoom * audioZoom * this.heightRatio;
                let size = Math.min(width, height);
                let x = getXY(originX, originY, width, height).x;
                let y = getXY(originX, originY, width, height).y;
                let angle = (this.initialAngle + (this.isRotation ? currantAngle : 0)) * (Math.PI / 180);
                context.clearRect(0, 0, canvasWidth, canvasHeight);
                context.save();
                context.translate(x + width / 2, y + height / 2);
                context.rotate(angle);
                // LOGO圆形化
                if (this.isCircular) {
                    context.beginPath();
                    context.arc(0, 0, size / 2, 0, Math.PI * 2, false);
                    context.closePath();
                    // context.clip();
                    context.strokeStyle = 'rgb(255, 255, 255)';
                    context.fill();
                    context.globalCompositeOperation = 'source-in';
                }
                context.drawImage(currantCanvas, -width / 2, -height / 2, width, height);
                // LOGO圆形描边
                if (this.isCircular && this.isStroke) {
                    context.globalCompositeOperation = 'lighter';
                    context.strokeStyle = 'rgb(' + this.strokeColor + ')';
                    context.stroke();
                }
                context.restore();
            }
        },

        /** 绘制canvas */
        drawCanvas: function () {
            this.updateLogo();
            this.drawLogo();
        },

        /** 停止Logo计时器 */
        stopLogoTimer: function () {
            if (timer) {
                clearTimeout(timer);
            }
        },

        /** 开始Logo计时器 */
        runLogoTimer: function () {
            this.stopLogoTimer();
            timer = setTimeout(
                ()=> {
                    this.drawCanvas();
                    this.runLogoTimer();
                }, this.milliSec);
        },

        /** 移除canvas */
        destroy: function () {
            this.$el
                .off('#canvas-logo')
                .removeData('logo');
            $('#canvas-logo').remove();
        },

        /**
         * 修改参数
         * @param {string} property 属性名
         * @param {*}      value    属性对应值
         */
        set: function (property, value) {
            switch (property) {
                case 'opacity':
                    this.opacity = value;
                    $(canvas).css('opacity', value);
                    break;
                case 'shadowColor':
                    this.shadowColor = value;
                    context.shadowColor = 'rgb(' + value + ')';
                    this.drawLogo();
                    break;
                case 'shadowBlur':
                    this.shadowBlur = value;
                    context.shadowBlur = value;
                    this.drawLogo();
                    break;
                case 'strokeColor':
                    this.strokeColor = value;
                    context.strokeStyle = 'rgb(' + value + ')';
                    this.drawLogo();
                    break;
                case 'lineWidth':
                    this.lineWidth = value;
                    context.lineWidth = value;
                    this.drawLogo();
                    break;
                case 'zoomRate':
                case 'rotationAngle':
                case 'isClickOffset':
                case 'milliSec':
                    this[property] = value;
                    break;
                case 'isCircular':
                case 'isStroke':
                case 'zoom':
                case 'widthRatio':
                case 'heightRatio':
                case 'initialAngle':
                    this[property] = value;
                    this.drawLogo();
                    break;
                case 'offsetX':
                case 'offsetY':
                    this[property] = value;
                    this.drawCanvas();
                    break;
                case 'isRotation':
                case 'isZoomFollow':
                    this[property] = value;
                    if (this.isRotation || this.isZoomFollow) {
                        this.runLogoTimer();
                    } else {
                        this.stopLogoTimer();
                    }
                    break;
                case 'isLogo':
                    this.isLogo = value;
                    if (this.isLogo) {
                        if (this.isRotation || this.isZoomFollow) {
                            this.runLogoTimer();
                        } else {
                            this.drawLogo();
                        }
                    } else {
                        this.stopLogoTimer();
                        this.clearCanvas();
                    }
                    break;
                case 'blur':
                case 'brightness':
                case 'contrast':
                case 'grayScale':
                case 'hueRotate':
                case 'invert':
                case 'saturate':
                case 'sepia':
                    this[property] = value;
                    $(canvas).css('filter', 'blur(' + this.blur + 'px) '
                        + 'brightness(' + this.brightness + '%) '
                        + 'contrast(' + this.contrast + '%) '
                        + 'grayscale(' + this.grayScale + '%) '
                        + 'hue-rotate(' + this.hueRotate + 'deg) '
                        + 'invert(' + this.invert + '%) '
                        + 'saturate(' + this.saturate + '%) '
                        + 'sepia(' + this.sepia + '%) '
                    );
                    break;
                case 'mixBlendMode':
                    this.mixBlendMode = value;
                    $(canvas).css('mix-blend-mode', value);
                    break;
                // no default
            }
        }

    };

    // 定义Logo插件
    //--------------------------------------------------------------------------------------------------------------

    let old = $.fn.logo;

    $.fn.logo = function (option) {
        let args = (arguments.length > 1) ? Array.prototype.slice.call(arguments, 1) : undefined;

        return this.each(function () {
            let $this = $(this);
            let data = $this.data('logo');
            let options = $.extend({}, Logo.DEFAULTS, $this.data(), typeof option === 'object' && option);

            if (!data && typeof option === 'string') {
                return;
            }
            if (!data) {
                $this.data('logo', (data = new Logo(this, options)));
            }
            else if (typeof option === 'string') {
                Logo.prototype[option].apply(data, args);
            }
        });
    };

    $.fn.logo.Constructor = Logo;

    // 确保插件不冲突
    $.fn.logo.noConflict = function () {
        $.fn.logo = old;
        return this;
    };

});