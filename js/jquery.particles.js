/*!
 * jQuery Particles plugin v0.0.3
 * reference: http://github.com/VincentGarreau/particles.js
 * project:
 * - https://github.com/Alice-Jie/AudioVisualizer
 * - https://git.oschina.net/Alice_Jie/circleaudiovisualizer
 * - http://steamcommunity.com/sharedfiles/filedetails/?id=921617616
 * @license MIT licensed
 * @author Alice
 * @date 2017/07/04
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

    let img = new Image();    // 图片对象
    let imgWidth, imgHeight;  // 图片宽度和高度
    let currantCanvas;        // 离屏Canvas
    let currantContext;       // 离屏Contest

    let particlesArray = [];  // 粒子数组

    let timer = null;  // 粒子计时器

    let mouseX, mouseY;  // 鼠标XY坐标

    //私有方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     * 获取粒子之间距离
     * XY坐标代入勾股函数计算出两点之间距离
     *
     * @param  {float} x1 始点X轴坐标
     * @param  {float} y1 始点Y轴坐标
     * @param  {float} x2 末点X轴坐标
     * @param  {float} y2 末点Y轴坐标
     * @return {float} 两点之间距离
     */
    function getDist(x1, y1, x2, y2) {
        let dx = x1 - x2,
            dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 检查粒子位置是否重叠
     * 和粒子数组中其他粒子比较坐标，直到任意两者不重复为止
     *
     * @param {int} index 粒子数组索引
     */
    function checkOverlap(index) {
        let particles1 = particlesArray[index];
        for (let i = 0; i < particlesArray.length; i++) {
            // 跳过索引相同的粒子
            if (i === index) {
                continue;
            }
            let particles2 = particlesArray[i];
            // 获取对象粒子和当前粒子之间距离
            let dist = getDist(particles1.x, particles1.y, particles2.x, particles2.y);
            // 如果距离小于两者半径之和
            if (dist <= particles1.radius + particles2.radius) {
                // 随机在画布上设置粒子对象坐标
                particles1.x = Math.random() * canvasWidth;
                particles1.y = Math.random() * canvasHeight;
                // 检查粒子位置是否重叠
                checkOverlap(index);
            }
        }
    }

    /**
     * 方向向量
     * 粒子移动距离 = 方向向量 X 粒子速度
     *
     * @param  {string} direction 方向字符串
     * @return {object} 方向向量对象
     */
    function directionVector(direction) {
        switch (direction) {
            case 'none':
                return {x: 0, y: 0};
            case 'top':
                return {x: 0, y: -1};
            case 'top-right':
                return {x: 0.5, y: -0.5};
            case 'right':
                return {x: 1, y: -0};
            case 'bottom-right':
                return {x: 0.5, y: 0.5};
            case 'bottom':
                return {x: 0, y: 1};
            case 'bottom-left':
                return {x: -0.5, y: 1};
            case 'left':
                return {x: -1, y: 0};
            case 'top-left':
                return {x: -0.5, y: -0.5};
            default:
                return {x: 0, y: 0};
        }
    }

    /**
     * 设置粒子是否笔直移动
     * 是否统一粒子的方向向量
     *
     * @param {!Object} particles  粒子对象
     * @param {boolean} isStraight 笔直移动开关
     * @param {string}  direction  方向字符串
     */
    function moveStraight(particles, isStraight, direction) {
        // 设置粒子的移动方向
        if (isStraight) {
            particles.vx = directionVector(direction).x;
            particles.vy = directionVector(direction).y;
        } else {
            particles.vx = directionVector(direction).x + Math.random() - 0.5;
            particles.vy = directionVector(direction).y + Math.random() - 0.5;
        }
    }

    /**
     * 移动粒子
     * 粒子下一个坐标 = 粒子当前坐标 + 粒子移动距离
     *
     * @param {!Object} particles  粒子对象
     * @param {boolean} isMove     粒子移动开关
     * @param {float}   speed      粒子移动速度
     */
    function moveParticles(particles, isMove, speed) {
        if (isMove) {
            particles.x += particles.vx * speed;
            particles.y += particles.vy * speed;
        }
    }

    /**
     * 获取粒子图片宽度和高度
     * 粒子图片宽高受粒子尺寸约束
     *
     * @param {!Object} particles 粒子对象
     * @return {Object} 图片宽高对象
     */
    function getImgSize(particles) {
        // 图片宽度和高度
        let width = currantCanvas.width,
            height = currantCanvas.height;
        // 如果图片超过粒子的尺寸限制
        if (currantCanvas.width > particles.radius * 10 || currantCanvas.height > particles.radius * 10) {
            let scaling = 0.5;  // 缩放值
            if (currantCanvas.width > currantCanvas.height) {
                scaling = particles.radius * 10 / currantCanvas.width;
            } else {
                scaling = particles.radius * 10 / currantCanvas.height;
            }
            width = currantCanvas.width * scaling;
            height = currantCanvas.height * scaling;
        }
        return {
            'width': width,
            'height': height
        };
    }

    /**
     * 反弹粒子
     * 计算两者之间最短距离是否等于两者半径之和
     *
     * @param {int}     index 粒子数组索引
     * @param {boolean} isBounce 粒子反弹开关
     */
    function bounceParticles(index, isBounce) {
        if (isBounce) {
            let particles1 = particlesArray[index];
            let particles1_dist = 0;
            if (particles1.shapeType === 'image') {
                particles1_dist = Math.min(getImgSize(particles1).width, getImgSize(particles1).height) / 2;
            } else {
                particles1_dist = particles1.radius;
            }
            for (let i = 0; i < particlesArray.length; i++) {
                // 跳过索引相同的粒子
                if (i === index) {
                    continue;
                }
                let particles2 = particlesArray[i];
                let particles2_dist = 0;
                if (particles2.shapeType === 'image') {
                    particles2_dist = Math.min(getImgSize(particles2).width, getImgSize(particles2).height) / 2;
                } else {
                    particles2_dist = particles2.radius;
                }
                // 获取对象粒子和当前粒子之间距离
                let dist = getDist(particles1.x + particles1_dist, particles1.y + particles1_dist, particles2.x + particles2_dist, particles2.y + particles2_dist);
                let dist_p = particles1_dist + particles2_dist;
                // 如果粒子距离小于等于两者半径之和
                if (dist <= dist_p) {
                    particles1.vx = -particles1.vx;
                    particles1.vy = -particles1.vy;

                    particles2.vx = -particles2.vx;
                    particles2.vy = -particles2.vy;
                }
            }
        }
    }

    /**
     * 边缘检测
     * 与窗口边缘值相比较，如离开则在窗口内随机生成坐标或则方向向量取反
     *
     * @param {!Object} particles   粒子对象
     * @param {string}  moveOutMode 离开模式
     */
    function marginalCheck(particles, moveOutMode) {
        let new_pos = {
            x_left: -particles.radius,
            x_right: canvasWidth + particles.radius,
            y_top: -particles.radius,
            y_bottom: canvasHeight + particles.radius
        };
        // 如果离开模式是反弹
        if (moveOutMode === 'bounce') {
            new_pos = {
                x_left: particles.radius,
                x_right: canvasWidth,
                y_top: particles.radius,
                y_bottom: canvasHeight
            }
        }

        // 粒子超出屏幕范围时，重设粒子的XY坐标

        // 如果粒子X轴大于画布宽度
        if (particles.x - particles.radius > canvasWidth) {
            particles.x = new_pos.x_left;
            particles.y = Math.random() * canvasHeight;
        }
        // 如果粒子X轴小于画布宽度
        else if (particles.x + particles.radius < 0) {
            particles.x = new_pos.x_right;
            particles.y = Math.random() * canvasHeight;
        }
        // 如果粒子Y轴大于画布高度
        if (particles.y - particles.radius > canvasHeight) {
            particles.y = new_pos.y_top;
            particles.x = Math.random() * canvasWidth;
        }
        // 如果粒子Y轴小于画布高度
        else if (particles.y + particles.radius < 0) {
            particles.y = new_pos.y_bottom;
            particles.x = Math.random() * canvasWidth;
        }

        // 如果离开模式是反弹，改变粒子的方向向量
        if (moveOutMode === 'bounce') {
            // 粒子的X坐标 > 屏幕宽度
            if (particles.x + particles.radius > canvasWidth) {
                particles.vx = -particles.vx;
            }
            // 粒子的X坐标 < 0
            else if (particles.x - particles.radius < 0) {
                particles.vx = -particles.vx;
            }

            // 粒子的Y坐标 > 屏幕高度
            if (particles.y + particles.radius > canvasHeight) {
                particles.vy = -particles.vy;
            }
            // 粒子的Y坐标 < 0
            else if (particles.y - particles.radius < 0) {
                particles.vy = -particles.vy;
            }
        }
    }

    /**
     * 角度偏移
     * 粒子角度 = 粒子当前角度 + 偏移角度
     *
     * @param  {int} rotationAngle 当前角度
     * @param  {int} deg           偏移角度
     * @return {int} 旋转后的角度
     */
    function rotation(rotationAngle, deg) {
        rotationAngle += Math.PI / 180 * deg;
        if (rotationAngle >= Math.PI * 2) {
            rotationAngle = rotationAngle - Math.PI * 2;
        } else if (rotationAngle <= Math.PI * -2) {
            rotationAngle = rotationAngle - Math.PI * -2;
        }
        return rotationAngle;
    }

    //构造函数和公共方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     * @class Particles
     *
     * @param {!Object} el      被选中的节点
     * @param {Object}  options 参数对象
     */
    let Particles = function (el, options) {
        this.$el = $(el);

        // 全局属性
        this.number = options.number;                        // 粒子数量
        this.isDensity = options.isDensity;                  // 粒子密度开关
        this.densityArea = options.densityArea;              // 粒子密度范围
        this.opacity = options.opacity;                      // 不透明度
        this.color = options.color;                          // 粒子颜色
        this.shadowColor = options.shadowColor;              // 模糊颜色
        this.shadowBlur = options.shadowBlur;                // 模糊大小
        // 形状属性
        this.shapeType = options.shapeType;                  // 粒子形状
        this.rotationAngle = options.rotationAngle;          // 旋转角度
        this.angleRandom = options.angleRandom;              // 随机角度
        // 大小属性
        this.sizeValue = options.sizeValue;                  // 粒子大小
        this.sizeRandom = options.sizeRandom;                // 随机大小
        // 连接属性
        this.linkEnable = options.linkEnable;                // 连接开关
        this.linkDistance = options.linkDistance;            // 连接距离
        this.linkWidth = options.linkWidth;                  // 连线宽度
        this.linkColor = options.linkColor;                  // 连接颜色
        this.linkOpacity = options.linkOpacity;              // 连线不透明度
        // 移动属性
        this.isMove = options.isMove;                        // 移动开关
        this.speed = options.speed;                          // 粒子速度
        this.speedRandom = options.speedRandom;              // 随机速度
        this.direction = options.direction;                  // 粒子方向
        this.isStraight = options.isStraight;                // 笔直移动
        this.isBounce = options.isBounce;                    // 粒子反弹
        this.moveOutMode = options.moveOutMode;              // 离屏模式
        // 交互事件
        this.interactivityLink = options.interactivityLink;  // 与鼠标连线


        // 创建并初始化canvas
        canvas = document.createElement('canvas');
        canvas.id = 'canvas-particles'; // canvas ID
        $(canvas).css({
            'position': 'fixed',
            'top': 0,
            'left': 0,
            'z-index': 1,
            'opacity': this.opacity
        });  // canvas CSS
        canvasWidth = canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        canvasHeight = canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        // 创建并初始化绘图的环境
        context = canvas.getContext('2d');
        context.fillStyle = 'rgb(' + this.color + ')';
        // 阴影属性
        context.shadowColor = 'rgb(' + this.color + ')';
        context.shadowBlur = this.shadowBlur;
        // 线条属性
        context.lineWidth = this.linkWidth;
        context.strokeStyle = "rgba(" + this.linkColor + "," + 1 + ")";

        // 创建并初始化离屏canvas
        currantCanvas = document.createElement('canvas');
        currantCanvas.width = currantCanvas.height = 500;
        currantContext = currantCanvas.getContext('2d');

        // 初始化Img属性
        img.id = 'particles-img';
        img.src = 'img/funny_01.png';
        imgWidth = imgHeight = 500;
        this.particlesImage('');

        $(this.$el).append(canvas);  // 添加canvas

        mouseX = mouseY = 0;  // 初始化鼠标XY

        // 默认开启
        this.setupPointerEvents();
        this.initParticlesArray();  // 初始化粒子列表
        this.densityAutoParticles();  // 基于粒子密度调节粒子数量

    };

    // 默认参数
    Particles.DEFAULTS = {
        // 全局属性
        number: 100,                 // 粒子数量
        isDensity: false,            // 粒子密度开关
        densityArea: 1000,           // 粒子密度范围
        opacity: 0.75,               // 不透明度
        opacityRandom: false,        // 随机不透明度
        color: '255,255,255',        // 粒子颜色
        shadowColor: '255,255,255',  // 阴影颜色
        shadowBlur: 0,               // 模糊大小
        // 形状属性
        shapeType: 'circle',         // 粒子形状
        rotationAngle: 0,            // 旋转角度
        angleRandom: false,          // 随机角度
        // 大小属性
        sizeValue: 5,                // 粒子大小
        sizeRandom: true,            // 随机大小
        // 连线属性
        linkEnable: false,           // 连接开关
        linkDistance: 100,           // 连接距离
        linkWidth: 2,                // 连线宽度
        linkColor: '255,255,255',    // 连线颜色
        linkOpacity: 0.75,           // 连线不透明度
        // 移动属性
        isMove: true,                // 粒子移动
        speed: 2,                    // 粒子速度
        speedRandom: true,           // 随机速度
        direction: 'bottom',         // 粒子方向
        isStraight: false,           // 笔直移动
        isBounce: false,             // 粒子反弹
        moveOutMode: 'out',          // 离屏模式
        // 交互事件
        interactivityLink: false     // 与鼠标连线
    };

    // 公共方法
    Particles.prototype = {

        // 面向内部方法
        //-----------------------------------------------------------

        /**
         * 初始化粒子数组
         * @private
         */
        initParticlesArray: function () {
            // 向粒子数组添加粒子
            for (let i = 0; i < this.number; i++) {
                // 随机XY坐标
                let x = ~~(0.5 + Math.random() * canvasWidth);
                let y = ~~(0.5 + Math.random() * canvasHeight);
                // 向粒子数组添加粒子
                particlesArray.push({
                    // 粒子全局属性
                    opacity: this.opacity,           // 不透明度
                    color: this.color,               // 粒子颜色
                    shadowColor: this.shadowColor,   // 阴影颜色
                    shadowBlur: this.shadowBlur,     // 模糊大小
                    // 尺寸属性
                    shapeType: this.shapeType,       // 粒子形状
                    rotationAngle: 0,                // 旋转角度
                    currantAngle: 0,                 // 当前角度
                    // 大小属性
                    radius: this.sizeValue,          // 粒子大小
                    // 坐标属性
                    x: x,                            // X轴坐标
                    y: y,                            // Y轴坐标
                    speed: 0,                        // 移动速度
                    vx: 0,                           // X轴方向向量
                    vy: 0                            // Y轴方向向量
                });
            }
            for (let i = 0; i < particlesArray.length; i++) {
                // 粒子属性随机化
                particlesArray[i].opacity = this.opacityRandom ? Math.min(Math.random(), this.opacity) : this.opacity;
                if (this.rotationAngle !== 0) {
                    particlesArray[i].rotationAngle = (this.angleRandom ? Math.random() : 1) * this.rotationAngle * (Math.PI / 180);
                }
                particlesArray[i].radius = (this.sizeRandom ? Math.random() : 1) * this.sizeValue;
                particlesArray[i].speed = (this.speedRandom ? Math.random() : 1) * this.speed;
                moveStraight(particlesArray[i], this.isStraight, this.direction);  // 设置粒子方向向量
                checkOverlap(i);  // 检查粒子之间是否重叠
            }
        },

        /**
         * 绘制多边形
         * By Programming Thomas - https://programmingthomas.wordpress.com/2013/04/03/n-sided-shapes/
         * @private
         *
         * @param {!Object} context context      对象
         * @param {float}   startX               开始X坐标
         * @param {float}   startY               开始Y坐标
         * @param {float}   sideLength           边长
         * @param {int}     sideCountNumerator   边数分子
         * @param {int}     sideCountDenominator 边数分母
         */
        drawShape: function (context, startX, startY, sideLength, sideCountNumerator, sideCountDenominator) {
            let sideCount = sideCountNumerator * sideCountDenominator;
            let decimalSides = sideCountNumerator / sideCountDenominator;
            let interiorAngleDegrees = (180 * (decimalSides - 2)) / decimalSides;
            let interiorAngle = Math.PI - Math.PI * interiorAngleDegrees / 180;  // convert to radians
            context.translate(startX, startY);
            context.moveTo(0, 0);
            for (let i = 0; i < sideCount; i++) {
                context.lineTo(sideLength, 0);
                context.translate(sideLength, 0);
                context.rotate(interiorAngle);
            }
        },


        /**
         * 设置交互事件
         * @private
         */
        setupPointerEvents: function () {

            let that = this;
            $(this.$el).on('mousemove', function (e) {
                if (that.interactivityLink) {
                    mouseX = e.clientX;
                    mouseY = e.clientY;
                }
            });

            // 窗体改变事件
            $(window).on('resize', function () {
                // 改变宽度和高度
                canvasWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                canvasHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            });

        },

        // 面向外部方法
        //-----------------------------------------------------------

        /**
         * 添加粒子
         * 和旧的粒子数量进行比较，添加/删除粒子
         *
         * @param {int} num  粒子数量
         */
        addParticles: function (num) {
            let old = this.number;
            if (num > old) {
                let n = num - old;
                let tempArray = [];
                // 多余的粒子初始化
                for (let i = 0; i < n; i++) {
                    let x = ~~(0.5 + Math.random() * canvasWidth);
                    let y = ~~(0.5 + Math.random() * canvasHeight);
                    tempArray.push({
                        // 粒子全局属性
                        opacity: this.opacity,          // 不透明度
                        color: this.color,              // 粒子颜色
                        shadowColor: this.shadowColor,  // 阴影颜色
                        shadowBlur: this.shadowBlur,    // 模糊大小
                        // 尺寸属性
                        shapeType: this.shapeType,      // 粒子形状
                        rotationAngle: 0,               // 旋转角度
                        currantAngle: 0,                // 当前角度
                        // 大小属性
                        radius: this.sizeValue,         // 粒子大小
                        // 坐标属性
                        x: x,                           // X轴坐标
                        y: y,                           // Y轴坐标
                        speed: 0,                       // 移动速度
                        vx: 0,                          // X轴方向向量
                        vy: 0                           // Y轴方向向量
                    });
                }
                // 多余的粒子属性随机化
                for (let i = 0; i < tempArray.length; i++) {
                    tempArray[i].opacity = (this.opacityRandom ? Math.random() : this.opacity);
                    tempArray[i].radius = (this.sizeRandom ? Math.random() : 1) * this.sizeValue;
                    if (this.rotationAngle !== 0) {
                        tempArray[i].rotationAngle = (this.angleRandom ? Math.random() : 1) * this.rotationAngle * (Math.PI / 180);
                    }
                    tempArray[i].speed = (this.speedRandom ? Math.random() : 1) * this.speed;
                    moveStraight(tempArray[i], this.isStraight, this.direction);
                }
                particlesArray = particlesArray.concat(tempArray);
                for (let i = 0; i < particlesArray.length; i++) {
                    checkOverlap(i);
                }
            } else if (num >= 0 && num < old) {
                let n = old - num;
                // 删除多余的粒子
                for (let i = 0; i < n; i++) {
                    particlesArray.pop();
                }
            }
            this.number = particlesArray.length;  // 更新粒子数目
        },

        /** 根据粒子密度确定粒子数量 */
        densityAutoParticles: function () {
            if (this.isDensity) {
                let area = canvasWidth * canvasHeight / 1000;  // 计算密度
                let particlesNum = area * this.number / this.densityArea;  // 基于密度区域的粒子个数
                // 添加或则移除X个粒子
                let missingParticles = particlesArray.length - particlesNum;
                if (missingParticles < 0) {
                    this.addParticles(this.number + Math.abs(missingParticles));
                } else {
                    this.addParticles(this.number - missingParticles);
                }
            }
        },

        /** 更新粒子数组 */
        updateParticlesArray: function () {
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].currantAngle = rotation(particlesArray[i].currantAngle, particlesArray[i].rotationAngle);
                moveParticles(particlesArray[i], this.isMove, particlesArray[i].speed);
                bounceParticles(i, this.isBounce);
                marginalCheck(particlesArray[i], this.moveOutMode);
            }
        },


        /** 清除Canvas内容 */
        clearCanvas: function () {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
        },

        /**
         *  改变当前图片
         *  通过离屏canvas绘制图片，图片宽高受粒子尺寸约束
         *
         *  @param {string} imgSrc 图片粒子路径
         */
        particlesImage: function (imgSrc) {
            if (imgSrc) {
                img.src = 'file:///' + imgSrc;
            } else {
                img.src = 'img/funny_01.png';
            }
            // 绘制离屏Canvas
            img.onload = function () {
                if (img.width > imgWidth || img.height > imgHeight) {
                    let scaling = 0.5;  // 缩放值
                    if (img.width > img.height) {
                        scaling = imgWidth / img.width;
                    } else {
                        scaling = imgHeight / img.height;
                    }
                    currantCanvas.width = img.width * scaling;
                    currantCanvas.height = img.height * scaling;
                    currantContext.drawImage(img, 0, 0, currantCanvas.width, currantCanvas.height);
                } else {
                    currantCanvas.width = img.width;
                    currantCanvas.height = img.height;
                    currantContext.drawImage(img, 0, 0);
                }
            }
        },

        /**
         *  绘制粒子
         *  根据当前粒子对象属性绘制粒子
         *
         * @param {!Object} particles 粒子对象
         */
        drawParticles: function (particles) {
            // 设置context属性
            context.save();
            context.fillStyle = 'rgb(' + particles.color + ')';
            context.shadowColor = 'rgb(' + particles.shadowColor + ')';
            context.shadowBlur = particles.shadowBlur;
            context.globalAlpha = particles.opacity;
            // 粒子路径
            context.beginPath();
            switch (particles.shapeType) {
                // 绘制圆形
                case 'circle':
                    context.arc(particles.x, particles.y, particles.radius, 0, Math.PI * 2, false);
                    break;
                // 绘制正方形
                case 'edge':
                    context.translate(particles.x + particles.radius / 2, particles.y + particles.radius / 2);
                    context.rotate(particles.currantAngle);
                    context.rect(-particles.radius, -particles.radius, particles.radius * 2, particles.radius * 2);
                    break;
                // 绘制三角形
                case 'triangle':
                    context.translate(particles.x + particles.radius / 2, particles.y + particles.radius / 2);
                    context.rotate(particles.currantAngle);
                    this.drawShape(context, -particles.radius, particles.radius / 1.66, particles.radius * 2, 3, 2);
                    break;
                // 绘制星形
                case 'star':
                    context.translate(particles.x + particles.radius / 2, particles.y + particles.radius / 2);
                    context.rotate(particles.currantAngle);
                    this.drawShape(
                        context,
                        -particles.radius * 2 / (5 / 4),        // startX
                        -particles.radius / (2 * 2.66 / 3.5),   // startY
                        particles.radius * 2 * 2.66 / (5 / 3),  // sideLength
                        5,                                      // sideCountNumerator
                        2                                       // sideCountDenominator
                    );
                    break;
                // 绘制图片
                case 'image':
                    // 获取图片粒子的宽和高
                    let width = getImgSize(particles).width,
                        height = getImgSize(particles).height;
                    context.translate(particles.x + width / 2, particles.y + height / 2);
                    context.rotate(particles.currantAngle);
                    context.drawImage(currantCanvas, -width / 2, -height / 2, width, height);
                    break;
            }
            context.closePath();
            context.fill();  // 绘制粒子
            context.restore();
        },

        /**
         * 绘制两点之间连线
         * 粒子之间透明度由两点之间距离决定，越近越清晰
         *
         * @param {float} x            始点X坐标
         * @param {float} y            始点Y坐标
         * @param {float} linkDistance 两点之间最大距离
         */
        drawXYLine: function (x, y, linkDistance) {
            for (let i = 0; i < particlesArray.length; i++) {
                let particles = particlesArray[i];
                // 获取对象粒子和当前粒子之间距离
                let dist = getDist(x, y, particles.x, particles.y);
                if (dist <= linkDistance) {
                    let d = (linkDistance - dist) / linkDistance;
                    let width = 0, height = 0;  // 粒子高度和宽度
                    context.save();
                    context.lineWidth = d * this.linkWidth;
                    context.strokeStyle = "rgba(" + this.linkColor + "," + Math.min(d, this.linkOpacity) + ")";
                    context.beginPath();
                    context.moveTo(x, y);
                    // 设置宽度和高度
                    switch (particles.shapeType) {
                        case 'circle':
                            width = height = 0;
                            break;
                        case 'edge':
                        case 'triangle':
                        case 'star':
                            width = height = particles.radius / 2;
                            break;
                        // 绘制图片
                        case 'image':
                            width = getImgSize(particles).width / 2;
                            height = getImgSize(particles).height / 2;
                            break;
                    }
                    context.lineTo(particles.x + width, particles.y + height);
                    context.closePath();
                    context.stroke();
                    context.restore();
                }
            }
        },

        /**
         * 绘制粒子间连线
         * 绘制索引对应的粒子与其它粒子的连线
         *
         * @param {int}     index 粒子数组索引
         */
        drawParticlesLine: function (index) {
            for (let i = 0; i < particlesArray.length; i++) {
                // 跳过索引相同的粒子
                if (i === index) {
                    continue;
                }
                let particles1 = particlesArray[index];
                let particles2 = particlesArray[i];
                // 获取对象粒子和当前粒子之间距离
                let dist = getDist(particles1.x, particles1.y, particles2.x, particles2.y);
                if (dist <= this.linkDistance) {
                    let d = (this.linkDistance - dist) / this.linkDistance;
                    let width = 0, height = 0;  // 粒子高度和宽度
                    context.save();
                    context.lineWidth = d * this.linkWidth;
                    context.strokeStyle = "rgba(" + this.linkColor + "," + Math.min(d, this.linkOpacity) + ")";
                    context.beginPath();
                    // 设置宽度和高度
                    switch (particles1.shapeType) {
                        case 'circle':
                            width = height = 0;
                            break;
                        case 'edge':
                        case 'triangle':
                        case 'star':
                            width = height = particles1.radius / 2;
                            break;
                        // 绘制图片
                        case 'image':
                            width = getImgSize(particles1).width / 2;
                            height = getImgSize(particles1).height / 2;
                            break;
                    }
                    context.moveTo(particles1.x + width, particles1.y + height);
                    // 设置宽度和高度
                    switch (particles2.shapeType) {
                        case 'circle':
                            width = height = 0;
                            break;
                        case 'edge':
                        case 'triangle':
                        case 'star':
                            width = height = particles2.radius / 2;
                            break;
                        // 绘制图片
                        case 'image':
                            width = getImgSize(particles2).width / 2;
                            height = getImgSize(particles2).height / 2;
                            break;
                    }
                    context.lineTo(particles2.x + width, particles2.y + height);
                    context.closePath();
                    context.stroke();
                    context.restore();
                }
            }
        },


        /** 停止粒子计时器 */
        stopParticlesTimer: function () {
            if (timer) {
                cancelAnimationFrame(timer);
            }
        },

        /** 开始粒子计时器 */
        runParticlesTimer: function () {
            this.stopParticlesTimer();
            let that = this;
            // 开始绘制动画
            timer = requestAnimationFrame(function animal() {
                that.updateParticlesArray();
                context.clearRect(0, 0, canvasWidth, canvasHeight);
                for (let i = 0; i < particlesArray.length; i++) {
                    that.drawParticles(particlesArray[i]);
                    if (that.linkEnable) {
                        that.drawParticlesLine(i);
                        if (that.interactivityLink) {
                            that.drawXYLine(mouseX, mouseY, that.linkDistance);
                        }
                    }
                }
                timer = requestAnimationFrame(animal);
            });
        },


        /** 移除canvas */
        destroy: function () {
            this.$el
                .off('#canvas-particles')
                .removeData('particles');
            $('#canvas-particles').remove();
        },

        /**
         * 设置粒子数组粒子属性
         * 粒子对象转换成粒子属性数组并修改对应属性值
         *
         * @param {string}   property 属性名
         */
        setParticles: function (property) {
            for (let i = 0; i < particlesArray.length; i++) {
                switch (property) {
                    case 'opacity':
                    case 'opacityRandom':
                        particlesArray[i].opacity = this.opacityRandom ? Math.min(Math.random(), this.opacity) : this.opacity;
                        break;
                    case 'color':
                        particlesArray[i].color = this.color;
                        break;
                    case 'shadowColor':
                        particlesArray[i].shadowColor = this.shadowColor;
                        break;
                    case 'shadowBlur':
                        particlesArray[i].shadowBlur = this.shadowBlur;
                        break;
                    case 'shapeType':
                        particlesArray[i].shapeType = this.shapeType;
                        break;
                    case 'sizeValue':
                    case 'sizeRandom':
                        particlesArray[i].radius = (this.sizeRandom ? Math.random() : 1) * this.sizeValue;
                        break;
                    case 'rotationAngle':
                    case 'angleRandom':
                        if (this.rotationAngle !== 0) {
                            particlesArray[i].rotationAngle = (this.angleRandom ? Math.random() : 1) * this.rotationAngle * (Math.PI / 180);
                        }
                        break;
                    case 'speed':
                    case 'speedRandom':
                        particlesArray[i].speed = (this.speedRandom ? Math.random() : 1) * this.speed;
                        break;
                    case 'isStraight':
                    case 'direction':
                        moveStraight(particlesArray[i], this.isStraight, this.direction);
                        break;
                }
            }
        },

        /**
         * 修改参数
         * @param {string} property 属性名
         * @param {*}      value    属性对应值
         */
        set: function (property, value) {
            switch (property) {
                case 'linkEnable':
                case 'linkDistance':
                case 'linkWidth':
                case 'linkColor':
                case 'linkOpacity':
                case 'isMove':
                case 'isBounce':
                case 'moveOutMode':
                case 'interactivityLink':
                    this[property] = value;
                    break;
                case 'isDensity':
                    this.isDensity = value;
                    this.densityAutoParticles();
                    break;
                case 'densityArea':
                    this.densityArea = value;
                    this.densityAutoParticles();
                    break;
                case 'color':
                case 'opacity':
                case 'opacityRandom':
                case 'shadowColor':
                case 'shadowBlur':
                case 'shapeType':
                case 'rotationAngle':
                case 'angleRandom':
                case 'sizeValue':
                case 'sizeRandom':
                case 'speed':
                case 'speedRandom':
                case 'direction':
                case 'isStraight':
                    this[property] = value;
                    this.setParticles(property);
                    break;
            }
        }

    };

    // 定义Particles插件
    //--------------------------------------------------------------------------------------------------------------

    let old = $.fn.particles;

    $.fn.particles = function (option) {
        let args = (arguments.length > 1) ? Array.prototype.slice.call(arguments, 1) : undefined;

        return this.each(function () {
            let $this = $(this);
            let data = $this.data('particles');
            let options = $.extend({}, Particles.DEFAULTS, $this.data(), typeof option === 'object' && option);

            if (!data && typeof option === 'string') {
                return;
            }
            if (!data) {
                $this.data('particles', (data = new Particles(this, options)));
            }
            else if (typeof option === 'string') {
                Particles.prototype[option].apply(data, args);
            }
        });
    };

    $.fn.particles.Constructor = Particles;

    // 确保插件不冲突
    $.fn.particles.noConflict = function () {
        $.fn.particles = old;
        return this;
    };

});