/*!
 * jQuery time plugin v0.0.10
 * project:
 * - https://github.com/Alice-Jie/AudioVisualizer
 * - https://gitee.com/Alice_Jie/circleaudiovisualizer
 * - http://steamcommunity.com/sharedfiles/filedetails/?id=921617616
 * @license MIT licensed
 * @author Alice
 * @date 2018/01/12
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

    let logoTimer = null,           // Logo计时器
        rotote3DTimer = null;       // 3D旋转计时器

    let audioAverage = 0,           // 音频平均值
        audioZoom = 1;              // 标志缩放值

    let originalPos = [],
        targetPos = [];

    // 3D旋转幅度计数
    let currantX = 0.0,
        currantY = 0.0,
        currantZ = 0.0;

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


    /**
     * 获取4x4仿射变换矩阵
     * http://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
     * https://codepen.io/fta/pen/ifnqH
     * http://www.numericjs.com/documentation.html
     * http://steamcommunity.com/sharedfiles/filedetails/?id=837056186
     *
     * @param  {Array.<!Object>} from 初始平面四角坐标XY对象数组
     * @param  {Array.<!Object>} to   目标平面四角坐标XY对象数组
     * @return {Array.<[float]>} 4x4放射变换矩阵二维数组
     */
    function getTransform(from, to) {
        /* global numeric: true */
        console.assert(from.length === to.length && from.length === 4);

        let A = [];
        for (let i = 0; i < 4; i++) {
            A.push([
                from[i].x,
                from[i].y,
                1,
                0,
                0,
                0,
                -from[i].x * to[i].x,
                -from[i].y * to[i].x
            ]);
            A.push([
                0,
                0,
                0,
                from[i].x,
                from[i].y,
                1,
                -from[i].x * to[i].y,
                -from[i].y * to[i].y
            ]);
        }

        /**
         * 矩阵A：
         * [from[i].x, from[i].y, 1, 0        , 0        , 0, -from[i].x * to[1].x, -from[i].y * to[i].x]
         * [0        , 0        , 0, from[i].x, from[i].y, 1,  from[i].x          ,  from[i].y          ]
         * ... (x4)
         * console.log('A:');
         * console.table(A);
         */

        let b = [];
        for (let i = 0; i < 4; i++) {
            b.push(to[i].x);
            b.push(to[i].y);
        }

        /**
         * 行矩阵B：
         * [to[0].x, to[0].y, to[1].x, to[1].y, to[2].x, to[2].y, to[3].x, to[3].y
         * console.log('b:');
         * console.table(b);
         */

        // numeric.solve: Solve Ax=b
        let h = numeric.solve(A, b);
        // console.log('h:');
        // console.table(h);

        let H = [
            [
                h[0],
                h[1],
                0,
                h[2]
            ],
            [
                h[3],
                h[4],
                0,
                h[5]
            ],
            [
                0,
                0,
                1,
                0
            ],
            [
                h[6],
                h[7],
                0,
                1
            ]
        ];

        /**
         * 矩阵H：                   转置矩阵HT:
         * [ h[0], h[1], 0, h[2] ]  [ h[0], h[3], 0, h[6] ]
         * [ h[3], h[4], 0, h[5] ]  [ h[1], h[4], 0, h[7] ]
         * [ 0   , 0   , 1, 0    ]  [ 0   , 0   , 1, 0    ]
         * [ h[6], h[7], 0, 1    ]  [ h[2], h[5], 0, 1    ]
         * console.log('H:');
         * console.table(H);
         */

        // 检测是否匹配
        for (let i = 0; i < 4; i++) {
            // numeric.dot: Matrix-Matrix, Matrix-Vector and Vector-Matrix product
            let lhs = numeric.dot(H, [
                from[i].x,
                from[i].y,
                0,
                1
            ]);
            let k = lhs[3];
            let rhs = numeric.dot(k, [
                to[i].x,
                to[i].y,
                0,
                1
            ]);
            console.assert(numeric.norm2(numeric.sub(lhs, rhs)) < 1e-9, 'Not equal:', lhs, rhs);
        }
        return H;
    }

    /**
     * 获取Matrix3D
     * http://steamcommunity.com/sharedfiles/filedetails/?id=837056186
     *
     * @param  {Array.<[float]>} originalPos 初始平面四角XY坐标二维数组
     * @param  {Array.<[float]>} targetPos   目标平面四角XY坐标二维数组
     * @return {string} Matrix3D字符串
     */
    function getMatrix3dStr(originalPos, targetPos) {
        let from = function () {
            let results = [];
            for (let i = 0; i < originalPos.length; i++) {
                let p = originalPos[i];
                results.push({
                    // 当前坐标 - 初始左上角XY坐标
                    x: p[0] - originalPos[0][0],
                    y: p[1] - originalPos[0][1]
                });
            }
            return results;
        }();  // 初始四角XY坐标对象数组
        let to = function () {
            let results = [];
            for (let i = 0; i < originalPos.length; i++) {
                let p = targetPos[i];
                results.push({
                    // 当前坐标 - 初始左上角XY坐标
                    x: p[0] - originalPos[0][0],
                    y: p[1] - originalPos[0][1]
                });
            }
            return results;
        }();  // 变换四角XY坐标对象数组

        let matrix = getTransform(from, to);  // 4x4仿射变换矩阵
        return 'matrix3d(' + function () {
                let results = [];
                // XYZ按顺序输出四个参数
                for (let i = 0; i < 4; i++) {
                    results.push(function () {
                        let results1 = [];
                        for (let j = 0; j < 4; j++) {
                            results1.push(matrix[j][i].toFixed(20));
                        }
                        return results1;
                    }());
                }
                return results;
            }().join(',') + ')';
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
        this.isStroke = options.isStroke;            // 描边开关
        this.strokeColor = options.strokeColor;      // 描边颜色
        this.lineWidth = options.lineWidth;          // 描边宽度
        this.dottedLine = options.dottedLine;        // 虚线效果
        this.shadowColor = options.shadowColor;      // 阴影颜色
        this.shadowBlur = options.shadowBlur;        // 阴影大小
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
        // 坐标参数
        this.offsetX = options.offsetX;              // X坐标偏移
        this.offsetY = options.offsetY;              // Y坐标偏移
        this.isClickOffset = options.isClickOffset;  // 鼠标坐标偏移
        // 变换参数
        this.isMasking = options.isMasking;          // 蒙版开关
        this.maskOpacity = options.maskOpacity;      // 蒙版不透明度
        this.perspective = options.perspective;      // 透视效果
        this.transformMode = options.transformMode;  // 变换模式
        this.translateX = options.translateX;        // X轴变换
        this.translateY = options.translateY;        // Y轴变换
        this.width = options.width;                  // 平面宽度(%)
        this.height = options.height;                // 平面高度(%)
        this.skewX = options.skewX;                  // X轴倾斜转换
        this.skewY = options.skewY;                  // Y轴倾斜转换
        this.rotateX = options.rotateX;              // X轴3D旋转
        this.rotateY = options.rotateY;              // Y轴3D旋转
        this.rotateZ = options.rotateZ;              // Z轴3D旋转
        this.rotate3d = options.rotate3d;            // 3D旋转
        this.autoRotateX = options.autoRotateX;      // X轴自动3D旋转
        this.autoRotateY = options.autoRotateY;      // Y轴自动3D旋转
        this.autoRotateZ = options.autoRotateZ;      // Z轴自动3D旋转
        this.degSize = options.degSize;              // 角度大小
        this.topLeftX = options.topLeftX;            // 左上角X(%)
        this.topLeftY = options.topLeftY;            // 左上角Y(%)
        this.topRightX = options.topRightX;          // 右上角X(%)
        this.topRightY = options.topRightY;          // 右上角Y(%)
        this.bottomRightX = options.bottomRightX;    // 右下角X(%)
        this.bottomRightY = options.bottomRightY;    // 右下角Y(%)
        this.bottomLeftX = options.bottomLeftX;      // 左下角X(%)
        this.bottomLeftY = options.bottomLeftY;      // 左下角Y(%)

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
            'transform': 'none',
            'filter': 'none'
        });  // canvas CSS
        canvasWidth = canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        canvasHeight = canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        // 获取原点XY坐标
        originX = canvasWidth * this.offsetX;
        originY = canvasHeight * this.offsetY;

        // 初始化originalPos、targetPos
        targetPos = originalPos = [
            [0, 0],
            [canvasWidth, 0],
            [canvasWidth, canvasHeight],
            [0, canvasHeight]
        ];

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
        // 基础参数
        isLogo: false,               // 显示标志
        isCircular: true,            // 圆形标志
        opacity: 0.9,                // 不透明度
        isStroke: false,             // 描边开关
        strokeColor: '255,255,255',  // 描边颜色
        lineWidth: 1,                // 描边宽度
        dottedLine: 0,               // 虚线效果
        shadowColor: '255,255,255',  // 阴影颜色
        shadowBlur: 0,               // 阴影大小
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
        // 滤镜参数
        blur: 0,                     // 模糊
        brightness: 100,             // 亮度
        contrast: 100,               // 对比度
        grayScale: 0,                // 灰度
        hueRotate: 0,                // 色相翻转
        invert: 0,                   // 反色
        saturate: 100,               // 饱和度
        sepia: 0,                    // 深褐色
        // 混合模式
        mixBlendMode: 'normal',      // 混合模式
        // 坐标参数
        offsetX: 0.5,                // X坐标偏移
        offsetY: 0.5,                // Y坐标偏移
        isClickOffset: false,        // 鼠标坐标偏移
        // 变换参数
        isMasking: false,            // 显示蒙版
        maskOpacity: 0.25,           // 蒙版不透明度
        perspective: 0,              // 透视效果
        transformMode: 'value',      // 变换模式
        translateX: 0,               // X轴变换(%)
        translateY: 0,               // Y轴变换(%)
        width: 1.00,                 // 平面宽度(%)
        height: 1.00,                // 平面高度(%)
        skewX: 0,                    // X轴倾斜转换
        skewY: 0,                    // Y轴倾斜转换
        rotateX: 0,                  // X轴3D旋转
        rotateY: 0,                  // Y轴3D旋转
        rotateZ: 0,                  // Z轴3D旋转
        rotate3d: 'none',            // 3D旋转
        autoRotateX: 0.0,            // X轴3D自动旋转
        autoRotateY: 0.0,            // Y轴3D自动旋转
        autoRotateZ: 0.0,            // Z轴3D自动旋转
        degSize: 50,                 // 角度大小
        topLeftX: 0,                 // 左上角X(%)
        topLeftY: 0,                 // 左上角Y(%)
        topRightX: 0,                // 右上角X(%)
        topRightY: 0,                // 右上角Y(%)
        bottomRightX: 0,             // 右下角X(%)
        bottomRightY: 0,             // 右下角Y(%)
        bottomLeftX: 0,              // 左下角X(%)
        bottomLeftY: 0               // 左下角Y(%)
    };

    // 公共方法
    Logo.prototype = {

        // 面向内部方法
        //-----------------------------------------------------------

        /**
         * 设置目标坐标
         * @private
         */
        setTargetPos: function () {
            targetPos = [
                // X: 0 + （左上坐标X百分比 * 平面宽度）
                // Y: 0 + （左上坐标Y百分比 * 平面高度）
                [
                    this.topLeftX * canvasWidth,
                    this.topLeftY * canvasHeight
                ],
                // X: 平面宽度 - （右上坐标X百分比 * 平面宽度）
                // Y: 0       + （右上坐标Y百分比 * 平面高度）
                [
                    canvasWidth - this.topRightX * canvasWidth,
                    this.topRightY * canvasHeight
                ],
                // X: 平面宽度 - （右下坐标X百分比 * 平面宽度）
                // Y: 平面高度 - （右下坐标Y百分比 * 平面高度）
                [
                    canvasWidth - this.bottomRightX * canvasWidth,
                    canvasHeight - this.bottomRightY * canvasHeight
                ],
                // X: 0       + （右下坐标X百分比 * 平面宽度）
                // Y: 平面高度 - （右下坐标Y百分比 * 平面高度）
                [
                    this.bottomLeftX * canvasWidth,
                    canvasHeight - this.bottomLeftY * canvasHeight
                ]
            ];
        },

        /**
         * 开始背景3D转换
         * @private
         *
         * @param {float} ex 鼠标X轴坐标
         * @param {float} ey 鼠标Y轴坐标
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
            let perspective = this.perspective ? 'perspective(' + this.perspective + 'px)' : '';
            $(canvas).css({
                'transform-origin': '50% 50%',
                'transform': perspective
                + 'translateX(' + canvasWidth * this.translateX + 'px)'
                + 'translateY(' + canvasHeight * this.translateY + 'px)'
                + 'scale(' + this.width + ', ' + this.height + ')'
                + 'skewX(' + this.skewX + 'deg)'
                + 'skewY(' + this.skewY + 'deg)'
                + 'rotate3d(' + -mouseY + ',' + mouseX + ',0,' + deg + 'deg)'
            });
        },

        /**
         * 停止变换
         * @private
         */
        stopTransform: function () {
            $(canvas).css({
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
            switch (this.transformMode) {
                case 'value':
                    $(canvas).css({
                        'transform-origin': '50% 50%',
                        'transform': perspective
                        + 'translateX(' + canvasWidth * this.translateX + 'px)'
                        + 'translateY(' + canvasHeight * this.translateY + 'px)'
                        + 'scale(' + this.width + ', ' + this.height + ')'
                        + 'skewX(' + this.skewX + 'deg)'
                        + 'skewY(' + this.skewY + 'deg)'
                        + 'rotateX(' + this.rotateX + 'deg)'
                        + 'rotateY(' + this.rotateY + 'deg)'
                        + 'rotateZ(' + this.rotateZ + 'deg)'
                    });
                    break;
                case 'matrix3d':
                    this.setTargetPos();
                    $(canvas).css({
                        'transform-origin': '0% 0%',
                        'transform': getMatrix3dStr(originalPos, targetPos)
                    });
                    break;
                default:
                    this.stopTransform();
            }
        },


        /**
         * 设置交互事件
         * @private
         */
        setupPointerEvents: function () {

            let that = this;

            // 鼠标移动事件
            $(this.$el).on('mousemove', function (e) {
                if (that.transformMode === 'value' && that.rotate3d === 'mouse') {
                    that.rotate3D(e.clientX, e.clientY);
                }
            });

            // 鼠标点击事件
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
            let width = currantCanvas.width * this.zoom * audioZoom * this.widthRatio;
            let height = currantCanvas.height * this.zoom * audioZoom * this.heightRatio;
            let size = Math.min(width, height);
            let x = getXY(originX, originY, width, height).x;
            let y = getXY(originX, originY, width, height).y;
            let angle = (this.initialAngle + (this.isRotation ? currantAngle : 0)) * (Math.PI / 180);
            context.clearRect(0, 0, canvasWidth, canvasHeight);

            context.save();
            if (this.isLogo) {
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
                if (this.isStroke) {
                    if (!this.isCircular) {
                        context.beginPath();
                        context.rect(-width / 2, -height / 2, width, height);
                        context.closePath();
                    } else {
                        context.globalCompositeOperation = 'source-over';
                    }
                    // 虚线效果
                    if (this.dottedLine > 0) {
                        context.setLineDash([this.dottedLine]);
                    }
                    context.strokeStyle = 'rgb(' + this.strokeColor + ')';
                    context.stroke();
                }

                context.restore();
            }
            // 蒙版效果
            if (this.isMasking) {
                context.fillStyle = 'rgba(255, 0, 0, ' + this.maskOpacity + ')';
                context.fillRect(0, 0, canvasWidth, canvasHeight);
            }

            context.restore();
        },

        /** 绘制canvas */
        drawCanvas: function () {
            this.updateLogo();
            this.drawLogo();
        },


        /** 停止Logo计时器 */
        stopLogoTimer: function () {
            logoTimer && clearTimeout(logoTimer);
        },

        /** 开始Logo计时器 */
        runLogoTimer: function () {
            this.stopLogoTimer();
            logoTimer = setTimeout(
                ()=> {
                    this.drawCanvas();
                    this.runLogoTimer();
                }, this.milliSec);
        },

        /** 停止3D旋转计时器 */
        stopRotate3DTimer: function () {
            rotote3DTimer && clearTimeout(rotote3DTimer);
        },

        /** 开始3D旋转计时器 */
        runRotate3DTimer: function () {
            this.stopRotate3DTimer();
            rotote3DTimer = setTimeout(
                ()=> {
                    currantX += this.autoRotateX;
                    currantY += this.autoRotateY;
                    currantZ += this.autoRotateZ;
                    $(canvas).css({
                        'transform-origin': '50% 50%',
                        'transform': (this.perspective ? 'perspective(' + this.perspective + 'px) ' : '')
                        + 'translateX(' + canvasWidth * this.translateX + 'px)'
                        + 'translateY(' + canvasHeight * this.translateY + 'px)'
                        + 'scale(' + this.width + ', ' + this.height + ')'
                        + 'skewX(' + this.skewX + 'deg)'
                        + 'skewY(' + this.skewY + 'deg)'
                        + 'rotateX(' + currantX + 'deg)'
                        + 'rotateY(' + currantY + 'deg)'
                        + 'rotateZ(' + currantZ + 'deg)'
                    });
                    this.runRotate3DTimer();
                }, 30);
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
                    $(canvas).css('opacity', this.opacity);
                    break;
                case 'shadowColor':
                    this.shadowColor = value;
                    context.shadowColor = 'rgb(' + this.shadowColor + ')';
                    this.drawLogo();
                    break;
                case 'shadowBlur':
                    this.shadowBlur = value;
                    context.shadowBlur = this.shadowBlur;
                    this.drawLogo();
                    break;
                case 'strokeColor':
                    this.strokeColor = value;
                    context.strokeStyle = 'rgb(' + this.strokeColor + ')';
                    this.drawLogo();
                    break;
                case 'lineWidth':
                    this.lineWidth = value;
                    context.lineWidth = this.lineWidth;
                    this.drawLogo();
                    break;
                case 'zoomRate':
                case 'rotationAngle':
                case 'isClickOffset':
                case 'milliSec':
                case 'degSize':
                case 'autoRotateX':
                case 'autoRotateY':
                case 'autoRotateZ':
                    this[property] = value;
                    break;
                case 'isMasking':
                case 'maskOpacity':
                case 'isCircular':
                case 'isStroke':
                case 'dottedLine':
                case 'zoom':
                case 'widthRatio':
                case 'heightRatio':
                case 'initialAngle':
                    this[property] = value;
                    this.drawLogo();
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
                case 'offsetX':
                case 'offsetY':
                    this[property] = value;
                    this.drawCanvas();
                    break;
                case 'perspective':
                case 'translateX':
                case 'translateY':
                case 'width':
                case 'height':
                case 'skewX':
                case 'skewY':
                case 'topLeftX':
                case 'topLeftY':
                case 'topRightX':
                case 'topRightY':
                case 'bottomRightX':
                case 'bottomRightY':
                case 'bottomLeftX':
                case 'bottomLeftY':
                    this[property] = value;
                    this.startTransform();
                    break;
                case 'rotateX':
                    currantX = this.rotateZ = value;
                    this.startTransform();
                    break;
                case 'rotateY':
                    currantY = this.rotateZ = value;
                    this.startTransform();
                    break;
                case 'rotateZ':
                    currantZ = this.rotateZ = value;
                    this.startTransform();
                    break;
                case 'transformMode':
                    this[property] = value;
                    this.startTransform();
                    if (this.transformMode !== 'value') {
                        this.stopRotate3DTimer();
                    }
                    break;
                case 'rotate3d':
                    this.rotate3d = value;
                    switch (this.rotate3d) {
                        case 'none':
                            this.stopRotate3DTimer();
                            this.startTransform();
                            break;
                        case 'auto':
                            currantZ = this.rotateX;
                            currantY = this.rotateY;
                            currantX = this.rotateZ;
                            this.runRotate3DTimer();
                            break;
                        case 'mouse':
                            this.stopTransform();
                            this.startTransform();
                            break;
                        //no default
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