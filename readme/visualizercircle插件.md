visualizercircle插件
---

#### 说明：
visualizercircle插件用于创建一个canvas，并绘制一个音频圆环。从`wallpaperAudioListener`接收音频数组`audioArray`，并根据`audioArray`绘制音频圆环。

如果你不知道`wallpaperAudioListener`，请点击：[Advanced: Web audio visualizer](http://steamcommunity.com/sharedfiles/filedetails/?id=786006047)

#### 使用：

初始化visualizercircle插件如下：

```javascript
    $(selector).visualizercircle();
```

你也可以传递一些参数初始化visualizercircle插件(具体参数详见参数列表):


```javascript
    $(selector).visualizercircle({
        amplitude: ...,
        decline: ...,
        ...
    });
```

#### 参数列表：

**音频参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
amplitude | int | 5 | 音频条形组的振幅大小
decline | float | 0.2 | 音频条形组变化灵敏度，最好在0.1~0.2之间
peak | float | 1.5 | 音频数组所允许值上限 

**圆环参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
isRing | boolean | true | 音频圆环开关
isStaticRing | boolean | false | 静态圆环开关
isInnerRing | boolean | true | 内环开关
isOuterRing | boolean | true | 外环开关
isLineTo | boolean | false | 显示环之间点与点连线开关
lineDirection | string | 'twoRing' | 连线所需双环字符串：'innerRing'、'outerRing'、'twoRing'
isWave | boolean | false | 波浪模式开关
waveDirection | string | 'innerRing' |波浪所需双环字符串：'innerRing'、'outerRing'、'twoRing'
isSilenceEffect | boolean | false | 静默特效开关
respiratoryRate | float | 0.001 | 音频条形呼吸频率
waveAmplitude | float | 0.5 | 正弦波振幅
groupVelocity | int | 3 | 正弦波群速度

**颜色参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
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

**基础参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
opacity | float | 0.90 | canvas的不透明度
radius | float | 0.5 | 音频圆环的半径大小
pointNum | int | 120 | 音频圆环上点的数量，范围在0~120之间
lineWidth | int | 5 | 用于设置context.lineWidth
lineJoin | string | 'butt' | 设置context.lineCap和context.lineJoin：'butt'、'square'、'round
innerDistance | int | 0 | 内环与静态环之间的距离
outerDistance | int | 0 | 外环与静态环之间的距离
connectionMode | string | 'connection' | 圆环首尾之间衔接方式。衔接模式字符串：'none'、'connection'和'center'
initialAngle | int | 0 | 音频圆环初始偏移角度，负数为逆时针旋转，正数为顺时针旋转
endAngle | int  | 360 | 音频圆环对应的弧角度
ringRotation | int | 0 | 旋转音频圆环，负数为逆时针旋转，正数为顺时针旋转

**小球参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
milliSec | int | 30 | 重绘音频条形组间隔(ms)
isBall | boolean | true | 音频小球开关
ballSpacer | int | 3 | 音频小球疏密程度
ballDistance | int | 50 | 音频小球与静态环之间的最小距离
ballSize | int | 3 | 音频小球半径
ballDirection | int | 1 | 音频小球成长方向
bindRingRotation | boolean | false | 音频小球旋转和音频圆环旋转角度绑定
ballRotation | int | 0 | 旋转音频小球，负数为逆时针旋转，正数为顺时针旋转

**坐标参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
offsetX | float | 0.5 | X坐标偏移系数，范围在0~1之间
offsetY | float | 0.9 | Y坐标偏移系数，范围在0~1之间
isClickOffset | boolean | false |  开启后，根据鼠标点击位置确定XY坐标偏移系数

**变换参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
isMasking | boolean | false | 蒙版显示开关
maskOpacity | float | 0.25 | 蒙版不透明度
perspective | int | 0| 透视效果距离，0为不启用透视效果
transformMode | string | 'value' | 变换模式，分别为：'value'模式和'matrix3d'模式
translateX | int | 0 | 调用css transform方法translateX(x)
translateY | int | 0 | 调用css transform方法translateY(y)
width | float | 0.0 | 调用css transform方法scale(width, height)
height | float | 0.0 | 调用css transform方法scale(width, height)
skewX | int | 0 | 调用css transform方法scaleX(x)
skewY | int | 0 | 调用css transform方法scaleY(y)
rotateX | int | 0 | 调用css transform方法rotateX(angle)
rotateY | int | 0 | 调用css transform方法rotateY(angle)
rotateZ | int | 0 | 调用css transform方法rotateZ(angle)
isRotate3D | boolean | 0 | 启用音频圆环跟随鼠标3D旋转
degSize | int | 50 | 启用3D旋转下音频圆环旋转幅度
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

调用`$(selector).visualizercircle('clearCanvas');`清除canvas内容。

**updateVisualizerCircle：**

调用`$(selector).visualizercircle('updateVisualizerCircle', audioArray);`更新音频圆环参数。

参数类型 | 参数名 | 参数描述
---------|--------|----------
Array<float> | audioSamples | 音频数组

**drawVisualizerCircle：**

调用`$(selector).visualizercircle('drawVisualizerCircle');`绘制音频圆环和音频小球

**drawCanvas：**

调用`$(selector).visualizercircle('drawCanvas', audioArray);`根据音频数组绘制音频圆环和音频小球

参数类型 | 参数名 | 参数描述
---------|--------|----------
Array<float> | audioSamples | 音频数组

**stopVisualizerCircleTimer：**

调用`$(selector).visualizercircle('stopVisualizerCircleTimer');`停止音频圆环计时器

**runVisualizerCircleTimer：**

调用`$(selector).visualizercircle('runVisualizerCircleTimer');`开始音频圆环计时器

**destroy：**

调用`$(selector).visualizercircle('destroy');`销毁音频圆环所在canvas

**set：**

调用`$(selector).visualizercircle('set', property, value);`设置visualizercircle插件相关参数，具体参数详见参数列表。

参数类型 | 参数名 | 参数描述
---------|--------|----------
string | property | 属性名
任意 | value | 属性对应值

#### 使用wallpaper音频监视器：

```javascript
    $('body').visualizercircle({});

    function wallpaperAudioListener(audioArray) {
        wallpaper.visualizercircle('drawCanvas', audioArray);
    }

    window.wallpaperRegisterAudioListener && window.wallpaperRegisterAudioListener(wallpaperAudioListener);
```