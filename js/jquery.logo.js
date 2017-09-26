/*!
 * jQuery time plugin v0.0.1
 * project:
 * - https://github.com/Alice-Jie/AudioVisualizer
 * - https://git.oschina.net/Alice_Jie/circleaudiovisualizer
 * - http://steamcommunity.com/sharedfiles/filedetails/?id=921617616
 * @license MIT licensed
 * @author Alice
 * @date 2017/09/26
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



    //私有方法
    //--------------------------------------------------------------------------------------------------------------



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

    };

    // 默认参数
    Logo.DEFAULTS = {

    };

    // 公共方法
    Logo.prototype = {

        // 面向内部方法
        //-----------------------------------------------------------



        // 面向外部方法
        //-----------------------------------------------------------

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