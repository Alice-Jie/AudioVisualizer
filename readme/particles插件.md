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
        isParticles: ...,
        number: ...,
        ...
    });
```

#### 参数列表：

**基础参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
isParticles | boolean | false | 是否显示粒子
number | int | 100 | 粒子的数量
isDensity | boolean | false | 启用粒子密度区域
densityArea | int | 1000 | 粒子密度范围
opacity | float | 0.75 | 粒子的最大透明度
opacityRandom | boolean | false | 粒子的粒子的透明度是否随机
isStroke | boolean | false | 描边粒子开关
lineWidth | int | 1 | 描边宽度
isFill | boolean | true | 填充粒子开关

**颜色参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
color | string | '255,255,255' | RGB格式颜色，粒子的颜色
isColorFollow | boolean | false | 颜色跟随音频开关
colorRate | int | 10 | 颜色变化速率
colorRandom | boolean | false | 随机粒子颜色开关
shadowColor | string | '255,255,255' | RGB格式颜色，粒子的阴影颜色
shadowBlur | int | 0 | 粒子的阴影大小

**形状参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
shapeType | string | 'circle' | 粒子的形状
rotationAngle| int | 0 | 旋转粒子，负数为逆时针旋转，正数为顺时针旋转
angleRandom | boolean | false | 粒子的旋转角度是否随机

**大小参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
sizeValue | int | 5 | 粒子的最大半径
isSizeFollow | boolean | false | 粒子的大小是否跟随音频
sizeRate | int | 5 | 大小变化速率
sizeRandom | boolean | true | 粒子的半径是否随机

**连线参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
linkEnable | boolean | false | 粒子间是否显示连线
linkDistance | int | 100 | 粒子间显示连线所需要的距离
linkWidth | int | 2 | 粒子间连线的宽度
linkColor | string | '255,255,255' | RGB格式颜色，粒子间连线的颜色
linkColorRandom | boolean | false | 随机粒子间连线颜色开关
linkOpacity | float | 0.75 | 粒子间连线的透明度

**移动参数：**

| 名称 | 类型 | 默认| 描述
|------|------|-----|-----
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
