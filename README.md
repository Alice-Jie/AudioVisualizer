![image](https://steamuserimages-a.akamaihd.net/ugc/842587364847342400/55201E5E7B04516568307E592F4EAD7BCC706638/)
# [4K]Audio Visualizer
---
一个在Wallpaper Engine创意工坊上的开源项目:
http://steamcommunity.com/sharedfiles/filedetails/?id=921617616

目前Circle Audio Visualizer使用了4个jquery插件，分别是`jquery.audiovisualizer.bars`、`jquery.audiovisualizer.circle`、`jquery.time`、`juqery.slider`、`jquery.particles`和`jquery.logo`。

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
videoProgress | float | 0 | 视频进度（0 - 1）
isVideoPlay | boolean | true | 视频播放状态
videoVolume | float | 0.75 | 视频音量（0 - 1）
playbackRate | float | 1.00 | 视频播放速度（0 - 任意）
videoFit | string | 'fill' | video适应方式
videoBGColor | string | '255,255,255' | RGB格式颜色，video背景颜色
audioProgress | float | 0 | 音频进度（0 - 1）
isAudioPlay | boolean | false | 音频播放状态
isAudioLoop | boolean | false | 音频是否播放
audioVolume | float | 0.75 | 音频音量（0 - 1）
isBackgourndBlur | boolean | flase | 背景缩放模糊
isBackgroundZoom | boolean | flase | 背景缩放开关
isRotate3D | boolean | flase | 背景3D转换开关

#### 方法列表：

**updateAudioAverage：**

调用`$(selector).slider('updateAudioAverage',  audioSamples);`更新音频均值。

参数类型 | 参数名 | 参数描述
---------|--------|----------
float | audioSamples | 音频数组

**backgroundBlur：**

调用`$(selector).slider('backgroundBlur');`根据音频均值模糊背景

参数类型 | 参数名 | 参数描述
---------|--------|----------
float | audioSamples | 音频数组

**backgroundZoom：**

调用`$(selector).slider('backgroundZoom');`根据音频均值缩放背景

参数类型 | 参数名 | 参数描述
---------|--------|----------
float | audioSamples | 音频数组

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

**setUserAudio：**

调用`$(selector).slider('setUserAudio', video);`获取用户自定义的视频地址，如果路径不存在默认为空字符串。

参数类型 | 参数名 | 参数描述
---------|--------|----------
string | audio | 用户音频路径

**cssUserColor：**

调用`$(selector).slider('cssUserColor');`设置background-color为用户颜色

**cssLinearGradient：**

调用`$(selector).slider('cssLinearGradient');`设置background-image为线性渐变

**cssSrcUserImg：**

调用`$(selector).slider('cssSrcUserImg');`设置background-image为用户图片。

**cssSrcDefaultImg：**

调用`$(selector).slider('cssSrcDefaultImg');`设置background-image为默认图片。

**addImg：**

调用`$(selector).slider('addImg');`添加上张图片和当前图片。

**delImg：**

调用`$(selector).slider('delImg');`删除上张图片和当前图片。

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

**currentVideo：**

调用`$(selector).slider('currentVideo');`读取当前视频源。

**prevVideo：**

调用`$(selector).slider('prevVideo');`读取上一个视频源。

**nextVideo：**

调用`$(selector).slider('nextVideo');`读取下一个视频源。

**setVideoProgress：**

调用`$(selector).slider('setVideoProgress', progress);`按进度百分比设置视频当前读取位置。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
{float} | progress | 视频进度（%）

**setVideoPlaybackRate：**

调用`$(selector).slider('setVideoProgress', backRate);`设置视频当前的播放速度。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
{float} | backRate | 视频播放速度（0.0 - 5.0）

**playVideo：**

调用`$(selector).slider('playVideo');`播放视频。

**pauseVideo：**

调用`$(selector).slider('pauseVideo');`暂停视频。

**setVideoVolume：**

调用`$(selector).slider('setVideoVolume', volume);`设置音量大小（%）。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
{float} | volume | 音量大小（%）

**getAudioList：**

调用`$(selector).slider('getAudioList');`从js/audioList.js中读取音频列表audioList。

**getAudioStr：**

调用`$(selector).slider('getAudioList', index);`从audioList读取索引对应值并转换成音频源。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
{int} | index | 音频列表索引

**audioSrcUserAudio：**

调用`$(selector).slider('audioSrcUserAudio');`设置当前音频为用户音频并添加至音频列表。

**audioSrcDefaultAudio：**

调用`$(selector).slider('audioSrcDefaultAudio');`设置当前音频为默认音频。

**currentAudio：**

调用`$(selector).slider('currentAudio');`读取当前音频源。

**prevAudio：**

调用`$(selector).slider('prevAudio');`读取上一个音频源。

**nextAudio：**

调用`$(selector).slider('nextAudio');`读取下一个音频源。

**setAudioProgress：**

调用`$(selector).slider('setAudioProgress', progress);`按进度百分比设置音频当前读取位置。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
{float} | progress | 音频进度（%）

**playAudio：**

调用`$(selector).slider('playAudio');`播放音频。

**pauseAudio：**

调用`$(selector).slider('pauseAudio');`暂停音频。

**setAudioVolume：**

调用`$(selector).slider('setAudioVolume', volume);`设置音量大小（%）。

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
isDensity | boolean | false | 启用粒子密度区域
densityArea | int | 1000 | 粒子密度范围
opacity | float | 0.75 | 粒子的最大透明度
opacityRandom | boolean | false | 粒子的粒子的透明度是否随机
color | string | '255,255,255' | RGB格式颜色，粒子的颜色
isColorFollow | boolean | false | 颜色跟随音频开关
colorRate | int | 10 | 颜色变化速率
colorRandom | boolean | false | 随机粒子颜色开关
isFill | boolean | true | 填充粒子开关
isStroke | boolean | false | 描边粒子开关
lineWidth | int | 1 | 描边宽度
shadowColor | string | '255,255,255' | RGB格式颜色，粒子的阴影颜色
shadowBlur | int | 0 | 粒子的阴影大小
shapeType | string | 'circle' | 粒子的形状
rotationAngle| int | 0 | 旋转粒子，负数为逆时针旋转，正数为顺时针旋转
angleRandom | boolean | false | 粒子的旋转角度是否随机 
sizeValue | int | 5 | 粒子的最大半径
isSizeFollow | boolean | false | 粒子的大小是否跟随音频
sizeRate | int | 5 | 大小变化速率
sizeRandom | boolean | true | 粒子的半径是否随机
linkEnable | boolean | false | 粒子间是否显示连线
linkDistance | int | 100 | 粒子间显示连线所需要的距离
linkWidth | int | 2 | 粒子间连线的宽度
linkColor | string | '255,255,255' | RGB格式颜色，粒子间连线的颜色
linkColorRandom | boolean | false | 随机粒子间连线颜色开关
linkOpacity | float | 0.75 | 粒子间连线的透明度
isMove | boolean | true | 粒子是否移动
isMoveFollow | boolean | false | 粒子的移动是否跟随音频开关
moveRate | int | 5 | 移动变化速率
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

**updateAudioAverage：**

调用`$(selector).particles('updateAudioAverage',  audioSamples);`更新音频均值。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
float | audioSamples | 音频数组

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

logo插件
---


#### 说明：
logo插件用于创建一个canvas,并随机在canvas上生成LOGO图像并按照某种方式移动旋转。


#### 使用：

初始化logo插件如下：


```javascript
    $(selector).logo();
```

你也可以传递一些参数初始化particles插件(具体参数详见参数列表):


```javascript
    $(selector).logo({
        isLogo: ...,
        isCircular: ...,
        ...
    });
```

#### 参数列表：

| 名称 | 类型 | 默认| 描述 
|------|------|-----|------
isLogo | boolean | flase | 显示LOGO开关
isCircular | boolean | true | LOGO圆形显示开关
opacity | float | 0.9 | canvas不透明度
shadowColor | int | '255,255,255' | RGB格式颜色，用于设置context.shadowColor
shadowBlur | int | 0 | 用于设置shadowBlur
isStroke | boolean | false | 圆形外描边开关
strokeColor |'string' | '255,255,255' | RGB格式颜色，用于设置context.strokeStyle
lineWidth | int | 1 | 连线宽度
dottedLine | int | 0 | 虚线间隔
offsetX | float | 0.5 | X坐标偏移系数，范围在0~1之间
offsetY | float | 0.5 | Y坐标偏移系数，范围在0~1之间
isClickOffset | boolean | false | 开启后，根据鼠标点击位置确定XY坐标偏移系数
zoom | float | 0.1 | 按比例缩放图像
isZoomFollow | boolean | false | 图像是否跟随音频缩放
zoomRate | int | 5 | 缩放变化速率
widthRatio | float | 1.0 | 图像宽度按比例拉伸
heightRatio | float | 1.0 | 图像高度按比例拉伸
initialAngle | int | 0 | 图像初始旋转角度
isRotation | boolean | false | 图像是否旋转
rotationAngle | float | 0.5 | 图像旋转角度
milliSec | int | 30 | 重绘图像所需间隔
blur | int | 0 | CSS3滤镜效果：模糊
brightness | int | 100 | CSS3滤镜效果：亮度
contrast | int | 100 | CSS3滤镜效果：对比度
grayScale | int | 0 | CSS3滤镜效果：灰度
hueRotate | int | 0 | CSS3滤镜效果：色相
invert | int | 0 | CSS3滤镜效果：反色
saturate | int | 100 | CSS3滤镜效果：饱和度
sepia | int | 0 | 深褐色
mixBlendMode | 'string' | 'normal' | CSS3混合选项

#### 方法列表：

**updateAudioAverage：**

调用`$(selector).logo('updateAudioAverage',  audioSamples);`更新音频均值。

参数类型 | 参数名 | 参数描述
---------|--------|----------
float | audioSamples | 音频数组

**clearCanvas：**

调用`$(selector).logo('clearCanvas');`清空Canvas内容。

**setUserImg：**

调用`$(selector).logo('setUserImg', img);`获取用户自定义的Logo地址，如果路径不存在默认为空字符串。

参数类型 | 参数名 | 参数描述
---------|--------|----------
string | img | 用户logo路径

**updateLogo：**

调用`$(selector).logo('updateLogo');`更新相关数据。

**drawLogo：**

调用`$(selector).logo('drawLogo');`绘制Logo。

**drawCanvas：**

调用`$(selector).logo('drawCanvas');`更新相关数据并绘制Logo。

**stopLogoTimer：**

调用`$(selector).logo('stopLogoTimer');`停止Logo计时器。

**runLogoTimer：**

调用`$(selector).logo('runLogoTimer');`开始Logo计时器。

**destroy：**

调用`$(selector).logo('destroy');`销毁logo所在canvas。

**set：**

调用`$(selector).logo('set', property, value);`设置logo插件相关参数，具体参数详见参数列表。

参数类型 | 参数名 | 参数描述 
---------|--------|----------
string | property | 属性名 
任意 | value | 属性对应值 

如何通过谷歌浏览器调试Wallpaper Engine
---
打开Wallpaper Engine，设置-综合，在CEF devtools port输入一个非占用端口，比如2333。

![image](https://steamuserimages-a.akamaihd.net/ugc/857225761278768000/B25BECE2E4B011814F70FE2BDDD9BABC5A021912/)

回到Wallpaper Engine，点击过滤，在左侧栏选择类型“网页”，来源“我的壁纸”；并选中你要调试的壁纸（这里我调试[4K]Audio Visualizer）

![image](https://steamuserimages-a.akamaihd.net/ugc/857225761278803478/E62BFEF8C98F07B5DF4C699083FC54E222BB1829/)

打开谷歌浏览器，输入地址`http://localhost:23333/`或则`http://127.0.0.1:23333/`（格式为：`http://localhost:你设置的端口号/`或则 `http://127.0.0.1:你设置的端口号/`）。如果没有显示请检查你设置的端口号是否被占用，并重新设置新的端口号，比如10086。

![image](https://steamuserimages-a.akamaihd.net/ugc/857225761278769702/5294064E61F048B1F3079877F67440720F24635E/)

点击网页中的超链接，操作你在Wallpaper Engine中设置的选项，开始调试。请善用console命令

![image](https://steamuserimages-a.akamaihd.net/ugc/857225761278772256/ABA22E4AB354221535459D95B43ED377C68DD063/)

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
* [particles](http://github.com/VincentGarreau/particles.js)