/**
 * 监视器区域
 * http://steamcommunity.com/sharedfiles/filedetails/?id=921617616&searchtext=
 * @author Alice
 */

;(function ($, window, document, Math, undefined) {

    'use strict';

    // 定义变量
    //--------------------------------------------------------------------------------------------------------------

    // 临时储存变量
    let sliderStyle = 1;           // 滑动样式
    let timeUnits = 'sec';         // 时间单位
    let files = {};                // 文件路径对象

    // 全局/局部配置
    let isGlobalSettings = true;
    let globalSettings = {
        // 全局参数
        opacity: 0.90,               // 不透明度
        color: '255,255,255',        // 颜色
        shadowColor: '255,255,255',  // 阴影颜色
        shadowBlur: 15,              // 模糊大小
        // 坐标参数
        offsetX: 0.5,                // X坐标偏移
        offsetY: 0.5,                // Y坐标偏移
        isClickOffset: false         // 鼠标坐标偏移
    };
    let audio = {
        // 全局参数
        opacity: 0.90,               // 不透明度
        color: '255,255,255',        // 颜色
        shadowColor: '255,255,255',  // 阴影颜色
        shadowBlur: 15,              // 模糊大小
        // 坐标参数
        offsetX: 0.5,                // X坐标偏移
        offsetY: 0.5,                // Y坐标偏移
        isClickOffset: false         // 鼠标坐标偏移
    };
    let date = {
        // 全局参数
        opacity: 0.90,               // 不透明度
        color: '255,255,255',        // 颜色
        shadowColor: '255,255,255',  // 阴影颜色
        shadowBlur: 15,              // 发光程度
        // 坐标参数
        offsetX: 0.5,                // X坐标偏移
        offsetY: 0.5,                // Y坐标偏移
        isClickOffset: false         // 鼠标坐标偏移
    };

    // 插件列表
    let wallpaper = $('body').audiovisualizer({}).date({}).particles({}).slider({});

    // 定义方法
    //--------------------------------------------------------------------------------------------------------------

    // 数字转换成标识字符串
    //-----------------------------------------------------------

    /**
     *  设置背景填充样式
     *
     *  @param  {int} n 背景填充样式对应值
     *  @return {string} 背景填充样式标识串
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
     *  设置背景切换模式
     *
     *  @param  {int} n 背景切换模式对应值
     *  @return {string} 背景切换模式标识串
     */
    function setSliderStyle(n) {
        switch (n) {
            case 1:
                return 'css';
            case 2:
                return 'image';
            case 3:
                return 'canvas';
        }
    }

    /**
     *  设置读取模式
     *
     *  @param  {int} n 背景切换模式对应值
     *  @return {string} 背景切换模式标识串
     */
    function setReadStyle(n) {
        switch (n) {
            case 1:
                return 'sequential';
            case 2:
                return 'random';
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
    function setIMGFitStyle(n) {
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
                timeUnits = 'sec';
                break;
            case 2:
                timeUnits = 'min';
                break;
            case 3:
                timeUnits = 'hour';
                break;
            default:
                timeUnits = 'sec';
        }
    }

    /**
     *  设置音频圆环
     *
     *  @param  {int} n 音频圆环对应值
     *  @return {string} 音频圆环标识串
     */
    function setPoint(n) {
        switch (n) {
            case 1:
                return 'staticRing';
            case 2:
                return 'innerRing';
            case 3:
                return 'outerRing';
        }
    }

    /**
     *  设置日期风格
     *
     *  @param  {int} n 日期风格对应值
     *  @return {string} 日期风格标识串
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
        }
    }

    /**
     *  设置日期风格
     *
     *  @param  {int} n 日期风格对应值
     *  @return {string} 日期风格标识串
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
        }
    }

    /**
     *  设置设置天气接口提供者
     *
     *  @param  {int} n 天气接口提供者对应值
     *  @return {string} 天气接口提供者标识串
     */
    function setWeatherProvider(n) {
        switch (n) {
            case 1:
                return 'heweather';
            case 2:
                return 'baidu';
            case 3:
                return 'sina';
        }
    }

    /**
     *  设置日期语言
     *
     *  @param  {int} n 日期语言对应值
     *  @return {string} 日期语言标识串
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
                return 'zh_cn';
        }
    }

    /**
     *  设置粒子类型
     *
     *  @param  {int} n 粒子类型对应值
     *  @return {string} 粒子类型标识串
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
        }
    }

    /**
     *  设置粒子方向
     *
     *  @param  {int} n 粒子方向对应值
     *  @return {string} 粒子方向标识串
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
        }
    }

    /**
     *  设置离屏模式
     *
     *  @param  {int} n 离屏模式对应值
     *  @return {string} 离屏模式标识串
     */
    function setMoveOutMode(n) {
        switch (n) {
            case 1:
                return 'out';
            case 2:
                return 'bounce';
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
        wallpaper.audiovisualizer('drawCanvas', audioArray);
        // wallpaper.audiovisualizer('updateAudioVisualizer', audioArray);
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

            // 背景参数
            //-----------------------------------------------------------

            // 背景颜色
            if (properties.image_BGColor) {
                let color = properties.image_BGColor.value.split(' ').map(function (c) {
                    return Math.ceil(c * 255);
                });
                wallpaper.css({
                    'background-image': 'none',
                    'background-color': 'rgb(' + color + ')'
                });
            }
            // 更换背景
            if (properties.image) {
                if (properties.image.value) {
                    wallpaper.slider('setUserImg', properties.image.value)
                        .slider('cssSrcUserImg');
                } else {
                    wallpaper.slider('setUserImg', '')
                        .slider('cssSrcDefaultImg');
                }
            }
            // 幻灯片模式
            if (properties.directory_isDirectory) {
                if (properties.directory_isDirectory.value) {
                    wallpaper.slider('setIsRun', true);
                    switch (sliderStyle) {
                        // css
                        case 1:
                            wallpaper.slider('clearCanvas')
                                .slider('delImg');
                            break;
                        // img
                        case 2:
                            wallpaper.slider('clearCanvas')
                                .slider('addImg');
                            break;
                        // canvas
                        case 3:
                            wallpaper.slider('delImg');
                            break;
                        default:
                            wallpaper.slider('clearCanvas')
                                .slider('delImg');
                    }
                    wallpaper.slider('startSlider')
                        .slider('changeSlider', setSliderStyle(sliderStyle));
                } else {
                    wallpaper.slider('setIsRun', false)
                        .slider('stopSlider')
                        .slider('clearCanvas')
                        .slider('delImg')
                        .slider('cssSrcUserImg');
                }
            }
            // 图片文件夹
            if (properties.directory) {
                if (properties.directory.value) {
                    wallpaper.slider('changeSlider', setSliderStyle(sliderStyle));
                } else {
                    wallpaper.slider('clearCanvas')
                        .slider('cssSrcUserImg')
                        .slider('imgSrcUserImg');
                }
            }
            // 滑动样式
            if (properties.directory_sliderStyle) {
                switch (properties.directory_sliderStyle.value) {
                    // css
                    case 1:
                        sliderStyle = 1;
                        wallpaper.slider('clearCanvas')
                            .slider('delImg');
                        break;
                    // img
                    case 2:
                        sliderStyle = 2;
                        wallpaper.slider('clearCanvas')
                            .slider('addImg');
                        break;
                    // canvas
                    case 3:
                        sliderStyle = 3;
                        wallpaper.slider('delImg');
                        break;
                    default:
                        sliderStyle = 1;
                        wallpaper.slider('clearCanvas')
                            .slider('delImg');
                }
                wallpaper.slider('set', 'sliderStyle', setSliderStyle(sliderStyle))
                    .slider('changeSlider', setSliderStyle(sliderStyle));
            }
            // 切换特效
            if (properties.directory_effect) {
                wallpaper.slider('set', 'effect', setEffect(properties.directory_effect.value));
            }
            // IMG适应样式
            if (properties.IMG_FitStyle) {
                wallpaper.slider('set', 'imgFit', setIMGFitStyle(properties.IMG_FitStyle.value));
            }
            // IMG背景颜色
            if (properties.IMG_BGColor) {
                let color = properties.IMG_BGColor.value.split(' ').map(function (c) {
                    return Math.ceil(c * 255);
                });
                wallpaper.slider('set', 'imgBGColor', color);
            }
            // 读取模式
            if (properties.directory_readStyle) {
                wallpaper.slider('set', 'readStyle', setReadStyle(properties.directory_readStyle.value));
            }
            // 选择时间单位
            if (properties.directory_timeUnits) {
                setTimeUnits(properties.directory_timeUnits.value);
                wallpaper.slider('set', 'timeUnits', timeUnits);
            }
            // 停留时间
            if (properties.directory_pauseTime) {
                wallpaper.slider('set', 'pauseTime', properties.directory_pauseTime.value);
            }
            // 背景填充样式
            if (properties.image_fillStyle) {
                setFillStyle(properties.image_fillStyle.value);
            }

            //全局参数
            //-----------------------------------------------------------

            // 全局设置
            if (properties.global_GlobalSettings) {
                if (properties.global_GlobalSettings.value) {
                    isGlobalSettings = true;
                    // 全局参数设置
                    wallpaper.audiovisualizer('set', 'opacity', globalSettings.opacity)
                        .audiovisualizer('set', 'color', globalSettings.color)
                        .audiovisualizer('set', 'shadowColor', globalSettings.shadowColor)
                        .audiovisualizer('set', 'shadowBlur', globalSettings.shadowBlur)
                        .audiovisualizer('set', 'offsetX', globalSettings.offsetX)
                        .audiovisualizer('set', 'offsetY', globalSettings.offsetY)
                        .audiovisualizer('set', 'isClickOffset', globalSettings.isClickOffset)
                        .date('set', 'opacity', globalSettings.opacity)
                        .date('set', 'color', globalSettings.color)
                        .date('set', 'shadowColor', globalSettings.shadowColor)
                        .date('set', 'shadowBlur', globalSettings.shadowBlur)
                        .date('set', 'offsetX', globalSettings.offsetX)
                        .date('set', 'offsetY', globalSettings.offsetY)
                        .date('set', 'isClickOffset', globalSettings.isClickOffset);
                } else {
                    isGlobalSettings = false;
                    // 音频圆环参数设置
                    wallpaper.audiovisualizer('set', 'opacity', audio.opacity)
                        .audiovisualizer('set', 'color', audio.color)
                        .audiovisualizer('set', 'shadowColor', audio.shadowColor)
                        .audiovisualizer('set', 'shadowBlur', audio.shadowBlur)
                        .audiovisualizer('set', 'offsetX', audio.offsetX)
                        .audiovisualizer('set', 'offsetY', audio.offsetY)
                        .audiovisualizer('set', 'isClickOffset', audio.isClickOffset);
                    // 日期参数设置
                    wallpaper.date('set', 'opacity', date.opacity)
                        .date('set', 'color', date.color)
                        .date('set', 'shadowColor', date.shadowColor)
                        .date('set', 'shadowBlur', date.shadowBlur)
                        .date('set', 'offsetX', date.offsetX)
                        .date('set', 'offsetY', date.offsetY)
                        .date('set', 'isClickOffset', date.isClickOffset);
                }
            }
            // 不透明度
            if (properties.global_opacity) {
                globalSettings.opacity = properties.global_opacity.value / 100;
                if (isGlobalSettings === true) {
                    wallpaper.audiovisualizer('set', 'opacity', globalSettings.opacity)
                        .date('set', 'opacity', globalSettings.opacity);
                }
            }
            // 颜色
            if (properties.global_color) {
                globalSettings.color = properties.global_color.value.split(' ').map(function (c) {
                    return Math.ceil(c * 255);
                });
                if (isGlobalSettings === true) {
                    wallpaper.audiovisualizer('set', 'color', globalSettings.color)
                        .date('set', 'color', globalSettings.color);
                }
            }
            // 模糊颜色
            if (properties.global_shadowColor) {
                globalSettings.shadowColor = properties.global_shadowColor.value.split(' ').map(function (c) {
                    return Math.ceil(c * 255);
                });
                if (isGlobalSettings === true) {
                    wallpaper.audiovisualizer('set', 'shadowColor', globalSettings.shadowColor)
                        .date('set', 'shadowColor', globalSettings.shadowColor);
                }
            }
            // 发光程度
            if (properties.global_shadowBlur) {
                globalSettings.shadowBlur = properties.global_shadowBlur.value * 5;
                if (isGlobalSettings === true) {
                    wallpaper.audiovisualizer('set', 'shadowBlur', globalSettings.shadowBlur)
                        .date('set', 'shadowBlur', globalSettings.shadowBlur);
                }
            }
            // X轴偏移
            if (properties.global_offsetX) {
                globalSettings.offsetX = properties.global_offsetX.value / 100;
                if (isGlobalSettings === true) {
                    wallpaper.audiovisualizer('set', 'offsetX', globalSettings.offsetX)
                        .date('set', 'offsetX', globalSettings.offsetX);
                }
            }
            // Y轴偏移
            if (properties.global_offsetY) {
                globalSettings.offsetY = properties.global_offsetY.value / 100;
                if (isGlobalSettings === true) {
                    wallpaper.audiovisualizer('set', 'offsetY', globalSettings.offsetY)
                        .date('set', 'offsetY', globalSettings.offsetY);
                }
            }
            // 鼠标坐标偏移
            if (properties.global_isClickOffset) {
                globalSettings.isClickOffset = properties.global_isClickOffset.value;
                if (isGlobalSettings === true) {
                    wallpaper.audiovisualizer('set', 'isClickOffset', globalSettings.isClickOffset)
                        .date('set', 'isClickOffset', globalSettings.isClickOffset);
                }
            }

            // 音频参数
            //-----------------------------------------------------------

            // 音频振幅
            if (properties.audio_amplitude) {
                wallpaper.audiovisualizer('set', 'amplitude', properties.audio_amplitude.value);
            }
            // 音频衰弱
            if (properties.audio_decline) {
                wallpaper.audiovisualizer('set', 'decline', properties.audio_decline.value / 100);
            }

            // 圆环参数
            //-----------------------------------------------------------

            // 显示圆环
            if (properties.audio_isRing) {
                if (properties.audio_isRing.value) {
                    wallpaper.audiovisualizer('set', 'isRing', true);
                } else {
                    wallpaper.audiovisualizer('set', 'isRing', false);
                }
            }
            // 显示静态环
            if (properties.audio_isStaticRing) {
                if (properties.audio_isStaticRing.value) {
                    wallpaper.audiovisualizer('set', 'isStaticRing', true);
                } else {
                    wallpaper.audiovisualizer('set', 'isStaticRing', false);
                }
            }
            // 显示内环
            if (properties.audio_isInnerRing) {
                if (properties.audio_isInnerRing.value) {
                    wallpaper.audiovisualizer('set', 'isInnerRing', true);
                } else {
                    wallpaper.audiovisualizer('set', 'isInnerRing', false);
                }
            }
            // 显示内环
            if (properties.audio_isOuterRing) {
                if (properties.audio_isOuterRing.value) {
                    wallpaper.audiovisualizer('set', 'isOuterRing', true);
                } else {
                    wallpaper.audiovisualizer('set', 'isOuterRing', false);
                }
            }
            // 圆环半径
            if (properties.audio_radius) {
                wallpaper.audiovisualizer('set', 'radius', properties.audio_radius.value / 10);
            }
            // 圆环旋转
            if (properties.audio_ringRotation) {
                wallpaper.audiovisualizer('set', 'ringRotation', properties.audio_ringRotation.value);
            }
            // 圆环和小球不透明度
            if (properties.audio_opacity) {
                audio.opacity = properties.audio_opacity.value / 100;
                if (isGlobalSettings === false) {
                    wallpaper.audiovisualizer('set', 'opacity', audio.opacity);
                }
            }
            // 圆环和小球颜色
            if (properties.audio_color) {
                audio.color = properties.audio_color.value.split(' ').map(function (c) {
                    return Math.ceil(c * 255);
                });
                if (isGlobalSettings === false) {
                    wallpaper.audiovisualizer('set', 'color', audio.color);
                }
            }
            // 圆环和小球模糊颜色
            if (properties.audio_shadowColor) {
                audio.shadowColor = properties.audio_shadowColor.value.split(' ').map(function (c) {
                    return Math.ceil(c * 255);
                });
                if (isGlobalSettings === false) {
                    wallpaper.audiovisualizer('set', 'shadowColor', audio.shadowColor);
                }
            }
            // 圆环和小球发光程度
            if (properties.audio_shadowBlur) {
                audio.shadowBlur = properties.audio_shadowBlur.value * 5;
                if (isGlobalSettings === false) {
                    wallpaper.audiovisualizer('set', 'shadowBlur', audio.shadowBlur);
                }
            }
            // 圆环和小球X轴偏移
            if (properties.audio_offsetX) {
                audio.offsetX = properties.audio_offsetX.value / 100;
                if (isGlobalSettings === false) {
                    wallpaper.audiovisualizer('set', 'offsetX', audio.offsetX);
                }
            }
            // 圆环和小球Y轴偏移
            if (properties.audio_offsetY) {
                audio.offsetY = properties.audio_offsetY.value / 100;
                if (isGlobalSettings === false) {
                    wallpaper.audiovisualizer('set', 'offsetY', audio.offsetY);
                }
            }
            // 圆环和小球鼠标坐标偏移
            if (properties.audio_isClickOffset) {
                audio.isClickOffset = properties.audio_isClickOffset.value;
                if (isGlobalSettings === false) {
                    wallpaper.audiovisualizer('set', 'isClickOffset', audio.isClickOffset);
                }
            }

            // 线条参数
            //-----------------------------------------------------------

            // 是否连线
            if (properties.audio_isLineTo) {
                wallpaper.audiovisualizer('set', 'isLineTo', properties.audio_isLineTo.value);
            }
            // 第一点
            if (properties.audio_firstPoint) {
                wallpaper.audiovisualizer('set', 'firstPoint', setPoint(properties.audio_firstPoint.value));
            }
            // 第二点
            if (properties.audio_secondPoint) {
                wallpaper.audiovisualizer('set', 'secondPoint', setPoint(properties.audio_secondPoint.value));
            }
            // 圆环点数
            if (properties.audio_pointNum) {
                wallpaper.audiovisualizer('set', 'pointNum', properties.audio_pointNum.value);
            }
            // 内外环距离
            if (properties.audio_distance) {
                wallpaper.audiovisualizer('set', 'distance', properties.audio_distance.value);
            }
            // 线条粗细
            if (properties.audio_lineWidth) {
                wallpaper.audiovisualizer('set', 'lineWidth', properties.audio_lineWidth.value);
            }

            // 小球参数
            //-----------------------------------------------------------

            // 显示小球
            if (properties.audio_isBall) {
                wallpaper.audiovisualizer('set', 'isBall', properties.audio_isBall.value);
            }
            // 小球间隔
            if (properties.audio_ballSpacer) {
                wallpaper.audiovisualizer('set', 'ballSpacer', properties.audio_ballSpacer.value);
            }
            // 小球大小
            if (properties.audio_ballSize) {
                wallpaper.audiovisualizer('set', 'ballSize', properties.audio_ballSize.value);
            }
            // 圆环旋转
            if (properties.audio_ballRotation) {
                wallpaper.audiovisualizer('set', 'ballRotation', properties.audio_ballRotation.value);
            }

            // 日期参数
            //-----------------------------------------------------------

            // 显示日期
            if (properties.date_isDate) {
                wallpaper.date('set', 'isDate', properties.date_isDate.value);
                properties.date_isDate.value ? wallpaper.date('startDateTimer') : wallpaper.date('stopDateTimer');
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
                    wallpaper.date('startWeatherTimer');
                } else {
                    wallpaper.date('stopWeatherTimer');
                }
            }
            // 天气接口提供者
            if (properties.date_weatherProvider) {
                wallpaper.date('set', 'weatherProvider', setWeatherProvider(properties.date_weatherProvider.value));
            }
            // 天气城市
            if (properties.date_city) {
                wallpaper.date('set', 'currentCity', properties.date_city.value);
            }
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
            // 日期不透明度
            if (properties.date_opacity) {
                date.opacity = properties.date_opacity.value / 100;
                if (isGlobalSettings === false) {
                    wallpaper.date('set', 'opacity', date.opacity);
                }
            }
            // 日期颜色
            if (properties.date_color) {
                date.color = properties.date_color.value.split(' ').map(function (c) {
                    return Math.ceil(c * 255);
                });
                if (isGlobalSettings === false) {
                    wallpaper.date('set', 'color', date.color);
                }
            }
            // 日期模糊颜色
            if (properties.date_shadowColor) {
                date.shadowColor = properties.date_shadowColor.value.split(' ').map(function (c) {
                    return Math.ceil(c * 255);
                });
                if (isGlobalSettings === false) {
                    wallpaper.date('set', 'shadowColor', date.shadowColor);
                }
            }
            // 日期发光程度
            if (properties.date_shadowBlur) {
                date.shadowBlur = properties.date_shadowBlur.value * 5;
                if (isGlobalSettings === false) {
                    wallpaper.date('set', 'shadowBlur', date.shadowBlur);
                }
            }
            // 日期X轴偏移
            if (properties.date_offsetX) {
                date.offsetX = properties.date_offsetX.value / 100;
                if (isGlobalSettings === false) {
                    wallpaper.date('set', 'offsetX', date.offsetX);
                }
            }
            // 日期Y轴偏移
            if (properties.date_offsetY) {
                date.offsetY = properties.date_offsetY.value / 100;
                if (isGlobalSettings === false) {
                    wallpaper.date('set', 'offsetY', date.offsetY);
                }
            }
            // 日期鼠标坐标偏移
            if (properties.date_isClickOffset) {
                date.isClickOffset = properties.date_isClickOffset.value;
                if (isGlobalSettings === false) {
                    wallpaper.date('set', 'isClickOffset', date.isClickOffset);
                }
            }

            // 粒子参数
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
            // 粒子数量
            if (properties.particles_number) {
                wallpaper.particles('addParticles', properties.particles_number.value);
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
                let color = properties.particles_color.value.split(' ').map(function (c) {
                    return Math.ceil(c * 255);
                });
                wallpaper.particles('set', 'color', color);
            }
            // 粒子模糊颜色
            if (properties.particles_shadowColor) {
                let color = properties.particles_shadowColor.value.split(' ').map(function (c) {
                    return Math.ceil(c * 255);
                });
                wallpaper.particles('set', 'shadowColor', color);
            }
            // 粒子模糊大小
            if (properties.particles_shadowBlur) {
                wallpaper.particles('set', 'shadowBlur', properties.particles_shadowBlur.value);
            }
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
            // 粒子随机大小
            if (properties.particles_sizeRandom) {
                wallpaper.particles('set', 'sizeRandom', properties.particles_sizeRandom.value);
            }
            // 显示连线
            if (properties.particles_linkEnable) {
                wallpaper.particles('set', 'linkEnable', properties.particles_linkEnable.value);
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
                let color = properties.particles_linkColor.value.split(' ').map(function (c) {
                    return Math.ceil(c * 255);
                });
                wallpaper.particles('set', 'linkColor', color);
            }
            // 连线不透明度
            if (properties.particles_linkOpacity) {
                wallpaper.particles('set', 'linkOpacity', properties.particles_linkOpacity.value / 100);
            }
            // 粒子是否移动
            if (properties.particles_isMove) {
                wallpaper.particles('set', 'isMove', properties.particles_isMove.value);
            }
            // 粒子速度
            if (properties.particles_speed) {
                wallpaper.particles('set', 'speed', properties.particles_speed.value);
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