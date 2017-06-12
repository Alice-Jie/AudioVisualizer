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
offsetX | float | 0.5 | X坐标偏移系数，范围在0~1之间
offsetY | float | 0.5 | Y坐标偏移系数，范围在0~1之间
isClickOffset | boolean | false | 开启后，根据鼠标点击位置确定XY坐标偏移系数
radius | float | 0.5 | 音频圆环的半径大小
amplitude | int | 5 | 音频圆环的振幅大小
decline | float | 0.2 | 音频圆环变化灵敏度，最好在0.1~0.2之间
isRing | boolean | true | 显示音频圆环开关
isStaticRing | boolean | false | 显示静态圆环开关
isInnerRing | boolean | true | 显示内环开关
isOuterRing | boolean | true | 显示外环开关
ringRotation | int | 0 | 旋转音频圆环，负数为逆时针旋转，正数为顺时针旋转
isLineTo | boolean | false | 显示内外环之间点与点连开关
firstPoint | int | 2 | 连线的始点所在环编号，1、静态环 2、内环 3、外环
secondPoint | int | 3 | 连线的末点所在环编号，1、静态环 2、内环 3、外环
pointNum | int | 120 | 音频圆环上点的数量，范围在0~120之间
distance | int | 0 | 内外环与静态环之间的距离
lineWidth | int | 5 | 用于设置context.lineWidth
isBall | boolean | true | 显示音频小球开关
ballSpacer | int | 3 | 音频小球疏密程度
ballSize | int | 3 | 音频小球的半径
ballRotation | int | 0 | 旋转音频小球，负数为逆时针旋转，正数为顺时针旋转

#### 方法列表：

**clearCanvas：**

调用`$(selector).audiovisualizer('clearCanvas');`清除canvas内容。

**drawCanvas：**

调用`$(selector).audiovisualizer('drawCanvas', audioArray);`重绘音频圆环和小球。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
Array<float> | audioSamples | 音频数组

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
offsetX | float | 0.5 | X坐标偏移系数，范围在0~1之间
offsetY | float | 0.5 | Y坐标偏移系数，范围在0~1之间
isClickOffset | boolean | false | 开启后，根据鼠标点击位置确定XY坐标偏移系数 |
isDate | boolean | true | 显示日期日期
timeStyle | int | 1 | 时间显示风格编号
dateStyle | int | 2 | 日期显示风格编号
timeFontSize | int | 60 | 时间字体大小
dateFontSize | int | 30 | 日期字体大小
language | string | 'zh_cn' | 日期语言

#### 方法列表：

**setCity：**

调用`$(selector).date('setCity', cityStr);`清除canvas内容。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
string | cityStr | 城市名（仅限中国）

**clearCanvas：**

调用`$(selector).date('clearCanvas');`清除canvas内容。

**drawDate：**

调用`$(selector).date('drawDate');`绘制时间和日期

**startDate：**

调用`$(selector).date('startDate');`开始日期计时器，间隔一秒重绘时间和日期

**stopDate：**

调用`$(selector).date('stopDate');`停止日期计时器

**startWeather：**

调用`$(selector).date('startWeather');`开始天气计时器，间隔三个小时重绘天气信息

**stopWeather：**

调用`$(selector).date('stopWeather');`停止天气计时器

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
sliderStyle | int | 1 | 背景切换模式 1、css 2、image 3、canvas
readStyle | int | 1 | 读取模式 1、顺序读取 2、随机读取
timeUnits | string | 'sec' | 时间单位：'sec'、'min'、'hour'
pauseTime | int | 1 | 当前背景停留时间
effect | string | 'none' | 背景切换特效
imgFit | string | 'fill' | IMG适应方式
imgBGColor | string | '255,255,255' | RGB格式颜色，IMG背景颜色

#### 方法列表：

**updateImgList：**

调用`$(selector).slider('updateImgList', currentFiles);`更新图片列表。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
{Array}<string> | currentFiles | 文件名数组

**setUserImg：**

调用`$(selector).slider('setUserImg', img);`获取用户自定义的图片地址，如果路径不存在默认为空字符串。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
string | img | 用户图片路径

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

**changeSlider：**

调用`$(selector).slider('changeSlider', sliderStyle);`使用imgList当前图片。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
int | sliderStyle | 背景切换模式

**setIsRun：**

调用`$(selector).slider('setIsRun', isDirectory);`更新状态锁。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
boolean | isDirectory | 幻灯片模式布尔值

**startSlider：**

调用`$(selector).slider('startSlider');`开始背景切换，只有状态锁开启情况下才开切换。

**stopSlider：**

调用`$(selector).slider('stopSlider');`停止背景切换。

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

**clearCanvas：**

调用`$(selector).particles('clearCanvas');`清除canvas内容。

**addParticles：**

调用`$(selector).particles('addParticles', num);`向canvsa添加粒子。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
int | num | 添加/删除粒子的数量

**particlesImage：**

调用`$(selector).particles('particlesImage', imgSrc);`改变图片粒子的图片路径。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
string | imgSrc | 图片粒子路径

**startParticles：**

调用`$(selector).particles('startParticles');`开始粒子计时器。

**stopParticles：**

调用`$(selector).particles('stopParticles');`停止粒子计时器。


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