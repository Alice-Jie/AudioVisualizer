/*!
 * 监视器区域
 * project:
 * - https://github.com/Alice-Jie/4K-Circle-Audio-Visualizer
 * - https://git.oschina.net/Alice_Jie/circlevisualizercircle
 * - http://steamcommunity.com/sharedfiles/filedetails/?id=921617616
 * @license MIT licensed
 * @author Alice
 * @date 2017/08/07
 */

;(function ($, window, document, Math, undefined) {

    'use strict';

    // 定义变量
    //--------------------------------------------------------------------------------------------------------------

    // 临时储存变量
    let files = {};         // 文件路径对象

    // 背景/视频配置
    let BG = {
        mode: 'Color',                // 背景模式
        isLinearGradient: false,      // 线性开关
        Color: '255,255,255',         // 背景颜色
        GradientDeg: 120,             // 线性角度
        GradientColor1: '189,253,0',  // 线性颜色1
        GradientColor2: '255,255,0',  // 线性颜色2
        file: ''                      // 背景图片
    };
    let video = {
        file: '',
        progress: 0,
        switch: 0,
        isPlay: true,
        volume: 0.75,
        playBackRate: 1,
        fitStyle: 'fill',
        BGColor: '255,255,255'

    };
    let audio = {
        file: '',
        progress: 0,
        switch: 0,
        isPlay: true,
        volume: 0.75
    };

    // 全局/局部配置
    let isGlobalSettings = true;
    let globalSettings = {
        // 基础参数
        opacity: 0.90,               // 不透明度
        colorMode: 'monochrome',     // 颜色模式
        color: '255,255,255',        // 颜色
        shadowColor: '255,255,255',  // 模糊颜色
        shadowBlur: 0,               // 模糊大小
        // 颜色变换参数
        isRandomColor: true,
        firstColor: '255,255,255',
        secondColor: '255,0,0',
        isChangeBlur: false,
        // 坐标参数
        offsetX: 0.5,                // X坐标偏移
        offsetY: 0.5,                // Y坐标偏移
        isClickOffset: false         // 鼠标坐标偏移
    };
    let circle = {
        // 基础参数
        opacity: 0.90,               // 不透明度
        colorMode: 'monochrome',     // 颜色模式
        // 颜色模式-单色
        color: '255,255,255',        // 颜色
        shadowColor: '255,255,255',  // 模糊颜色
        shadowBlur: 0,               // 模糊大小
        // 颜色模式-颜色变换
        isRandomColor: true,         // 随机颜色变换
        firstColor: '255,255,255',   // 起始颜色
        secondColor: '255,0,0',      // 最终颜色
        isChangeBlur: false,         // 模糊颜色变换开关
        // 颜色模式-彩虹
        hueRange: 360,               // 色相范围
        saturationRange: 100,        // 饱和度范围(%)
        lightnessRange: 50,          // 亮度范围(%)
        gradientOffset: 0,           // 渐变效果偏移
        // 坐标参数
        offsetX: 0.5,                // X坐标偏移
        offsetY: 0.5,                // Y坐标偏移
        isClickOffset: false,        // 鼠标坐标偏移
        // 环参数
        redraw: 30                   // 重绘间隔(ms)
    };
    let bars = {
        // 基础参数
        opacity: 0.90,               // 不透明度
        colorMode: 'monochrome',     // 颜色模式
        // 颜色模式-单色
        color: '255,255,255',        // 颜色
        shadowColor: '255,255,255',  // 模糊颜色
        shadowBlur: 0,               // 模糊大小
        // 颜色模式-颜色变换
        isRandomColor: true,         // 随机颜色变换
        firstColor: '255,255,255',   // 起始颜色
        secondColor: '255,0,0',      // 最终颜色
        isChangeBlur: false,         // 模糊颜色变换开关
        // 颜色模式-彩虹
        hueRange: 360,               // 色相范围
        saturationRange: 100,        // 饱和度范围(%)
        lightnessRange: 50,          // 亮度范围(%)
        gradientOffset: 0,           // 渐变效果偏移
        // 坐标参数
        offsetX: 0.5,                // X坐标偏移
        offsetY: 0.9,                // Y坐标偏移
        isClickOffset: false,        // 鼠标坐标偏移
        // 条形参数
        redraw: 30                   // 重绘间隔(ms)
    };
    let date = {
        // 基础参数
        opacity: 0.90,               // 不透明度
        colorMode: 'monochrome',     // 颜色模式
        color: '255,255,255',        // 颜色
        shadowColor: '255,255,255',  // 阴影颜色
        shadowBlur: 0,               // 发光程度
        // 颜色变换参数
        isRandomColor: true,
        firstColor: '255,255,255',
        secondColor: '255,0,0',
        isChangeBlur: false,
        // 坐标参数
        offsetX: 0.5,                // X坐标偏移
        offsetY: 0.5,                // Y坐标偏移
        isClickOffset: false,        // 鼠标坐标偏移
        // 天气参数
        isInputCity: false,          // 查询城市天气
        weatherProvider: '',         // 天气提供者
        city: ''                     // 中国城市名
    };

    let isBackgroundZoom = false;  // 背景缩放开关

    // 插件列表
    let wallpaper = $('#wallpaper').visualizercircle().visualizerbars().date().particles().slider();
    wallpaper.slider('getAudioList');  // 获取音频列表

    // 定义方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     * 获取颜色字符串
     *
     * @param c wallpaper颜色格式
     * @return 颜色字符串
     */
    function getColor(c) {
        return c.split(' ').map((index)=> {
            return Math.ceil(index * 255);
        }).toString();
    }

    // 数字转换成标识字符串
    //-----------------------------------------------------------

    /**
     * 设置背景填充样式
     *
     * @param  {int} n 背景填充样式对应值
     * @return {string} 背景填充样式标识串
     */
    function setFillStyle(n) {
        let position = '0% 0%';
        let size = '100% 100%';
        let repeat = 'no-repeat';
        switch (n) {
            // 填充
            case 1:
                size = 'cover';
                break;
            // 适应
            case 2:
                position = '50% 50%';
                size = 'contain';
                break;
            // 拉伸
            case 3:
                size = '100% 100%';
                break;
            // 平铺
            case 4:
                size = 'initial';
                repeat = 'repeat';
                break;
            // 居中
            case 5:
                position = '50% 50%';
                size = 'initial';
                break;
            // 默认适应
            default:
                size = 'contain';
        }
        wallpaper.css({
            'background-position': position,
            'background-size': size,
            'background-repeat': repeat
        });
    }

    /**
     * 设置背景切换模式
     *
     * @param  {int} n 背景切换模式对应值
     * @return {string} 背景切换模式标识串
     */
    function setSliderStyle(n) {
        switch (n) {
            case 1:
                return 'css';
            case 2:
                return 'image';
            case 3:
                return 'canvas';
            default:
                return 'css';
        }
    }

    /**
     * 设置读取模式
     *
     * @param  {int} n 背景切换模式对应值
     * @return {string} 背景切换模式标识串
     */
    function setReadStyle(n) {
        switch (n) {
            case 1:
                return 'sequential';
            case 2:
                return 'random';
            default:
                return 'sequential';
        }
    }

    /**
     * 设置特效
     *
     *  @param  {int} n 滑动特效对应值
     *  @return {string} 滑动特效标识串
     */
    function setEffect(n) {
        switch (n) {
            case 0:
                return 'none';
            case 1:
                return 'cover';
            case 2:
                return 'fadeIn';
            case 3:
                return 'fadeOut';
            case 4:
                return 'shuffle';
            case 5:
                return 'slider';
            case 6:
                return 'vertIn';
            case 7:
                return 'vertOut';
            case 8:
                return 'zoomIn';
            case 9:
                return 'zoomOut';
            default:
                return 'none';
        }
    }

    /**
     * 设置IMG适应样式
     *
     *  @param  {int} n IMG适应样式对应值
     *  @return {string} IMG适应样式标识串
     */
    function setFitStyle(n) {
        switch (n) {
            // Fill
            case 1:
                return 'cover';
            // Fit
            case 2:
                return 'contain';
            // Stretch
            case 3:
                return 'fill';
            // Scale-Down
            case 4:
                return 'scale-down';
            // Center
            case 5:
                return 'none';
            default:
                return 'fill';
        }
    }

    /**
     * 设置时间单位
     *
     *  @param  {int} n 时间单位对应值
     *  @return {string} 时间单位标识串
     */
    function setTimeUnits(n) {
        switch (n) {
            case 1:
                return 'sec';
            case 2:
                return 'min';
            case 3:
                return 'hour';
            default:
                return 'min';
        }
    }

    /**
     * 设置颜色模式
     *
     *  @param  {int} n 颜色模式对应值
     *  @return {string} 颜色模式标识串
     */
    function setColorMode(n) {
        switch (n) {
            case 1:
                return 'monochrome';
            case 2:
                return 'colorTransformation';
            case 3:
                return 'rainBow';
            default:
                return 'monochrome';
        }
    }

    /**
     * 设置音频圆环
     *
     * @param  {int} n 音频圆环对应值
     * @return {string} 音频圆环标识串
     */
    function setPoint(n) {
        switch (n) {
            case 1:
                return 'staticRing';
            case 2:
                return 'innerRing';
            case 3:
                return 'outerRing';
            default:
                return 'staticRing';
        }
    }

    /**
     * 设置线帽样式
     *
     * @param  {int} n 线帽样式对应值
     * @return {string} 线帽样式标识串
     */
    function setLineCap(n) {
        switch (n) {
            case 1:
                return 'butt';
            case 2:
                return 'round';
            case 3:
                return 'square';
            default:
                return 'butt';
        }
    }

    /**
     * 设置线交互样式
     *
     * @param  {int} n 线交互样式对应值
     * @return {string} 线交互样式标识串
     */
    function setLineJoin(n) {
        switch (n) {
            case 1:
                return 'miter';
            case 2:
                return 'round';
            case 3:
                return 'bevel';
            default:
                return 'miter';
        }
    }

    /**
     * 设置音频条形
     *
     * @param  {int} n 音频条形对应值
     * @return {string} 音频圆环标识串
     */
    function setBarsDirection(n) {
        switch (n) {
            case 1:
                return 'upper bars';
            case 2:
                return 'lower bars';
            case 3:
                return 'two bars';
            default:
                return 'upper bars';
        }
    }

    /**
     * 设置日期风格
     *
     * @param  {int} n 日期风格对应值
     * @return {string} 日期风格标识串
     */
    function setTimeStyle(n) {
        switch (n) {
            case 1:
                return 'hh:mm:ss a';
            case 2:
                return 'hh:mm:ss';
            case 3:
                return 'HH:mm:ss a';
            case 4:
                return 'HH:mm:ss';
            case 5:
                return 'hh:mm a';
            case 6:
                return 'hh:mm';
            case 7:
                return 'HH:mm a';
            case 8:
                return 'HH:mm';
            default:
                return 'hh:mm:ss a';
        }
    }

    /**
     * 设置日期风格
     *
     * @param  {int} n 日期风格对应值
     * @return {string} 日期风格标识串
     */
    function setDateStyle(n) {
        switch (n) {
            case 1:
                return 'LL';
            case 2:
                return 'LL dddd';
            case 3:
                return 'MM - DD dddd';
            case 4:
                return 'MM - DD';
            case 5:
                return 'MMM Do dddd';
            case 6:
                return 'MMM Do';
            case 7:
                return '[Days] DDDD';
            case 8:
                return 'weather';
            default:
                return 'LL dddd';
        }
    }

    /**
     * 设置设置天气接口提供者
     *
     * @param  {int} n 天气接口提供者对应值
     * @return {string} 天气接口提供者标识串
     */
    function setWeatherProvider(n) {
        switch (n) {
            case 1:
                return 'heWeather';
            case 2:
                return 'baidu';
            case 3:
                return 'sina';
            default:
                return 'heWeather';
        }
    }

    /**
     * 设置日期语言
     *
     * @param  {int} n 日期语言对应值
     * @return {string} 日期语言标识串
     */
    function setDateLang(n) {
        switch (n) {
            // 南非语
            case 1:
                return 'af';
            // 阿尔巴尼亚语
            case 2:
                return 'sq';
            // 阿拉伯语
            case 3:
                return 'ar';
            // 亚美尼亚语
            case 4:
                return 'hy-am';
            // 阿塞拜疆语
            case 5:
                return 'az';
            // 巴斯克语
            case 6:
                return 'eu';
            // 白俄罗斯语
            case 7:
                return 'be';
            // 孟加拉语
            case 8:
                return 'bn';
            // 波斯尼亚语
            case 9:
                return 'bs';
            // 布列塔尼语
            case 10:
                return 'br';
            // 保加利亚语
            case 11:
                return 'bg';
            // 缅甸语
            case 12:
                return 'my';
            // 加泰罗尼亚语
            case 13:
                return 'ca';
            // 楚瓦什语
            case 14:
                return 'cv';
            // 克罗地亚语
            case 15:
                return 'hr';
            // 捷克语
            case 16:
                return 'cs';
            // 丹麦语
            case 17:
                return 'da';
            // 荷兰语
            case 18:
                return 'nl';
            // 英语（美国）
            case 19:
                return 'en';
            // 世界语
            case 20:
                return 'eo';
            // 爱沙尼亚语
            case 21:
                return 'et';
            // 波斯语
            case 22:
                return 'fa';
            // 芬兰语
            case 23:
                return 'fi';
            // 法语
            case 24:
                return 'fr';
            // 西弗里西亚语
            case 25:
                return 'fy';
            // 加利西亚语
            case 26:
                return 'gl';
            // 格鲁吉亚语
            case 27:
                return 'ka';
            // 希腊语
            case 28:
                return 'el';
            // 德语
            case 29:
                return 'de';
            // 希伯来语
            case 30:
                return 'he';
            // 印地语
            case 31:
                return 'hi';
            // 匈牙利语
            case 32:
                return 'hu';
            // 法罗群
            case 33:
                return 'fo';
            // 冰岛语
            case 34:
                return 'is';
            // 印尼语
            case 35:
                return 'id';
            // 意大利语
            case 36:
                return 'it';
            // 日语
            case 37:
                return 'ja';
            // 韩语
            case 38:
                return 'ko';
            // 高棉语
            case 39:
                return 'km';
            // 拉脱维亚语
            case 40:
                return 'lv';
            // 立陶宛语
            case 41:
                return 'lt';
            // 卢森堡语
            case 42:
                return 'lb';
            // 马其顿语
            case 43:
                return 'mk';
            // 马来语
            case 44:
                return 'ms-my';
            // 马拉雅拉姆语
            case 45:
                return 'ml';
            // 黑山语
            case 46:
                return 'me';
            // 马拉地语
            case 47:
                return 'mr';
            // 尼泊尔语
            case 48:
                return 'ne';
            // 挪威语
            case 49:
                return 'nb';
            // 波兰语
            case 50:
                return 'pl';
            // 葡萄牙语
            case 51:
                return 'pt';
            // 罗马尼亚语
            case 52:
                return 'ro';
            // 俄语
            case 53:
                return 'ru';
            // 塞尔维亚语
            case 54:
                return 'sr';
            // 简体中文
            case 55:
                return 'zh-cn';
            // 西班牙语
            case 56:
                return 'es';
            // 斯洛伐克语
            case 57:
                return 'sk';
            // 斯洛维尼亚语
            case 58:
                return 'sl';
            // 瑞典语
            case 59:
                return 'sv';
            // 塔马塞特语
            case 60:
                return 'tzm';
            // 泰米尔语
            case 61:
                return 'ta';
            // 他加禄语
            case 62:
                return 'tl-ph';
            // 泰语
            case 63:
                return 'th';
            // 藏语
            case 64:
                return 'bo';
            // 繁體中文
            case 65:
                return 'zh-tw';
            // 土耳其语
            case 66:
                return 'tr';
            // 乌克兰语
            case 67:
                return 'uk';
            // 乌兹别克语
            case 68:
                return 'uz';
            // 威尔士语
            case 69:
                return 'cy';
            // 越南语
            case 70:
                return 'vi';
            default:
                return 'zh-cn';
        }
    }

    /**
     * 设置粒子类型
     *
     * @param  {int} n 粒子类型对应值
     * @return {string} 粒子类型标识串
     */
    function setShapeType(n) {
        switch (n) {
            case 1:
                return 'circle';
            case 2:
                return 'edge';
            case 3:
                return 'triangle';
            case 4:
                return 'star';
            case 5:
                return 'image';
            default:
                return 'circle';
        }
    }

    /**
     * 设置粒子方向
     *
     * @param  {int} n 粒子方向对应值
     * @return {string} 粒子方向标识串
     */
    function setDirection(n) {
        switch (n) {
            case 1:
                return 'none';
            case 2:
                return 'top';
            case 3:
                return 'top-right';
            case 4:
                return 'right';
            case 5:
                return 'bottom-right';
            case 6:
                return 'bottom';
            case 7:
                return 'bottom-left';
            case 8:
                return 'left';
            case 9:
                return 'top-left';
            default:
                return 'none';
        }
    }

    /**
     * 设置离屏模式
     *
     * @param  {int} n 离屏模式对应值
     * @return {string} 离屏模式标识串
     */
    function setMoveOutMode(n) {
        switch (n) {
            case 1:
                return 'out';
            case 2:
                return 'bounce';
            default:
                return 'out';
        }
    }

    // 音频监视器
    //--------------------------------------------------------------------------------------------------------------

    /**
     * 从wallpaper接收音频样本
     *
     * @param {Array<float>} audioArray 音频数组
     */
    function wallpaperAudioListener(audioArray) {
        // 更新date插件数据
        wallpaper.date('updateDate');

        if (circle.redraw === 30) {
            // 更新circle插件音频数据
            wallpaper.visualizercircle('drawCanvas', audioArray);
        } else {
            // 更新circle插件音频数据并绘图
            wallpaper.visualizercircle('updateVisualizerCircle', audioArray);
        }
        if (bars.redraw === 30) {
            // 更新bars插件音频数据并绘图
            wallpaper.visualizerbars('drawCanvas', audioArray);
        } else {
            // 更新bars插件音频数据
            wallpaper.visualizerbars('updateVisualizerBars', audioArray);
        }

        // 更新slider和particles音频均值
        wallpaper.particles('updateAudioAverage', audioArray);
        wallpaper.slider('updateAudioAverage', audioArray);

        // 背景缩放
        if (isBackgroundZoom) {
            wallpaper.slider('backgroundZoom');
        }
    }

    window.wallpaperRegisterAudioListener && window.wallpaperRegisterAudioListener(wallpaperAudioListener);

    // wallpaper参数监视器
    //--------------------------------------------------------------------------------------------------------------

    window.wallpaperPropertyListener = {

        /**
         * 从wallpaper接收属性值
         *
         * @param {*} properties 属性名
         */
        applyUserProperties: function (properties) {

            /**
             * 壁纸初始化时wallpaper默认遍历运行参数一遍
             * 参数属性：condition 满足后默认运行该参数一次
             */

            // 背景设置
            //-----------------------------------------------------------

            // 背景模式
            if (properties.BG_mode) {
                // 初始化对应模式的所需环境
                switch (properties.BG_mode.value) {
                    case 1:
                        BG.mode = 'Color';
                        wallpaper.slider('delVideo')
                            .slider('stopSliderTimer');
                        if (BG.isLinearGradient) {
                            wallpaper.slider('cssLinearGradient');
                        } else {
                            wallpaper.slider('cssUserColor');
                        }
                        break;
                    case 2:
                        BG.mode = 'Wallpaper';
                        wallpaper.slider('delVideo')
                            .slider('stopSliderTimer');
                        if (BG.file) {
                            wallpaper.slider('cssUserImg');
                        } else {
                            wallpaper.slider('cssDefaultImg');
                        }
                        break;
                    case 3:
                        BG.mode = 'Directory';
                        wallpaper.slider('delVideo')
                            .slider('startSlider');
                        break;
                    case 4:
                        BG.mode = 'Video';
                        wallpaper.slider('stopSliderTimer')
                            .slider('getVideoList')
                            .slider('addVideo');
                        if (video.file) {
                            wallpaper.slider('videoSrcUserVideo');
                        } else {
                            wallpaper.slider('videoSrcDefaultVideo');
                        }
                        break;
                }
            }
            // 背景颜色
            if (properties.BG_Color) {
                BG.Color = getColor(properties.BG_Color.value);
                wallpaper.slider('setUserColor', BG.Color);
                if (BG.mode === 'Color') {
                    wallpaper.slider('cssUserColor');
                }
            }
            // 线性颜色开关
            if (properties.BG_isLinearGradient) {
                BG.isLinearGradient = properties.BG_isLinearGradient.value;
                if (BG.isLinearGradient) {
                    wallpaper.slider('cssLinearGradient');
                } else {
                    wallpaper.slider('cssUserColor');
                }
            }
            // 线性颜色1
            if (properties.BG_linearGradientColor1) {
                BG.GradientColor1 = getColor(properties.BG_linearGradientColor1.value);
                wallpaper.slider('setUserLinearGradient', BG.GradientDeg, BG.GradientColor1, BG.GradientColor2);
                if (BG.mode === 'Color' && BG.isLinearGradient) {
                    wallpaper.slider('cssLinearGradient');
                }
            }
            // 线性颜色2
            if (properties.BG_linearGradientColor2) {
                BG.GradientColor2 = getColor(properties.BG_linearGradientColor2.value);
                wallpaper.slider('setUserLinearGradient', BG.GradientDeg, BG.GradientColor1, BG.GradientColor2);
                if (BG.mode === 'Color' && BG.isLinearGradient) {
                    wallpaper.slider('cssLinearGradient');
                }
            }
            // 线性角度
            if (properties.BG_linearGradientDeg) {
                BG.GradientDeg = properties.BG_linearGradientDeg.value;
                wallpaper.slider('setUserLinearGradient', BG.GradientDeg, BG.GradientColor1, BG.GradientColor2);
                if (BG.mode === 'Color' && BG.isLinearGradient) {
                    wallpaper.slider('cssLinearGradient');
                }
            }
            // 更换背景
            if (properties.BG_image) {
                if (properties.BG_image.value) {
                    BG.file = properties.BG_image.value;
                    wallpaper.slider('setUserImg', BG.file);
                    if (BG.mode === 'Wallpaper') {
                        wallpaper.slider('cssUserImg');
                    }
                } else {
                    wallpaper.slider('setUserImg', '');
                    if (BG.mode === 'Wallpaper') {
                        wallpaper.slider('cssDefaultImg');
                    }
                }
            }
            // 背景填充样式
            if (properties.image_fillStyle) {
                setFillStyle(properties.image_fillStyle.value);
            }
            // 背景缩放开关
            if (properties.image_isBackgroundZoom) {
                isBackgroundZoom = properties.image_isBackgroundZoom.value;
                wallpaper.slider('set', 'isBackgroundZoom', properties.image_isBackgroundZoom.value);
            }
            // 背景3D转换
            if (properties.image_isRotate3D) {
                wallpaper.slider('set', 'isRotate3D', properties.image_isRotate3D.value);
            }

            // # 幻灯片参数
            //-------------

            // 幻灯片目录
            if (properties.directory) {
                if (properties.directory.value) {
                    if (BG.mode === 'Directory') {
                        wallpaper.slider('changeSlider');
                    }
                } else {
                    if (BG.mode === 'Directory') {
                        wallpaper.slider('changeSlider');
                    }
                }
            }
            // 滑动样式
            if (properties.directory_sliderStyle) {
                wallpaper.slider('set', 'sliderStyle', setSliderStyle(properties.directory_sliderStyle.value));
            }
            // 切换特效
            if (properties.directory_effect) {
                wallpaper.slider('set', 'effect', setEffect(properties.directory_effect.value));
            }
            // IMG适应样式
            if (properties.IMG_FitStyle) {
                wallpaper.slider('set', 'imgFit', setFitStyle(properties.IMG_FitStyle.value));
            }
            // IMG背景颜色
            if (properties.IMG_BGColor) {
                wallpaper.slider('set', 'imgBGColor', getColor(properties.IMG_BGColor.value));
            }
            // 读取模式
            if (properties.directory_readStyle) {
                wallpaper.slider('set', 'readStyle', setReadStyle(properties.directory_readStyle.value));
            }
            // 选择时间单位
            if (properties.directory_timeUnits) {
                if (BG.mode === 'Directory') {
                    wallpaper.slider('set', 'timeUnits', setTimeUnits(properties.directory_timeUnits.value));
                }
            }
            // 停留时间
            if (properties.directory_pauseTime) {
                if (BG.mode === 'Directory') {
                    wallpaper.slider('set', 'pauseTime', properties.directory_pauseTime.value);
                }
            }

            // # 视频参数
            //-----------

            // 视频文件
            if (properties.video_file) {
                if (properties.video_file.value) {
                    video.file = properties.video_file.value;
                    wallpaper.slider('setUserVideo', video.file);
                    if (BG.mode === 'Video') {
                        wallpaper.slider('videoSrcUserVideo');
                    }
                } else {
                    wallpaper.slider('setUserVideo', '');
                    if (BG.mode === 'Video') {
                        wallpaper.slider('videoSrcDefaultVideo');
                    }
                }
            }
            // 视频进度
            if (properties.video_progress) {
                video.progress = properties.video_progress.value / 100;
                if (BG.mode === 'Video') {
                    wallpaper.slider('set', 'videoProgress', video.progress);
                }

            }
            // 视频切换
            if (properties.video_switch) {
                video.switch = properties.video_switch.value;
                switch (video.switch) {
                    case -1:
                        wallpaper.slider('prevVideo');
                        break;
                    case 0:
                        wallpaper.slider('currentVideo');
                        break;
                    case 1:
                        wallpaper.slider('nextVideo');
                        break;
                    default:
                        wallpaper.slider('currentVideo');
                }

            }
            // 视频切换播放/暂停
            if (properties.video_isPlay) {
                video.isPlay = properties.video_isPlay.value;
                if (BG.mode === 'Video') {
                    wallpaper.slider('set', 'isVideoPlay', video.isPlay);
                }
            }
            // 视频音量
            if (properties.video_volume) {
                video.volume = properties.video_volume.value / 100;
                wallpaper.slider('set', 'videoVolume', video.volume);
            }
            // 视频播放速度
            if (properties.video_playBackRate) {
                video.playbackRate = properties.video_playBackRate.value / 100;
                wallpaper.slider('set', 'playbackRate', video.playbackRate);
            }
            // video适应样式
            if (properties.video_FitStyle) {
                video.fitStyle = setFitStyle(properties.video_FitStyle.value);
                wallpaper.slider('set', 'videoFit', video.fitStyle);
            }
            // video背景颜色
            if (properties.video_BGColor) {
                video.BGColor = getColor(properties.video_BGColor.value);
                wallpaper.slider('set', 'videoBGColor', video.BGColor);
            }

            // # 音频参数
            //-----------

            // 音频文件
            if (properties.audio_file) {
                if (properties.audio_file.value) {
                    audio.file = properties.audio_file.value;
                    wallpaper.slider('setUserAudio', audio.file)
                        .slider('audioSrcUserAudio');
                } else {
                    audio.file = '';
                    wallpaper.slider('setUserAudio', '')
                        .slider('audioSrcDefaultAudio');
                }
            }
            // 音频进度
            if (properties.audio_progress) {
                audio.progress = properties.audio_progress.value / 100;
                wallpaper.slider('set', 'audioProgress', audio.progress);
            }
            // 音频切换
            if (properties.audio_switch) {
                audio.switch = properties.audio_switch.value;
                switch (audio.switch) {
                    case -1:
                        wallpaper.slider('prevAudio');
                        break;
                    case 0:
                        wallpaper.slider('currentAudio');
                        break;
                    case 1:
                        wallpaper.slider('nextAudio');
                        break;
                    default:
                        wallpaper.slider('currentAudio');
                }

            }
            // 音频切换播放/暂停
            if (properties.audio_isPlay) {
                audio.isPlay = properties.audio_isPlay.value;
                wallpaper.slider('set', 'isAudioPlay', audio.isPlay);
            }
            // 音频音量
            if (properties.audio_volume) {
                audio.volume = properties.audio_volume.value / 100;
                wallpaper.slider('set', 'audioVolume', audio.volume);
            }

            // 全局设置
            //-----------------------------------------------------------

            // 全局模式
            if (properties.global_GlobalSettings) {
                if (properties.global_GlobalSettings.value) {
                    isGlobalSettings = true;  // 开启全局模式

                    // 音频圆环+日期参数设置
                    //----------------------

                    // 基础参数
                    wallpaper.visualizercircle('set', 'opacity', globalSettings.opacity)
                        .visualizercircle('set', 'colorMode', globalSettings.colorMode)
                        .visualizercircle('set', 'color', globalSettings.color)
                        .visualizercircle('set', 'shadowColor', globalSettings.shadowColor)
                        .visualizercircle('set', 'shadowBlur', globalSettings.shadowBlur)
                        // 颜色变换参数
                        .visualizercircle('set', 'firstColor', globalSettings.firstColor)
                        .visualizercircle('set', 'secondColor', globalSettings.secondColor)
                        .visualizercircle('set', 'isRandomColor', globalSettings.isRandomColor)
                        .visualizercircle('set', 'isChangeBlur', globalSettings.isChangeBlur)
                        // 坐标参数
                        .visualizercircle('set', 'offsetX', globalSettings.offsetX)
                        .visualizercircle('set', 'offsetY', globalSettings.offsetY)
                        .visualizercircle('set', 'isClickOffset', globalSettings.isClickOffset)
                        // 全局参数
                        .date('set', 'opacity', globalSettings.opacity)
                        .date('set', 'colorMode', globalSettings.colorMode)
                        .date('set', 'color', globalSettings.color)
                        .date('set', 'shadowColor', globalSettings.shadowColor)
                        .date('set', 'shadowBlur', globalSettings.shadowBlur)
                        // 颜色变换参数
                        .date('set', 'firstColor', globalSettings.firstColor)
                        .date('set', 'secondColor', globalSettings.secondColor)
                        .date('set', 'isRandomColor', globalSettings.isRandomColor)
                        .date('set', 'isChangeBlur', globalSettings.isChangeBlur)
                        // 坐标参数
                        .date('set', 'offsetX', globalSettings.offsetX)
                        .date('set', 'offsetY', globalSettings.offsetY)
                        .date('set', 'isClickOffset', globalSettings.isClickOffset);
                    // 彩虹模式下关闭模糊效果
                    if (globalSettings.colorMode === 'rainBow') {
                        wallpaper.visualizercircle('set', 'shadowBlur', 0);

                    }
                } else {
                    isGlobalSettings = false;  // 开启非全局模式

                    // 音频圆环参数设置
                    //-----------------

                    // 基础参数
                    wallpaper.visualizercircle('set', 'opacity', circle.opacity)
                        .visualizercircle('set', 'colorMode', circle.colorMode)
                        .visualizercircle('set', 'color', circle.color)
                        .visualizercircle('set', 'shadowColor', circle.shadowColor)
                        .visualizercircle('set', 'shadowBlur', circle.shadowBlur)
                        // 颜色变换参数
                        .visualizercircle('set', 'firstColor', circle.firstColor)
                        .visualizercircle('set', 'secondColor', circle.secondColor)
                        .visualizercircle('set', 'isRandomColor', circle.isRandomColor)
                        .visualizercircle('set', 'isChangeBlur', circle.isChangeBlur)
                        // 坐标参数
                        .visualizercircle('set', 'offsetX', circle.offsetX)
                        .visualizercircle('set', 'offsetY', circle.offsetY)
                        .visualizercircle('set', 'isClickOffset', circle.isClickOffset);
                    // 彩虹模式下关闭模糊效果
                    if (circle.colorMode === 'rainBow') {
                        wallpaper.visualizercircle('set', 'shadowBlur', 0);

                    }

                    // 日期参数设置
                    //-------------

                    // 全局参数
                    wallpaper.date('set', 'opacity', date.opacity)
                        .date('set', 'colorMode', date.colorMode)
                        .date('set', 'color', date.color)
                        .date('set', 'shadowColor', date.shadowColor)
                        .date('set', 'shadowBlur', date.shadowBlur)
                        // 颜色变换参数
                        .date('set', 'firstColor', date.firstColor)
                        .date('set', 'secondColor', date.secondColor)
                        .date('set', 'isRandomColor', date.isRandomColor)
                        .date('set', 'isChangeBlur', date.isChangeBlur)
                        // 坐标参数
                        .date('set', 'offsetX', date.offsetX)
                        .date('set', 'offsetY', date.offsetY)
                        .date('set', 'isClickOffset', date.isClickOffset);
                }
            }

            // # 基础参数
            //-----------

            // 不透明度
            if (properties.global_opacity) {
                globalSettings.opacity = properties.global_opacity.value / 100;
                // 全局模式下开启
                if (isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'opacity', globalSettings.opacity)
                        .date('set', 'opacity', globalSettings.opacity);
                }
            }
            // 颜色模式
            if (properties.global_colorMode) {
                globalSettings.colorMode = setColorMode(properties.global_colorMode.value);
                // 全局模式下开启
                if (isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'colorMode', globalSettings.colorMode)
                        .date('set', 'colorMode', globalSettings.colorMode);
                    // 初始化对应颜色模式环境
                    switch (globalSettings.colorMode) {
                        case 'monochrome':
                            wallpaper.visualizercircle('set', 'color', globalSettings.color)
                                .visualizercircle('set', 'shadowColor', globalSettings.shadowColor)
                                .visualizercircle('set', 'shadowBlur', globalSettings.shadowBlur)
                                .date('set', 'color', globalSettings.color)
                                .date('set', 'shadowColor', globalSettings.shadowColor);
                            break;
                        case 'colorTransformation':
                            wallpaper.visualizercircle('set', 'shadowBlur', globalSettings.shadowBlur);
                            break;
                        case 'rainBow':
                            // 彩虹模式下关闭模糊效果
                            wallpaper.visualizercircle('set', 'shadowBlur', 0);
                            break;
                    }
                }
            }
            // 颜色
            if (properties.global_color) {
                globalSettings.color = getColor(properties.global_color.value);
                // 全局模式下开启
                if (isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'color', globalSettings.color)
                        .date('set', 'color', globalSettings.color);
                }
            }
            // 模糊颜色
            if (properties.global_shadowColor) {
                globalSettings.shadowColor = getColor(properties.global_shadowColor.value);
                // 全局模式下开启
                if (isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'shadowColor', globalSettings.shadowColor)
                        .date('set', 'shadowColor', globalSettings.shadowColor);
                }
            }
            // 模糊程度
            if (properties.global_shadowBlur) {
                globalSettings.shadowBlur = properties.global_shadowBlur.value;
                // 全局模式下开启
                if (isGlobalSettings) {
                    if (globalSettings.colorMode !== 'rainBow') {
                        wallpaper.visualizercircle('set', 'shadowBlur', globalSettings.shadowBlur)
                            .date('set', 'shadowBlur', globalSettings.shadowBlur);
                    }
                    else {
                        // 彩虹模式下关闭模糊效果
                        wallpaper.visualizercircle('set', 'shadowBlur', 0);
                    }
                }
            }

            // # 颜色变换参数
            //---------------

            // 随机颜色
            if (properties.global_isRandomColor) {
                globalSettings.isRandomColor = properties.global_isRandomColor.value;
                // 全局模式下开启
                if (isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'isRandomColor', globalSettings.isRandomColor)
                        .date('set', 'isRandomColor', globalSettings.isRandomColor);
                }
            }
            // 开始颜色
            if (properties.global_firstColor) {
                globalSettings.firstColor = getColor(properties.global_firstColor.value);
                // 全局模式下开启
                if (isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'firstColor', globalSettings.firstColor)
                        .date('set', 'firstColor', globalSettings.firstColor);
                }
            }
            // 结束颜色
            if (properties.global_secondColor) {
                globalSettings.secondColor = getColor(properties.global_secondColor.value);
                // 全局模式下开启
                if (isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'secondColor', globalSettings.secondColor)
                        .date('set', 'secondColor', globalSettings.secondColor);
                }
            }
            // 绑定模糊颜色
            if (properties.global_isChangeBlur) {
                globalSettings.isChangeBlur = properties.global_isChangeBlur.value;
                // 全局模式下开启
                if (isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'isChangeBlur', globalSettings.isChangeBlur)
                        .date('set', 'isChangeBlur', globalSettings.isChangeBlur);
                    // 若不绑定模糊颜色
                    if (globalSettings.isChangeBlur === false) {
                        wallpaper.visualizercircle('set', 'shadowColor', globalSettings.shadowColor)
                            .date('set', 'shadowColor', globalSettings.shadowColor);
                    }
                }
            }

            // # 坐标参数
            //-----------

            // X轴偏移
            if (properties.global_offsetX) {
                globalSettings.offsetX = properties.global_offsetX.value / 100;
                // 全局模式下开启
                if (isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'offsetX', globalSettings.offsetX)
                        .date('set', 'offsetX', globalSettings.offsetX);
                }
            }
            // Y轴偏移
            if (properties.global_offsetY) {
                globalSettings.offsetY = properties.global_offsetY.value / 100;
                // 全局模式下开启
                if (isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'offsetY', globalSettings.offsetY)
                        .date('set', 'offsetY', globalSettings.offsetY);
                }
            }
            // 鼠标坐标偏移
            if (properties.global_isClickOffset) {
                globalSettings.isClickOffset = properties.global_isClickOffset.value;
                // 全局模式下开启
                if (isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'isClickOffset', globalSettings.isClickOffset)
                        .date('set', 'isClickOffset', globalSettings.isClickOffset);
                }
            }

            // 音频设置
            //-----------------------------------------------------------

            // 音频振幅
            if (properties.circle_amplitude) {
                wallpaper.visualizercircle('set', 'amplitude', properties.circle_amplitude.value)
                    .visualizerbars('set', 'amplitude', properties.circle_amplitude.value);
            }
            // 音频衰弱
            if (properties.circle_decline) {
                wallpaper.visualizercircle('set', 'decline', properties.circle_decline.value / 100)
                    .visualizerbars('set', 'decline', properties.circle_decline.value / 100);
            }
            // 音频峰值
            if (properties.circle_peak) {
                wallpaper.visualizercircle('set', 'peak', properties.circle_peak.value / 10)
                    .visualizerbars('set', 'peak', properties.circle_peak.value / 10);
            }

            // 圆环设置
            //-----------------------------------------------------------

            // # 基础参数
            //-----------

            // 圆环和小球不透明度
            if (properties.circle_opacity) {
                circle.opacity = properties.circle_opacity.value / 100;
                // 非全局模式下开启
                if (!isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'opacity', circle.opacity);
                }
            }
            // 圆环和小球颜色模式
            if (properties.circle_colorMode) {
                circle.colorMode = setColorMode(properties.circle_colorMode.value);
                // 非全局模式下开启
                if (!isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'colorMode', circle.colorMode);
                    // 初始化对应颜色环境
                    switch (circle.colorMode) {
                        case 'monochrome':
                            wallpaper.visualizercircle('set', 'color', circle.color)
                                .visualizercircle('set', 'shadowColor', circle.shadowColor)
                                .visualizercircle('set', 'shadowBlur', circle.shadowBlur);
                            break;
                        case 'colorTransformation':
                            wallpaper.visualizercircle('set', 'shadowBlur', circle.shadowBlur);
                            break;
                        case 'rainBow':
                            // 彩虹模式下关闭模糊效果
                            wallpaper.visualizercircle('set', 'shadowBlur', 0);
                            break;
                    }
                }
            }
            // 圆环和小球颜色
            if (properties.circle_color) {
                circle.color = getColor(properties.circle_color.value);
                // 非全局模式下开启
                if (!isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'color', circle.color);
                }
            }
            // 圆环和小球模糊颜色
            if (properties.circle_shadowColor) {
                circle.shadowColor = getColor(properties.circle_shadowColor.value);
                // 非全局模式下开启
                if (!isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'shadowColor', circle.shadowColor);
                }
            }
            // 圆环和小球模糊程度
            if (properties.circle_shadowBlur) {
                circle.shadowBlur = properties.circle_shadowBlur.value;
                // 非全局模式下开启
                if (!isGlobalSettings) {
                    if (circle.colorMode !== 'rainBow') {
                        wallpaper.visualizercircle('set', 'shadowBlur', circle.shadowBlur);
                    } else {
                        // 彩虹模式下关闭模糊效果
                        wallpaper.visualizercircle('set', 'shadowBlur', 0);
                    }
                }
            }

            // # 颜色变换参数
            //---------------

            // 圆环和小球随机颜色
            if (properties.circle_isRandomColor) {
                circle.isRandomColor = properties.circle_isRandomColor.value;
                // 非全局模式下开启
                if (!isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'isRandomColor', circle.isRandomColor);
                }
            }
            // 圆环和小球开始颜色
            if (properties.circle_firstColor) {
                circle.firstColor = getColor(properties.circle_firstColor.value);
                // 非全局模式下开启
                if (!isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'firstColor', circle.firstColor);
                }
            }
            // 圆环和小球结束颜色
            if (properties.circle_secondColor) {
                circle.secondColor = getColor(properties.circle_secondColor.value);
                // 非全局模式下开启
                if (!isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'secondColor', circle.secondColor);
                }
            }

            // # 彩虹渐变参数
            //---------------

            // 圆环和小球色相范围
            if (properties.circle_hueRange) {
                circle.hueRange = properties.circle_hueRange.value;
                wallpaper.visualizercircle('set', 'hueRange', circle.hueRange);
            }
            // 圆环和小球饱和度范围(%)
            if (properties.circle_saturationRange) {
                circle.saturationRange = properties.circle_saturationRange.value;
                wallpaper.visualizercircle('set', 'saturationRange', circle.saturationRange);
            }
            // 圆环和小球亮度范围(%)
            if (properties.circle_lightnessRange) {
                circle.lightnessRange = properties.circle_lightnessRange.value;
                wallpaper.visualizercircle('set', 'lightnessRange', circle.lightnessRange);
            }
            // 圆环和小球渐变效果偏移
            if (properties.circle_gradientOffset) {
                circle.gradientOffset = properties.circle_gradientOffset.value;
                wallpaper.visualizercircle('set', 'gradientOffset', circle.gradientOffset);
            }

            // # 坐标参数
            //-----------

            // 圆环和小球绑定模糊颜色
            if (properties.circle_isChangeBlur) {
                circle.isChangeBlur = properties.circle_isChangeBlur.value;
                // 非全局模式下开启
                if (!isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'isChangeBlur', circle.isChangeBlur);
                    // 若不绑定模糊颜色
                    if (circle.isChangeBlur === false) {
                        wallpaper.visualizercircle('set', 'shadowColor', circle.shadowColor);
                    }
                }
            }
            // 圆环和小球X轴偏移
            if (properties.circle_offsetX) {
                // 非全局模式下开启
                circle.offsetX = properties.circle_offsetX.value / 100;
                if (!isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'offsetX', circle.offsetX);
                }
            }
            // 圆环和小球Y轴偏移
            if (properties.circle_offsetY) {
                // 非全局模式下开启
                circle.offsetY = properties.circle_offsetY.value / 100;
                if (!isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'offsetY', circle.offsetY);
                }
            }
            // 圆环和小球鼠标坐标偏移
            if (properties.circle_isClickOffset) {
                // 非全局模式下开启
                circle.isClickOffset = properties.circle_isClickOffset.value;
                if (!isGlobalSettings) {
                    wallpaper.visualizercircle('set', 'isClickOffset', circle.isClickOffset);
                }
            }


            // # 圆环参数
            //-----------

            // 显示圆环
            if (properties.circle_isRing) {
                wallpaper.visualizercircle('set', 'isRing', properties.circle_isRing.value);
            }
            // 显示静态环
            if (properties.circle_isStaticRing) {
                wallpaper.visualizercircle('set', 'isStaticRing', properties.circle_isStaticRing.value);
            }
            // 显示内环
            if (properties.circle_isInnerRing) {
                wallpaper.visualizercircle('set', 'isInnerRing', properties.circle_isInnerRing.value);
            }
            // 显示外环
            if (properties.circle_isOuterRing) {
                wallpaper.visualizercircle('set', 'isOuterRing', properties.circle_isOuterRing.value);
            }
            // 波浪模式
            if (properties.circle_isWave) {
                wallpaper.visualizercircle('set', 'isWave', properties.circle_isWave.value);
            }
            // 第一环
            if (properties.circle_firstRing) {
                wallpaper.visualizercircle('set', 'firstRing', setPoint(properties.circle_firstRing.value));
            }
            // 第二环
            if (properties.circle_secondRing) {
                wallpaper.visualizercircle('set', 'secondRing', setPoint(properties.circle_secondRing.value));
            }
            // 圆环半径
            if (properties.circle_radius) {
                wallpaper.visualizercircle('set', 'radius', properties.circle_radius.value / 10);
            }
            // 圆环旋转
            if (properties.circle_ringRotation) {
                wallpaper.visualizercircle('set', 'ringRotation', properties.circle_ringRotation.value);
            }
            // 重绘间隔
            if (properties.circle_milliSec) {
                circle.redraw = properties.circle_milliSec.value;
                wallpaper.visualizercircle('set', 'milliSec', circle.redraw);
                if (circle.redraw === 30) {
                    wallpaper.visualizercircle('stopVisualizerCircleTimer');
                } else {
                    wallpaper.visualizercircle('runVisualizerCircleTimer');
                }
            }

            // # 线条参数
            //-----------

            // 是否连线
            if (properties.circle_isLineTo) {
                wallpaper.visualizercircle('set', 'isLineTo', properties.circle_isLineTo.value);
            }
            // 第一点
            if (properties.circle_firstPoint) {
                wallpaper.visualizercircle('set', 'firstPoint', setPoint(properties.circle_firstPoint.value));
            }
            // 第二点
            if (properties.circle_secondPoint) {
                wallpaper.visualizercircle('set', 'secondPoint', setPoint(properties.circle_secondPoint.value));
            }
            // 圆环点数
            if (properties.circle_pointNum) {
                wallpaper.visualizercircle('set', 'pointNum', properties.circle_pointNum.value);
            }
            // 内环距离
            if (properties.circle_innerDistance) {
                wallpaper.visualizercircle('set', 'innerDistance', properties.circle_innerDistance.value);
            }
            // 外环距离
            if (properties.circle_outerDistance) {
                wallpaper.visualizercircle('set', 'outerDistance', properties.circle_outerDistance.value);
            }
            // 线帽样式
            if (properties.circle_lineCap) {
                wallpaper.visualizercircle('set', 'lineCap', setLineCap(properties.circle_lineCap.value));
            }
            // 线交汇样式
            if (properties.circle_lineJoin) {
                wallpaper.visualizercircle('set', 'lineJoin', setLineJoin(properties.circle_lineJoin.value));
            }
            // 线条粗细
            if (properties.circle_lineWidth) {
                wallpaper.visualizercircle('set', 'lineWidth', properties.circle_lineWidth.value);
            }

            // # 小球参数
            //-----------

            // 显示小球
            if (properties.circle_isBall) {
                wallpaper.visualizercircle('set', 'isBall', properties.circle_isBall.value);
            }
            // 小球间隔
            if (properties.circle_ballSpacer) {
                wallpaper.visualizercircle('set', 'ballSpacer', properties.circle_ballSpacer.value);
            }
            // 内环距离
            if (properties.circle_ballDistance) {
                wallpaper.visualizercircle('set', 'ballDistance', properties.circle_ballDistance.value);
            }
            // 小球大小
            if (properties.circle_ballSize) {
                wallpaper.visualizercircle('set', 'ballSize', properties.circle_ballSize.value);
            }
            // 小球方向
            if (properties.circle_ballDirection) {
                wallpaper.visualizercircle('set', 'ballDirection', properties.circle_ballDirection.value);
            }
            // 绑定圆环旋转
            if (properties.circle_bindRingRotation) {
                wallpaper.visualizercircle('set', 'bindRingRotation', properties.circle_bindRingRotation.value);
            }
            // 小球旋转
            if (properties.circle_ballRotation) {
                wallpaper.visualizercircle('set', 'ballRotation', properties.circle_ballRotation.value);
            }


            // 条形设置
            //-----------------------------------------------------------

            // # 基础参数
            //-----------

            // 条形不透明度
            if (properties.bars_opacity) {
                bars.opacity = properties.bars_opacity.value / 100;
                wallpaper.visualizerbars('set', 'opacity', bars.opacity);
            }
            // 颜色模式
            if (properties.bars_colorMode) {
                bars.colorMode = setColorMode(properties.bars_colorMode.value);
                wallpaper.visualizerbars('set', 'colorMode', bars.colorMode);
                // 初始化对应颜色环境
                switch (bars.colorMode) {
                    case 'monochrome':
                        wallpaper.visualizerbars('set', 'color', bars.color)
                            .visualizerbars('set', 'shadowColor', bars.shadowColor)
                            .visualizerbars('set', 'shadowBlur', bars.shadowBlur);
                        break;
                    case 'colorTransformation':
                        wallpaper.visualizerbars('set', 'shadowBlur', bars.shadowBlur);
                        break;
                    case 'rainBow':
                        // 彩虹模式下关闭模糊效果
                        wallpaper.visualizerbars('set', 'shadowBlur', 0);
                        break;
                }
            }
            // 条形颜色
            if (properties.bars_color) {
                bars.color = getColor(properties.bars_color.value);
                wallpaper.visualizerbars('set', 'color', bars.color);
            }
            // 条形模糊颜色
            if (properties.bars_shadowColor) {
                bars.shadowColor = getColor(properties.bars_shadowColor.value);
                wallpaper.visualizerbars('set', 'shadowColor', bars.shadowColor);
            }
            // 条形模糊程度
            if (properties.bars_shadowBlur) {
                bars.shadowBlur = properties.bars_shadowBlur.value;
                if (bars.colorMode !== 'rainBow') {
                    wallpaper.visualizerbars('set', 'shadowBlur', bars.shadowBlur);
                } else {
                    // 彩虹模式下关闭模糊效果
                    wallpaper.visualizerbars('set', 'shadowBlur', 0);
                }
            }

            // # 颜色变换参数
            //---------------

            // 条形随机颜色
            if (properties.bars_isRandomColor) {
                bars.isRandomColor = properties.bars_isRandomColor.value;
                wallpaper.visualizerbars('set', 'isRandomColor', bars.isRandomColor);
            }
            // 条形开始颜色
            if (properties.bars_firstColor) {
                bars.firstColor = getColor(properties.bars_firstColor.value);
                wallpaper.visualizerbars('set', 'firstColor', bars.firstColor);
            }
            // 条形结束颜色
            if (properties.bars_secondColor) {
                bars.secondColor = getColor(properties.bars_secondColor.value);
                wallpaper.visualizerbars('set', 'secondColor', bars.secondColor);
            }
            // 条形绑定模糊颜色
            if (properties.bars_isChangeBlur) {
                bars.isChangeBlur = properties.bars_isChangeBlur.value;
                wallpaper.visualizerbars('set', 'isChangeBlur', bars.isChangeBlur);
                // 若不绑定模糊颜色
                if (!bars.isChangeBlur) {
                    wallpaper.visualizerbars('set', 'shadowColor', bars.shadowColor);
                }
            }

            // # 彩虹渐变参数
            //---------------

            // 条形色相范围
            if (properties.bars_hueRange) {
                bars.hueRange = properties.bars_hueRange.value;
                wallpaper.visualizerbars('set', 'hueRange', bars.hueRange);
            }
            // 条形饱和度范围(%)
            if (properties.bars_saturationRange) {
                bars.saturationRange = properties.bars_saturationRange.value;
                wallpaper.visualizerbars('set', 'saturationRange', bars.saturationRange);
            }
            // 条形亮度范围(%)
            if (properties.bars_lightnessRange) {
                bars.lightnessRange = properties.bars_lightnessRange.value;
                wallpaper.visualizerbars('set', 'lightnessRange', bars.lightnessRange);
            }
            // 条形渐变效果偏移
            if (properties.bars_gradientOffset) {
                bars.gradientOffset = properties.bars_gradientOffset.value;
                wallpaper.visualizerbars('set', 'gradientOffset', bars.gradientOffset);
            }

            // # 坐标参数
            //-----------

            // 条形X轴偏移
            if (properties.bars_offsetX) {
                bars.offsetX = properties.bars_offsetX.value / 100;
                wallpaper.visualizerbars('set', 'offsetX', bars.offsetX);
            }
            // 条形Y轴偏移
            if (properties.bars_offsetY) {
                bars.offsetY = properties.bars_offsetY.value / 100;
                wallpaper.visualizerbars('set', 'offsetY', bars.offsetY);

            }
            // 条形鼠标坐标偏移
            if (properties.bars_isClickOffset) {
                bars.isClickOffset = properties.bars_isClickOffset.value;
                wallpaper.visualizerbars('set', 'isClickOffset', bars.isClickOffset);
            }

            // # 条形参数
            //-----------

            // 显示条形
            if (properties.bars_isBars) {
                wallpaper.visualizerbars('set', 'isBars', properties.bars_isBars.value);
            }
            // 显示线条
            if (properties.bars_isLineTo) {
                wallpaper.visualizerbars('set', 'isLineTo', properties.bars_isLineTo.value);
            }
            // 基础宽度
            if (properties.bars_width) {
                wallpaper.visualizerbars('set', 'width', properties.bars_width.value / 10);
            }
            // 基础高度
            if (properties.bars_height) {
                wallpaper.visualizerbars('set', 'height', properties.bars_height.value);
            }
            // 点的数量
            if (properties.bars_pointNum) {
                wallpaper.visualizerbars('set', 'pointNum', properties.bars_pointNum.value);
            }
            // 旋转角度
            if (properties.bars_barsRotation) {
                wallpaper.visualizerbars('set', 'barsRotation', properties.bars_barsRotation.value);
            }
            // 条形方向
            if (properties.bars_barsDirection) {
                wallpaper.visualizerbars('set', 'barsDirection', setBarsDirection(properties.bars_barsDirection.value));
            }
            // 线帽样式
            if (properties.bars_lineCap) {
                wallpaper.visualizerbars('set', 'lineCap', setLineCap(properties.bars_lineCap.value));
            }
            // 线交汇样式
            if (properties.bars_lineJoin) {
                wallpaper.visualizerbars('set', 'lineJoin', setLineJoin(properties.bars_lineJoin.value));
            }
            // 线条粗细
            if (properties.bars_lineWidth) {
                wallpaper.visualizerbars('set', 'lineWidth', properties.bars_lineWidth.value);
            }
            // 重绘间隔
            if (properties.bars_milliSec) {
                bars.redraw = properties.bars_milliSec.value;
                wallpaper.visualizerbars('set', 'milliSec', bars.redraw);
                if (bars.redraw === 30) {
                    wallpaper.visualizerbars('stopVisualizerBarsTimer');
                } else {
                    wallpaper.visualizerbars('runVisualizerBarsTimer');
                }
            }

            // 时间日期参数
            //-----------------------------------------------------------

            // 显示日期
            if (properties.date_isDate) {
                wallpaper.date('set', 'isDate', properties.date_isDate.value);
                if (properties.date_isDate.value) {
                    wallpaper.date('runDateTimer')
                } else {
                    wallpaper.date('stopDateTimer');
                }
            }
            // 设置语言
            if (properties.date_language) {
                wallpaper.date('set', 'language', setDateLang(properties.date_language.value));
            }
            // 时间样式
            if (properties.date_timeStyle) {
                wallpaper.date('set', 'timeStyle', setTimeStyle(properties.date_timeStyle.value));
            }
            // 日期样式
            if (properties.date_dateStyle) {
                wallpaper.date('set', 'dateStyle', setDateStyle(properties.date_dateStyle.value));
                // 天气计时器开关
                if (properties.date_dateStyle === 8) {
                    wallpaper.date('runWeatherTimer');
                } else {
                    wallpaper.date('stopWeatherTimer');
                }
            }

            // # 天气参数
            //-----------

            // 天气接口提供者
            if (properties.date_weatherProvider) {
                date.weatherProvider = setWeatherProvider(properties.date_weatherProvider.value);
                wallpaper.date('set', 'weatherProvider', date.weatherProvider);
            }
            // 中国天气城市
            if (properties.date_city) {
                date.city = properties.date_city.value;
                if (date.isInputCity) {
                    wallpaper.date('set', 'currentCity', date.city);
                }
            }
            // 查询城市天气
            if (properties.date_isInputCity) {
                date.isInputCity = properties.date_isInputCity.value;
                if (date.isInputCity) {
                    wallpaper.date('set', 'currentCity', date.city);
                } else {
                    wallpaper.date('set', 'currentCity', '');
                }
            }

            // # 时间日期参数
            //---------------

            // 字体大小
            if (properties.date_fontSize) {
                wallpaper.date('set', 'timeFontSize', properties.date_fontSize.value)
                    .date('set', 'dateFontSize', properties.date_fontSize.value / 2);
            }
            // 时间字体大小
            if (properties.date_timeFontSize) {
                wallpaper.date('set', 'timeFontSize', properties.date_timeFontSize.value);
            }
            // 日期字体大小
            if (properties.date_dateFontSize) {
                wallpaper.date('set', 'dateFontSize', properties.date_dateFontSize.value);
            }
            // 时间和日期之间距离
            if (properties.date_distance) {
                wallpaper.date('set', 'distance', properties.date_distance.value);
            }

            // # 基础参数
            //-----------

            // 日期不透明度
            if (properties.date_opacity) {
                date.opacity = properties.date_opacity.value / 100;
                if (!isGlobalSettings) {
                    wallpaper.date('set', 'opacity', date.opacity);
                }
            }
            // 日期颜色模式
            if (properties.date_colorMode) {
                date.colorMode = setColorMode(properties.date_colorMode.value);
                // 非全局模式下开启
                if (!isGlobalSettings) {
                    wallpaper.date('set', 'colorMode', date.colorMode);
                    if (date.colorMode === 'monochrome') {
                        // 初始化单颜色环境
                        wallpaper.date('set', 'color', date.color)
                            .date('set', 'shadowColor', date.shadowColor);
                    }
                }
            }
            // 日期颜色
            if (properties.date_color) {
                date.color = getColor(properties.date_color.value);
                if (!isGlobalSettings) {
                    wallpaper.date('set', 'color', date.color);
                }
            }
            // 日期模糊颜色
            if (properties.date_shadowColor) {
                date.shadowColor = getColor(properties.date_shadowColor.value);
                if (!isGlobalSettings) {
                    wallpaper.date('set', 'shadowColor', date.shadowColor);
                }
            }
            // 日期模糊程度
            if (properties.date_shadowBlur) {
                date.shadowBlur = properties.date_shadowBlur.value;
                // 非全局模式下开启
                if (!isGlobalSettings) {
                    wallpaper.date('set', 'shadowBlur', date.shadowBlur);
                }
            }

            // # 颜色变换参数
            //---------------

            // 日期随机颜色
            if (properties.date_isRandomColor) {
                date.isRandomColor = properties.date_isRandomColor.value;
                // 非全局模式下开启
                if (!isGlobalSettings) {
                    wallpaper.date('set', 'isRandomColor', date.isRandomColor);
                }
            }
            // 日期开始颜色
            if (properties.date_firstColor) {
                date.firstColor = getColor(properties.date_firstColor.value);
                // 非全局模式下开启
                if (!isGlobalSettings) {
                    wallpaper.date('set', 'firstColor', date.firstColor);
                }
            }
            // 日期结束颜色
            if (properties.date_secondColor) {
                date.secondColor = getColor(properties.date_secondColor.value);
                // 非全局模式下开启
                if (!isGlobalSettings) {
                    wallpaper.date('set', 'secondColor', date.secondColor);
                }
            }
            // 日期绑定模糊颜色
            if (properties.date_isChangeBlur) {
                date.isChangeBlur = properties.date_isChangeBlur.value;
                // 非全局模式下开启
                if (!isGlobalSettings) {
                    wallpaper.date('set', 'isChangeBlur', date.isChangeBlur);
                    // 若没有绑定模糊颜色
                    if (!date.isChangeBlur) {
                        wallpaper.date('set', 'shadowColor', date.shadowColor);
                    }
                }
            }

            // # 坐标参数
            //-----------

            // 日期X轴偏移
            if (properties.date_offsetX) {
                date.offsetX = properties.date_offsetX.value / 100;
                if (!isGlobalSettings) {
                    wallpaper.date('set', 'offsetX', date.offsetX);
                }
            }
            // 日期Y轴偏移
            if (properties.date_offsetY) {
                date.offsetY = properties.date_offsetY.value / 100;
                if (!isGlobalSettings) {
                    wallpaper.date('set', 'offsetY', date.offsetY);
                }
            }
            // 日期鼠标坐标偏移
            if (properties.date_isClickOffset) {
                date.isClickOffset = properties.date_isClickOffset.value;
                if (!isGlobalSettings) {
                    wallpaper.date('set', 'isClickOffset', date.isClickOffset);
                }
            }

            // 粒子属性参数
            //-----------------------------------------------------------

            // 显示粒子
            if (properties.particles_isParticles) {
                if (properties.particles_isParticles.value) {
                    wallpaper.particles('runParticlesTimer');
                } else {
                    wallpaper.particles('stopParticlesTimer')
                        .particles('clearCanvas');
                }
            }

            // # 基础参数
            //---------------

            // 粒子数量
            if (properties.particles_number) {
                wallpaper.particles('addParticles', properties.particles_number.value);
            }
            // 粒子密度开关
            if (properties.particles_isDensity) {
                wallpaper.particles('set', 'isDensity', properties.particles_isDensity.value);
            }
            // 粒子密度区域
            if (properties.particles_densityArea) {
                wallpaper.particles('set', 'densityArea', properties.particles_densityArea.value);
            }
            // 粒子不透明度
            if (properties.particles_opacity) {
                wallpaper.particles('set', 'opacity', properties.particles_opacity.value / 100);
            }
            // 粒子随机不透明度
            if (properties.particles_opacityRandom) {
                wallpaper.particles('set', 'opacityRandom', properties.particles_opacityRandom.value);
            }
            // 粒子颜色
            if (properties.particles_color) {
                wallpaper.particles('set', 'color', getColor(properties.particles_color.value));
            }
            // 粒子颜色跟随音频
            if (properties.particles_isColorFollow) {
                wallpaper.particles('set', 'isColorFollow', properties.particles_isColorFollow.value);
            }
            // 粒子颜色变化率
            if (properties.particles_colorRate) {
                wallpaper.particles('set', 'colorRate', properties.particles_colorRate.value);
            }
            // 粒子随机颜色
            if (properties.particles_colorRandom) {
                wallpaper.particles('set', 'colorRandom', properties.particles_colorRandom.value);
            }
            // 填充粒子
            if (properties.particles_isFill) {
                wallpaper.particles('set', 'isFill', properties.particles_isFill.value);
            }
            // 描边粒子
            if (properties.particles_isStroke) {
                wallpaper.particles('set', 'isStroke', properties.particles_isStroke.value);
            }
            // 粒子描边颜色
            if (properties.particles_lineWidth) {
                wallpaper.particles('set', 'lineWidth', properties.particles_lineWidth.value);
            }
            // 粒子模糊颜色
            if (properties.particles_shadowColor) {
                wallpaper.particles('set', 'shadowColor', getColor(properties.particles_shadowColor.value));
            }
            // 粒子模糊大小
            if (properties.particles_shadowBlur) {
                wallpaper.particles('set', 'shadowBlur', properties.particles_shadowBlur.value);
            }

            // # 类型参数
            //---------------

            // 粒子类型
            if (properties.particles_shapeType) {
                wallpaper.particles('set', 'shapeType', setShapeType(properties.particles_shapeType.value));
            }
            // 粒子图片
            if (properties.particles_image) {
                wallpaper.particles('particlesImage', properties.particles_image.value);
            }
            // 粒子旋转角度
            if (properties.particles_rotationAngle) {
                wallpaper.particles('set', 'rotationAngle', properties.particles_rotationAngle.value);
            }
            // 随机角度
            if (properties.particles_angleRandom) {
                wallpaper.particles('set', 'angleRandom', properties.particles_angleRandom.value);
            }
            // 粒子大小
            if (properties.particles_sizeValue) {
                wallpaper.particles('set', 'sizeValue', properties.particles_sizeValue.value);
            }
            // 粒子大小跟随音频
            if (properties.particles_isSizeFollow) {
                wallpaper.particles('set', 'isSizeFollow', properties.particles_isSizeFollow.value);
            }
            // 粒子大小变化率
            if (properties.particles_sizeRate) {
                wallpaper.particles('set', 'sizeRate', properties.particles_sizeRate.value);
            }
            // 粒子随机大小
            if (properties.particles_sizeRandom) {
                wallpaper.particles('set', 'sizeRandom', properties.particles_sizeRandom.value);
            }

            // # 连线参数
            //---------------

            // 显示连线
            if (properties.particles_linkEnable) {
                wallpaper.particles('set', 'linkEnable', properties.particles_linkEnable.value);
            }
            // 鼠标交互
            if (properties.particles_mouseInteraction) {
                wallpaper.particles('set', 'interactivityLink', properties.particles_mouseInteraction.value);
            }
            // 连线距离
            if (properties.particles_linkDistance) {
                wallpaper.particles('set', 'linkDistance', properties.particles_linkDistance.value);
            }
            // 连线宽度
            if (properties.particles_linkWidth) {
                wallpaper.particles('set', 'linkWidth', properties.particles_linkWidth.value);
            }
            // 连线颜色
            if (properties.particles_linkColor) {
                wallpaper.particles('set', 'linkColor', getColor(properties.particles_linkColor.value));
            }
            // 随机连线颜色
            if (properties.particles_linkColorRandom) {
                wallpaper.particles('set', 'linkColorRandom', properties.particles_linkColorRandom.value);
            }
            // 连线不透明度
            if (properties.particles_linkOpacity) {
                wallpaper.particles('set', 'linkOpacity', properties.particles_linkOpacity.value / 100);
            }

            // # 移动参数
            //---------------

            // 粒子是否移动
            if (properties.particles_isMove) {
                wallpaper.particles('set', 'isMove', properties.particles_isMove.value);
            }
            // 粒子速度
            if (properties.particles_speed) {
                wallpaper.particles('set', 'speed', properties.particles_speed.value);
            }
            // 粒子移动跟随音频
            if (properties.particles_isMoveFollow) {
                wallpaper.particles('set', 'isMoveFollow', properties.particles_isMoveFollow.value);
            }
            // 粒子移动变化率
            if (properties.particles_moveRate) {
                wallpaper.particles('set', 'moveRate', properties.particles_moveRate.value);
            }
            // 随机粒子速度
            if (properties.particles_speedRandom) {
                wallpaper.particles('set', 'speedRandom', properties.particles_speedRandom.value);
            }
            // 粒子方向
            if (properties.particles_direction) {
                wallpaper.particles('set', 'direction', setDirection(properties.particles_direction.value));
            }
            // 粒子是否笔直移动
            if (properties.particles_isStraight) {
                wallpaper.particles('set', 'isStraight', properties.particles_isStraight.value);
            }
            // 粒子反弹
            if (properties.particles_isBounce) {
                wallpaper.particles('set', 'isBounce', properties.particles_isBounce.value);
            }
            // 粒子离屏模式
            if (properties.particles_moveOutMode) {
                wallpaper.particles('set', 'moveOutMode', setMoveOutMode(properties.particles_moveOutMode.value));
            }

        },

        /**
         * 从wallpaper接收文件路径数组
         * 添加或则修改图片都会触发这个方法
         *
         * @param {string}        propertyName 属性名称
         * @param {Array<string>} changedFiles 文件路径字符串数组
         * - 首轮载入，读取文件夹中所有图片的路径
         * - 添加图片，读取文件夹中所有被添加图片的路径
         * - 修改图片，读取文件夹中所有被修改图片的路径
         */
        userDirectoryFilesAddedOrChanged: function (propertyName, changedFiles) {
            if (!files.hasOwnProperty(propertyName)) {
                // 首轮添加图片
                files[propertyName] = changedFiles;
            } else {
                // 添加或则修改图片
                files[propertyName] = files[propertyName].concat(changedFiles);
            }
            wallpaper.slider('updateImgList', files[propertyName]);
        },

        /**
         * 从wallpaper接收文件路径数组
         * 删除或则修改图片都会触发这个方法
         *
         * @param {string}        propertyName 属性名称
         * @param {Array<string>} removedFiles 文件路径字符串数组
         * - 删除图片，读取文件夹中所有被删除图片的路径
         * - 修改图片，读取文件夹中所有被修改图片的路径
         * - 修改图片是先触发userDirectoryFilesAddedOrChanged后再触发userDirectoryFilesAddedOrChanged
         */
        userDirectoryFilesRemoved: function (propertyName, removedFiles) {
            // 剔除删除或则被修改的图片路径
            for (let i = 0; i < removedFiles.length; ++i) {
                let index = files[propertyName].indexOf(removedFiles[i]);
                if (index >= 0) {
                    files[propertyName].splice(index, 1);
                }
            }
            wallpaper.slider('updateImgList', files[propertyName]);
        }

    };

})(jQuery, window, document, Math);