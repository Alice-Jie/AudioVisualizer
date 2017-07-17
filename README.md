![image](https://steamuserimages-a.akamaihd.net/ugc/816685937288288292/89720D1D71A87391C3C1668779883A311D6EF73B/?interpolation=lanczos-none&output-format=jpeg&output-quality=95&fit=inside|268:268&composite-to%3D%2A%2C%2A%7C268%3A268&background-color=black)
# [4K]Circle Audio Visualizer
---
一个在Wallpaper Engine创意工坊上的开源项目:
http://steamcommunity.com/sharedfiles/filedetails/?id=921617616

目前Circle Audio Visualizer使用了4个jquery插件，分别是`jquery.audiovisualizer`、`jquery.date`、`juqery.slider`和`jquery.particles`。

audiovisualizer插件
---

#### 说明：
audiovisualizer插件用于创建一个canvas,并绘制一个音频圆环。从`wallpaperAudioListener`接收音频数组`audioArray`，并根据`audioArray`绘制音频圆环。

如果你不知道`wallpaperAudioListener`，请点击：[Advanced: Web audio visualizer](http://steamcommunity.com/sharedfiles/filedetails/?id=786006047)


#### 使用：

初始化audiovisualizer插件如下：


```javascript
    $(selector).audiovisualizer();
```

你也可以传递一些参数初始化audiovisualizer插件(具体参数详见参数列表):


```javascript
    $(selector).audiovisualizer({
        opacity: ...,
        color: ...,
        ...
    });
```

#### 参数列表：


| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
opacity | float | 0.90 | canvas的不透明度
color | string | '255,255,255' | RGB格式颜色，用于设置context.fillStyle、strokeStyle
shadowColor | string | '255,255,255' | RGB格式颜色，用于设置context.shadowColor
shadowBlur | int | 15 | 用于设置shadowBlur
isChangeColor | boolean | false | 颜色变换开关
isRandomColor | boolean | true | 随机颜色变换开关
firstColor | string | '255,255,255' | 初始颜色
secondColor | string | '255,0,0' | 最终颜色
isChangeBlur | boolean | false | 颜色变换shadowBlur绑定
offsetX | float | 0.5 | X坐标偏移系数，范围在0~1之间
offsetY | float | 0.5 | Y坐标偏移系数，范围在0~1之间
isClickOffset | boolean | false | 开启后，根据鼠标点击位置确定XY坐标偏移系数
radius | float | 0.5 | 音频圆环的半径大小
amplitude | int | 5 | 音频圆环的振幅大小
decline | float | 0.2 | 音频圆环变化灵敏度，最好在0.1~0.2之间
peak | float | 1.5 | 音频数组所允许值上限
milliSec | int | 30 | 重绘音频圆环间隔（ms）
isRing | boolean | true | 显示音频圆环开关
isStaticRing | boolean | false | 显示静态圆环开关
isInnerRing | boolean | true | 显示内环开关
isOuterRing | boolean | true | 显示外环开关
ringRotation | int | 0 | 旋转音频圆环，负数为逆时针旋转，正数为顺时针旋转
isLineTo | boolean | false | 显示内外环之间点与点连开关
firstPoint | string | 'innerRing' | 连线的始点标识字符串
secondPoint | string | 'outerRing' | 连线的末点标识字符串
pointNum | int | 120 | 音频圆环上点的数量，范围在0~120之间
innerDistance | int | 0 | 内环与静态环之间的距离
outerDistance | int | 0 | 外环与静态环之间的距离
lineWidth | int | 5 | 用于设置context.lineWidth
isBall | boolean | true | 显示音频小球开关
ballSpacer | int | 3 | 音频小球疏密程度
ballDistance | int | 50 | 小球与静态环之间的最小距离
ballSize | int | 3 | 音频小球的半径
ballRotation | int | 0 | 旋转音频小球，负数为逆时针旋转，正数为顺时针旋转

#### 方法列表：

**clearCanvas：**

调用`$(selector).audiovisualizer('clearCanvas');`清除canvas内容。

**updateAudioVisualizer：**

调用`$(selector).audiovisualizer('updateAudioVisualizer', audioArray);`更新音频圆环参数。

参数类型 | 参数名 | 参数描述
---------|--------|----------
Array<float> | audioSamples | 音频数组

**drawAudioVisualizer：**

调用`$(selector).audiovisualizer('drawAudioVisualizer');`绘制音频圆环和音频小球

**drawCanvas：**

调用`$(selector).audiovisualizer('drawCanvas', audioArray);`根据音频数组绘制音频圆环和音频小球

参数类型 | 参数名 | 参数描述
---------|--------|----------
Array<float> | audioSamples | 音频数组

**stopAudioVisualizerTimer：**

调用`$(selector).audiovisualizer('stopAudioVisualizerTimer');`停止音频圆环计时器

**startAudioVisualizerTimer：**

调用`$(selector).audiovisualizer('runAudioVisualizerTimer');`开始音频圆环计时器

**destroy：**

调用`$(selector).audiovisualizer('destroy');`销毁音频圆环所在canvas

**set：**

调用`$(selector).audiovisualizer('set', property, value);`设置audiovisualizer插件相关参数，具体参数详见参数列表。

参数类型 | 参数名 | 参数描述
---------|--------|----------
string | property | 属性名
任意 | value | 属性对应值

#### 使用wallpaper音频监视器：

```javascript
    $('body').audiovisualizer({});

    function wallpaperAudioListener(audioArray) {
        wallpaper.audiovisualizer('drawCanvas', audioArray);
    }

    window.wallpaperRegisterAudioListener && window.wallpaperRegisterAudioListener(wallpaperAudioListener);
```

date插件
---

#### 说明：
date插件用于创建一个canvas,创建一个canvas并绘制日期。

#### 使用：

初始化date插件如下：


```javascript
    $(selector).date();
```

你也可以传递一些参数初始化date插件(具体参数详见参数列表):


```javascript
    $(selector).date({
        opacity: ...,
        color: ...,
        ...
    });
```

#### 参数列表：


| 名称 | 类型 | 默认| 描述
|------|------|-----|------
opacity | float | 0.90 | canvas的不透明度
color | string | '255,255,255' |  RGB格式颜色，用于设置context.fillStyle、strokeStyle
shadowColor | string | '255,255,255' |  RGB格式颜色，用于设置context.shadowColor
shadowBlur | int | 15 | 用于设置shadowBlur
isChangeColor | boolean | false | 颜色变换开关
isRandomColor | boolean | true | 随机颜色变换开关
firstColor | string | '255,255,255' | 初始颜色
secondColor | string | '255,0,0' | 最终颜色
isChangeBlur | boolean | false | 颜色变换shadowBlur绑定
offsetX | float | 0.5 | X坐标偏移系数，范围在0~1之间
offsetY | float | 0.5 | Y坐标偏移系数，范围在0~1之间
isClickOffset | boolean | false | 开启后，根据鼠标点击位置确定XY坐标偏移系数 |
isDate | boolean | true | 显示日期日期
timeStyle | string | 'hh:mm:ss a' | 时间显示风格
dateStyle | string | 'LL dddd' | 日期显示风格
timeFontSize | int | 60 | 时间字体大小
dateFontSize | int | 30 | 日期字体大小
language | string | 'zh_cn' | 日期语言
weatherProvider | string | 'sina' | 天气API提供者
currentCity | string | 'zh_cn' | 当前城市

#### 方法列表：

**setCity：**

调用`$(selector).date('setCity', cityStr);`清除canvas内容。

参数类型 | 参数名 | 参数描述
---------|--------|----------
string | cityStr | 城市名（仅限中国）

**clearCanvas：**

调用`$(selector).date('clearCanvas');`清除canvas内容。

**updateDate：**

调用`$(selector).date('updateDate');`更新时间日期信息

**drawDate：**

调用`$(selector).date('drawDate');`绘制时间日期

**stopDateTimer：**

调用`$(selector).date('stopDateTimer');`停止日期计时器

**startDateTimer：**

调用`$(selector).date('runDateTimer');`开始日期计时器，间隔一秒重绘时间和日期

**updateWeather：**

调用`$(selector).date('updataWeather');`更新天气信息

**stopWeatherTimer：**

调用`$(selector).date('stopWeatherTimer');`停止天气计时器

**startWeatherTimer：**

调用`$(selector).date('runWeatherTimer');`开始天气计时器，间隔三个小时重绘天气信息

**destroy：**

调用`$(selector).date('destroy');`销毁日期所在canvas

**set：**

调用`$(selector).date('set', property, value);`设置date插件相关参数，具体参数详见参数列表。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
string | property | 属性名 
任意 | value | 属性对应值 

#### 时间格式

- YYYY：年 
- MMM：月（非数字） 
- MM：月（数字） 
- Do：日（非数字） 
- DD：日（数字）
- HH：小时(二十四小时制) 
- hh：小时(十二小时制) 
- mm：分钟 
- ss：秒
- a：时间段 
- dddd：星期


slider插件
---

#### 说明：
slider插件用于背景切换，从`window.wallpaperPropertyListener`扩展方法`userDirectoryFilesAddedOrChanged`和`userDirectoryFilesRemoved`接收属性名`propertyName`、图片文件路径数组`Files`。

如果你不知道扩展方法`userDirectoryFilesAddedOrChanged`和`userDirectoryFilesRemoved`，请点击：[Advanced: Web user customization - Importing User Images](http://steamcommunity.com/sharedfiles/filedetails/?id=795674740)

目前提供了`css`、`image`、`canvas`三种模式切换，image和canvas支持背景切换特效。


#### 使用：

初始化slider插件如下：


```javascript
    $(selector).slider();
```

你也可以传递一些参数初始化slider插件(具体参数详见参数列表):


```javascript
    $(selector).slider({
        sliderStyle: ...,
        readStyle: ...,
        ...
    });
```

#### 参数列表：

| 名称 | 类型 | 默认| 描述 
|------|------|-----|------
sliderStyle | string | 'css' | 背景切换模式
readStyle | string | 'sequential' | 读取模式
timeUnits | string | 'sec' | 时间单位：'sec'、'min'、'hour'
pauseTime | int | 1 | 当前背景停留时间
effect | string | 'none' | 背景切换特效
imgFit | string | 'fill' | IMG适应方式
imgBGColor | string | '255,255,255' | RGB格式颜色，IMG背景颜色
progress | float | 0 | 视频进度（0 - 1）
isPlay | boolean | true | 视频播放状态
volume | float | 0.75 | 视频音量（0 - 1）
videoFit | string | 'fill' | video适应方式
videoBGColor | string | '255,255,255' | RGB格式颜色，video背景颜色
isRotate3D | boolean | flase | 背景3D转换开关

#### 方法列表：

**setUserColor：**

调用`$(selector).slider('selector', color);`获取用户自定义的颜色地址，如果路径不存在默认为'255,255,255'。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
string | color | 用户颜色路径

**setUserImg：**

调用`$(selector).slider('setUserImg', img);`获取用户自定义的图片地址，如果路径不存在默认为空字符串。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
string | img | 用户图片路径

**setUserVideo：**

调用`$(selector).slider('setUserVideo', video);`获取用户自定义的视频地址，如果路径不存在默认为空字符串。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
string | video | 用户视频路径

**cssSrcUserImg：**

调用`$(selector).slider('cssSrcUserImg');`设置background-image为用户图片。

**cssSrcUserImg：**

调用`$(selector).slider('cssSrcUserImg');`设置background-image为用户图片。

**cssSrcDefaultImg：**

调用`$(selector).slider('cssSrcDefaultImg');`设置background-image为默认图片。

**addImg：**

调用`$(selector).slider('addImg');`添加上张图片和当前图片。

**delImg：**

调用`$(selector).slider('delImg');`删除上张图片和当前图片。

**imgSrcUserImg：**

调用`$(selector).slider('imgSrcUserImg');`设置当前图片为用户图片。

**imgSrcDefaultImg：**

调用`$(selector).slider('imgSrcDefaultImg');`设置当前图片为默认图片。

**drawUserImg：**

调用`$(selector).slider('drawUserImg');`绘制用户图片。

**drawDefaultImg：**

调用`$(selector).slider('drawDefaultImg');`绘制默认图片。

**clearCanvas：**

调用`$(selector).slider('clearCanvas');`清空Canvas内容。


**updateImgList：**

调用`$(selector).slider('updateImgList', currentFiles);`更新图片列表。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
{Array}<string> | currentFiles | 文件名数组

**changeSliderStyle：**

调用`$(selector).slider('changeSliderStyle');` 改变背景滑动模式。

**changeSlider：**

调用`$(selector).slider('changeSlider');`使用imgList当前图片。

**stopSliderTimer：**

调用`$(selector).slider('stopSliderTimer');`停止背景切换。

**startSlider：**

调用`$(selector).slider('startSlider');`开始背景切换。

**addVideo：**

调用`$(selector).slider('addVideo');`添加视频对象至节点。

**delVideo：**

调用`$(selector).slider('delVideo');`删除视频对象。

**getVideoList：**

调用`$(selector).slider('getVideoList');`从js/videoList.js中读取视频列表videoList。

**getVideoStr：**

调用`$(selector).slider('getVideoList', index);`从videoList读取索引对应值并转换成视频源。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
{int} | index | 视频列表索引

**videoSrcUserVideo：**

调用`$(selector).slider('videoSrcUserVideo');`设置当前视频为用户视频并添加至视频列表。

**videoSrcDefaultVideo：**

调用`$(selector).slider('videoSrcDefaultVideo');`设置当前视频为默认视频。

**prevVideo：**

调用`$(selector).slider('prevVideo');`读取上一个视频源。

**nextVideo：**

调用`$(selector).slider('nextVideo');`读取下一个视频源。

**setVideoProgress：**

调用`$(selector).slider('setVideoProgress', progress);`按进度百分比设置视频当前读取位置。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
{float} | progress | 视频进度（%）

**playVideo：**

调用`$(selector).slider('playVideo');`播放视频。

**pauseVideo：**

调用`$(selector).slider('pauseVideo');`暂停视频。

**setVideoVolume：**

调用`$(selector).slider('setVideoVolume', volume);`设置音量大小（%）。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
{float} | volume | 音量大小（%）

**destroy：**

调用`$(selector).slider('destroy');`销毁slider所在canvas、img。

**set：**

调用`$(selector).slider('set', property, value);`设置slider插件相关参数，具体参数详见参数列表。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
string | property | 属性名 
任意 | value | 属性对应值 

#### 使用wallpaper图片文件夹监视器：

在`applyUserProperties: function (properties) { // do something },` 后尾添加：
```javascript
    userDirectoryFilesAddedOrChanged: function (propertyName, changedFiles) {
        if (!files.hasOwnProperty(propertyName)) {
            files[propertyName] = changedFiles;
        } else {
            files[propertyName] = files[propertyName].concat(changedFiles);
        }
        wallpaper.slider('updateImgList', files[propertyName]);
    },
    
    userDirectoryFilesRemoved: function (propertyName, removedFiles) {
        for (var i = 0; i < removedFiles.length; ++i) {
            var index = files[propertyName].indexOf(removedFiles[i]);
            if (index >= 0) {
                files[propertyName].splice(index, 1);
            }
        }
        wallpaper.slider('updateImgList', files[propertyName]);
    }
```

particles插件
---


#### 说明：
particles插件用于创建一个canvas,并随机在canvas上生成粒子并按照某种方式移动。


#### 使用：

初始化particles插件如下：


```javascript
    $(selector).particles();
```

你也可以传递一些参数初始化particles插件(具体参数详见参数列表):


```javascript
    $(selector).particles({
        number: ...,
        opacity: ...,
        ...
    });
```

#### 参数列表：

| 名称 | 类型 | 默认| 描述 
|------|------|-----|------
number | int | 100 | 粒子的数量
opacity | float | 0.75 | 粒子的最大透明度
opacityRandom | boolean | false | 粒子的透明度是否随机
color | string | '255,255,255' | RGB格式颜色，粒子的颜色
shadowColor | string | '255,255,255' | RGB格式颜色，粒子的阴影颜色
shadowBlur | int | 0 | 粒子的阴影大小
shapeType | string | 'circle' | 粒子的形状
rotationAngle| int | 0 | 旋转粒子，负数为逆时针旋转，正数为顺时针旋转
angleRandom | boolean | false | 粒子的旋转角度是否随机 
sizeValue | int | 5 | 粒子的最大半径
sizeRandom | boolean | true | 粒子的半径是否随机
linkEnable | boolean | false | 粒子间是否显示连线
linkDistance | int | 100 | 粒子间显示连线所需要的距离
linkWidth | int | 2 | 粒子间连线的宽度
linkColor | string | '255,255,255' | RGB格式颜色，粒子间连线的颜色
linkOpacity | float | 0.75 | 粒子间连线的透明度
isMove | boolean | true | 粒子是否移动
speed | int | 2 | 粒子的最大移动速度
speedRandom | boolean | true | 粒子的移动速度是否随机
direction | string | 'bottom' | 粒子的移动方向
isStraight | boolean | false | 粒子是否笔直移动
isBounce | boolean | false | 粒子之间是否发生碰撞
moveOutMode | string | 'out' | 粒子离开canvas所发生的行为

#### 方法列表：

**addParticles：**

调用`$(selector).particles('addParticles', num);`向canvsa添加粒子。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
int | num | 添加/删除粒子的数量

**densityAutoParticles：**

调用`$(selector).particles('densityAutoParticles');`根据粒子密度确定粒子数量。

**updateParticlesArray：**

调用`$(selector).particles('updateParticlesArray');`更新粒子数组。

**clearCanvas：**

调用`$(selector).particles('clearCanvas');`清除canvas内容。

**particlesImage：**

调用`$(selector).particles('particlesImage', imgSrc);`改变图片粒子的图片路径。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
string | imgSrc | 图片粒子路径

**drawParticles：**

调用`$(selector).particles('drawParticles', particles);`绘制粒子。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
Object | particles | 粒子对象

**drawLine：**

调用`$(selector).particles('drawLine', index);`绘制索引对应的粒子与其它粒子的连线。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
index | particles | 粒子对象

**stopParticlesTimer：**

调用`$(selector).particles('stopParticlesTimer');`停止粒子计时器。

**runParticlesTimer：**

调用`$(selector).particles('runParticlesTimer');`开始粒子计时器。

**destroy：**

调用`$(selector).particles('destroy');`销毁粒子所在canvas

**setParticles：**

调用`$(selector).particles('setParticles', property);`设置粒子数组粒子属性。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
string | property | 属性名 

**set：**

调用`$(selector).particles('set', property, value);`设置particles插件相关参数，具体参数详见参数列表。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
string | property | 属性名 
任意 | value | 属性对应值 

有问题反馈
---

在使用中有任何问题，欢迎反馈给我，可以用以下联系方式跟我交流

* 邮件(909011298@qq.com)
* QQ: 909011298


感谢
---

感谢以下的项目,排名不分先后
* [jquery](http://jquery.com)
* [moment](http://momentjs.cn/)
* [particles.js](http://github.com/VincentGarreau/particles.js)