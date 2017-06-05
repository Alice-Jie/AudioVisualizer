/**
 * jQuery Particles plugin v0.0.2
 * reference: http://github.com/VincentGarreau/particles.js
 * project: http://steamcommunity.com/sharedfiles/filedetails/?id=921617616&searchtext=
 * @license MIT licensed
 * @author Alice
 * @date 2017/05/30
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

    var canvas;                     // canvas对象
    var context;                    // context对象
    var canvasWidth, canvasHeight;  // canvas宽度和高度

    var img = new Image();    // 图片对象
    var imgWidth, imgHeight;  // 图片宽度和高度
    var currantCanvas;        // 离屏Canvas
    var currantContext;

    var particlesArray = [];  // 粒子数组

    var timer = null;  // 粒子计时器

    //私有方法
    //--------------------------------------------------------------------------------------------------------------

    // particles方法
    //-----------------------------------------------------------

    /**
     * 获取粒子之间距离
     *
     * @param  {float} x1 始点X轴坐标
     * @param  {float} y1 始点Y轴坐标
     * @param  {float} x2 末点X轴坐标
     * @param  {float} y2 末点Y轴坐标
     * @return {float} 两点之间距离
     */
    function getDist(x1, y1, x2, y2) {
        var dx = x1 - x2,
            dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 检查粒子位置是否重叠
     *
     * @param {int} index 粒子数组索引
     */
    function checkOverlap(index) {
        for (var i = 0; i < particlesArray.length; i++) {
            // 跳过索引相同的粒子
            if (i === index) {
                continue;
            }
            var particles1 = particlesArray[index];
            var particles2 = particlesArray[i];
            // 获取对象粒子和当前粒子之间距离
            var dist = getDist(particles1.x, particles1.y, particles2.x, particles2.y);
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
     * 反弹粒子
     * @param {int}     index 粒子数组索引
     * @param {boolean} isBounce 粒子反弹开关
     */
    function bounceParticles (index, isBounce) {
        if(isBounce) {
            for (var i = 0; i < particlesArray.length; i++) {
                // 跳过索引相同的粒子
                if (i === index) {
                    continue;
                }
                var particles1 = particlesArray[index];
                var particles2 = particlesArray[i];
                // 获取对象粒子和当前粒子之间距离
                var dist = getDist(particles1.x, particles1.y, particles2.x, particles2.y);
                var dist_p = particles1.radius + particles2.radius;
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
     *
     * @param {!Object} particles   粒子对象
     * @param {string}  moveOutMode 离开模式
     */
    function marginalCheck(particles, moveOutMode) {
        // 如果离开模式是反弹
        if (moveOutMode === 'bounce') {
            var new_pos = {
                x_left: particles.radius,
                x_right: canvasWidth,
                y_top: particles.radius,
                y_bottom: canvasHeight
            }
        } else {
            var new_pos = {
                x_left: -particles.radius,
                x_right: canvasWidth + particles.radius,
                y_top: -particles.radius,
                y_bottom: canvasHeight + particles.radius
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

    // particlesArray方法
    //-----------------------------------------------------------

    /**
     *  初始化粒子数组
     *
     * @param {Function} that 方法Particles
     * - that.number        {int}     粒子数量
     * - that.opacity       {float}   不透明度
     * - that.color         {string}  粒子颜色
     * - that.shadowColor   {string}  阴影颜色
     * - that.shadowBlur    {int}     阴影大小
     * - that.sizeValue     {int}     粒子大小
     * - that.shapeType     {string}  粒子形状
     * - that.opacityRandom {boolean} 随机不透明度
     * - that.sizeRandom    {boolean} 随机大小
     * - that.speedRandom   {boolean} 随机速度
     * - that.speed         {int}     粒子速度
     * - that.isStraight    {boolean} 笔直移动
     * - that.direction     {string}  粒子方向
     */
    function initParticlesArray(that) {
        // 向粒子数组添加粒子
        for (var i = 0; i < that.number; i++) {
            // 随机XY坐标
            var x = ~~(0.5 + Math.random() * canvasWidth);
            var y = ~~(0.5 + Math.random() * canvasHeight);
            // 向粒子数组添加粒子
            particlesArray.push({
                // 粒子全局属性
                opacity: that.opacity,          // 不透明度
                color: that.color,              // 粒子颜色
                shadowColor: that.shadowColor,  // 阴影颜色
                shadowBlur: that.shadowBlur,    // 模糊大小
                // 尺寸属性
                shapeType: that.shapeType,      // 粒子形状
                // 大小属性
                radius: that.sizeValue,         // 粒子大小
                // 坐标属性
                x: x,                           // X轴坐标
                y: y,                           // Y轴坐标
                speed: 0,                       // 移动速度
                vx: 0,                          // X轴方向向量
                vy: 0                           // Y轴方向向量
            });
        }
        for (var i = 0; i < particlesArray.length; i++) {
            // 粒子属性随机化
            particlesArray[i].opacity = that.opacityRandom ? Math.min(Math.random(), that.opacity) : that.opacity;
            particlesArray[i].radius = (that.sizeRandom ? Math.random() : 1) * that.sizeValue;
            particlesArray[i].speed = Math.max(1, (that.speedRandom ? Math.random() : 1) * that.speed);
            moveStraight(particlesArray[i], that.isStraight, that.direction);  // 设置粒子方向向量
            checkOverlap(i);  // 检查粒子之间是否重叠
        }
    }

    /**
     * 添加粒子
     *
     * @param {Function} that 方法Particles
     * @param {int}      num  粒子数量
     * that - 方法Particles
     * - that.opacity       {float}   不透明度
     * - that.color         {string}  粒子颜色
     * - that.shadowColor   {string}  阴影颜色
     * - that.shadowBlur    {int}     阴影大小
     * - that.sizeValue     {int}     粒子大小
     * - that.shapeType     {string}  粒子形状
     * - that.opacityRandom {boolean} 随机不透明度
     * - that.sizeRandom    {boolean} 随机大小
     * - that.speedRandom   {boolean} 随机速度
     * - that.speed         {int}     粒子速度
     * - that.isStraight    {boolean} 笔直移动
     * - that.direction     {string}  粒子方向
     * - that.number        {int}     粒子数量
     */
    function addParticles(that, num) {
        var old = that.number;
        if (num > old) {
            var n = num - old;
            var tempArray = [];
            // 多余的粒子初始化
            for (var i = 0; i < n; i++) {
                var x = ~~(0.5 + Math.random() * canvasWidth);
                var y = ~~(0.5 + Math.random() * canvasHeight);
                tempArray.push({
                    // 粒子全局属性
                    opacity: that.opacity,          // 不透明度
                    color: that.color,              // 粒子颜色
                    shadowColor: that.shadowColor,  // 阴影颜色
                    shadowBlur: that.shadowBlur,    // 模糊大小
                    // 尺寸属性
                    shapeType: that.shapeType,      // 粒子形状
                    // 大小属性
                    radius: that.sizeValue,         // 粒子大小
                    // 坐标属性
                    x: x,                           // X轴坐标
                    y: y,                           // Y轴坐标
                    speed: 0,                       // 移动速度
                    vx: 0,                          // X轴方向向量
                    vy: 0                           // Y轴方向向量
                });
            }
            // 多余的粒子属性随机化
            for (var i = 0; i < tempArray.length; i++) {
                tempArray[i].opacity = (that.opacityRandom ? Math.random() : that.opacity);
                tempArray[i].radius = (that.sizeRandom ? Math.random() : 1) * that.sizeValue;
                tempArray[i].speed = (that.speedRandom ? Math.random() : 1) * that.speed;
                moveStraight(tempArray[i], that.isStraight, that.direction);
            }
            particlesArray = particlesArray.concat(tempArray);
            for (var i = 0; i < particlesArray.length; i++) {
                checkOverlap(i);
            }
        } else if (num >= 0 && num < old) {
            var n = old - num;
            // 删除多余的粒子
            for (var i = 0; i < n; i++) {
                particlesArray.pop();
            }
        }
        that.number = particlesArray.length;  // 更新粒子数目
    }

    /**
     * 设置粒子数组全局粒子属性
     *
     * @param {Function} that 方法Particles
     * - that.opacityRandom {boolean} 随机不透明度
     * - that.opacity       {float}   不透明度
     * - that.color         {string}  粒子颜色
     * - that.shadowColor   {string}  阴影颜色
     * - that.shadowBlur    {int}     阴影大小
     */
    function setParticlesGlobalValue(that) {
        for (var i = 0; i < particlesArray.length; i++) {
            particlesArray[i].opacity = that.opacityRandom ? Math.min(Math.random(), that.opacity) : that.opacity;
            particlesArray[i].color = that.color;              // 粒子颜色
            particlesArray[i].shadowColor = that.shadowColor;  // 阴影颜色
            particlesArray[i].shadowBlur = that.shadowBlur;    // 模糊大小
        }
    }

    /**
     * 设置粒子数组粒子尺寸属性
     *
     * @param {Function} that 方法Particles
     * - that.sizeValue  {int}     粒子大小
     * - that.sizeRandom {boolean} 随机大小
     * - that.shapeType  {string}  粒子形状
     */
    function setParticlesSizeValue(that) {
        for (var i = 0; i < particlesArray.length; i++) {
            particlesArray[i].shapeType = that.shapeType;
            particlesArray[i].radius = (that.sizeRandom ? Math.random() : 1) * that.sizeValue;
        }
    }

    /**
     * 设置粒子数组粒子移动属性
     *
     * @param {Function} that 方法Particles
     * - that.speedRandom {boolean} 随机速度
     * - that.speed       {int}     粒子速度
     * - that.isStraight  {boolean} 笔直移动
     * - that.direction   {string}  粒子方向
     */
    function setParticlesMoveValue(that) {
        for (var i = 0; i < particlesArray.length; i++) {
            particlesArray[i].speed = Math.max(1, (that.speedRandom ? Math.random() : 1) * that.speed);
            moveStraight(particlesArray[i], that.isStraight, that.direction);
        }
    }

    /**
     * 更新粒子数组
     *
     * @param {boolean} isMove      粒子移动开关
     * @param {boolean} isBounce    粒子反弹开关
     * @param {string}  moveOutMode 离屏模式
     */
    function updateParticlesArray(isMove, isBounce, moveOutMode) {
        for (var i = 0; i < particlesArray.length; i++) {
            moveParticles(particlesArray[i], isMove, particlesArray[i].speed);
            bounceParticles(i, isBounce);
            marginalCheck(particlesArray[i], moveOutMode);
        }
    }

    // Canvas绘制方法
    //-----------------------------------------------------------

    /**
     * 绘制多边形
     *
     * @param {!Object} context context      对象
     * @param {float}   startX               开始X坐标
     * @param {float}   startY               开始Y坐标
     * @param {float}   sideLength           边长
     * @param {int}     sideCountNumerator   边数分子
     * @param {int}     sideCountDenominator 边数分母
     */
    function drawShape(context, startX, startY, sideLength, sideCountNumerator, sideCountDenominator) {
        // By Programming Thomas - https://programmingthomas.wordpress.com/2013/04/03/n-sided-shapes/
        var sideCount = sideCountNumerator * sideCountDenominator;
        var decimalSides = sideCountNumerator / sideCountDenominator;
        var interiorAngleDegrees = (180 * (decimalSides - 2)) / decimalSides;
        var interiorAngle = Math.PI - Math.PI * interiorAngleDegrees / 180; // convert to radians
        context.translate(startX, startY);
        context.moveTo(0, 0);
        for (var i = 0; i < sideCount; i++) {
            context.lineTo(sideLength, 0);
            context.translate(sideLength, 0);
            context.rotate(interiorAngle);
        }
    }

    /**
     *  绘制粒子
     *
     * @param {!Object} particles 粒子对象
     */
    function drawParticles(particles) {
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
                context.rect(particles.x - particles.radius, particles.y - particles.radius, particles.radius * 2, particles.radius * 2);
                break;
            // 绘制三角形
            case 'triangle':
                drawShape(context, particles.x - particles.radius, particles.y + particles.radius / 1.66, particles.radius * 2, 3, 2);
                break;
            // 绘制星形
            case 'star':
                drawShape(
                    context,
                    particles.x - particles.radius * 2 / (5 / 4),      // startX
                    particles.y - particles.radius / (2 * 2.66 / 3.5), // startY
                    particles.radius * 2 * 2.66 / (5 / 3),             // sideLength
                    5,                                                 // sideCountNumerator
                    2                                                  // sideCountDenominator
                );
                break;
            // 绘制图片
            case 'image':
                if(currantCanvas.width > particles.radius * 10 || currantCanvas.height > particles.radius * 10) {
                    var scaling = 0.5;  // 缩放值
                    var width, height;  // 绘制宽度和高度
                    if (currantCanvas.width > currantCanvas.height) {
                        scaling = particles.radius * 10 / currantCanvas.width ;
                    } else {
                        scaling = particles.radius * 10 / currantCanvas.height;
                    }
                    width = currantCanvas.width * scaling;
                    height = currantCanvas.height * scaling;
                }
                context.drawImage(currantCanvas, particles.x, particles.y, width, height);
                break;
        }
        context.closePath();
        context.fill();  // 绘制粒子
        context.restore();
    }

    /**
     * 绘制粒子间连线
     *
     * @param {int}     index 粒子数组索引
     * @param {Function} that  方法Particles
     *  - that.linkDistance {boolean} 连接距离
     *  - that.linkWidth    {int}     连线宽度
     *  - that.linkColor    {string}  连线颜色
     *  - that.linkOpacity  {float}   连线不透明度
     */
    function drawLine(index, that) {
        for (var i = 0; i < particlesArray.length; i++) {
            // 跳过索引相同的粒子
            if (i === index) {
                continue;
            }
            var particles1 = particlesArray[index];
            var particles2 = particlesArray[i];
            // 获取对象粒子和当前粒子之间距离
            var dist = getDist(particles1.x, particles1.y, particles2.x, particles2.y);
            if (dist <= that.linkDistance) {
                var d = (that.linkDistance - dist) / that.linkDistance;
                context.save();
                context.lineWidth = d * that.linkWidth;
                context.strokeStyle = "rgba(" + that.linkColor + "," + Math.min(d, that.linkOpacity) + ")";
                context.beginPath();
                context.moveTo(particles1.x, particles1.y);
                context.lineTo(particles2.x, particles2.y);
                context.closePath();
                context.stroke();
                context.restore();
            }
        }
    }

    // 计时器方法
    //-----------------------------------------------------------

    /**
     * 开始粒子计时器
     *
     * @param {Function} that 方法Particles
     * - that.isMove      {boolean} 粒子移动开关
     * - that.isBounce    {boolean} 粒子反弹开关
     * - that.moveOutMode {string}  粒子离屏模式
     * - that.linkEnable  {boolean} 粒子连线开关
     */
    function runParticlesTimer(that) {
        // 开始绘制动画
        timer = requestAnimationFrame(function animal() {
            updateParticlesArray(that.isMove, that.isBounce, that.moveOutMode);
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            for (var i = 0; i < particlesArray.length; i++) {
                drawParticles(particlesArray[i]);
                if (that.linkEnable) {
                    drawLine(i, that);
                }
            }
            timer = requestAnimationFrame(animal);
        });
    }

    /** 停止粒子计时器 */
    function stopParticlesTimer() {
        if (timer) {
            cancelAnimationFrame(timer);
        }
    }

    //构造函数和公共方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     *  初始化Particles
     *
     * @param {!Object} el      被选中的节点
     * @param {Object}  options 参数对象
     */
    var Particles = function (el, options) {
        this.$el = $(el);

        // 全局属性
        this.number = options.number;              // 粒子数量
        this.opacity = options.opacity;            // 不透明度
        this.color = options.color;                // 粒子颜色
        this.shadowColor = options.shadowColor;    // 模糊颜色
        this.shadowBlur = options.shadowBlur;      // 模糊大小
        // 形状属性
        this.shapeType = options.shapeType;        // 粒子形状
        // 大小属性
        this.sizeValue = options.sizeValue;        // 粒子大小
        this.sizeRandom = options.sizeRandom;      // 随机大小
        // 连接属性
        this.linkEnable = options.linkEnable;      // 连接开关
        this.linkDistance = options.linkDistance;  // 连接距离
        this.linkWidth = options.linkWidth;        // 连线宽度
        this.linkColor = options.linkColor;        // 连接颜色
        this.linkOpacity = options.linkOpacity;    // 连线不透明度
        // 移动属性
        this.isMove = options.isMove;              // 移动开关
        this.speed = options.speed;                // 粒子速度
        this.speedRandom = options.speedRandom;    // 随机速度
        this.direction = options.direction;        // 粒子方向
        this.isStraight = options.isStraight;      // 笔直移动
        this.isBounce = options.isBounce;          // 粒子反弹
        this.moveOutMode = options.moveOutMode;    // 离屏模式

        // 创建并初始化canvas
        canvas = document.createElement('canvas');
        canvas.id = 'canvas-particles'; // canvas ID
        $(canvas).css({
            'position': 'absolute',
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
        currantCanvas.width = canvasWidth;
        currantCanvas.height = canvasHeight;
        currantContext = currantCanvas.getContext('2d');

        // 初始化Img属性
        img.id = 'particles-img';
        img.src = 'img/xiguaxiong.png';
        imgWidth = imgHeight = 500;
        this.particlesImage('');

        $(this.$el).append(canvas);  // 添加canvas

        initParticlesArray(this);  // 初始化粒子列表
        this.setupPointerEvents();

    };

    // 公共方法
    Particles.prototype = {

        /** 设置交互事件 */
        setupPointerEvents: function () {

            // 窗体改变事件
            $(window).on('resize', function() {
                // 改变宽度和高度
                canvasWidth =  window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                canvasHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            });

        },

        /** 清除Canvas内容 */
        clearCanvas: function () {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
        },

        /** 添加粒子 */
        addParticles: function (num) {
            addParticles(this, num);
        },

        /** 改变当前图片 */
        particlesImage: function (imgSrc) {
            if (imgSrc) {
                img.src = 'file:///' + imgSrc;
            } else {
                img.src = 'img/xiguaxiong.png';
            }
            // 绘制离屏Canvas
            img.onload = function () {
                if(img.width > imgWidth || img.height > imgHeight) {
                    var scaling = 0.5;  // 缩放值
                    if(img.width > img.height) {
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

        /** 开始粒子效果 */
        startParticles: function () {
            stopParticlesTimer();
            runParticlesTimer(this);
        },

        /** 停止粒子效果 */
        stopParticles: function () {
            stopParticlesTimer();
        },

        /**
         * 修改参数
         * @param {string} property 属性名
         * @param {*}      value    属性对应值
         */
        set: function (property, value) {
            switch (property) {
                case 'number':
                case 'linkEnable':
                case 'linkDistance':
                case 'linkWidth':
                case 'linkColor':
                case 'linkOpacity':
                case 'isMove':
                case 'isBounce':
                case 'moveOutMode':
                    this[property] = value;
                    break;
                case 'color':
                case 'opacity':
                case 'opacityRandom':
                case 'shadowColor':
                case 'shadowBlur':
                    this[property] = value;
                    setParticlesGlobalValue(this);
                    break;
                case 'shapeType':
                case 'sizeValue':
                case 'sizeRandom':
                    this[property] = value;
                    setParticlesSizeValue(this);
                    break;
                case 'speed':
                case 'speedRandom':
                case 'direction':
                case 'isStraight':
                    this[property] = value;
                    setParticlesMoveValue(this);
                    break;
            }
        }

    };

    // 默认参数
    Particles.DEFAULTS = {
        // 全局属性
        number: 100,                 // 粒子数量
        opacity: 0.75,               // 不透明度
        opacityRandom: false,        // 随机不透明度
        color: '255,255,255',        // 粒子颜色
        shadowColor: '255,255,255',  // 阴影颜色
        shadowBlur: 0,               // 模糊大小
        // 形状属性
        shapeType: 'circle',         // 粒子形状
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
        moveOutMode: 'out'           // 离屏模式
    };

    //定义Particles插件
    //--------------------------------------------------------------------------------------------------------------

    var old = $.fn.particles;

    $.fn.particles = function (option) {
        var args = (arguments.length > 1) ? Array.prototype.slice.call(arguments, 1) : undefined;

        return this.each(function () {
            var $this = $(this);
            var data = $this.data('particles');
            var options = $.extend({}, Particles.DEFAULTS, $this.data(), typeof option === 'object' && option);

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