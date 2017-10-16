/*！
 * jQuery AudioVisualizer Bars plugin v0.0.11
 * project:
 * - https://github.com/Alice-Jie/AudioVisualizer
 * - https://gitee.com/Alice_Jie/circleaudiovisualizer
 * - http://steamcommunity.com/sharedfiles/filedetails/?id=921617616
 * @license MIT licensed
 * @author Alice
 * @date 2017/10/13
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

    // 兼容requestAnimFrame、cancelAnimationFrame
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

    let lastAudioArray = [],
        currantAudioArray = [];
    for (let i = 0; i < 128; i++) {
        currantAudioArray[i] = lastAudioArray[i] = 0;
    }
    let audioAverage = 0;  // 音频平均值

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
    let incrementR = (color1.R - color2.R) / incrementMAX,
        incrementG = (color1.G - color2.G) / incrementMAX,
        incrementB = (color1.B - color2.B) / incrementMAX;

    // 彩虹渐变对象数组
    let rainBowArray = [];        // 条形
    let gradientOffsetRange = 0;  // 偏移范围

    let RUN_COUNT = 1;  // 绘制次数

    let timer = null;  // 音频圆环计时器

    let originalPos = [],
        targetPos = [];

    // 私有方法
    //--------------------------------------------------------------------------------------------------------------

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
     *  检测音频数组静默状态
     *  数组所有值皆为0返回true,反之返回false
     *
     * @param  {Array<float>} audioArray 音频数组
     * @return {boolean} 静默状态布尔值
     */
    function isSilence(audioArray) {
        if (!audioArray) {
            return false;
        }
        for (let i = 0; i < audioArray.length; i++) {
            if (audioArray[i]) {
                return true;
            }
        }
        return false;
    }

    /**
     * 根据点的数量提取音频数组
     * 获取数组长度等于点的数量的音频数组
     *
     * @param  {Array<float>} audioArray 音频数组
     * @param  {int}          num          点的数量
     * @return {Array<float>} AudioArray   抽取后的音频数组
     */
    function getBarsArray(audioArray, num) {
        let audioArray1 = [].concat(audioArray) || [];
        let num1 = Math.min(num || 0, audioArray.length);
        let max = audioArray1.length - num1;
        let isFirst = true;  // 头尾元素指示器
        for (let i = 0; i < max; i++) {
            if (isFirst) {
                audioArray1.shift();
                isFirst = false;
            } else {
                audioArray1.pop();
                isFirst = true;
            }
        }
        return audioArray1;
    }


    /** 设置RGB增量 */
    function setRGBIncrement() {
        incrementCount = 0;
        incrementR = (color1.R - color2.R) / incrementMAX;
        incrementG = (color1.G - color2.G) / incrementMAX;
        incrementB = (color1.B - color2.B) / incrementMAX;
    }

    /**
     * 通过RGB字符串更新RGB颜色对象
     * 字符串格式为"R,B,G"，例如："255,255,255"
     *
     * @param {!Object} colorObj RGB颜色对象
     * @param {string}  colorStr RGB颜色字符串
     */
    function setColorObj(colorObj, colorStr) {
        colorObj.R = parseInt(colorStr.split(',')[0]);
        colorObj.G = parseInt(colorStr.split(',')[1]);
        colorObj.B = parseInt(colorStr.split(',')[2]);
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
     * 应用仿射变换矩阵至canvas
     * http://steamcommunity.com/sharedfiles/filedetails/?id=837056186
     *
     * @param {Array.<[float]>} originalPos 初始平面四角XY坐标二维数组
     * @param {Array.<[float]>} targetPos   目标平面四角XY坐标二维数组
     */
    function applyTransform(originalPos, targetPos) {
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
        let matrix3D = 'matrix3d(' + function () {
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

        $(canvas).css({
            'transform': matrix3D,
            'transform-origin': '0 0'
        });
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

        // 音频参数
        this.amplitude = options.amplitude;              // 振幅
        this.decline = options.decline;                  // 衰退值
        this.peak = options.peak;                        // 峰值
        // 条形参数
        this.isLineTo = options.isLineTo;                // 显示连线
        this.isBars = options.isBars;                    // 显示条形
        this.barsDirection = options.barsDirection;      // 条形方向
        this.isWave = options.isWave;                    // 波浪模式
        this.waveDirection = options.waveDirection;      // 条形方向
        // 颜色参数
        this.colorMode = options.colorMode;              // 颜色模式
        this.color = options.color;                      // 颜色
        this.shadowColor = options.shadowColor;          // 阴影颜色
        this.shadowBlur = options.shadowBlur;            // 阴影大小
        this.shadowOverlay = options.shadowOverlay;      // 显示阴影
        this.isRandomColor = options.isRandomColor;      // 随机颜色开关
        this.firstColor = options.firstColor;            // 起始颜色
        this.secondColor = options.secondColor;          // 最终颜色
        this.isChangeBlur = options.isChangeBlur;        // 模糊变换开关
        this.hueRange = options.hueRange;                // 色相范围
        this.saturationRange = options.saturationRange;  // 饱和度范围(%)
        this.lightnessRange = options.lightnessRange;    // 亮度范围(%)
        this.gradientOffset = options.gradientOffset;    // 旋转渐变效果
        // 基础参数
        this.opacity = options.opacity;                  // 不透明度
        this.width = options.width;                      // 宽度比例
        this.height = options.height;                    // 基础高度
        this.pointNum = options.pointNum;                // 点的数量
        this.lineWidth = options.lineWidth;              // 线条粗细
        this.lineJoin = options.lineJoin;                // 交互类型
        this.barsRotation = options.barsRotation;        // 旋转角度
        this.milliSec = options.milliSec;                // 重绘间隔
        // 坐标参数
        this.offsetX = options.offsetX;                  // X坐标偏移
        this.offsetY = options.offsetY;                  // Y坐标偏移
        this.isClickOffset = options.isClickOffset;      // 鼠标坐标偏移
        // 扭曲参数
        this.isMasking = options.isMasking;              // 蒙版开关
        this.maskOpacity = options.maskOpacity;          // 蒙版不透明度
        this.topLeftX = options.topLeftX;                // 左上角X(%)
        this.topLeftY = options.topLeftY;                // 左上角Y
        this.topRightX = options.topRightX;              // 右上角X
        this.topRightY = options.topRightY;              // 右上角Y
        this.bottomRightX = options.bottomRightX;        // 右下角X
        this.bottomRightY = options.bottomRightY;        // 右下角Y
        this.bottomLeftX = options.bottomLeftX;          // 左下角X
        this.bottomLeftY = options.bottomLeftY;          // 左下角Y

        // 创建并初始化canvas
        canvas = document.createElement('canvas');
        canvas.id = 'canvas-visualizerBars'; // canvas ID
        $(canvas).css({
            'position': 'fixed',
            'top': 0,
            'left': 0,
            'z-index': 4,
            'opacity': this.opacity,
            'transform': 'none'
        });  // canvas CSS
        canvasWidth = canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        canvasHeight = canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        // 获取最小宽度、原点XY坐标和初始XY坐标
        minLength = canvasWidth * this.width;
        originX = canvasWidth * this.offsetX;
        originY = canvasHeight * this.offsetY;
        startX = originX - minLength / 2;
        startY = originY;

        // 初始化originalPos、targetPos
        targetPos = originalPos = [
            [0, 0],
            [canvasWidth, 0],
            [canvasWidth, canvasHeight],
            [0, canvasHeight]
        ];

        // 创建并初始化绘图的环境
        context = canvas.getContext('2d');
        context.fillStyle = 'rgb(' + this.color + ')';
        // 线条属性
        context.lineWidth = this.lineWidth;
        context.miterLimit = Math.max(10, this.lineWidth);
        context.lineCap = 'square';
        context.lineJoin = 'bevel';
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
        this.updateVisualizerBars(currantAudioArray);
        this.drawVisualizerBars();
    };

    // 默认参数
    VisualizerBars.DEFAULTS = {
        // 音频参数
        amplitude: 5,                // 振幅
        decline: 0.2,                // 衰退值
        peak: 1.5,                   // 峰值
        // 颜色参数
        colorMode: 'monochrome',     // 颜色模式
        color: '255,255,255',        // 颜色
        shadowColor: '255,255,255',  // 阴影颜色
        shadowBlur: 0,               // 阴影大小
        shadowOverlay: false,        // 显示阴影
        isRandomColor: true,         // 随机颜色变换
        firstColor: '255,255,255',   // 起始颜色
        secondColor: '255,0,0',      // 最终颜色
        isChangeBlur: false,         // 模糊颜色变换开关
        hueRange: 360,               // 色相范围
        saturationRange: 100,        // 饱和度范围(%)
        lightnessRange: 50,          // 亮度范围(%)
        gradientOffset: 0,           // 渐变效果偏移
        // 条形参数
        isLineTo: false,             // 显示连线
        isBars: false,               // 显示条形
        barsDirection: 'upperBars',  // 条形方向
        isWave: false,               // 波浪模式
        waveDirection: 'lowerBars',  // 条形方向
        // 基础参数
        opacity: 0.90,               // 不透明度
        width: 0.5,                  // 宽度比例
        height: 2,                   // 基础高度
        pointNum: 120,               // 点的数量
        lineWidth: 5,                // 线条粗细
        lineJoin: 'butt',            // 交汇类型
        barsRotation: 0,             // 旋转角度
        milliSec: 30,                // 重绘间隔
        // 坐标参数
        offsetX: 0.5,                // X坐标偏移
        offsetY: 0.9,                // Y坐标偏移
        isClickOffset: false,        // 鼠标坐标偏移
        // 扭曲参数
        isMasking: false,            // 显示蒙版
        maskOpacity: 0.25,           // 蒙版不透明度
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
    VisualizerBars.prototype = {

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
         * 更新音频数组（待议）
         * @private
         *
         * @param  {Array<float>} audioArray 音频数组
         */
        updateAudioArray: function (audioArray) {
            let audioArray1 = new Array(audioArray.length / 2),
                audioArray2 = new Array(audioArray.length / 2),
                audioArray3 = new Array(audioArray.length / 2);
            // 左右声道叠加
            for (let i = 0; i < audioArray1.length; i++) {
                audioArray1[i] = audioArray[i];
                audioArray2[i] = audioArray[audioArray.length - 1 - i];
                audioArray3[i] = audioArray1[i] + audioArray2[i];
            }
            // 生成补间声道
            let audioArray4 = [];
            for (let i = 0; i < audioArray1.length - 1; i++) {
                audioArray4.push(audioArray3[i]);
                audioArray4.push((audioArray3[i] + audioArray3[i + 1]) / 2);
            }
            audioArray4.push((audioArray3[audioArray3.length - 1]) / 2);
            audioArray4.push((audioArray3[0] + audioArray3[audioArray3.length - 1]) / 2);
            return audioArray4;
        },

        /**
         * 比较当前数组和上次音频数组
         * @private
         */
        compareAudioArray: function () {
            this.decline = this.decline || 0.01;
            // 逐个对比当前音频数组值和上次音频数组 - 音频衰退值
            for (let i = 0; i < lastAudioArray.length; i++) {
                currantAudioArray[i] = Math.max(currantAudioArray[i], lastAudioArray[i] - this.decline);
                currantAudioArray[i] = Math.min(currantAudioArray[i], this.peak);
            }
            // 更新上次音频数组和当前音频均值
            lastAudioArray = [].concat(currantAudioArray);
        },

        /**
         * 更新音频值（未完成）
         * @private
         */
        updateAudioValue: function (audioValue) {
            // 对音频数值的处理
        },


        /**
         * 生成静态点的坐标集合
         * 生成静态音频条形坐标数组
         * @private
         *
         * @param  {Array<float>}   audioArray 音频数组
         * @return {Array<Object>} 坐标数组
         */
        setStaticPoint: function (audioArray) {
            let pointArray = [];
            let barsArray = getBarsArray(audioArray, this.pointNum);
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
         * @param  {Array<float>}   audioArray 音频数组
         * @param  {int}            direction  方向（1或则-1）
         * @return {Array<Object>} 坐标数组
         */
        setPoint: function (audioArray, direction) {
            let pointArray = [];
            let barsArray = getBarsArray(audioArray, this.pointNum);
            let spacing = minLength / (barsArray.length - 1);
            // 将barsArray.length点数组转换成坐标数组
            for (let i = 0; i < barsArray.length; i++) {
                let audioValue = audioArray[i] * this.amplitude;
                let x = startX + i * spacing;
                let y = originY + direction * (audioValue + this.height);
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
         * 绘制音频波浪
         * @private
         *
         * @param {!Object} pointArray1 坐标数组1
         * @param {!Object} pointArray2 坐标数组2
         */
        drawWave: function (pointArray1, pointArray2) {
            // 偏移开始坐标和结束坐标
            pointArray1[0].x -= this.lineWidth / 2;
            pointArray2[0].x -= this.lineWidth / 2;
            pointArray1[pointArray1.length - 1].x += this.lineWidth / 2;
            pointArray2[pointArray1.length - 1].x += this.lineWidth / 2;
            context.save();
            // 线段1开头和线段2结尾
            context.beginPath();
            context.moveTo(pointArray2[0].x, pointArray2[0].y);
            context.lineTo(pointArray1[0].x, pointArray1[0].y);
            // 顺指针连接线段1路径
            for (let i = 1; i < pointArray1.length; i++) {
                context.lineTo(pointArray1[i].x, pointArray1[i].y);
            }
            // 逆指针连接线段2路径
            for (let i = pointArray2.length - 1; i >= 0; i--) {
                context.lineTo(pointArray2[i].x, pointArray2[i].y);
            }
            context.closePath();
            // 填充内部区域
            context.fill();
            context.restore();
            // 还原开始坐标和结束坐标
            pointArray1[0].x += this.lineWidth / 2;
            pointArray2[0].x += this.lineWidth / 2;
            pointArray1[pointArray1.length - 1].x -= this.lineWidth / 2;
            pointArray2[pointArray1.length - 1].x -= this.lineWidth / 2;
        },


        /**
         * 音频条形和小球颜色变换
         * @private
         */
        colorTransformation: function () {
            if (incrementCount < incrementMAX) {
                // color1对象向color2对象变化
                color1.R -= incrementR;
                color1.G -= incrementG;
                color1.B -= incrementB;
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
            let incrementH = this.hueRange / (pointNum * 2);
            let currantH = gradientOffsetRange || 0;
            for (let i = 0; i < pointNum; i++) {
                let startH = currantH;
                currantH += incrementH;
                let endH = currantH;
                currantH += incrementH;
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
         * @param {(int | float)} x1      渐变开始点的 x 坐标
         * @param {(int | float)} y1      渐变开始点的 y 坐标
         * @param {(int | float)} x2      渐变结束点的 x 坐标
         * @param {(int | float)} y2      渐变结束点的 y 坐标
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
                    that.updateVisualizerBars(currantAudioArray);
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
                that.updateVisualizerBars(currantAudioArray);
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
         * @param {Array<float>} audioArray 音频数组
         */
        updateVisualizerBars: function (audioArray) {

            // 更新宽度、原点坐标坐标以及初始XY坐标
            minLength = canvasWidth * this.width;
            originX = canvasWidth * this.offsetX;
            originY = canvasHeight * this.offsetY;
            startX = originX - minLength / 2;
            startY = originY;
            // 更新并处理音频数组
            currantAudioArray = [].concat(audioArray) || new Array(128);
            // currantAudioArray = this.updateAudioArray(audioArray) || new Array(128);
            // audioAverage = mean(currantAudioArray);
            this.compareAudioArray();  // 更新lastAudioArray
            // 更新坐标数组
            staticPointsArray = this.setStaticPoint(currantAudioArray);
            pointArray1 = this.setPoint(currantAudioArray, -1);
            pointArray2 = this.setPoint(currantAudioArray, 1);
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
            context.save();

            // 旋转canvas内容
            context.save();
            context.translate(startX + minLength / 2, startY);
            context.rotate((Math.PI / 180) * this.barsRotation);
            context.translate(-startX - minLength / 2, -startY);
            // 绘制音频条形、连线和波浪
            if (this.colorMode !== 'rainBow') {
                context.save();
                if (!this.shadowOverlay) {
                    context.globalCompositeOperation = 'lighter';
                }
                // 绘制条形
                if (this.isLineTo) {
                    switch (this.barsDirection) {
                        case  'upperBars':
                            this.drawLine(pointArray1);
                            break;
                        case 'lowerBars':
                            this.drawLine(pointArray2);
                            break;
                        case 'twoBars':
                            this.drawLine(pointArray1);
                            this.drawLine(pointArray2);
                            break;
                        default:
                            this.drawLine(pointArray1);
                            this.drawLine(pointArray2);
                    }
                }
                // 绘制条形
                if (this.isBars) {
                    switch (this.barsDirection) {
                        case  'upperBars':
                            this.drawBars(staticPointsArray, pointArray1);
                            break;
                        case 'lowerBars':
                            this.drawBars(staticPointsArray, pointArray2);
                            break;
                        case 'twoBars':
                            this.drawBars(pointArray1, pointArray2);
                            break;
                        default:
                            this.drawBars(pointArray1, pointArray2);
                    }

                }
                // 绘制音频波浪
                if (this.isWave) {
                    switch (this.waveDirection) {
                        case  'upperBars':
                            this.drawWave(staticPointsArray, pointArray1);
                            break;
                        case 'lowerBars':
                            this.drawWave(staticPointsArray, pointArray2);
                            break;
                        case 'twoBars':
                            this.drawWave(pointArray1, pointArray2);
                            break;
                        default:
                            this.drawWave(staticPointsArray, pointArray1);
                    }
                }
                context.restore();
            } else {
                // 绘制彩虹连线
                if (this.isLineTo) {
                    switch (this.barsDirection) {
                        case  'upperBars':
                            this.drawRainBowLine(pointArray1);
                            break;
                        case 'lowerBars':
                            this.drawRainBowLine(pointArray2);
                            break;
                        case 'twoBars':
                            this.drawRainBowLine(pointArray1);
                            this.drawRainBowLine(pointArray2);
                            break;
                        default:
                            this.drawRainBowLine(pointArray1);
                            this.drawRainBowLine(pointArray2);
                    }
                }
                // 绘制彩虹条形
                if (this.isBars) {
                    switch (this.barsDirection) {
                        case  'upperBars':
                            this.drawRainBowBars(staticPointsArray, pointArray1);
                            break;
                        case 'lowerBars':
                            this.drawRainBowBars(staticPointsArray, pointArray2);
                            break;
                        case 'twoBars':
                            this.drawRainBowBars(pointArray1, pointArray2);
                            break;
                        default:
                            this.drawRainBowBars(pointArray1, pointArray2);
                    }
                }
            }
            context.restore();

            // 蒙版效果
            if (this.isMasking) {
                context.fillStyle = 'rgba(255, 0, 0, ' + this.maskOpacity + ')';
                context.fillRect(0, 0, canvasWidth, canvasHeight);
            }

            context.restore();
        },

        /**
         * 根据音频数组绘制音频条形
         * 当上次音频数组记录和当前音频数组不处于静默状态、颜色变换状态、绘制条形
         *
         * @param  {Array<float>} audioArray 音频数组
         */
        drawCanvas: function (audioArray) {
            this.updateVisualizerBars(audioArray);
            if (isSilence(audioArray)
                || isSilence(currantAudioArray)
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
                .off('#canvas-visualizerBars')
                .removeData('visualizerBars');
            $('#canvas-visualizerBars').remove();
        },

        /**
         * 修改参数
         *
         * @param {string} property 属性名
         * @param {*}      value    属性对应值
         */
        set: function (property, value) {
            switch (property) {
                case 'color':
                    this.color = value;
                    context.fillStyle = 'rgb(' + this.color + ')';
                    context.strokeStyle = 'rgb(' + this.color + ')';
                    this.drawVisualizerBars();
                    break;
                case 'shadowColor':
                    this.shdowColor = value;
                    context.shadowColor = 'rgb(' + this.shdowColor + ')';
                    this.drawVisualizerBars();
                    break;
                case 'shadowBlur':
                    this.shadowBlur = value;
                    context.shadowBlur = this.shadowBlur;
                    this.drawVisualizerBars();
                    break;
                case 'opacity':
                    this.opacity = value;
                    $(canvas).css('opacity', this.opacity);
                    break;
                case 'lineWidth':
                    this.lineWidth = value;
                    context.lineWidth = this.lineWidth;
                    this.drawVisualizerBars();
                    break;
                case 'lineJoin':
                    this.lineJoin = value;
                    switch (this.lineJoin) {
                        case 'butt':
                            context.lineCap = 'butt';
                            context.lineJoin = 'miter';
                            break;
                        case 'square':
                            context.lineCap = 'square';
                            context.lineJoin = 'bevel';
                            break;
                        case 'round':
                            context.lineCap = 'round';
                            context.lineJoin = 'round';
                            break;
                        default:
                            context.lineCap = 'square';
                            context.lineJoin = 'bevel';
                    }
                    this.drawVisualizerBars();
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
                case 'amplitude':
                case 'decline':
                case 'peak':
                case 'colorMode':
                case 'isRandomColor':
                case 'isChangeBlur':
                case 'gradientOffset':
                case 'isClickOffset':
                case 'milliSec':
                    this[property] = value;
                    break;
                case 'isMasking':
                case 'maskOpacity':
                    this[property] = value;
                    this.drawVisualizerBars();
                    break;
                case 'shadowOverlay':
                case 'saturationRange':
                case 'lightnessRange':
                case 'isBars':
                case 'barsDirection':
                case 'isWave':
                case 'waveDirection':
                case 'width':
                case 'height':
                case 'isLineTo':
                case 'barsRotation':
                case 'offsetX':
                case 'offsetY':
                    this[property] = value;
                    this.updateVisualizerBars(currantAudioArray);
                    this.drawVisualizerBars();
                    break;
                case 'hueRange':
                case 'pointNum':
                    this[property] = value;
                    rainBowArray = this.setRainBow(this.pointNum);
                    this.updateVisualizerBars(currantAudioArray);
                    this.drawVisualizerBars();
                    break;
                case 'topLeftX':
                case 'topLeftY':
                case 'topRightX':
                case 'topRightY':
                case 'bottomRightX':
                case 'bottomRightY':
                case 'bottomLeftX':
                case 'bottomLeftY':
                    this[property] = value;
                    this.setTargetPos();
                    applyTransform(originalPos, targetPos);
                    break;
                // no default
            }
        }

    };

    // 定义VisualizerBars插件
    //--------------------------------------------------------------------------------------------------------------

    let old = $.fn.visualizerBars;

    $.fn.visualizerBars = function (option) {
        let args = (arguments.length > 1) ? Array.prototype.slice.call(arguments, 1) : undefined;

        return this.each(function () {
            let $this = $(this);
            let data = $this.data('visualizerBars');
            let options = $.extend({}, VisualizerBars.DEFAULTS, $this.data(), typeof option === 'object' && option);

            if (!data && typeof option === 'string') {
                return;
            }
            if (!data) {
                $this.data('visualizerBars', (data = new VisualizerBars(this, options)));
            }
            else if (typeof option === 'string') {
                VisualizerBars.prototype[option].apply(data, args);
            }
        });
    };

    $.fn.visualizerBars.Constructor = VisualizerBars;

    // 确保插件不冲突
    $.fn.visualizerBars.noConflict = function () {
        $.fn.audiovisualize = old;
        return this;
    };

});
