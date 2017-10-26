/*!
 * jQuery time plugin v0.0.15
 * moment.js: http://momentjs.cn/
 * project:
 * - https://github.com/Alice-Jie/AudioVisualizer
 * - https://gitee.com/Alice_Jie/circleaudiovisualizer
 * - http://steamcommunity.com/sharedfiles/filedetails/?id=921617616
 * @license MIT licensed
 * @author Alice
 * @date 2017/10/25
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

    // 和风天气信息
    let heWeather = {
        basic: {
            city: '未知'           // 城市
        },
        weatherData: {
            weather: '未知',       // 天气情况
            temperature: '-1℃',   // 温度情况
            wind: '未知'           // 风向风力
        }
    };
    // 百度天气信息
    let baiduWeather = {
        basic: {
            city: '未知'           // 城市
        },
        weatherData: {
            weather: '未知',       // 天气情况
            temperature: '-1℃',   // 温度情况
            wind: '未知'           // 风向风力
        }
    };
    // 新浪天气信息
    let sinaWeather = {
        basic: {
            city: '未知'          // 城市
        },
        weatherData: {
            weather: '未知',      // 天气情况
            temperature: '-1℃',  // 温度情况
            wind: '未知'          // 风向风力
        }
    };

    let city = '';

    // 天气信息
    let weatherStr = '读取天气数据中...';

    let timer = null,         // 时间计时器
        weatherTimer = null;  // 天气计时器

    let milliSec = 1000;  // 重绘间隔(ms)

    let originalPos = [],
        targetPos = [];

    //私有方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     * 通过新浪获取IP信息
     *
     * @param {Function} callback 回调函数
     */
    function toSinaIP(callback) {
        $.ajax({
            url: 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json',
            type: 'GET',
            dataType: "json",
            success: function (result) {
                if (result.ret === 1) {
                    if (!city) {
                        // 若city为空则取IP所在城市
                        city = result.city;
                    }
                    (callback && typeof(callback) === "function") && callback();
                } else {
                    weatherStr = 'IP查询失败';
                    console.error(result.ret);
                }
            },
            error: function (XMLHttpRequest) {
                weatherStr = '错误' + XMLHttpRequest.status + ' ' + XMLHttpRequest.statusText;
            }
        });
    }

    /**
     * 通过百度获取IP信息
     *
     * @param {Function} callback 回调函数
     */
    function toBaiduIP(callback) {
        $.ajax({
            url: 'https://api.map.baidu.com/location/ip?ak=E909e759b4dcc019acf2b8d61abb80fa',
            type: 'GET',
            dataType: "jsonp",
            success: function (result) {
                if (result.status === 0) {
                    if (!city) {
                        // 返回 city + 市 （#-_-)┯━┯ (╯°口°)╯(┴—┴
                        // city = result.address_detail.city;
                        (callback && typeof(callback) === "function") && callback();
                    }
                } else {
                    weatherStr = 'IP查询失败';
                    console.error(result.status);
                }
            },
            error: function (XMLHttpRequest) {
                weatherStr = '错误' + XMLHttpRequest.status + ' ' + XMLHttpRequest.statusText;
            }
        });
    }

    /**
     * 生成weatherStr信息
     * 根据天气API提供者设置weatherStr信息
     *
     * @param {string} provider API提供者
     * @return {string} 天气信息字符串
     */
    function setWeatherStr(provider) {
        // 写入weatherStr
        switch (provider) {
            // 和风天气
            case 'heWeather':
                return heWeather.basic.city
                    + ' ' + heWeather.weatherData.weather
                    + ' ' + heWeather.weatherData.temperature
                    + ' ' + heWeather.weatherData.wind;
            // 百度天气
            case 'baidu':
                // RegExp (\([^\)]+\))
                return baiduWeather.basic.city
                    + ' ' + baiduWeather.weatherData.weather
                    + ' ' + baiduWeather.weatherData.temperature
                    + ' ' + baiduWeather.weatherData.wind;
            // 新浪天气
            case 'sina':
                return sinaWeather.basic.city
                    + ' ' + sinaWeather.weatherData.weather
                    + ' ' + sinaWeather.weatherData.temperature
                    + ' ' + sinaWeather.weatherData.wind;
            default:
                weatherStr = '读取天气数据中...';
        }
    }

    /**
     * 获取和风天气信息
     * @param {string}   city     城市(China)
     * @param {Function} callback 回调函数
     */
    function getHeWeather(city, callback) {
        $.ajax({
            dataType: 'json',
            type: 'GET',
            url: 'https://free-api.heweather.com/v5/now?city=' + city + '&key=71f9989659254be9a991375a04511d54',
            success: (result)=> {
                // 获取接口状态
                if (result.HeWeather5[0].status === 'ok') {
                    // 获取天气信息
                    heWeather.basic.cnty = result.HeWeather5[0].basic.cnty;
                    heWeather.basic.city = result.HeWeather5[0].basic.city;
                    heWeather.weatherData.weather = result.HeWeather5[0].now.cond.txt;
                    heWeather.weatherData.temperature = result.HeWeather5[0].now.tmp + '℃';
                    heWeather.weatherData.wind = result.HeWeather5[0].now.wind.dir + ' ' + result.HeWeather5[0].now.wind.sc + '级';
                    (callback && typeof(callback) === "function") && callback();
                } else {
                    weatherStr = '天气接口异常';
                    console.error(result.HeWeather5[0].status);
                }
            },
            error: function (XMLHttpRequest) {
                if (XMLHttpRequest.status === 412) {
                    weatherStr = '错误' + XMLHttpRequest.status + '本日和风天气访问次数达到上限';
                } else {
                    weatherStr = '错误' + XMLHttpRequest.status + ' ' + XMLHttpRequest.statusText;
                }
            }
        });
    }

    /**
     * 获取百度天气信息
     * @param {string} city     城市(China)
     * @param {Function} callback 回调函数
     */
    function getBaiduWeather(city, callback) {
        $.ajax({
            dataType: 'jsonp',
            type: 'GET',
            url: 'http://api.map.baidu.com/telematics/v3/weather?location=' + city + '&output=json&ak=E909e759b4dcc019acf2b8d61abb80fa',
            success: (result)=> {
                // 获取接口状态
                if (result.status === 'success') {
                    // 获取天气信息
                    baiduWeather.basic.city = result.results[0].currentCity;
                    baiduWeather.weatherData.date = result.results[0].weather_data[0].date;
                    baiduWeather.weatherData.weather = result.results[0].weather_data[0].weather;
                    baiduWeather.weatherData.temperature = result.results[0].weather_data[0].temperature;
                    baiduWeather.weatherData.wind = result.results[0].weather_data[0].wind;
                    (callback && typeof(callback) === "function") && callback();
                } else {
                    weatherStr = '天气接口异常';
                    console.error(result.status);
                }
            },
            error: function (XMLHttpRequest) {
                if (XMLHttpRequest.status === 412) {
                    weatherStr = '错误' + XMLHttpRequest.status + '本日百度天气访问次数达到上限';
                } else {
                    weatherStr = '错误' + XMLHttpRequest.status + ' ' + XMLHttpRequest.statusText;
                }
            }
        });
    }

    /**
     * 获取新浪天气信息
     * @param {string} city     城市(China)
     * @param {Function} callback 回调函数
     */
    function getSinaWeather(city, callback) {
        $.ajax({
            dataType: 'script',
            scriptCharset: 'gbk',
            url: 'http://php.weather.sina.com.cn/iframe/index/w_cl.php?code=js&city=' + city + '&day=' + 0,
            success: ()=> {
                // 获取天气信息
                try {
                    let weather = window.SWther.w[city][0];
                    sinaWeather.basic.city = city;
                    sinaWeather.weatherData.weather = weather.s1;
                    sinaWeather.weatherData.temperature = weather.t1 + '℃～' + weather.t2 + '℃';
                    sinaWeather.weatherData.wind = weather.d1 + weather.p1 + '级';
                    (callback && typeof(callback) === "function") && callback();
                } catch (e) {
                    weatherStr = '非法城市地址';
                    console.error(e.message);
                }
            },
            error: function (XMLHttpRequest) {
                weatherStr = '错误' + XMLHttpRequest.status + ' ' + XMLHttpRequest.statusText;
            }
        });
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
     * @class Time
     *
     * @param {!Object} el      被选中的节点
     * @param {Object}  options 参数对象
     */
    let Time = function (el, options) {
        this.$el = $(el);

        // 日期参数
        this.isDate = options.isDate;                    // 是否显示日期
        this.isStroke = options.isStroke;                // 是否描边
        this.lineWidth = options.lineWidth;              // 描边宽度
        this.isFill = options.isFill;                    // 是否填充
        // 颜色参数
        this.colorMode = options.colorMode;              // 颜色模式
        this.color = options.color;                      // 颜色
        this.shadowColor = options.shadowColor;          // 阴影颜色
        this.shadowBlur = options.shadowBlur;            // 模糊大小
        this.shadowOverlay = options.shadowOverlay;      // 显示阴影
        this.isRandomColor = options.isRandomColor;      // 随机颜色开关
        this.firstColor = options.firstColor;            // 起始颜色
        this.secondColor = options.secondColor;          // 最终颜色
        this.isChangeBlur = options.isChangeBlur;        // 模糊变换开关
        // 基础参数
        this.opacity = options.opacity;                  // 不透明度
        this.language = options.language;                // 日期语言
        this.timeStyle = options.timeStyle;              // 时间显示风格
        this.dateStyle = options.dateStyle;              // 日期显示风格
        this.isFormat = options.isFormat;                // 是否格式化
        this.userTimeStyle = options.userTimeStyle;      // 自定义时间显示风格
        this.userDateStyle = options.userDateStyle;      // 自定义日期显示风格
        this.fontFamily = options.fontFamily;            // 字体样式
        this.timeFontSize = options.timeFontSize;        // 时间字体大小
        this.dateFontSize = options.dateFontSize;        // 日期字体大小
        this.distance = options.distance;                // 时间和日期之间距离
        // 天气参数
        this.weatherProvider = options.weatherProvider;  // 天气API提供者
        this.currentCity = options.currentCity;          // 天气信息
        // 坐标参数
        this.offsetX = options.offsetX;                  // X坐标偏移
        this.offsetY = options.offsetY;                  // Y坐标偏移
        this.isClickOffset = options.isClickOffset;      // 鼠标坐标偏移
        // 变换参数
        this.isMasking = options.isMasking;              // 蒙版开关
        this.maskOpacity = options.maskOpacity;          // 蒙版不透明度
        this.width = options.width;                      // 平面宽度(%)
        this.height = options.height;                    // 平面高度(%)
        this.perspective = options.perspective;          // 透视效果
        this.transformMode = options.transformMode;      // 变换模式
        this.translateX = options.translateX;            // X轴变换
        this.translateY = options.translateY;            // Y轴变换
        this.skewX = options.skewX;                      // X轴倾斜转换
        this.skewY = options.skewY;                      // Y轴倾斜转换
        this.rotateX = options.rotateX;                  // X轴3D旋转
        this.rotateY = options.rotateY;                  // Y轴3D旋转
        this.rotateZ = options.rotateZ;                  // Z轴3D旋转
        this.isRotate3D = options.isRotate3D;            // 是否3D旋转
        this.degSize = options.degSize;                  // 角度大小
        this.topLeftX = options.topLeftX;                // 左上角X(%)
        this.topLeftY = options.topLeftY;                // 左上角Y(%)
        this.topRightX = options.topRightX;              // 右上角X(%)
        this.topRightY = options.topRightY;              // 右上角Y(%)
        this.bottomRightX = options.bottomRightX;        // 右下角X(%)
        this.bottomRightY = options.bottomRightY;        // 右下角Y(%)
        this.bottomLeftX = options.bottomLeftX;          // 左下角X(%)
        this.bottomLeftY = options.bottomLeftY;          // 左下角Y(%)

        // 创建并初始化canvas
        canvas = document.createElement('canvas');
        canvas.id = 'canvas-date'; // canvas ID
        $(canvas).css({
            'position': 'fixed',
            'left': 0,
            'right': 0,
            'top': 0,
            'bottom': 0,
            'width': '100%',
            'height': '100%',
            'z-index': 5,
            'opacity': this.opacity,
            'transform': 'none'
        });  // canvas CSS
        canvasWidth = canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        canvasHeight = canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        // 获取原点
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
        context.fillStyle = 'rgb(' + this.color + ')';
        // 线条属性
        context.lineWidth = this.lineWidth;
        context.strokeStyle = 'rgb(' + this.color + ')';
        // 阴影属性
        context.shadowColor = 'rgb(' + this.shadowColor + ')';
        context.shadowBlur = this.shadowBlur;
        // 文字属性
        context.font = this.timeFontSize + 'px ' + this.fontFamily;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        // 颜色对象
        setColorObj(color1, this.firstColor);
        setColorObj(color2, this.secondColor);

        $(this.$el).append(canvas);  // 添加canvas

        // 默认开启
        this.setupPointerEvents();
        this.runDateTimer();
    };

    // 默认参数
    Time.DEFAULTS = {
        // 日期参数
        isDate: true,                   // 是否显示日期
        isStroke: false,                // 是否描边
        lineWidth: 1,                   // 描边宽度
        isFill: true,                   // 是否填充
        // 颜色模式
        color: '255,255,255',           // 颜色
        colorMode: 'monochrome',        // 颜色模式
        shadowColor: '255,255,255',     // 阴影颜色
        shadowBlur: 15,                 // 模糊大小
        shadowOverlay: false,           // 显示阴影
        isRandomColor: true,            // 随机颜色变换
        firstColor: '255,255,255',      // 起始颜色
        secondColor: '255,0,0',         // 最终颜色
        isChangeBlur: false,            // 模糊颜色变换开关
        // 基础参数
        opacity: 0.90,                  // 不透明度
        language: 'zh_cn',              // 日期语言
        timeStyle: 'hh:mm:ss a',        // 时间显示风格
        dateStyle: 'LL dddd',           // 日期显示风格
        isFormat: true,                 // 是否格式化
        userTimeStyle: '',              // 自定义时间显示风格
        userDateStyle: '',              // 自定义日期显示风格
        fontFamily: 'Microsoft YaHei',  // 字体样式
        timeFontSize: 60,               // 时间字体大小
        dateFontSize: 30,               // 日期字体大小
        distance: 0,                    // 时间与日期之间距离
        // 天气参数
        weatherProvider: 'sina',        // 天气API提供者
        currentCity: '',                // 当前城市
        // 坐标参数
        offsetX: 0.5,                   // X坐标偏移
        offsetY: 0.5,                   // Y坐标偏移
        isClickOffset: false,           // 鼠标坐标偏移
        // 变换参数
        isMasking: false,               // 显示蒙版
        maskOpacity: 0.25,              // 蒙版不透明度
        width: 1.00,                    // 平面宽度(%)
        height: 1.00,                   // 平面高度(%)
        perspective: 0,                 // 透视效果
        transformMode: 'value',         // 变换模式
        translateX: 100,                // X轴变换(%)
        translateY: 100,                // Y轴变换(%)
        skewX: 0,                       // X轴倾斜转换
        skewY: 0,                       // Y轴倾斜转换
        rotateX: 0,                     // X轴3D旋转
        rotateY: 0,                     // Y轴3D旋转
        rotateZ: 0,                     // Z轴3D旋转
        isRotate3D: false,              // 是否3D旋转
        degSize: 50,                    // 角度大小
        topLeftX: 0,                    // 左上角X(%)
        topLeftY: 0,                    // 左上角Y(%)
        topRightX: 0,                   // 右上角X(%)
        topRightY: 0,                   // 右上角Y(%)
        bottomRightX: 0,                // 右下角X(%)
        bottomRightY: 0,                // 右下角Y(%)
        bottomLeftX: 0,                 // 左下角X(%)
        bottomLeftY: 0                  // 左下角Y(%)
    };

    // 公共方法
    Time.prototype = {

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
                'transform': perspective + 'rotate3d(' + -mouseY + ',' + mouseX + ',0,' + deg + 'deg)'
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
         * 时间格式说明：
         * YYYY：年 MMM：月(非数字) MM：月(数字) Do：日(非数字) DD：日(数字)
         * HH：小时(二十四小时制) hh：小时(十二小时制) mm：分钟 ss：秒
         * a：时间段 dddd：星期
         */

        /**
         * 获取当前时间信息
         * 格式化效果详见：http://momentjs.cn/docs/#/displaying/
         * @private
         *
         * @param  {string} formatStr 时间格式字符串
         * @return {string} 时间字符串
         */
        getFormatStr: function (formatStr) {
            switch (formatStr) {
                case 'hh:mm:ss':
                case 'HH:mm:ss':
                case 'hh:mm':
                case 'HH:mm':
                case 'LL':
                case 'LL dddd':
                case 'MM - DD dddd':
                case 'MM - DD':
                case 'MMM Do dddd':
                case 'MMM Do':
                case '[Days] DDDD':
                    return moment().format(formatStr);
                case 'hh:mm:ss a':
                case 'HH:mm:ss a':
                case 'hh:mm a':
                case 'HH:mm a':
                    return moment().format(formatStr).toUpperCase();
                case 'weather':
                    return weatherStr;
                default:
                    return this.isFormat ? moment().format(formatStr).toUpperCase() : formatStr;
            }
        },


        /**
         * 获取天气信息
         * - 目前支持访问和风天气、百度天气、新浪天气
         * - 访问成功后将天气信息写入对应天气对象
         * @private
         *
         * @param {string} city     城市(China)
         */
        getWeather: function (city) {
            switch (this.weatherProvider) {
                // 和风天气接口
                case 'heWeather':
                    getHeWeather(city, ()=> {
                        weatherStr = setWeatherStr(this.weatherProvider);
                    });
                    break;
                // 百度天气接口
                case 'baidu':
                    getBaiduWeather(city, ()=> {
                        weatherStr = setWeatherStr(this.weatherProvider);
                    });
                    break;
                // 新浪天气接口
                case 'sina':
                    getSinaWeather(city, ()=> {
                        weatherStr = setWeatherStr(this.weatherProvider);
                    });
                    break;
                default:
                    weatherStr = '读取天气数据中...';
            }
        },


        /**
         * 时间日期颜色变换
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
         * 设置交互事件
         * @private
         */
        setupPointerEvents: function () {

            let that = this;

            // 鼠标移动事件
            $(this.$el).on('mousemove', function (e) {
                if (that.transformMode === 'value' && that.isRotate3D) {
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
                that.drawDate();
            });

        },

        // 面向外部方法
        //-----------------------------------------------------------

        /** 清除Canvas内容 */
        clearCanvas: function () {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
        },

        /** 更新时间日期信息 */
        updateDate: function () {
            // 更新原点坐标
            originX = canvasWidth * this.offsetX;
            originY = canvasHeight * this.offsetY;
            // 更新时间日期颜色
            if (this.colorMode === 'colorTransformation') {
                this.colorTransformation();
            }
        },

        /** 绘制时间 */
        drawDate: function () {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            // 更新时间和日期
            if (this.isDate) {

                context.save();

                if (!this.shadowOverlay) {
                    context.globalCompositeOperation = 'lighter';
                }
                // 设置时间属性并绘制
                context.font = this.timeFontSize + 'px ' + this.fontFamily;
                if (this.isStroke) {
                    context.strokeText(
                        this.getFormatStr(this.userTimeStyle || this.timeStyle),
                        originX,
                        originY - this.timeFontSize / 2 - this.distance
                    );
                }
                if (this.isFill) {
                    context.fillText(
                        this.getFormatStr(this.userTimeStyle || this.timeStyle),
                        originX,
                        originY - this.timeFontSize / 2 - this.distance
                    );
                }
                // 设置日期属性并绘制
                context.font = this.dateFontSize + 'px ' + this.fontFamily;
                if (this.isStroke) {
                    context.strokeText(
                        this.getFormatStr(this.userDateStyle || this.dateStyle),
                        originX,
                        originY + this.dateFontSize / 2 + this.distance
                    );
                }
                if (this.isFill) {
                    context.fillText(
                        this.getFormatStr(this.userDateStyle || this.dateStyle),
                        originX,
                        originY + this.dateFontSize / 2 + this.distance
                    );
                }

                // 蒙版效果
                if (this.isMasking) {
                    context.fillStyle = 'rgba(255, 0, 0, ' + this.maskOpacity + ')';
                    context.fillRect(0, 0, canvasWidth, canvasHeight);
                }

                context.restore();
            }
        },

        /** 更新日期信息并绘制时间 */
        drawCanvas: function () {
            this.updateDate();
            this.drawDate();
        },


        /** 停止时间计时器 */
        stopDateTimer: function () {
            if (timer) {
                clearInterval(timer);
            }
        },

        /** 开始时间计时器 */
        runDateTimer: function () {
            this.stopDateTimer();
            timer = setInterval(
                ()=> {
                    //this.updateDate();
                    this.drawDate();
                }, milliSec);
        },


        /** 更新天气 */
        updateWeather: function () {
            city = this.currentCity;
            toSinaIP(()=> {
                this.getWeather(city);
            });
        },

        /** 停止天气计时器 */
        stopWeatherTimer: function () {
            if (weatherTimer) {
                clearInterval(weatherTimer);
            }
        },

        /** 开始天气计时器 */
        runWeatherTimer: function () {
            this.stopWeatherTimer();
            // this.updateWeather();  立即更新天气
            weatherTimer = setInterval(
                ()=> {
                    this.updateWeather();
                }, 3600000);  // 每隔1个小时更新一次天气
        },


        /** 移除canvas */
        destroy: function () {
            this.$el
                .off('#canvas-date')
                .removeData('time');
            $('#canvas-date').remove();
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
                case 'color':
                    this.color = value;
                    context.fillStyle = 'rgb(' + this.color + ')';
                    context.strokeStyle = 'rgb(' + this.color + ')';
                    this.drawDate();
                    break;
                case 'lineWidth':
                    this.lineWidth = value;
                    context.lineWidth = this.lineWidth;
                    break;
                case 'shadowColor':
                    this.shadowColor = value;
                    context.shadowColor = 'rgb(' + this.shadowColor + ')';
                    this.drawDate();
                    break;
                case 'shadowBlur':
                    this.shadowBlur = value;
                    context.shadowBlur = this.shadowBlur;
                    this.drawDate();
                    break;
                case 'width':
                    this.width = value;
                    $(canvas).css({
                        'width': this.width + '%',
                        'left': 50 - this.width / 2 + '%',
                        'right': 50 - this.width / 2 + '%'
                    });
                    break;
                case 'height':
                    this.height = value;
                    $(canvas).css({
                        'height': this.height + '%',
                        'top': 50 - this.height / 2 + '%',
                        'bottom': 50 - this.height / 2 + '%'
                    });
                    break;
                case 'language':
                    moment.locale(value);
                    this.drawDate();
                    break;
                case 'isRandomColor':
                case 'isChangeBlur':
                case 'isClickOffset':
                case 'degSize':
                    this[property] = value;
                    break;
                case 'colorMode':
                    this.colorMode = value;
                    this.colorMode === 'colorTransformation' ? milliSec = 30 : milliSec = 1000;
                    this.runDateTimer();
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
                case 'weatherProvider':
                case 'currentCity':
                    this[property] = value;
                    this.updateWeather();
                    break;
                case 'shadowOverlay':
                case 'isMasking':
                case 'maskOpacity':
                case 'isDate':
                case 'isFormat':
                case 'timeStyle':
                case 'dateStyle':
                case 'userTimeStyle':
                case 'userDateStyle':
                case 'fontFamily':
                case 'timeFontSize':
                case 'dateFontSize':
                case 'distance':
                case 'isStroke':
                case 'isFill':
                    this[property] = value;
                    this.drawDate();
                    break;
                case 'offsetX':
                case 'offsetY':
                    this[property] = value;
                    this.drawCanvas();
                    break;
                case 'transformMode':
                case 'perspective':
                case 'translateX':
                case 'translateY':
                case 'skewX':
                case 'skewY':
                case 'rotateX':
                case 'rotateY':
                case 'rotateZ':
                case 'isRotate3D':
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
                // no default
            }
        }

    };

    // 定义Time插件
    //--------------------------------------------------------------------------------------------------------------

    let old = $.fn.time;

    $.fn.time = function (option) {
        let args = (arguments.length > 1) ? Array.prototype.slice.call(arguments, 1) : undefined;

        return this.each(function () {
            let $this = $(this);
            let data = $this.data('time');
            let options = $.extend({}, Time.DEFAULTS, $this.data(), typeof option === 'object' && option);

            if (!data && typeof option === 'string') {
                return;
            }
            if (!data) {
                $this.data('time', (data = new Time(this, options)));
            }
            else if (typeof option === 'string') {
                Time.prototype[option].apply(data, args);
            }
        });
    };

    $.fn.time.Constructor = Time;

    // 确保插件不冲突
    $.fn.time.noConflict = function () {
        $.fn.time = old;
        return this;
    };

});