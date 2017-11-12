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
        sliderMode: ...,
        isLinearGradient: ...,
        ...
    });
```

#### 参数列表：

**幻灯片参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
sliderMode | string | 'wallpaper' | 壁纸模式选择，分别为：'color'、'wallpaper'、'directory'、'video'
isLinearGradient | boolean | false | 线性背景开关,color壁纸模式下选择单色背景或者线性渐变背景
sliderStyle | string | 'css' | 幻灯片切换模式，分别为：'css'、'img'、'canvas'
readStyle | string | 'sequential' | 切换壁纸时读取下个图片地址方式,分别为'sequential'、'random'
timeUnits | string | 'sec' | 时间单位：'sec'、'min'、'hour'
pauseTime | int | 30 | 当前背景停留时间
effect | string | 'none' | 背景切换特效
imgFit | string | 'fill' | IMG适应方式
imgBGColor | string | '255,255,255' | RGB格式颜色，IMG背景颜色
canvasFit | string | 'fill' | Canvas适应方式
canvasBGColor | string | '255,255,255' | RGB格式颜色，Canvas背景颜色

**video参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
videoProgress | float | 0 | 视频进度（0 - 1）
isVideoPlay | boolean | true | 视频播放状态
videoVolume | float | 0.75 | 视频音量（0 - 1）
playbackRate | float | 1.00 | 视频播放速度（0 - 任意）
videoFit | string | 'fill' | video适应方式
videoBGColor | string | '255,255,255' | RGB格式颜色，video背景颜色

**变换参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
isRotate3D | boolean | 0 | 启用背景跟随鼠标3D旋转
degSize | int | 5 | 启用3D旋转下背景旋转幅度
isBackgourndBlur | boolean | flase | 背景模糊开关
isBackgroundZoom | boolean | flase | 背景缩放开关
perspective | int | 0| 透视效果距离，0为不启用透视效果
width | float | 0.0 | 调用css transform方法scale(width, height)
height | float | 0.0 | 调用css transform方法scale(width, height)

**Audio参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
audioProgress | float | 0 | 音频进度（0.00 - 1.00）
isAudioPlay | boolean | false | 音频播放状态
isAudioLoop | boolean | false | 音频是否播放
audioVolume | float | 0.75 | 音频音量（0.00 - 1.00）

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

**setUserLinearGradient：**

调用`$(selector).slider('setUserLinearGradient', deg, color1, color2);`获取用户自定义的线性背景颜色和角度。

参数类型 | 参数名 | 参数描述
---------|--------|----------
int | deg | 线性渐变角度
string | color1 | 线性渐变初始颜色
string | color2 | 线性渐变终止颜色

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
int | index | 视频列表索引

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
float | progress | 视频进度（%）

**setVideoPlaybackRate：**

调用`$(selector).slider('setVideoProgress', backRate);`设置视频当前的播放速度。

参数类型 | 参数名 | 参数描述
---------|--------|----------
float | backRate | 视频播放速度（0.50 - 5.00）

**playVideo：**

调用`$(selector).slider('playVideo');`播放视频。

**pauseVideo：**

调用`$(selector).slider('pauseVideo');`暂停视频。

**setVideoVolume：**

调用`$(selector).slider('setVideoVolume', volume);`设置音量大小（%）。

参数类型 | 参数名 | 参数描述
---------|--------|----------
float | volume | 音量大小（%）

**getAudioList：**

调用`$(selector).slider('getAudioList');`从js/audioList.js中读取音频列表audioList。

**getAudioStr：**

调用`$(selector).slider('getAudioList', index);`从audioList读取索引对应值并转换成音频源。

参数类型 | 参数名 | 参数描述
---------|--------|----------
int | index | 音频列表索引

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
float | progress | 音频进度（%）

**playAudio：**

调用`$(selector).slider('playAudio');`播放音频。

**pauseAudio：**

调用`$(selector).slider('pauseAudio');`暂停音频。

**setAudioVolume：**

调用`$(selector).slider('setAudioVolume', volume);`设置音量大小（%）。

参数类型 | 参数名 | 参数描述
---------|--------|----------
float | volume | 音量大小（%）

**destroy：**

调用`$(selector).slider('destroy');`销毁slider所在canvas、img。


**initSlider：**

调用`$(selector).slider('initSlider');`初始化模式所需要的环境。

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