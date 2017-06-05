![mahua](https://steamuserimages-a.akamaihd.net/ugc/816685937288288292/89720D1D71A87391C3C1668779883A311D6EF73B/?interpolation=lanczos-none&output-format=jpeg&output-quality=95&fit=inside|268:268&composite-to%3D%2A%2C%2A%7C268%3A268&background-color=black)
##[4K]Circle Audio Visualizer(自定义背景&圆形音频可视化&多语言日期)
一个在Wallpaper Engine创意工坊上的开源项目

##Circle Audio Visualizer目前使用的插件

* jquery.audiovisualizer.js：用于生成音频圆环插件，如果你要使用它：
```javascript
    $('body').audiovisualizer({});

    function wallpaperAudioListener(audioArray) {
        wallpaper.audiovisualizer('drawCanvas', audioArray);
    }
    
    window.wallpaperRegisterAudioListener && window.wallpaperRegisterAudioListener(wallpaperAudioListener);
```
* jquery.date.js：基于moment-with-locales.min.js绘制日期插件如果你要使用它：
```javascript
    $('body').date({});
```
* juqery.slider.js：用于幻灯片切换插件，支持css、image、canvas切换，如果你要使用它：
```javascript
    $('body').slider({}); 
```
并在 applyUserProperties: function (properties) { // do something }, 后尾添加：
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

##有问题反馈
在使用中有任何问题，欢迎反馈给我，可以用以下联系方式跟我交流

* 邮件(909011298@qq.com)
* QQ: 909011298


##感激
感谢以下的项目,排名不分先后

* [jquery](http://jquery.com)
