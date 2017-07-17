/*!
 * 静态调试区域
 * project:
 * - https://github.com/Alice-Jie/4K-Circle-Audio-Visualizer
 * - https://git.oschina.net/Alice_Jie/circleaudiovisualizer
 * - http://steamcommunity.com/sharedfiles/filedetails/?id=921617616
 * @license MIT licensed
 * @author Alice
 * @date 2017/07/17
 */

;(function ($, window, document, Math, undefined) {

    'use strict';

    // 定义变量
    //--------------------------------------------------------------------------------------------------------------

    // 模拟音频数据
    let audioSamples = new Array(128);
    for (let i = 0; i < 128; i++) {
        audioSamples[i] = i * 0.01;
    }

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

    // AudioVisualizer插件调试区域
    //--------------------------------------------------------------------------------------------------------------

    //$('#wallpaper').audiovisualizer({});
    //$('#wallpaper').audiovisualizer('set', 'isChangeColor', true);
    //$('#wallpaper').audiovisualizer('updateAudioVisualizer', audioSamples);
    //$('#wallpaper').audiovisualizer('runAudioVisualizerTimer');
    // Date插件调试区域
    //--------------------------------------------------------------------------------------------------------------

    //$('#wallpaper').date({});
    //$('#wallpaper').date('set', 'dateStyle', 'weather');

    // Slider插件调试区域
    //--------------------------------------------------------------------------------------------------------------

    //$('#wallpaper').slider({});
    //$('#wallpaper').slider('addVideo');
    //('#wallpaper').slider('delVideo');

    // Particles插件调试区域
    //--------------------------------------------------------------------------------------------------------------

    //$('#wallpaper').particles({});
    //$('#wallpaper').particles('runParticlesTimer');

})(jQuery, window, document, Math);