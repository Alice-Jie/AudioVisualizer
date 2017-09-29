/*!
 * jQuery time plugin v0.0.2
 * project:
 * - https://github.com/Alice-Jie/AudioVisualizer
 * - https://git.oschina.net/Alice_Jie/circleaudiovisualizer
 * - http://steamcommunity.com/sharedfiles/filedetails/?id=921617616
 * @license MIT licensed
 * @author Alice
 * @date 2017/09/29
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

        // 基础参数
        this.isLogo = options.isLogo;                // 显示标志
        this.opacity = options.opacity;              // 不透明度
        this.isCircular = options.isCircular;        // 圆形标志
        // 坐标参数
        this.offsetX = options.offsetX;              // X坐标偏移
        this.offsetY = options.offsetY;              // Y坐标偏移
        this.isClickOffset = options.isClickOffset;  // 鼠标坐标偏移
        // 标志参数
        this.zoom = options.zoom;                    // 比例缩放
        this.widthRatio = options.widthRatio;        // 宽度比例
        this.heightRatio = options.heightRatio;      // 高度比例
        this.initialAngle = options.initialAngle;    // 初始角度
        this.isRotation = options.isRotation;        // 是否旋转
        this.rotationAngle = options.rotationAngle;  // 旋转角度
        this.milliSec = options.milliSec;            // 重绘间隔

        // 创建并初始化canvas
        canvas = document.createElement('canvas');
        canvas.id = 'canvas-logo'; // canvas ID
        $(canvas).css({
            'position': 'fixed',
            'top': 0,
            'left': 0,
            'z-index': 1,
            'opacity': this.opacity
        });  // canvas CSS
        canvasWidth = canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        canvasHeight = canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        // 获取原点XY坐标
        originX = canvasWidth * this.offsetX;
        originY = canvasHeight * this.offsetY;

        // 创建并初始化绘图的环境
        context = canvas.getContext('2d');

        // 创建并初始化离屏canvas
        currantCanvas = document.createElement('canvas');
        currantCanvas.width = canvasWidth;
        currantCanvas.height = canvasHeight;
        currantContext = currantCanvas.getContext('2d');

        // 初始化图片源
        currantImg.src = 'img/logo.png';

        $(this.$el).append(canvas);  // 添加canvas

        // 默认开启
        this.setupPointerEvents();

    };

    // 默认参数
    Logo.DEFAULTS = {
        // 基础参数
        isLogo: false,         // 显示标志
        opacity: 0.9,          // 不透明度
        isCircular: true,      // 圆形标志
        // 坐标参数
        offsetX: 0.5,          // X坐标偏移
        offsetY: 0.5,          // Y坐标偏移
        isClickOffset: false,  // 鼠标坐标偏移
        // LOGO参数
        zoom: 1.0,             // 比例缩放
        widthRatio: 1.0,       // 宽度比例
        heightRatio: 1.0,      // 高度比例
        initialAngle: 20,      // 初始角度
        isRotation: false,     // 是否旋转
        rotationAngle: 0.5,    // 旋转角度
        milliSec: 30           // 重绘间隔
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
            originX = canvasWidth * this.offsetX;
            originY = canvasHeight * this.offsetY;
            if (this.isRotation) {
                currantAngle += this.rotationAngle;
            }
        },

        /** 绘制Logo */
        drawLogo: function () {
            if (this.isLogo) {
                let width = currantCanvas.width * this.zoom * this.widthRatio;
                let height = currantCanvas.height * this.zoom * this.heightRatio;
                let x = getXY(originX, originY, width, height).x;
                let y = getXY(originX, originY, width, height).y;
                let angle = (this.initialAngle + (this.isRotation ? currantAngle : 0)) * (Math.PI / 180);
                context.clearRect(0, 0, canvasWidth, canvasHeight);
                context.save();
                context.translate(x + width / 2, y + height / 2);
                context.rotate(angle);
                // LOGO圆形化
                if (this.isCircular) {
                    let radius = Math.min(width, height);
                    context.beginPath();
                    context.arc(0, 0, radius / 2, 0, Math.PI * 2, false);
                    context.closePath();
                    context.clip();
                }
                context.drawImage(currantCanvas, -width / 2, -height / 2, width, height);
                // context.strokeStyle = 'rgb(255, 0, 0)';
                // context.lineWidth = 2;
                // context.stroke();
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
                    $(canvas).css('opacity', value);
                    break;
                case 'isCircular':
                case 'rotationAngle':
                case 'isClickOffset':
                case 'milliSec':
                    this[property] = value;
                    break;
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
                    this.isRotation = value;
                    this.isRotation ? this.runLogoTimer() : this.stopLogoTimer();
                    break;
                case 'isLogo':
                    this.isLogo = value;
                    if (this.isLogo) {
                        this.isRotation ? this.runLogoTimer() : this.drawLogo();
                    } else {
                        this.stopLogoTimer();
                        this.clearCanvas();
                    }
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