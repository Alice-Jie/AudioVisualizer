![image](https://steamuserimages-a.akamaihd.net/ugc/842587364847342400/55201E5E7B04516568307E592F4EAD7BCC706638/)

# [4K]Audio Visualizer

一个在Wallpaper Engine创意工坊上的开源项目:
http://steamcommunity.com/sharedfiles/filedetails/?id=921617616

目前Circle Audio Visualizer使用了6个jquery插件，分别是`jquery.audiovisualizer.bars`、`jquery.audiovisualizer.circle`、`jquery.time`、`juqery.slider`、`jquery.particles`和`jquery.logo`。

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