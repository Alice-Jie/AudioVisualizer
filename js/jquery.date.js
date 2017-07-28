/*!
 * jQuery date plugin v0.0.8
 * moment.js: http://momentjs.cn/
 * project:
 * - https://github.com/Alice-Jie/4K-Circle-Audio-Visualizer
 * - https://git.oschina.net/Alice_Jie/circleaudiovisualizer
 * - http://steamcommunity.com/sharedfiles/filedetails/?id=921617616
 * @license MIT licensed
 * @author Alice
 * @date 2017/07/26
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

    // 和风天气信息
    let heWeather = {
        basic: {
            cnty: '中国',                       // 国家
            city: '北京'                        // 城市
        },
        weather_data: {
            weather: '阴',                      // 天气情况
            temperature: '15℃',                // 温度情况
            wind: {
                deg: '40',                      // 风向（360度）
                dir: '东北风',                  // 风向
                sc: '4-5',                      // 风力
                spd: '24'                       // 风速（kmph）
            }
        }
    };
    // 百度天气信息
    let baiduWeather = {
        basic: {
            city: '北京',                       // 城市
            pm25: '144'                         // PM25
        },
        weather_data: {
            date: "周六 03月05日 (实时：12℃)",  // 星期-日期-温度
            weather: "浮尘转晴",                // 天气情况
            temperature: "12-1℃",             // 温度情况
            wind: "北风4-5级"                   // 风向风力
        }
    };
    // 新浪天气信息
    let sinaWeather = {
        basic: {
            city: '桂林'                         // 城市
        },
        weather_data: {
            weather: "阵风",                     // 天气情况
            temperature: "30℃～25℃",           // 温度情况
            wind: "南风≤3级"                     // 风向风力
        }
    };
    let weatherStr = '读取天气数据中...';  // 天气信息

    let timer = null,         // 时间计时器
        weatherTimer = null;  // 天气计时器

    let milliSec = 1000;  // 重绘间隔（ms）

    //私有方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     * 时间格式说明：
     * YYYY：年 MMM：月（非数字） MM：月（数字） Do：日（非数字） DD：日（数字）
     * HH：小时(二十四小时制) hh：小时(十二小时制) mm：分钟 ss：秒
     * a：时间段 dddd：星期
     */

    /**
     * 获取当前时间信息
     * 格式化效果详见：http://momentjs.cn/docs/#/displaying/
     *
     * @param  {string} timeStyle 时间格式字符串
     * @return {string} 时间字符串
     */
    function getTime(timeStyle) {
        switch (timeStyle) {
            case 'hh:mm:ss a':
            case 'hh:mm:ss':
            case 'HH:mm:ss a':
            case 'HH:mm:ss':
            case 'hh:mm a':
            case 'hh:mm':
            case 'HH:mm a':
            case 'HH:mm':
                return moment().format(timeStyle).toUpperCase();
            default:
                return moment().format('hh:mm:ss a').toUpperCase();
        }
    }

    /**
     * 获取当前日期信息
     * 格式化效果详见：http://momentjs.cn/docs/#/displaying/
     *
     * @param  {int} dateStyle  日期格式字符串
     * @return {string} 日期字符串
     */
    function getDate(dateStyle) {
        switch (dateStyle) {
            case 'LL':
            case 'LL dddd':
            case 'MM - DD dddd':
            case 'MM - DD':
            case 'MMM Do dddd':
            case 'MMM Do':
            case '[Days] DDDD':
                return moment().format(dateStyle);
            case 'weather':
                return weatherStr;
            default:
                return moment().format('LL dddd');
        }
    }


    /**
     * 生成weatherStr信息
     * 根据天气API提供者设置weatherStr信息
     *
     * @param {string} provider API提供者
     */
    function setWeatherStr(provider) {
        // 写入weatherStr
        switch (provider) {
            // 和风天气
            case 'heWeather':
                weatherStr = heWeather.basic.city
                    + ' ' + heWeather.weather_data.weather
                    + ' ' + heWeather.weather_data.temperature
                    + ' ' + heWeather.weather_data.wind.dir
                    + ' ' + heWeather.weather_data.wind.sc;
                break;
            // 百度天气
            case 'baidu':
                // RegExp (\([^\)]+\))
                weatherStr = baiduWeather.basic.city
                    + ' ' + baiduWeather.weather_data.weather
                    + ' ' + baiduWeather.weather_data.temperature
                    + ' ' + baiduWeather.weather_data.wind;
                break;
            // 新浪天气
            case 'sina':
                weatherStr = sinaWeather.basic.city
                    + ' ' + sinaWeather.weather_data.weather
                    + ' ' + sinaWeather.weather_data.temperature
                    + ' ' + sinaWeather.weather_data.wind;
                break;
            default:
                weatherStr = '读取天气数据中...';
        }
    }

    /**
     * 获取天气信息
     * - 目前支持访问和风天气、百度天气、新浪天气
     * - 访问成功后将天气信息写入对应天气对象
     *
     * @param {string} provider API提供者
     * @param {string} city     城市（China）
     */
    function getWeather(provider, city) {
        switch (provider) {
            // 和风天气接口
            case 'heWeather':
                $.ajax({
                    dataType: "json",
                    type: "GET",
                    url: 'https://free-api.heweather.com/v5/now?city=' + city + '&key=71f9989659254be9a991375a04511d54',
                    success: function (result) {
                        // 获取接口状态
                        if (result.HeWeather5[0].status === 'ok') {
                            // 获取天气信息
                            heWeather.basic.cnty = result.HeWeather5[0].basic.cnty;
                            heWeather.basic.city = result.HeWeather5[0].basic.city;
                            heWeather.weather_data.weather = result.HeWeather5[0].now.cond.txt;
                            heWeather.weather_data.temperature = result.HeWeather5[0].now.tmp + "℃";
                            heWeather.weather_data.wind.deg = result.HeWeather5[0].now.wind.deg;
                            heWeather.weather_data.wind.dir = result.HeWeather5[0].now.wind.dir;
                            heWeather.weather_data.wind.sc = result.HeWeather5[0].now.wind.sc + '级';
                            heWeather.weather_data.wind.spd = result.HeWeather5[0].now.wind.spd;
                            setWeatherStr(provider);  // 写入weatherStr
                        } else {
                            weatherStr = '天气接口异常 ' + result.HeWeather5[0].status;
                        }
                    },
                    error: function (XMLHttpRequest) {
                        if (XMLHttpRequest.status === 401) {
                            weatherStr = '错误' + XMLHttpRequest.status + XMLHttpRequest.statusText;
                        } else if (XMLHttpRequest.status === 412) {
                            weatherStr = '错误' + XMLHttpRequest.status + '本日和风天气访问次数达到上限';
                        } else {
                            weatherStr = '错误' + XMLHttpRequest.status + " " + XMLHttpRequest.statusText;
                        }
                    }
                });
                break;
            // 百度天气接口
            case 'baidu':
                $.ajax({
                    dataType: "jsonp",
                    type: "GET",
                    url: 'http://api.map.baidu.com/telematics/v3/weather?location=' + city + '&output=json&ak=E909e759b4dcc019acf2b8d61abb80fa',
                    success: function (result) {
                        // 获取接口状态
                        if (result.status === 'success') {
                            // 获取天气信息
                            baiduWeather.basic.city = result.results[0].currentCity;
                            baiduWeather.basic.pm25 = result.results[0].pm25;
                            baiduWeather.weather_data.date = result.results[0].weather_data[0].date;
                            baiduWeather.weather_data.weather = result.results[0].weather_data[0].weather;
                            baiduWeather.weather_data.wind = result.results[0].weather_data[0].wind;
                            baiduWeather.weather_data.temperature = result.results[0].weather_data[0].temperature;
                            setWeatherStr(provider);  // 写入weatherStr
                        } else {
                            weatherStr = '天气接口异常 ' + result.HeWeather5[0].status;
                        }
                    },
                    error: function (XMLHttpRequest) {
                        if (XMLHttpRequest.status === 401) {
                            weatherStr = '错误' + XMLHttpRequest.status + XMLHttpRequest.statusText;
                        } else if (XMLHttpRequest.status === 412) {
                            weatherStr = '错误' + XMLHttpRequest.status + '本日百度天气访问次数达到上限';
                        } else {
                            weatherStr = '错误' + XMLHttpRequest.status + " " + XMLHttpRequest.statusText;
                        }
                    }
                });
                break;
            // 新浪天气接口
            case 'sina':
                $.ajax({
                    dataType: "script",
                    scriptCharset: "gbk",
                    url: "http://php.weather.sina.com.cn/iframe/index/w_cl.php?code=js&city=" + city + "&day=0&dfc=3",
                    success: function () {
                        let weather = window.SWther.w[city][0];
                        sinaWeather.basic.city = city;
                        sinaWeather.weather_data.weather = weather.s1;
                        sinaWeather.weather_data.temperature = weather.t1 + "℃～" + weather.t2 + "℃";
                        sinaWeather.weather_data.wind = weather.d1 + weather.p1 + "级";
                        setWeatherStr(provider);  // 写入weatherStr
                    },
                    error: function (XMLHttpRequest) {
                        weatherStr = '错误' + XMLHttpRequest.status + " " + XMLHttpRequest.statusText;
                    }
                });
                break;
            default:
                weatherStr = '读取天气数据中...';
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

    //构造函数和公共方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     *  初始化Date
     *
     * @param {!Object} el      被选中的节点
     * @param {Object}  options 参数对象
     */
    let Date = function (el, options) {
        this.$el = $(el);

        // 全局参数
        this.opacity = options.opacity;                  // 不透明度
        this.colorMode = options.colorMode;              // 颜色模式
        this.color = options.color;                      // 颜色
        this.shadowColor = options.shadowColor;          // 阴影颜色
        this.shadowBlur = options.shadowBlur;            // 模糊大小
        this.isRandomColor = options.isRandomColor;      // 随机颜色开关
        this.firstColor = options.firstColor;            // 起始颜色
        this.secondColor = options.secondColor;          // 最终颜色
        this.isChangeBlur = options.isChangeBlur;        // 模糊变换开关
        // 坐标参数
        this.offsetX = options.offsetX;                  // X坐标偏移
        this.offsetY = options.offsetY;                  // Y坐标偏移
        this.isClickOffset = options.isClickOffset;      // 鼠标坐标偏移
        // 日期参数
        this.isDate = options.isDate;                    // 是否显示日期
        this.timeStyle = options.timeStyle;              // 时间显示风格
        this.dateStyle = options.dateStyle;              // 日期显示风格
        this.timeFontSize = options.timeFontSize;        // 字体大小
        this.dateFontSize = options.dateFontSize;        // 字体大小
        this.distance = options.distance;                // 时间和日期之间距离
        this.language = options.language;                // 日期语言
        // 天气参数
        this.weatherProvider = options.weatherProvider;  // 天气API提供者
        this.currentCity = options.currentCity;          // 天气信息

        // 创建并初始化canvas
        canvas = document.createElement('canvas');
        canvas.id = 'canvas-date'; // canvas ID
        $(canvas).css({
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'z-index': 4,
            'opacity': this.opacity
        });  // canvas CSS
        canvasWidth = canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        canvasHeight = canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        // 获取最小宽度以及原点
        minLength = Math.min(canvasWidth, canvasHeight);
        originX = canvasWidth * this.offsetX;
        originY = canvasHeight * this.offsetY;

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
        context.font = this.timeFontSize + 'px 微软雅黑';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        // 颜色对象
        setColorObj(color1, this.firstColor);
        setColorObj(color2, this.secondColor);

        $(this.$el).append(canvas);  // 添加canvas

        moment.lang('zh-cn');  // 默认日期语言为中文

        // 默认开启
        this.setupPointerEvents();
        this.runDateTimer();
    };

    // 默认参数
    Date.DEFAULTS = {
        // 全局参数
        opacity: 0.90,                 // 不透明度
        color: '255,255,255',          // 颜色
        colorMode: 'monochrome',       // 颜色模式
        shadowColor: '255,255,255',    // 阴影颜色
        shadowBlur: 15,                // 模糊大小
        isRandomColor: true,           // 随机颜色变换
        firstColor: '255,255,255',     // 起始颜色
        secondColor: '255,0,0',        // 最终颜色
        isChangeBlur: false,           // 模糊颜色变换开关
        // 坐标参数
        offsetX: 0.5,                  // X坐标偏移
        offsetY: 0.5,                  // Y坐标偏移
        isClickOffset: false,          // 鼠标坐标偏移
        // 日期参数
        isDate: true,                  // 是否显示日期
        timeStyle: 'hh:mm:ss a',       // 时间显示风格
        dateStyle: 'LL dddd',          // 日期显示风格
        timeFontSize: 60,              // 时间字体大小
        dateFontSize: 30,              // 日期字体大小
        distance: 0,                   // 时间与日期之间距离
        language: 'zh_cn',             // 日期语言
        // 天气参数
        weatherProvider: 'sina',       // 天气API提供者
        currentCity: ''                // 当前城市
    };

    // 公共方法
    Date.prototype = {

        // 面向内部方法
        //-----------------------------------------------------------

        /** 时间日期颜色变换 */
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
                    that.drawCanvas();
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
                context.font = this.timeFontSize + 'px 微软雅黑';
                context.fillText(getTime(this.timeStyle), originX, originY - this.timeFontSize / 2 - this.distance);
                context.font = this.dateFontSize + 'px 微软雅黑';
                context.fillText(getDate(this.dateStyle), originX, originY + this.dateFontSize / 2 + this.distance);
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
            if (!this.currentCity) {
                // 根据IP获取城市
                let cityUrl = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js';  // 获取IP
                $.getScript(cityUrl, ()=> {
                    let currentCity = remote_ip_info.city;  // 获取城市
                    getWeather(this.weatherProvider, currentCity);
                });
            } else {
                getWeather(this.weatherProvider, this.currentCity);
            }
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
                .removeData('date');
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
                    $(canvas).css('opacity', value);
                    break;
                case 'color':
                    context.fillStyle = 'rgb(' + value + ')';
                    context.strokeStyle = 'rgb(' + value + ')';
                    this.drawDate();
                    break;
                case 'shadowColor':
                    context.shadowColor = 'rgb(' + value + ')';
                    this.drawDate();
                    break;
                case 'shadowBlur':
                    context.shadowBlur = value;
                    this.drawDate();
                    break;
                case 'isRandomColor':
                case 'isChangeBlur':
                case 'isClickOffset':
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
                    setColorObj(color2, this.secondColor);
                    setRGBIncrement();
                    break;
                case 'secondColor':
                    this.secondColor = value;
                    setColorObj(color1, this.firstColor);
                    setColorObj(color2, this.secondColor);
                    setRGBIncrement();
                    break;
                case 'weatherProvider':
                case 'currentCity':
                    this[property] = value;
                    this.updateWeather();
                    break;
                case 'isDate':
                case 'timeStyle':
                case 'dateStyle':
                case 'timeFontSize':
                case 'dateFontSize':
                case 'distance':
                    this[property] = value;
                    this.drawDate();
                    break;
                case 'offsetX':
                case 'offsetY':
                    this[property] = value;
                    this.drawCanvas();
                    break;
                case 'language':
                    moment.lang(value);
                    this.drawDate();
                    break;
            }
        }

    };

    //定义Date插件
    //--------------------------------------------------------------------------------------------------------------

    let old = $.fn.date;

    $.fn.date = function (option) {
        let args = (arguments.length > 1) ? Array.prototype.slice.call(arguments, 1) : undefined;

        return this.each(function () {
            let $this = $(this);
            let data = $this.data('date');
            let options = $.extend({}, Date.DEFAULTS, $this.data(), typeof option === 'object' && option);

            if (!data && typeof option === 'string') {
                return;
            }
            if (!data) {
                $this.data('date', (data = new Date(this, options)));
            }
            else if (typeof option === 'string') {
                Date.prototype[option].apply(data, args);
            }
        });
    };

    $.fn.date.Constructor = Date;

    // 确保插件不冲突
    $.fn.date.noConflict = function () {
        $.fn.date = old;
        return this;
    };

});