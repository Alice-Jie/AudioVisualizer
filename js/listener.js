/*!
 * 监视器区域
 * project:
 * - https://github.com/Alice-Jie/4K-Circle-Audio-Visualizer
 * - https://gitee.com/Alice_Jie/circleaudiovisualizer
 * - http://steamcommunity.com/sharedfiles/filedetails/?id=921617616
 * @license MIT licensed
 * @author Alice
 * @date 2017/10/25
 */

(function ($, window, document, Math) {

    'use strict';

    // 定义变量
    //--------------------------------------------------------------------------------------------------------------

    // 临时储存变量
    let files = {};  // 文件路径对象

    // 背景/幻灯片/视频配置
    let BG = {
        mode: 'Color',                // 背景模式
        isLinearGradient: false,      // 线性开关
        Color: '255,255,255',         // 背景颜色
        GradientDeg: 120,             // 线性角度
        GradientColor1: '189,253,0',  // 线性颜色1
        GradientColor2: '255,255,0',  // 线性颜色2
        file: ''                      // 背景图片
    };
    let directory = {
        sliderStyle: 'css',
        timeUnits: 'sec',
        pauseTime: 30
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
        isLoop: false,
        volume: 0.75
    };

    // 局部配置
    let circle = {
        // 颜色模式
        colorMode: 'monochrome',     // 颜色模式
        // 颜色模式-单色
        color: '255,255,255',        // 颜色
        shadowColor: '255,255,255',  // 阴影颜色
        shadowBlur: 0,               // 阴影大小
        shadowOverlay: false,        // 阴影叠加
        // 颜色模式-颜色变换
        isRandomColor: true,         // 随机颜色变换
        firstColor: '255,255,255',   // 起始颜色
        secondColor: '255,0,0',      // 最终颜色
        // 颜色模式-彩虹
        hueRange: 360,               // 色相范围
        saturationRange: 100,        // 饱和度范围(%)
        lightnessRange: 50,          // 亮度范围(%)
        gradientOffset: 0,           // 渐变效果偏移
        // 基础参数
        redraw: 30                   // 重绘间隔(ms)
    };
    let bars = {
        colorMode: 'monochrome',     // 颜色模式
        // 颜色模式-单色
        color: '255,255,255',        // 颜色
        shadowColor: '255,255,255',  // 阴影颜色
        shadowBlur: 0,               // 阴影大小
        shadowOverlay: false,        // 阴影叠加
        // 颜色模式-颜色变换
        isRandomColor: true,         // 随机颜色变换
        firstColor: '255,255,255',   // 起始颜色
        secondColor: '255,0,0',      // 最终颜色
        // 颜色模式-彩虹
        hueRange: 360,               // 色相范围
        saturationRange: 100,        // 饱和度范围(%)
        lightnessRange: 50,          // 亮度范围(%)
        gradientOffset: 0,           // 渐变效果偏移
        // 条形参数
        redraw: 30                   // 重绘间隔(ms)
    };
    let date = {
        colorMode: 'monochrome',     // 颜色模式
        // 颜色模式-单色
        color: '255,255,255',        // 颜色
        shadowColor: '255,255,255',  // 阴影颜色
        shadowBlur: 0,               // 发光程度
        // 颜色变换参数
        isRandomColor: true,         // 随机颜色变换
        firstColor: '255,255,255',   // 起始颜色
        secondColor: '255,0,0',      // 最终颜色
        isChangeBlur: false,         // 阴影颜色变换开关
        // 天气参数
        isInputCity: false,          // 查询城市天气
        weatherProvider: '',         // 天气提供者
        city: ''                     // 中国城市名
    };

    // 插件列表
    let wallpaper = $('#wallpaper').slider().logo().particles().visualizerCircle().visualizerBars().time();
    wallpaper.slider('getAudioList').slider('getVideoList');  // 获取音频/视频列表

    // 定义方法
    //--------------------------------------------------------------------------------------------------------------

    /**
     * 获取颜色字符串
     *
     * @param  {string} c 百分比格式颜色字符串
     * @return {string} RGB格式颜色字符串
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
        switch (n) {
            case 1:
                return 'fill';
            case 2:
                return 'fit';
            case 3:
                return 'stretch';
            case 4:
                return 'tile';
            case 5:
                return 'center';
            default:
                return 'fill';
        }
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
     * 设置Img/Video适应样式
     *
     *  @param  {int} n Img/Video适应样式对应值
     *  @return {string} Img/Video适应样式标识串
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
     * 设置Canvas适应样式
     *
     *  @param  {int} n Canvas适应样式对应值
     *  @return {string} Canvas适应样式标识串
     */
    function setCanvasFitStyle(n) {
        switch (n) {
            // Fill
            case 1:
                return 'fill';
            // Fit
            case 2:
                return 'fit';
            // Stretch
            case 3:
                return 'stretch';
            // Center
            case 4:
                return 'center';
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
    function setRing(n) {
        switch (n) {
            case 1:
                return 'innerRing';
            case 2:
                return 'outerRing';
            case 3:
                return 'twoRing';
            default:
                return 'twoRing';
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
                return 'butt';
            case 2:
                return 'square';
            case 3:
                return 'round';
            default:
                return 'butt';
        }
    }

    /**
     * 设置变换样式
     *
     * @param  {int} n 变换样式对应值
     * @return {string} 变换样式标识串
     */
    function setTransformMode(n) {
        switch (n) {
            case 1:
                return 'value';
            case 2:
                return 'matrix3d';
            default:
                return 'value';
        }
    }

    /**
     * 设置音频条形
     *
     * @param  {int} n 音频条形对应值
     * @return {string} 音频条形标识串
     */
    function setBarsDirection(n) {
        switch (n) {
            case 1:
                return 'upperBars';
            case 2:
                return 'lowerBars';
            case 3:
                return 'twoBars';
            default:
                return 'upperBars';
        }
    }

    /**
     * 设置混合选项
     *
     * @param  {int} n 混合选项对应值
     * @return {string} 混合选项标识串
     */
    function setMixBlendMode(n) {
        switch (n) {
            case 1:
                // 正常
                return 'normal';
            case 2:
                // 正片叠底
                return 'multiply';
            case 3:
                // 滤色
                return 'screen';
            case 4:
                // 叠加
                return 'overlay';
            case 5:
                // 变暗
                return 'darken';
            case 6:
                // 变亮
                return 'lighten';
            case 7:
                // 颜色减淡
                return 'color-dodge';
            case 8:
                // 颜色加深
                return 'color-burn';
            case 9:
                // 强光
                return 'hard-light';
            case 10:
                // 柔光
                return 'soft-light';
            case 11:
                // 差值
                return 'difference';
            case 12:
                // 排除
                return 'exclusion';
            case 13:
                // 色相
                return 'hue';
            case 14:
                // 饱和度
                return 'saturation';
            case 15:
                // 颜色
                return 'color';
            case 16:
                // 亮度
                return 'luminosity';
            default:
                return 'normal';
        }
    }

    /**
     * 设置时间风格
     *
     * @param  {int} n 时间风格对应值
     * @return {string} 时间风格标识串
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
     * 设置字体风格
     *
     * @param  {(int | string)} n 字体风格对应值/字符串
     * @return {string} 字体风格标识串
     */
    function setFontFamily(n) {
        switch (n) {
            // 英文&&自定义字体
            case 1:
                return 'Tahoma';
            case 2:
                return 'Helvetica';
            case 3:
                return 'Arial';
            case 4:
                return 'sans-serif';
            case 5:
                return 'Curlz';
            case 6:
                return 'Harngton';
            case 7:
                return 'Oldengl';
            case 8:
                return 'PixelSplitter';
            case 9:
                return 'Superg';
            case 10:
                return 'Trancefm';
            // windows常见内置中文字体
            case 11:
                return 'SimSun';
            case 12:
                return 'SimHei';
            case 13:
                return 'Microsoft Yahei';
            case 14:
                return 'Microsoft JhengHei';
            case 15:
                return 'KaiTi';
            case 16:
                return 'NSimSun';
            case 17:
                return 'FangSong';
            // office安装后新增字体
            case 18:
                return 'YouYuan';
            case 19:
                return 'LiSu';
            case 20:
                return 'STXihei';
            case 21:
                return 'STKaiti';
            case 22:
                return 'STSong';
            case 23:
                return 'STFangsong';
            case 24:
                return 'STZhongsong';
            case 25:
                return 'STCaiyun';
            case 26:
                return 'STHupo';
            case 27:
                return 'STXinwei';
            case 28:
                return 'STLiti';
            case 29:
                return 'STXingkai';
            case 30:
                return 'FZShuTi';
            case 31:
                return 'FZYaoti';
            default:
                if (n && typeof(n) === 'string') {
                    return n;
                } else if (typeof(n) === 'number') {
                    return 'Microsoft JhengHei';
                } else {
                    console.err('undefined.');
                }
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
        wallpaper.time('updateDate');

        if (circle.redraw === 30) {
            // 更新circle插件音频数据
            wallpaper.visualizerCircle('drawCanvas', audioArray);
        } else {
            // 更新circle插件音频数据并绘图
            wallpaper.visualizerCircle('updateVisualizerCircle', audioArray);
        }
        if (bars.redraw === 30) {
            // 更新bars插件音频数据并绘图
            wallpaper.visualizerBars('drawCanvas', audioArray);
        } else {
            // 更新bars插件音频数据
            wallpaper.visualizerBars('updateVisualizerBars', audioArray);
        }

        // 更新slider、logo和particles音频均值
        wallpaper.slider('updateAudioAverage', audioArray)
            .logo('updateAudioAverage', audioArray)
            .particles('updateAudioAverage', audioArray);

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
                        wallpaper.slider('set', 'sliderMode', BG.mode)
                            .slider('set', 'isLinearGradient', BG.isLinearGradient);
                        break;
                    case 2:
                        BG.mode = 'Wallpaper';
                        wallpaper.slider('set', 'sliderMode', BG.mode);
                        break;
                    case 3:
                        BG.mode = 'Directory';
                        wallpaper.slider('set', 'sliderMode', BG.mode)
                            .slider('set', 'sliderStyle', directory.sliderStyle)
                            .slider('set', 'timeUnits', directory.timeUnits)
                            .slider('set', 'pauseTime', directory.pauseTime);
                        break;
                    case 4:
                        BG.mode = 'Video';
                        wallpaper.slider('set', 'sliderMode', BG.mode);
                        break;
                    // no default
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
                if (BG.mode === 'Color') {
                    wallpaper.slider('set', 'isLinearGradient', BG.isLinearGradient);
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
                wallpaper.slider('setFillStyle', setFillStyle(properties.image_fillStyle.value));
            }

            // # 幻灯片参数
            //-------------

            // 幻灯片目录
            if (properties.directory) {
                if (BG.mode === 'Directory') {
                    wallpaper.slider('changeSlider');
                }
            }
            // 滑动样式
            if (properties.directory_sliderStyle) {
                directory.sliderStyle = setSliderStyle(properties.directory_sliderStyle.value);
                if (BG.mode === 'Directory') {
                    wallpaper.slider('set', 'sliderStyle', directory.sliderStyle);
                }
            }
            // 切换特效
            if (properties.directory_effect) {
                wallpaper.slider('set', 'effect', setEffect(properties.directory_effect.value));
            }
            // IMG适应样式
            if (properties.directory_imgFitStyle) {
                wallpaper.slider('set', 'imgFit', setFitStyle(properties.directory_imgFitStyle.value));
            }
            // IMG背景颜色
            if (properties.directory_imgBGColor) {
                wallpaper.slider('set', 'imgBGColor', getColor(properties.directory_imgBGColor.value));
            }
            // Canvas适应样式
            if (properties.directory_canvasFitStyle) {
                wallpaper.slider('set', 'canvasFit', setCanvasFitStyle(properties.directory_canvasFitStyle.value));
            }
            // Canvas背景颜色
            if (properties.directory_canvasBGColor) {
                wallpaper.slider('set', 'canvasBGColor', getColor(properties.directory_canvasBGColor.value));
            }
            // 读取模式
            if (properties.directory_readStyle) {
                wallpaper.slider('set', 'readStyle', setReadStyle(properties.directory_readStyle.value));
            }
            // 选择时间单位
            if (properties.directory_timeUnits) {
                directory.timeUnits = setTimeUnits(properties.directory_timeUnits.value);
                if (BG.mode === 'Directory') {
                    wallpaper.slider('set', 'timeUnits', directory.timeUnits);
                }
            }
            // 停留时间
            if (properties.directory_pauseTime) {
                directory.pauseTime = properties.directory_pauseTime.value;
                if (BG.mode === 'Directory') {
                    wallpaper.slider('set', 'pauseTime', directory.pauseTime);
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

            // # 变换参数
            //-----------

            // 背景缩放开关
            if (properties.image_isBackgroundZoom) {
                wallpaper.slider('set', 'isBackgroundZoom', properties.image_isBackgroundZoom.value);
            }
            // 背景模糊样式
            if (properties.image_filterBlur) {
                wallpaper.slider('set', 'isBackgroundBlur', properties.image_filterBlur.value);
            }
            // 透视效果
            if (properties.image_perspective) {
                wallpaper.slider('set', 'perspective', properties.image_perspective.value * 100);
            }
            // 平面宽度(%)
            if (properties.image_width) {
                wallpaper.slider('set', 'width', properties.image_width.value / 100);
            }
            // 平面高度(%)
            if (properties.image_height) {
                wallpaper.slider('set', 'height', properties.image_height.value / 100);
            }
            // 背景3D旋转
            if (properties.image_isRotate3D){
                wallpaper.slider('set', 'isRotate3D', properties.image_isRotate3D.value);
            }
            // 角度大小
            if (properties.image_degSize) {
                wallpaper.slider('set', 'degSize', properties.image_degSize.value);
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
            // 音频循环
            if (properties.audio_isLoop) {
                audio.isLoop = properties.audio_isLoop.value;
                wallpaper.slider('set', 'isAudioLoop', audio.isLoop);
            }
            // 音频音量
            if (properties.audio_volume) {
                audio.volume = properties.audio_volume.value / 100;
                wallpaper.slider('set', 'audioVolume', audio.volume);
            }

            // 音频设置
            //-----------------------------------------------------------

            // 音频振幅
            if (properties.audioData_amplitude) {
                wallpaper.visualizerCircle('set', 'amplitude', properties.audioData_amplitude.value)
                    .visualizerBars('set', 'amplitude', properties.audioData_amplitude.value);
            }
            // 音频衰弱
            if (properties.audioData_decline) {
                wallpaper.visualizerCircle('set', 'decline', properties.audioData_decline.value / 100)
                    .visualizerBars('set', 'decline', properties.audioData_decline.value / 100);
            }
            // 音频峰值
            if (properties.audioData_peak) {
                wallpaper.visualizerCircle('set', 'peak', properties.audioData_peak.value / 10)
                    .visualizerBars('set', 'peak', properties.audioData_peak.value / 10);
            }

            // 圆环设置
            //-----------------------------------------------------------

            // # 颜色参数
            //-----------

            // 圆环和小球颜色模式
            if (properties.circle_colorMode) {
                circle.colorMode = setColorMode(properties.circle_colorMode.value);
                wallpaper.visualizerCircle('set', 'colorMode', circle.colorMode);
                // 初始化对应颜色环境
                switch (circle.colorMode) {
                    case 'monochrome':
                        wallpaper.visualizerCircle('set', 'color', circle.color)
                            .visualizerCircle('set', 'shadowColor', circle.shadowColor)
                            .visualizerCircle('set', 'shadowBlur', circle.shadowBlur);
                        break;
                    case 'colorTransformation':
                        wallpaper.visualizerCircle('set', 'shadowBlur', circle.shadowBlur);
                        break;
                    case 'rainBow':
                        // 彩虹模式下关闭阴影效果
                        wallpaper.visualizerCircle('set', 'shadowBlur', 0);
                        break;
                    // no default
                }
            }
            // 圆环和小球颜色
            if (properties.circle_color) {
                circle.color = getColor(properties.circle_color.value);
                wallpaper.visualizerCircle('set', 'color', circle.color);
            }
            // 圆环和小球阴影颜色
            if (properties.circle_shadowColor) {
                circle.shadowColor = getColor(properties.circle_shadowColor.value);
                wallpaper.visualizerCircle('set', 'shadowColor', circle.shadowColor);
            }
            // 圆环和小球阴影程度
            if (properties.circle_shadowBlur) {
                circle.shadowBlur = properties.circle_shadowBlur.value;
                if (circle.colorMode !== 'rainBow') {
                    wallpaper.visualizerCircle('set', 'shadowBlur', circle.shadowBlur);
                } else {
                    // 彩虹模式下关闭阴影效果
                    wallpaper.visualizerCircle('set', 'shadowBlur', 0);
                }
            }
            // 圆环和小球阴影叠加
            if (properties.circle_shadowOverlay) {
                wallpaper.visualizerCircle('set', 'shadowOverlay', properties.circle_shadowOverlay.value);
            }

            // # 颜色变换参数
            //---------------

            // 圆环和小球随机颜色
            if (properties.circle_isRandomColor) {
                circle.isRandomColor = properties.circle_isRandomColor.value;
                wallpaper.visualizerCircle('set', 'isRandomColor', circle.isRandomColor);
            }
            // 圆环和小球开始颜色
            if (properties.circle_firstColor) {
                circle.firstColor = getColor(properties.circle_firstColor.value);
                wallpaper.visualizerCircle('set', 'firstColor', circle.firstColor);
            }
            // 圆环和小球结束颜色
            if (properties.circle_secondColor) {
                circle.secondColor = getColor(properties.circle_secondColor.value);
                wallpaper.visualizerCircle('set', 'secondColor', circle.secondColor);
            }

            // # 彩虹渐变参数
            //---------------

            // 圆环和小球色相范围
            if (properties.circle_hueRange) {
                circle.hueRange = properties.circle_hueRange.value;
                wallpaper.visualizerCircle('set', 'hueRange', circle.hueRange);
            }
            // 圆环和小球饱和度范围(%)
            if (properties.circle_saturationRange) {
                circle.saturationRange = properties.circle_saturationRange.value;
                wallpaper.visualizerCircle('set', 'saturationRange', circle.saturationRange);
            }
            // 圆环和小球亮度范围(%)
            if (properties.circle_lightnessRange) {
                circle.lightnessRange = properties.circle_lightnessRange.value;
                wallpaper.visualizerCircle('set', 'lightnessRange', circle.lightnessRange);
            }
            // 圆环和小球渐变效果偏移
            if (properties.circle_gradientOffset) {
                circle.gradientOffset = properties.circle_gradientOffset.value;
                wallpaper.visualizerCircle('set', 'gradientOffset', circle.gradientOffset);
            }

            // # 圆环参数
            //-----------

            // 显示圆环
            if (properties.circle_isRing) {
                wallpaper.visualizerCircle('set', 'isRing', properties.circle_isRing.value);
            }
            // 显示静态环
            if (properties.circle_isStaticRing) {
                wallpaper.visualizerCircle('set', 'isStaticRing', properties.circle_isStaticRing.value);
            }
            // 显示内环
            if (properties.circle_isInnerRing) {
                wallpaper.visualizerCircle('set', 'isInnerRing', properties.circle_isInnerRing.value);
            }
            // 显示外环
            if (properties.circle_isOuterRing) {
                wallpaper.visualizerCircle('set', 'isOuterRing', properties.circle_isOuterRing.value);
            }
            // 是否连线
            if (properties.circle_isLineTo) {
                wallpaper.visualizerCircle('set', 'isLineTo', properties.circle_isLineTo.value);
            }
            // 连线方向
            if (properties.circle_lineDirection) {
                wallpaper.visualizerCircle('set', 'lineDirection', setRing(properties.circle_lineDirection.value));
            }
            // 波浪模式
            if (properties.circle_isWave) {
                wallpaper.visualizerCircle('set', 'isWave', properties.circle_isWave.value);
            }
            // 波浪方向
            if (properties.circle_waveDirection) {
                wallpaper.visualizerCircle('set', 'waveDirection', setRing(properties.circle_waveDirection.value));
            }
            // 静默特效
            if (properties.circle_isSilenceEffect) {
                wallpaper.visualizerCircle('set', 'isSilenceEffect', properties.circle_isSilenceEffect.value);
            }
            // 呼吸频率
            if (properties.circle_respiratoryRate) {
                wallpaper.visualizerCircle('set', 'respiratoryRate', properties.circle_respiratoryRate.value / 10000);
            }
            // 波振幅
            if (properties.circle_waveAmplitude) {
                wallpaper.visualizerCircle('set', 'waveAmplitude', properties.circle_waveAmplitude.value / 100);
            }
            // 群速度
            if (properties.circle_groupVelocity) {
                wallpaper.visualizerCircle('set', 'groupVelocity', properties.circle_groupVelocity.value);
            }

            // # 基础参数
            //-----------

            // 圆环和小球不透明度
            if (properties.circle_opacity) {
                wallpaper.visualizerCircle('set', 'opacity', properties.circle_opacity.value / 100);
            }
            // 圆环半径
            if (properties.circle_radius) {
                wallpaper.visualizerCircle('set', 'radius', properties.circle_radius.value / 10);
            }
            // 圆环点数
            if (properties.circle_pointNum) {
                wallpaper.visualizerCircle('set', 'pointNum', properties.circle_pointNum.value);
            }
            // 内环距离
            if (properties.circle_innerDistance) {
                wallpaper.visualizerCircle('set', 'innerDistance', properties.circle_innerDistance.value);
            }
            // 外环距离
            if (properties.circle_outerDistance) {
                wallpaper.visualizerCircle('set', 'outerDistance', properties.circle_outerDistance.value);
            }
            // 线条粗细
            if (properties.circle_lineWidth) {
                wallpaper.visualizerCircle('set', 'lineWidth', properties.circle_lineWidth.value);
            }
            // 线交汇样式
            if (properties.circle_lineJoin) {
                wallpaper.visualizerCircle('set', 'lineJoin', setLineJoin(properties.circle_lineJoin.value));
            }
            // 圆环旋转
            if (properties.circle_ringRotation) {
                wallpaper.visualizerCircle('set', 'ringRotation', properties.circle_ringRotation.value);
            }
            // 重绘间隔
            if (properties.circle_milliSec) {
                circle.redraw = properties.circle_milliSec.value;
                wallpaper.visualizerCircle('set', 'milliSec', circle.redraw);
                if (circle.redraw === 30) {
                    wallpaper.visualizerCircle('stopVisualizerCircleTimer');
                } else {
                    wallpaper.visualizerCircle('runVisualizerCircleTimer');
                }
            }

            // # 小球参数
            //-----------

            // 显示小球
            if (properties.circle_isBall) {
                wallpaper.visualizerCircle('set', 'isBall', properties.circle_isBall.value);
            }
            // 小球间隔
            if (properties.circle_ballSpacer) {
                wallpaper.visualizerCircle('set', 'ballSpacer', properties.circle_ballSpacer.value);
            }
            // 内环距离
            if (properties.circle_ballDistance) {
                wallpaper.visualizerCircle('set', 'ballDistance', properties.circle_ballDistance.value);
            }
            // 小球大小
            if (properties.circle_ballSize) {
                wallpaper.visualizerCircle('set', 'ballSize', properties.circle_ballSize.value);
            }
            // 小球方向
            if (properties.circle_ballDirection) {
                wallpaper.visualizerCircle('set', 'ballDirection', properties.circle_ballDirection.value);
            }
            // 绑定圆环旋转
            if (properties.circle_bindRingRotation) {
                wallpaper.visualizerCircle('set', 'bindRingRotation', properties.circle_bindRingRotation.value);
            }
            // 小球旋转
            if (properties.circle_ballRotation) {
                wallpaper.visualizerCircle('set', 'ballRotation', properties.circle_ballRotation.value);
            }

            // # 坐标参数
            //-----------

            // 圆环和小球绑定阴影颜色
            if (properties.circle_isChangeBlur) {
                circle.isChangeBlur = properties.circle_isChangeBlur.value;
                wallpaper.visualizerCircle('set', 'isChangeBlur', circle.isChangeBlur);
                // 若不绑定阴影颜色
                if (circle.isChangeBlur === false) {
                    wallpaper.visualizerCircle('set', 'shadowColor', circle.shadowColor);
                }

            }
            // 圆环和小球X轴偏移
            if (properties.circle_offsetX) {
                wallpaper.visualizerCircle('set', 'offsetX', properties.circle_offsetX.value / 100);
            }
            // 圆环和小球Y轴偏移
            if (properties.circle_offsetY) {
                wallpaper.visualizerCircle('set', 'offsetY', properties.circle_offsetY.value / 100);
            }
            // 圆环和小球鼠标坐标偏移
            if (properties.circle_isClickOffset) {
                wallpaper.visualizerCircle('set', 'isClickOffset', properties.circle_isClickOffset.value);
            }

            // # 变化参数
            //-----------

            // 显示蒙版
            if (properties.circle_isMasking) {
                wallpaper.visualizerCircle('set', 'isMasking', properties.circle_isMasking.value);
            }
            // 蒙版不透明度
            if (properties.circle_maskOpacity) {
                wallpaper.visualizerCircle('set', 'maskOpacity', properties.circle_maskOpacity.value / 100);
            }
            // 变换模式
            if (properties.circle_transformMode) {
                wallpaper.visualizerCircle('set', 'transformMode', setTransformMode(properties.circle_transformMode.value));
            }
            // 透视效果
            if (properties.circle_perspective) {
                wallpaper.visualizerCircle('set', 'perspective', properties.circle_perspective.value * 100);
            }
            // X轴变换(%)
            if (properties.circle_translateX) {
                wallpaper.visualizerCircle('set', 'translateX', properties.circle_translateX.value / 100);
            }
            // Y轴变换(%)
            if (properties.circle_translateY) {
                wallpaper.visualizerCircle('set', 'translateY', properties.circle_translateY.value / 100);
            }
            // 平面宽度(%)
            if (properties.circle_width) {
                wallpaper.visualizerCircle('set', 'width', properties.circle_width.value / 100);
            }
            // 平面高度(%)
            if (properties.circle_height) {
                wallpaper.visualizerCircle('set', 'height', properties.circle_height.value / 100);
            }
            // X轴倾斜转换
            if (properties.circle_skewX) {
                wallpaper.visualizerCircle('set', 'skewX', properties.circle_skewX.value);
            }
            // Y轴倾斜转换
            if (properties.circle_skewY) {
                wallpaper.visualizerCircle('set', 'skewY', properties.circle_skewY.value);
            }
            // X轴旋转转换
            if (properties.circle_rotateX) {
                wallpaper.visualizerCircle('set', 'rotateX', properties.circle_rotateX.value);
            }
            // Y轴旋转转换
            if (properties.circle_rotateY) {
                wallpaper.visualizerCircle('set', 'rotateY', properties.circle_rotateY.value);
            }
            // Z轴旋转转换
            if (properties.circle_rotateZ) {
                wallpaper.visualizerCircle('set', 'rotateZ', properties.circle_rotateZ.value);
            }
            // 3D转换
            if (properties.circle_isRotate3D) {
                wallpaper.visualizerCircle('set', 'isRotate3D', properties.circle_isRotate3D.value);
            }
            // 角度大小
            if (properties.circle_degSize) {
                wallpaper.visualizerCircle('set', 'degSize', properties.circle_degSize.value);
            }
            // 左上角X
            if (properties.circle_topLeftX) {
                wallpaper.visualizerCircle('set', 'topLeftX', properties.circle_topLeftX.value / 1000);
            }
            // 左上角Y
            if (properties.circle_topLeftY) {
                wallpaper.visualizerCircle('set', 'topLeftY', properties.circle_topLeftY.value / 1000);
            }
            // 右上角X
            if (properties.circle_topRightX) {
                wallpaper.visualizerCircle('set', 'topRightX', properties.circle_topRightX.value / 1000);
            }
            // 右上角Y
            if (properties.circle_topRightY) {
                wallpaper.visualizerCircle('set', 'topRightY', properties.circle_topRightY.value / 1000);
            }
            // 右下角X
            if (properties.circle_bottomRightX) {
                wallpaper.visualizerCircle('set', 'bottomRightX', properties.circle_bottomRightX.value / 1000);
            }
            // 右下角Y
            if (properties.circle_bottomRightY) {
                wallpaper.visualizerCircle('set', 'bottomRightY', properties.circle_bottomRightY.value / 1000);
            }
            // 左下角X
            if (properties.circle_bottomLeftX) {
                wallpaper.visualizerCircle('set', 'bottomLeftX', properties.circle_bottomLeftX.value / 1000);
            }
            // 左下角Y
            if (properties.circle_bottomLeftY) {
                wallpaper.visualizerCircle('set', 'bottomLeftY', properties.circle_bottomLeftY.value / 1000);
            }

            // 条形设置
            //-----------------------------------------------------------

            // # 条形参数
            //-----------

            // 显示线条
            if (properties.bars_isLineTo) {
                wallpaper.visualizerBars('set', 'isLineTo', properties.bars_isLineTo.value);
            }
            // 显示条形
            if (properties.bars_isBars) {
                wallpaper.visualizerBars('set', 'isBars', properties.bars_isBars.value);
            }
            // 条形方向
            if (properties.bars_barsDirection) {
                wallpaper.visualizerBars('set', 'barsDirection', setBarsDirection(properties.bars_barsDirection.value));
            }
            // 波浪模式
            if (properties.bars_isWave) {
                wallpaper.visualizerBars('set', 'isWave', properties.bars_isWave.value);
            }
            // 波浪方向
            if (properties.bars_waveDirection) {
                wallpaper.visualizerBars('set', 'waveDirection', setBarsDirection(properties.bars_waveDirection.value));
            }
            // 静默特效
            if (properties.bars_isSilenceEffect) {
                wallpaper.visualizerBars('set', 'isSilenceEffect', properties.bars_isSilenceEffect.value);
            }
            // 呼吸频率
            if (properties.bars_respiratoryRate) {
                wallpaper.visualizerBars('set', 'respiratoryRate', properties.bars_respiratoryRate.value / 10000);
            }
            // 波振幅
            if (properties.bars_waveAmplitude) {
                wallpaper.visualizerBars('set', 'waveAmplitude', properties.bars_waveAmplitude.value / 100);
            }
            // 群速度
            if (properties.bars_groupVelocity) {
                wallpaper.visualizerBars('set', 'groupVelocity', properties.bars_groupVelocity.value);
            }

            // # 颜色模式
            //---------------

            // 颜色模式
            if (properties.bars_colorMode) {
                bars.colorMode = setColorMode(properties.bars_colorMode.value);
                wallpaper.visualizerBars('set', 'colorMode', bars.colorMode);
                // 初始化对应颜色环境
                switch (bars.colorMode) {
                    case 'monochrome':
                        wallpaper.visualizerBars('set', 'color', bars.color)
                            .visualizerBars('set', 'shadowColor', bars.shadowColor)
                            .visualizerBars('set', 'shadowBlur', bars.shadowBlur);
                        break;
                    case 'colorTransformation':
                        wallpaper.visualizerBars('set', 'shadowBlur', bars.shadowBlur);
                        break;
                    case 'rainBow':
                        // 彩虹模式下关闭阴影效果
                        wallpaper.visualizerBars('set', 'shadowBlur', 0);
                        break;
                    // no default
                }
            }
            // 条形颜色
            if (properties.bars_color) {
                bars.color = getColor(properties.bars_color.value);
                wallpaper.visualizerBars('set', 'color', bars.color);
            }
            // 条形阴影颜色
            if (properties.bars_shadowColor) {
                bars.shadowColor = getColor(properties.bars_shadowColor.value);
                wallpaper.visualizerBars('set', 'shadowColor', bars.shadowColor);
            }
            // 条形阴影程度
            if (properties.bars_shadowBlur) {
                bars.shadowBlur = properties.bars_shadowBlur.value;
                if (bars.colorMode !== 'rainBow') {
                    wallpaper.visualizerBars('set', 'shadowBlur', bars.shadowBlur);
                } else {
                    // 彩虹模式下关闭阴影效果
                    wallpaper.visualizerBars('set', 'shadowBlur', 0);
                }
            }
            // 条形阴影叠加
            if (properties.bars_shadowOverlay) {
                wallpaper.visualizerBars('set', 'shadowOverlay', properties.bars_shadowOverlay.value);
            }
            // 条形随机颜色
            if (properties.bars_isRandomColor) {
                bars.isRandomColor = properties.bars_isRandomColor.value;
                wallpaper.visualizerBars('set', 'isRandomColor', bars.isRandomColor);
            }
            // 条形开始颜色
            if (properties.bars_firstColor) {
                bars.firstColor = getColor(properties.bars_firstColor.value);
                wallpaper.visualizerBars('set', 'firstColor', bars.firstColor);
            }
            // 条形结束颜色
            if (properties.bars_secondColor) {
                bars.secondColor = getColor(properties.bars_secondColor.value);
                wallpaper.visualizerBars('set', 'secondColor', bars.secondColor);
            }
            // 条形绑定阴影颜色
            if (properties.bars_isChangeBlur) {
                bars.isChangeBlur = properties.bars_isChangeBlur.value;
                wallpaper.visualizerBars('set', 'isChangeBlur', bars.isChangeBlur);
                // 若不绑定阴影颜色
                if (!bars.isChangeBlur) {
                    wallpaper.visualizerBars('set', 'shadowColor', bars.shadowColor);
                }
            }
            // 条形色相范围
            if (properties.bars_hueRange) {
                bars.hueRange = properties.bars_hueRange.value;
                wallpaper.visualizerBars('set', 'hueRange', bars.hueRange);
            }
            // 条形饱和度范围(%)
            if (properties.bars_saturationRange) {
                bars.saturationRange = properties.bars_saturationRange.value;
                wallpaper.visualizerBars('set', 'saturationRange', bars.saturationRange);
            }
            // 条形亮度范围(%)
            if (properties.bars_lightnessRange) {
                bars.lightnessRange = properties.bars_lightnessRange.value;
                wallpaper.visualizerBars('set', 'lightnessRange', bars.lightnessRange);
            }
            // 条形渐变效果偏移
            if (properties.bars_gradientOffset) {
                bars.gradientOffset = properties.bars_gradientOffset.value;
                wallpaper.visualizerBars('set', 'gradientOffset', bars.gradientOffset);
            }

            // # 基础参数
            //-----------

            // 条形不透明度
            if (properties.bars_opacity) {
                wallpaper.visualizerBars('set', 'opacity', properties.bars_opacity.value / 100);
            }
            // 基础宽度
            if (properties.bars_barsWidth) {
                wallpaper.visualizerBars('set', 'barsWidth', properties.bars_barsWidth.value / 10);
            }
            // 基础高度
            if (properties.bars_barsHeight) {
                wallpaper.visualizerBars('set', 'barsHeight', properties.bars_barsHeight.value);
            }
            // 点的数量
            if (properties.bars_pointNum) {
                wallpaper.visualizerBars('set', 'pointNum', properties.bars_pointNum.value);
            }
            // 线条粗细
            if (properties.bars_lineWidth) {
                wallpaper.visualizerBars('set', 'lineWidth', properties.bars_lineWidth.value);
            }
            // 线交汇样式
            if (properties.bars_lineJoin) {
                wallpaper.visualizerBars('set', 'lineJoin', setLineJoin(properties.bars_lineJoin.value));
            }
            // 旋转角度
            if (properties.bars_barsRotation) {
                wallpaper.visualizerBars('set', 'barsRotation', properties.bars_barsRotation.value);
            }
            // 重绘间隔
            if (properties.bars_milliSec) {
                bars.redraw = properties.bars_milliSec.value;
                wallpaper.visualizerBars('set', 'milliSec', bars.redraw);
                if (bars.redraw === 30) {
                    wallpaper.visualizerBars('stopVisualizerBarsTimer');
                } else {
                    wallpaper.visualizerBars('runVisualizerBarsTimer');
                }
            }

            // # 坐标参数
            //-----------

            // 条形X轴偏移
            if (properties.bars_offsetX) {
                wallpaper.visualizerBars('set', 'offsetX', properties.bars_offsetX.value / 100);
            }
            // 条形Y轴偏移
            if (properties.bars_offsetY) {
                wallpaper.visualizerBars('set', 'offsetY', properties.bars_offsetY.value / 100);
            }
            // 条形鼠标坐标偏移
            if (properties.bars_isClickOffset) {
                wallpaper.visualizerBars('set', 'isClickOffset', properties.bars_isClickOffset.value);
            }

            // # 变化参数
            //-----------

            // 显示蒙版
            if (properties.bars_isMasking) {
                wallpaper.visualizerBars('set', 'isMasking', properties.bars_isMasking.value);
            }
            // 蒙版不透明度
            if (properties.bars_maskOpacity) {
                wallpaper.visualizerBars('set', 'maskOpacity', properties.bars_maskOpacity.value / 100);
            }
            // 变换模式
            if (properties.bars_transformMode) {
                wallpaper.visualizerBars('set', 'transformMode', setTransformMode(properties.bars_transformMode.value));
            }
            // 透视效果
            if (properties.bars_perspective) {
                wallpaper.visualizerBars('set', 'perspective', properties.bars_perspective.value * 100);
            }
            // X轴变换(%)
            if (properties.bars_translateX) {
                wallpaper.visualizerBars('set', 'translateX', properties.bars_translateX.value / 100);
            }
            // Y轴变换(%)
            if (properties.bars_translateY) {
                wallpaper.visualizerBars('set', 'translateY', properties.bars_translateY.value / 100);
            }
            // 平面宽度(%)
            if (properties.bars_width) {
                wallpaper.visualizerBars('set', 'width', properties.bars_width.value / 100);
            }
            // 平面高度(%)
            if (properties.bars_height) {
                wallpaper.visualizerBars('set', 'height', properties.bars_height.value / 100);
            }
            // X轴倾斜转换
            if (properties.bars_skewX) {
                wallpaper.visualizerBars('set', 'skewX', properties.bars_skewX.value);
            }
            // Y轴倾斜转换
            if (properties.bars_skewY) {
                wallpaper.visualizerBars('set', 'skewY', properties.bars_skewY.value);
            }
            // X轴旋转转换
            if (properties.bars_rotateX) {
                wallpaper.visualizerBars('set', 'rotateX', properties.bars_rotateX.value);
            }
            // Y轴旋转转换
            if (properties.bars_rotateY) {
                wallpaper.visualizerBars('set', 'rotateY', properties.bars_rotateY.value);
            }
            // Z轴旋转转换
            if (properties.bars_rotateZ) {
                wallpaper.visualizerBars('set', 'rotateZ', properties.bars_rotateZ.value);
            }
            // 3D转换
            if (properties.bars_isRotate3D) {
                wallpaper.visualizerBars('set', 'isRotate3D', properties.bars_isRotate3D.value);
            }
            // 角度大小
            if (properties.bars_degSize) {
                wallpaper.visualizerBars('set', 'degSize', properties.bars_degSize.value);
            }
            // 左上角X
            if (properties.bars_topLeftX) {
                wallpaper.visualizerBars('set', 'topLeftX', properties.bars_topLeftX.value / 1000);
            }
            // 左上角Y
            if (properties.bars_topLeftY) {
                wallpaper.visualizerBars('set', 'topLeftY', properties.bars_topLeftY.value / 1000);
            }
            // 右上角X
            if (properties.bars_topRightX) {
                wallpaper.visualizerBars('set', 'topRightX', properties.bars_topRightX.value / 1000);
            }
            // 右上角Y
            if (properties.bars_topRightY) {
                wallpaper.visualizerBars('set', 'topRightY', properties.bars_topRightY.value / 1000);
            }
            // 右下角X
            if (properties.bars_bottomRightX) {
                wallpaper.visualizerBars('set', 'bottomRightX', properties.bars_bottomRightX.value / 1000);
            }
            // 右下角Y
            if (properties.bars_bottomRightY) {
                wallpaper.visualizerBars('set', 'bottomRightY', properties.bars_bottomRightY.value / 1000);
            }
            // 左下角X
            if (properties.bars_bottomLeftX) {
                wallpaper.visualizerBars('set', 'bottomLeftX', properties.bars_bottomLeftX.value / 1000);
            }
            // 左下角Y
            if (properties.bars_bottomLeftY) {
                wallpaper.visualizerBars('set', 'bottomLeftY', properties.bars_bottomLeftY.value / 1000);
            }

            // Logo设置
            //-----------------------------------------------------------

            // # 基础参数
            //-----------

            // 显示标志
            if (properties.logo_isLogo) {
                wallpaper.logo('set', 'isLogo', properties.logo_isLogo.value);
            }
            // 标志文件
            if (properties.logo_image) {
                if (properties.logo_image.value) {
                    wallpaper.logo('setUserImg', properties.logo_image.value);
                } else {
                    wallpaper.logo('setUserImg', '');
                }
            }
            // 圆形标志
            if (properties.logo_isCircular) {
                wallpaper.logo('set', 'isCircular', properties.logo_isCircular.value);
            }
            // 标志不透明度
            if (properties.logo_opacity) {
                wallpaper.logo('set', 'opacity', properties.logo_opacity.value / 100);
            }
            // 圆形描边开关
            if (properties.logo_isStroke) {
                wallpaper.logo('set', 'isStroke', properties.logo_isStroke.value);
            }
            // 圆形描边颜色
            if (properties.logo_strokeColor) {
                wallpaper.logo('set', 'strokeColor', getColor(properties.logo_strokeColor.value));
            }
            // 圆形描边宽度
            if (properties.logo_lineWidth) {
                wallpaper.logo('set', 'lineWidth', properties.logo_lineWidth.value);
            }
            // 圆形虚线描边
            if (properties.logo_dottedLine) {
                wallpaper.logo('set', 'dottedLine', properties.logo_dottedLine.value);
            }
            // 标志阴影颜色
            if (properties.logo_shadowColor) {
                wallpaper.logo('set', 'shadowColor', getColor(properties.logo_shadowColor.value));
            }
            // 标志阴影颜色
            if (properties.logo_shadowBlur) {
                wallpaper.logo('set', 'shadowBlur', properties.logo_shadowBlur.value);
            }

            // # 标志参数
            //-----------

            // 比例缩放
            if (properties.logo_zoom) {
                wallpaper.logo('set', 'zoom', properties.logo_zoom.value / 100);
            }
            // 比例缩放跟随音频
            if (properties.logo_isZoomFollow) {
                wallpaper.logo('set', 'isZoomFollow', properties.logo_isZoomFollow.value);
            }
            // 比例缩放速率
            if (properties.logo_zoomRate) {
                wallpaper.logo('set', 'zoomRate', properties.logo_zoomRate.value / 10);
            }
            // 宽度比例
            if (properties.logo_widthRatio) {
                wallpaper.logo('set', 'widthRatio', properties.logo_widthRatio.value / 100);
            }
            // 高度比例
            if (properties.logo_heightRatio) {
                wallpaper.logo('set', 'heightRatio', properties.logo_heightRatio.value / 100);
            }
            // 初始角度
            if (properties.logo_initialAngle) {
                wallpaper.logo('set', 'initialAngle', properties.logo_initialAngle.value);
            }
            // 旋转Logo
            if (properties.logo_isRotation) {
                wallpaper.logo('set', 'isRotation', properties.logo_isRotation.value);
            }
            // 旋转速度
            if (properties.logo_rotationAngle) {
                wallpaper.logo('set', 'rotationAngle', properties.logo_rotationAngle.value / 100);
            }
            // 重绘间隔
            if (properties.logo_milliSec) {
                wallpaper.logo('set', 'milliSec', properties.logo_milliSec.value);
            }


            // # 滤镜参数
            //-----------

            // 模糊
            if (properties.logo_blur) {
                wallpaper.logo('set', 'blur', properties.logo_blur.value);
            }
            // 亮度
            if (properties.logo_brightness) {
                wallpaper.logo('set', 'brightness', properties.logo_brightness.value);
            }
            // 对比度
            if (properties.logo_contrast) {
                wallpaper.logo('set', 'contrast', properties.logo_contrast.value);
            }
            // 灰度
            if (properties.logo_grayScale) {
                wallpaper.logo('set', 'grayScale', properties.logo_grayScale.value);
            }
            // 色相翻转
            if (properties.logo_hueRotate) {
                wallpaper.logo('set', 'hueRotate', properties.logo_hueRotate.value);
            }
            // 反相
            if (properties.logo_invert) {
                wallpaper.logo('set', 'invert', properties.logo_invert.value);
            }
            // 饱和度
            if (properties.logo_saturate) {
                wallpaper.logo('set', 'saturate', properties.logo_saturate.value);
            }
            // 深褐色
            if (properties.logo_sepia) {
                wallpaper.logo('set', 'sepia', properties.logo_sepia.value);
            }

            // # 混合选项
            //-----------

            // 混合选项
            if (properties.logo_mixBlendMode) {
                wallpaper.logo('set', 'mixBlendMode', setMixBlendMode(properties.logo_mixBlendMode.value));
            }

            // # 坐标参数
            //-----------

            // 标志X轴偏移
            if (properties.logo_offsetX) {
                wallpaper.logo('set', 'offsetX', properties.logo_offsetX.value / 100);
            }
            // 标志Y轴偏移
            if (properties.logo_offsetY) {
                wallpaper.logo('set', 'offsetY', properties.logo_offsetY.value / 100);
            }
            // 标志鼠标坐标偏移
            if (properties.logo_isClickOffset) {
                wallpaper.logo('set', 'isClickOffset', properties.logo_isClickOffset.value);
            }

            // # 变化参数
            //-----------

            // 蒙版不透明度
            if (properties.logo_maskOpacity) {
                wallpaper.logo('set', 'maskOpacity', properties.logo_maskOpacity.value / 100);
            }
            // 变换模式
            if (properties.logo_transformMode) {
                wallpaper.logo('set', 'transformMode', setTransformMode(properties.logo_transformMode.value));
            }
            // 透视效果
            if (properties.logo_perspective) {
                wallpaper.logo('set', 'perspective', properties.logo_perspective.value * 100);
            }
            // X轴变换(%)
            if (properties.logo_translateX) {
                wallpaper.logo('set', 'translateX', properties.logo_translateX.value / 100);
            }
            // Y轴变换(%)
            if (properties.logo_translateY) {
                wallpaper.logo('set', 'translateY', properties.logo_translateY.value / 100);
            }
            // 平面宽度(%)
            if (properties.logo_width) {
                wallpaper.logo('set', 'width', properties.logo_width.value / 100);
            }
            // 平面高度(%)
            if (properties.logo_height) {
                wallpaper.logo('set', 'height', properties.logo_height.value / 100);
            }
            // 显示蒙版
            if (properties.logo_isMasking) {
                wallpaper.logo('set', 'isMasking', properties.logo_isMasking.value);
            }
            // X轴倾斜转换
            if (properties.logo_skewX) {
                wallpaper.logo('set', 'skewX', properties.logo_skewX.value);
            }
            // Y轴倾斜转换
            if (properties.logo_skewY) {
                wallpaper.logo('set', 'skewY', properties.logo_skewY.value);
            }
            // X轴旋转转换
            if (properties.logo_rotateX) {
                wallpaper.logo('set', 'rotateX', properties.logo_rotateX.value);
            }
            // Y轴旋转转换
            if (properties.logo_rotateY) {
                wallpaper.logo('set', 'rotateY', properties.logo_rotateY.value);
            }
            // Z轴旋转转换
            if (properties.logo_rotateZ) {
                wallpaper.logo('set', 'rotateZ', properties.logo_rotateZ.value);
            }
            // 3D转换
            if (properties.logo_isRotate3D) {
                wallpaper.logo('set', 'isRotate3D', properties.logo_isRotate3D.value);
            }
            // 角度大小
            if (properties.logo_degSize) {
                wallpaper.logo('set', 'degSize', properties.logo_degSize.value);
            }
            // 左上角X
            if (properties.logo_topLeftX) {
                wallpaper.logo('set', 'topLeftX', properties.logo_topLeftX.value / 1000);
            }
            // 左上角Y
            if (properties.logo_topLeftY) {
                wallpaper.logo('set', 'topLeftY', properties.logo_topLeftY.value / 1000);
            }
            // 右上角X
            if (properties.logo_topRightX) {
                wallpaper.logo('set', 'topRightX', properties.logo_topRightX.value / 1000);
            }
            // 右上角Y
            if (properties.logo_topRightY) {
                wallpaper.logo('set', 'topRightY', properties.logo_topRightY.value / 1000);
            }
            // 右下角X
            if (properties.logo_bottomRightX) {
                wallpaper.logo('set', 'bottomRightX', properties.logo_bottomRightX.value / 1000);
            }
            // 右下角Y
            if (properties.logo_bottomRightY) {
                wallpaper.logo('set', 'bottomRightY', properties.logo_bottomRightY.value / 1000);
            }
            // 左下角X
            if (properties.logo_bottomLeftX) {
                wallpaper.logo('set', 'bottomLeftX', properties.logo_bottomLeftX.value / 1000);
            }
            // 左下角Y
            if (properties.logo_bottomLeftY) {
                wallpaper.logo('set', 'bottomLeftY', properties.logo_bottomLeftY.value / 1000);
            }

            // 时间日期参数
            //-----------------------------------------------------------


            // # 日期参数
            //-----------

            // 显示日期
            if (properties.date_isDate) {
                wallpaper.time('set', 'isDate', properties.date_isDate.value);
                if (properties.date_isDate.value) {
                    wallpaper.time('runDateTimer');
                } else {
                    wallpaper.time('stopDateTimer');
                }
            }
            // 描边
            if (properties.date_isStroke) {
                wallpaper.time('set', 'isStroke', properties.date_isStroke.value);
            }
            // 描边宽度
            if (properties.date_lineWidth) {
                wallpaper.time('set', 'lineWidth', properties.date_lineWidth.value);
            }
            // 填充
            if (properties.date_isFill) {
                wallpaper.time('set', 'isFill', properties.date_isFill.value);
            }

            // # 颜色参数
            //-----------

            // 日期颜色模式
            if (properties.date_colorMode) {
                date.colorMode = setColorMode(properties.date_colorMode.value);
                wallpaper.time('set', 'colorMode', date.colorMode);
                if (date.colorMode === 'monochrome') {
                    // 初始化单颜色环境
                    wallpaper.time('set', 'color', date.color)
                        .time('set', 'shadowColor', date.shadowColor);
                }
            }
            // 日期颜色
            if (properties.date_color) {
                date.color = getColor(properties.date_color.value);
                wallpaper.time('set', 'color', date.color);
            }
            // 日期阴影颜色
            if (properties.date_shadowColor) {
                date.shadowColor = getColor(properties.date_shadowColor.value);
                wallpaper.time('set', 'shadowColor', date.shadowColor);
            }
            // 日期阴影程度
            if (properties.date_shadowBlur) {
                date.shadowBlur = properties.date_shadowBlur.value;
                wallpaper.time('set', 'shadowBlur', date.shadowBlur);
            }
            // 日期阴影叠加
            if (properties.date_shadowOverlay) {
                wallpaper.time('set', 'shadowOverlay', properties.date_shadowOverlay.value);
            }
            // 日期随机颜色
            if (properties.date_isRandomColor) {
                date.isRandomColor = properties.date_isRandomColor.value;
                wallpaper.time('set', 'isRandomColor', date.isRandomColor);
            }
            // 日期开始颜色
            if (properties.date_firstColor) {
                date.firstColor = getColor(properties.date_firstColor.value);
                wallpaper.time('set', 'firstColor', date.firstColor);
            }
            // 日期结束颜色
            if (properties.date_secondColor) {
                date.secondColor = getColor(properties.date_secondColor.value);
                wallpaper.time('set', 'secondColor', date.secondColor);
            }
            // 日期绑定阴影颜色
            if (properties.date_isChangeBlur) {
                date.isChangeBlur = properties.date_isChangeBlur.value;
                wallpaper.time('set', 'isChangeBlur', date.isChangeBlur);
                // 若没有绑定阴影颜色
                if (!date.isChangeBlur) {
                    wallpaper.time('set', 'shadowColor', date.shadowColor);
                }
            }

            // # 基础参数
            //-----------

            // 日期不透明度
            if (properties.date_opacity) {
                wallpaper.time('set', 'opacity', properties.date_opacity.value / 100);
            }
            // 设置语言
            if (properties.date_language) {
                wallpaper.time('set', 'language', setDateLang(properties.date_language.value));
            }
            // 时间样式
            if (properties.date_timeStyle) {
                wallpaper.time('set', 'timeStyle', setTimeStyle(properties.date_timeStyle.value));
            }
            // 日期样式
            if (properties.date_dateStyle) {
                wallpaper.time('set', 'dateStyle', setDateStyle(properties.date_dateStyle.value));
                // 天气计时器开关
                if (properties.date_dateStyle === 8) {
                    wallpaper.time('runWeatherTimer');
                } else {
                    wallpaper.time('stopWeatherTimer');
                }
            }
            // 格式化
            if (properties.date_isFormat) {
                wallpaper.time('set', 'isFormat', properties.date_isFormat.value);
            }
            // 自定义时间样式
            if (properties.date_userTimeStyle) {
                wallpaper.time('set', 'userTimeStyle', properties.date_userTimeStyle.value);
            }
            // 自定义日期样式
            if (properties.date_userDateStyle) {
                wallpaper.time('set', 'userDateStyle', properties.date_userDateStyle.value);
                // 天气计时器开关
                if (properties.date_dateStyle === 8) {
                    wallpaper.time('runWeatherTimer');
                } else {
                    wallpaper.time('stopWeatherTimer');
                }
            }
            // 字体风格
            if (properties.date_fontFamily) {
                wallpaper.time('set', 'fontFamily', setFontFamily(properties.date_fontFamily.value));
            }
            // 自定义字体风格
            if (properties.date_userFontFamily) {
                if (properties.date_userFontFamily.value) {
                    wallpaper.time('set', 'fontFamily', setFontFamily(properties.date_userFontFamily.value));
                }
            }
            // 时间字体大小
            if (properties.date_timeFontSize) {
                wallpaper.time('set', 'timeFontSize', properties.date_timeFontSize.value);
            }
            // 日期字体大小
            if (properties.date_dateFontSize) {
                wallpaper.time('set', 'dateFontSize', properties.date_dateFontSize.value);
            }
            // 时间和日期之间距离
            if (properties.date_distance) {
                wallpaper.time('set', 'distance', properties.date_distance.value);
            }

            // # 天气参数
            //-----------

            // 天气接口提供者
            if (properties.date_weatherProvider) {
                date.weatherProvider = setWeatherProvider(properties.date_weatherProvider.value);
                wallpaper.time('set', 'weatherProvider', date.weatherProvider);
            }
            // 中国天气城市
            if (properties.date_city) {
                date.city = properties.date_city.value;
                wallpaper.time('set', 'currentCity', date.city);
            }

            // # 坐标参数
            //-----------

            // 日期X轴偏移
            if (properties.date_offsetX) {
                wallpaper.time('set', 'offsetX', properties.date_offsetX.value / 100);
            }
            // 日期Y轴偏移
            if (properties.date_offsetY) {
                wallpaper.time('set', 'offsetY', properties.date_offsetY.value / 100);
            }
            // 日期鼠标坐标偏移
            if (properties.date_isClickOffset) {
                wallpaper.time('set', 'isClickOffset', properties.date_isClickOffset.value);
            }

            // # 变化参数
            //-----------

            // 显示蒙版
            if (properties.date_isMasking) {
                wallpaper.time('set', 'isMasking', properties.date_isMasking.value);
            }
            // 蒙版不透明度
            if (properties.date_maskOpacity) {
                wallpaper.time('set', 'maskOpacity', properties.date_maskOpacity.value / 100);
            }
            // 变换模式
            if (properties.date_transformMode) {
                wallpaper.time('set', 'transformMode', setTransformMode(properties.date_transformMode.value));
            }
            // 透视效果
            if (properties.date_perspective) {
                wallpaper.time('set', 'perspective', properties.date_perspective.value * 100);
            }
            // X轴变换(%)
            if (properties.date_translateX) {
                wallpaper.time('set', 'translateX', properties.date_translateX.value / 100);
            }
            // Y轴变换(%)
            if (properties.date_translateY) {
                wallpaper.time('set', 'translateY', properties.date_translateY.value / 100);
            }
            // 平面宽度(%)
            if (properties.date_width) {
                wallpaper.time('set', 'width', properties.date_width.value / 100);
            }
            // 平面高度(%)
            if (properties.date_height) {
                wallpaper.time('set', 'height', properties.date_height.value / 100);
            }
            // X轴倾斜转换
            if (properties.date_skewX) {
                wallpaper.time('set', 'skewX', properties.date_skewX.value);
            }
            // Y轴倾斜转换
            if (properties.date_skewY) {
                wallpaper.time('set', 'skewY', properties.date_skewY.value);
            }
            // X轴旋转转换
            if (properties.date_rotateX) {
                wallpaper.time('set', 'rotateX', properties.date_rotateX.value);
            }
            // Y轴旋转转换
            if (properties.date_rotateY) {
                wallpaper.time('set', 'rotateY', properties.date_rotateY.value);
            }
            // Z轴旋转转换
            if (properties.date_rotateZ) {
                wallpaper.time('set', 'rotateZ', properties.date_rotateZ.value);
            }
            // 3D转换
            if (properties.date_isRotate3D) {
                wallpaper.time('set', 'isRotate3D', properties.date_isRotate3D.value);
            }
            // 角度大小
            if (properties.date_degSize) {
                wallpaper.time('set', 'degSize', properties.date_degSize.value);
            }
            // 左上角X
            if (properties.date_topLeftX) {
                wallpaper.time('set', 'topLeftX', properties.date_topLeftX.value / 1000);
            }
            // 左上角Y
            if (properties.date_topLeftY) {
                wallpaper.time('set', 'topLeftY', properties.date_topLeftY.value / 1000);
            }
            // 右上角X
            if (properties.date_topRightX) {
                wallpaper.time('set', 'topRightX', properties.date_topRightX.value / 1000);
            }
            // 右上角Y
            if (properties.date_topRightY) {
                wallpaper.time('set', 'topRightY', properties.date_topRightY.value / 1000);
            }
            // 右下角X
            if (properties.date_bottomRightX) {
                wallpaper.time('set', 'bottomRightX', properties.date_bottomRightX.value / 1000);
            }
            // 右下角Y
            if (properties.date_bottomRightY) {
                wallpaper.time('set', 'bottomRightY', properties.date_bottomRightY.value / 1000);
            }
            // 左下角X
            if (properties.date_bottomLeftX) {
                wallpaper.time('set', 'bottomLeftX', properties.date_bottomLeftX.value / 1000);
            }
            // 左下角Y
            if (properties.date_bottomLeftY) {
                wallpaper.time('set', 'bottomLeftY', properties.date_bottomLeftY.value / 1000);
            }

            // 粒子属性参数
            //-----------------------------------------------------------

            // # 基础参数
            //---------------

            // 显示粒子
            if (properties.particles_isParticles) {
                if (properties.particles_isParticles.value) {
                    wallpaper.particles('runParticlesTimer');
                } else {
                    wallpaper.particles('stopParticlesTimer')
                        .particles('clearCanvas');
                }
            }
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
            // 描边粒子
            if (properties.particles_isStroke) {
                wallpaper.particles('set', 'isStroke', properties.particles_isStroke.value);
            }
            // 粒子描边宽度
            if (properties.particles_lineWidth) {
                wallpaper.particles('set', 'lineWidth', properties.particles_lineWidth.value);
            }
            // 填充粒子
            if (properties.particles_isFill) {
                wallpaper.particles('set', 'isFill', properties.particles_isFill.value);
            }

            // # 颜色参数
            //---------------

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
            // 粒子阴影颜色
            if (properties.particles_shadowColor) {
                wallpaper.particles('set', 'shadowColor', getColor(properties.particles_shadowColor.value));
            }
            // 粒子阴影大小
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
            for (let i = 0; i < removedFiles.length; i++) {
                let index = files[propertyName].indexOf(removedFiles[i]);
                if (index >= 0) {
                    files[propertyName].splice(index, 1);
                }
            }
            wallpaper.slider('updateImgList', files[propertyName]);
        }

    };

})(jQuery, window, document, Math);