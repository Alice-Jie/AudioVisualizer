visualizerbars插件
---

#### 说明：
visualizerbars插件用于创建一个canvas，并绘制一个音频条形组。从`wallpaperAudioListener`接收音频数组`audioArray`，并根据`audioArray`绘制音频条形组。

如果你不知道`wallpaperAudioListener`，请点击：[Advanced: Web audio visualizer](http://steamcommunity.com/sharedfiles/filedetails/?id=786006047)


#### 使用：

初始化visualizerbars插件如下：


```javascript
    $(selector).visualizerbars();
```

你也可以传递一些参数初始化visualizerbars插件(具体参数详见参数列表):


```javascript
    $(selector).visualizerbars({
        amplitude: ...,
        decline: ...,
        ...
    });
```

#### 参数列表：


| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
amplitude | int | 5 | 音频条形组的振幅大小
decline | float | 0.2 | 音频条形组变化灵敏度，最好在0.1~0.2之间
peak | float | 1.5 | 音频数组所允许值上限
isLineTo | boolean | false | 音频连线开关
isBars | boolean | false | 音频条形开关
barsDirection | string | 'upperBars' | 音频条形组成长方向
isWave | boolean | false | 波浪模式开关
waveDirection | string | 'lowerBars' | 音频波浪组成长方向
isSilenceEffect | boolean | false | 静默特效开关
respiratoryRate | float | 0.001 | 音频条形呼吸频率
waveAmplitude | float | 0.5 | 正弦波振幅
groupVelocity | int | 3 | 正弦波群速度
colorMode | string | 'monochrome' | 颜色模式标识字符串：'monochrome'、'colorTransformation'、'rainBow'
color | string | '255,255,255' | RGB格式颜色，设置context.fillStyle、strokeStyle
shadowColor | string | '255,255,255' | RGB格式颜色，设置context.shadowColor
shadowBlur | int | 0 | 设置shadowBlur
shadowOverlay | boolean | false | 设置canvas叠加属性为'lighter'
isRandomColor | boolean | true | 随机颜色变换开关
firstColor | string | '255,255,255' | 初始颜色
secondColor | string | '255,0,0' | 最终颜色
isChangeBlur | boolean | false | 颜色变换shadowBlur绑定
hueRange | int | 360 | 	色相范围
saturationRange | int | 100 | 饱和度范围(%)
lightnessRange | int | 50 | 亮度范围(%)
gradientOffset | int | 0 | 渐变效果偏移值
opacity | float | 0.90 | canvas的不透明度
width | float | 0.5 | 音频条形的宽度大小
height | int | 2 | 音频条形初始高度
pointNum | int | 120 | 音频条形的数量，范围在0~120之间
lineWidth | int | 5 | 设置context.lineWidth
lineJoin | string | 'butt' | 设置context.lineCap和context.lineJoin
barsRotation | int | 0 |  旋转音频条形组，负数为逆时针旋转，正数为顺时针旋转
milliSec | int | 30 | 重绘音频条形组间隔(ms)
offsetX | float | 0.5 | X坐标偏移系数，范围在0~1之间
offsetY | float | 0.9 | Y坐标偏移系数，范围在0~1之间
isClickOffset | boolean | false |  开启后，根据鼠标点击位置确定XY坐标偏移系数
isMasking | boolean | false | 蒙版显示开关
maskOpacity | float | 0.25 | 蒙版不透明度
topLeftX | float | 0 | 扭曲目标左上角X
topLeftY | float | 0 | 扭曲目标左上角Y
topRightX | float | 0 | 扭曲目标右上角X
topRightY | float | 0 | 扭曲目标右上角Y
bottomRightX | 0 | 0 | 扭曲目标右下角X
bottomRightY | float | 0 | 扭曲目标右下角Y
bottomLeftX | float | 0 | 扭曲目标左下角X
bottomLeftY | float | 0 | 扭曲目标左下角Y

#### 方法列表：

**clearCanvas：**

调用`$(selector).visualizerbars('clearCanvas');`清除canvas内容。

**updateVisualizerBars：**

调用`$(selector).visualizerbars('updateVisualizerBars', audioArray);`更新音频条形绘制参数。

参数类型 | 参数名 | 参数描述
---------|--------|----------
Array<float> | audioSamples | 音频数组

**drawVisualizerBars：**

调用`$(selector).visualizerbars('drawVisualizerBars');`绘制音频条形组

**drawCanvas：**

调用`$(selector).visualizerbars('drawCanvas', audioArray);`更新音频条形绘制参数并根据条件绘制音频条形

参数类型 | 参数名 | 参数描述
---------|--------|----------
Array<float> | audioSamples | 音频数组

**stopVisualizerBarsTimer：**

调用`$(selector).visualizerbars('stopVisualizerBarsTimer');`停止音频条形组计时器

**runVisualizerBarsTimer：**

调用`$(selector).visualizerbars('runVisualizerBarsTimer');`开始音频条形组计时器

**destroy：**

调用`$(selector).visualizerbars('destroy');`销毁音频条形组所在canvas

**set：**

调用`$(selector).visualizerbars('set', property, value);`设置visualizerbars插件相关参数，具体参数详见参数列表。

参数类型 | 参数名 | 参数描述
---------|--------|----------
string | property | 属性名
任意 | value | 属性对应值

#### 使用wallpaper音频监视器：

```javascript
    $('body').visualizerbars({});

    function wallpaperAudioListener(audioArray) {
        wallpaper.visualizerbars('drawCanvas', audioArray);
    }

    window.wallpaperRegisterAudioListener && window.wallpaperRegisterAudioListener(wallpaperAudioListener);
```
