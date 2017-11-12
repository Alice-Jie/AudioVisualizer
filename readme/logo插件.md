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

**基础参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
isLogo | boolean | flase | 显示LOGO开关
isCircular | boolean | true | LOGO圆形显示开关
opacity | float | 0.9 | canvas不透明度
isStroke | boolean | false | 圆形外描边开关
strokeColor |'string' | '255,255,255' | RGB格式颜色，用于设置context.strokeStyle
lineWidth | int | 1 | 连线宽度
dottedLine | int | 0 | 虚线间隔
shadowColor | int | '255,255,255' | RGB格式颜色，用于设置context.shadowColor
shadowBlur | int | 0 | 用于设置shadowBlur

**标志参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
zoom | float | 0.1 | 按比例缩放图像
isZoomFollow | boolean | false | 图像是否跟随音频缩放
zoomRate | int | 5 | 缩放变化速率
widthRatio | float | 1.0 | 图像宽度按比例拉伸
heightRatio | float | 1.0 | 图像高度按比例拉伸
initialAngle | int | 0 | 图像初始旋转角度
isRotation | boolean | false | 图像是否旋转
rotationAngle | float | 0.5 | 图像旋转角度
milliSec | int | 30 | 重绘图像所需间隔

**滤镜参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
blur | int | 0 | CSS3滤镜效果：模糊
brightness | int | 100 | CSS3滤镜效果：亮度
contrast | int | 100 | CSS3滤镜效果：对比度
grayScale | int | 0 | CSS3滤镜效果：灰度
hueRotate | int | 0 | CSS3滤镜效果：色相
invert | int | 0 | CSS3滤镜效果：反色
saturate | int | 100 | CSS3滤镜效果：饱和度
sepia | int | 0 | 深褐色

**混合模式：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
mixBlendMode | 'string' | 'normal' | CSS3混合选项

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