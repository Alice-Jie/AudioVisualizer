time插件
---

#### 说明：
time插件用于创建一个canvas,创建一个canvas并绘制时间日期。

#### 使用：

初始化time插件如下：


```javascript
    $(selector).time();
```

你也可以传递一些参数初始化time插件(具体参数详见参数列表):


```javascript
    $(selector).time({
        isDate: ...,
        isStroke: ...,
        ...
    });
```

#### 参数列表：

**日期参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
isDate | boolean | true | 显示时间日期
isStroke | boolean | false | 描边时间日期开关
lineWidth | int | 1 | 描边宽度
isFill | boolean | true | 填充时间日期开关

**颜色参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
colorMode | string | 'monochrome' |  颜色模式标识字符串：'monochrome'、'colorTransformation'、'rainBow'
color | string | '255,255,255' |  RGB格式颜色，用于设置context.fillStyle、strokeStyle
shadowColor | string | '255,255,255' |  RGB格式颜色，用于设置context.shadowColor
shadowBlur | int | 15 | 用于设置shadowBlur
isRandomColor | boolean | true | 随机颜色变换开关
firstColor | string | '255,255,255' | 初始颜色
secondColor | string | '255,0,0' | 最终颜色
isChangeBlur | boolean | false | 颜色变换shadowBlur绑定

**基础参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
opacity | float | 0.90 | canvas的不透明度
language | string | 'zh_cn' | 日期语言
timeStyle | string | 'hh:mm:ss a' | 时间显示风格
dateStyle | string | 'LL dddd' | 日期显示风格
isFormat | true | false | 是否按时间格式规范转换字符串
userTimeStyle | string | '' | 自定义时间显示字符串
userDateStyle | string | '' | 自定义日期显示字符串
fontFamily | string | 'Microsoft YaHei' | 字体样式
timeFontSize | int | 60 | 时间字体大小
dateFontSize | int | 30 | 日期字体大小
distance | int | 0 | 时间与日期之间距离

**天气参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
weatherProvider | string | 'sina' | 天气API提供者
currentCity | string | '' | 指定显示天气的城市

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

**setCity：**

调用`$(selector).time('setCity', cityStr);`清除canvas内容。

参数类型 | 参数名 | 参数描述
---------|--------|----------
string | cityStr | 城市名（仅限中国）

**clearCanvas：**

调用`$(selector).time('clearCanvas');`清除canvas内容。

**updateDate：**

调用`$(selector).time('updateDate');`更新时间日期信息

**drawDate：**

调用`$(selector).time('drawDate');`绘制时间日期

**drawCanvas：**

调用`$(selector).time('drawCanvas');`更新日期信息并绘制时间日期

**stopDateTimer：**

调用`$(selector).time('stopDateTimer');`停止日期计时器

**startDateTimer：**

调用`$(selector).time('runDateTimer');`开始日期计时器，间隔1秒重绘时间和日期

**updateWeather：**

调用`$(selector).time('updataWeather');`更新天气信息

**stopWeatherTimer：**

调用`$(selector).time('stopWeatherTimer');`停止天气计时器

**startWeatherTimer：**

调用`$(selector).time('runWeatherTimer');`开始天气计时器，间隔三个小时重绘天气信息

**destroy：**

调用`$(selector).time('destroy');`销毁日期所在canvas

**set：**

调用`$(selector).time('set', property, value);`设置date插件相关参数，具体参数详见参数列表。

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
- HH：小时（二十四小时制）
- hh：小时（十二小时制）
- mm：分钟
- ss：秒
- a：时间段
- dddd：星期