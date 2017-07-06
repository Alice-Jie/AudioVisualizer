/*!
 * 静态调试区域
 * project:
 * - https://github.com/Alice-Jie/4K-Circle-Audio-Visualizer
 * - https://git.oschina.net/Alice_Jie/circleaudiovisualizer
 * - http://steamcommunity.com/sharedfiles/filedetails/?id=921617616
 * @license MIT licensed
 * @author Alice
 * @date 2017/07/04
 */

;(function ($, window, document, Math, undefined) {

    'use strict';

    // AudioVisualizer插件调试区域
    //--------------------------------------------------------------------------------------------------------------


    // 模拟音频数据
    let audioSamples = new Array(128);
    for (let i = 0; i < 128; i++) {
        audioSamples[i] = i * 0.01;
    }

    //$('#wallpaper').audiovisualizer({});
    //$('#wallpaper').audiovisualizer('drawCanvas', audioSamples);

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