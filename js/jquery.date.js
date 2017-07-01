/**
 * jQuery date plugin v0.0.6
 * moment.js: http://momentjs.cn/
 * project: http://steamcommunity.com/sharedfiles/filedetails/?id=921617616&searchtext=
 * @license MIT licensed
 * @author Alice
 * @date 2017/07/01
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

    // 和风天气信息
    let heweather = {
        basic: {
            cnty: '中国',                       // 国家
            city: '北京'                        // 城市
        },
        weather_data: {
            weather: '阴',                      // 天气情况
            temperature: '15℃',                // 温度情况
            wind: {
                deg: '40',                      //风向（360度）
                dir: '东北风',                  //风向
                sc: '4-5',                      //风力
                spd: '24'                       //风速（kmph）
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
            temperature: "12-1℃",              // 温度情况
            wind: "北风4-5级"                   // 风向风力
        }
    };
    // 新浪天气信息
    let sinaWeather = {
        basic: {
            city: '桂林'                        // 城市
        },
        weather_data: {
            weather: "阵风",                    // 天气情况
            temperature: "30℃～25℃",           // 温度情况
            wind: "南风≤3级"                    // 风向风力
        }
    };
    let weatherStr = '读取天气数据中...';  // 天气信息

    let timer = null;         // 时间计时器
    let weatherTimer = null;  // 天气计时器

    //私有方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     * 时间格式说明：
     * YYYY：年 MMM：月（非数字） MM：月（数字） Do：日（非数字） DD：日（数字）
     * HH：小时(二十四小时制) hh：小时(十二小时制) mm：分钟 ss：秒
     * a：时间段 dddd：星期
     */

    /**
     * 获取时间
     *
     * @param  {int} timeStyle 时间风格选择
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
        }
    }

    /**
     * 获取日期
     *
     * @param  {int} dateStyle  日期风格选择
     * @return {string} 时间字符串
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
        }
    }

    /**
     * 设置weatherStr
     *
     * @param {string} provider API提供者
     */
    function setWeatherStr(provider) {
        // 写入weatherStr
        switch (provider) {
            // 和风天气
            case 'heweather':
                weatherStr = heweather.basic.city
                    + ' ' + heweather.weather_data.weather
                    + ' ' + heweather.weather_data.temperature
                    + ' ' + heweather.weather_data.wind.dir
                    + ' ' + heweather.weather_data.wind.sc;
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
     * - 请勿盗取使用本人key，请到和风天气申请key使用（https://www.heweather.com/）
     * - 访问次数限制：4000
     *
     * @param {string} provider API提供者
     * @param {string} city     城市（China）
     */
    function getWeather(provider, city) {
        switch (provider) {
            // 和风天气接口
            case 'heweather':
                $.ajax({
                    dataType: "json",
                    type: "GET",
                    url: 'https://free-api.heweather.com/v5/now?city=' + city + '&key=71f9989659254be9a991375a04511d54',
                    success: function (result) {
                        // 获取接口状态
                        if (result.HeWeather5[0].status === 'ok') {
                            // 获取天气信息
                            heweather.basic.cnty = result.HeWeather5[0].basic.cnty;
                            heweather.basic.city = result.HeWeather5[0].basic.city;
                            heweather.weather_data.weather = result.HeWeather5[0].now.cond.txt;
                            heweather.weather_data.temperature = result.HeWeather5[0].now.tmp + "℃";
                            heweather.weather_data.wind.deg = result.HeWeather5[0].now.wind.deg;
                            heweather.weather_data.wind.dir = result.HeWeather5[0].now.wind.dir;
                            heweather.weather_data.wind.sc = result.HeWeather5[0].now.wind.sc + '级';
                            heweather.weather_data.wind.spd = result.HeWeather5[0].now.wind.spd;
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
                            weatherStr = '错误' + XMLHttpRequest.status + '本日和风天气访问次数达到上限';
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
        this.color = options.color;                      // 颜色
        this.shadowColor = options.shadowColor;          // 阴影颜色
        this.shadowBlur = options.shadowBlur;            // 发光程度
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
            'z-index': 3,
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

        $(this.$el).append(canvas);  // 添加canvas

        moment.lang('zh-cn');  // 默认日期语言为中文


        this.setupPointerEvents();  // 添加交互事件

        this.startDateTimer();  // 开始日期计时器
    };

    // 默认参数
    Date.DEFAULTS = {
        // 全局参数
        opacity: 0.90,                 // 不透明度
        color: '255,255,255',          // 颜色
        shadowColor: '255,255,255',    // 阴影颜色
        shadowBlur: 15,                // 发光程度
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
        language: 'zh_cn',             // 日期语言
        // 天气参数
        weatherProvider: 'sina',       // 天气API提供者
        currentCity: ''                // 当前城市
    };

    // 公共方法
    Date.prototype = {

        // 面向内部方法
        //-----------------------------------------------------------

        /** 更新天气 */
        updataWeather: function () {
            if (!this.currentCity) {
                // 根据IP获取城市
                let cityUrl = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js';  // 获取IP
                $.getScript(cityUrl, ()=> {
                    this.currentCity = remote_ip_info.city;  // 获取城市
                    getWeather(this.weatherProvider, this.currentCity);
                });
            } else {
                getWeather(this.weatherProvider, this.currentCity);
            }
        },

        // 计时器方法
        //----------------------------

        /** 开始时间计时器 */
        runDateTimer: function () {
            timer = setInterval(
                ()=> {
                    this.drawDate();
                }, 1000);
        },

        /** 开始天气计时器 */
        runWeatherTimer: function () {
            // this.updataWeather();  立即更新天气
            weatherTimer = setInterval(
                ()=> {
                    this.updataWeather();
                }, 21600000);  // 每隔6个小时更新一次天气
        },

        // Events
        //----------------------------

        /** 设置交互事件 */
        setupPointerEvents: function () {

            // 点击事件
            let that = this;
            $(this.$el).on('click', function (e) {
                if (that.isClickOffset) {
                    let x = originX = e.clientX || originX;
                    let y = originY = e.clientY || originY;
                    that.offsetX = x / canvasWidth;
                    that.offsetY = y / canvasHeight;
                    that.drawDate();
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
            });

        },

        // 面向外部方法
        //-----------------------------------------------------------

        /** 清除Canvas内容 */
        clearCanvas: function () {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
        },

        /** 绘制时间 */
        drawDate: function () {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            if (this.isDate) {
                context.font = this.timeFontSize + 'px 微软雅黑';
                context.fillText(getTime(this.timeStyle), originX, originY - this.timeFontSize / 2);
                context.font = this.dateFontSize + 'px 微软雅黑';
                context.fillText(getDate(this.dateStyle), originX, originY + this.dateFontSize / 2);
            }
        },

        /** 停止时间计时器 */
        stopDateTimer: function () {
            clearInterval(timer);
        },

        /** 开始时间计时器 */
        startDateTimer: function () {
            this.stopDateTimer();
            this.runDateTimer();
        },

        /** 停止天气计时器 */
        stopWeatherTimer: function () {
            clearInterval(weatherTimer);
        },

        /** 开始天气计时器 */
        startWeatherTimer: function () {
            this.stopWeatherTimer();
            this.runWeatherTimer();
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
                    $(canvas).css(property, value);
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
                case 'isClickOffset':
                    this[property] = value;
                    break;
                case 'weatherProvider':
                case 'currentCity':
                    this[property] = value;
                    this.updataWeather();
                    break;
                case 'isDate':
                case 'timeStyle':
                case 'dateStyle':
                case 'timeFontSize':
                case 'dateFontSize':
                    this[property] = value;
                    this.drawDate();
                    break;
                case 'offsetX':
                    this[property] = value;
                    originX = canvasWidth * this.offsetX;
                    this.drawDate();
                    break;
                case 'offsetY':
                    this[property] = value;
                    originY = canvasHeight * this.offsetY;
                    this.drawDate();
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