## v4.1.5更新说明

添加的筛选此过多，整个页面会很长看不到保存按钮。
更改为固定长度，超过长度出现滚动条

## v4.1.6更新说明

#### 同一个tab页跳转之后没有生效。

比如这个是列表页-https://nga.178.com/thread.php?fid=-81981，这个是详情页-https://nga.178.com/read.php?tid=37601732，在生命之杯列表页做了屏蔽关键字的配置，详情页没有配置。

先打开列表页，没有问题，在点进详情页，刷新页面，然后后退或者再点击到列表页，过滤器就没有反应了，只有再次刷新才有反应。

修复了这个问题。

#### 屏蔽计数不准确

还是刚才的例子，假如列表页屏蔽了2条，进入详情页，再后退，插件图标显示屏蔽了4条。重复操作，屏蔽数每次增加2。

也就是计数不准确的问题，已修复。

## v4.1.7更新说明

增加导入导出配置的功能，方便在不同设备间同步，目前导入会覆盖当前配置

## v4.1.8更新说明

优化导入导出策略

## v4.1.9更新说明

去掉ga统计，流畅多了。。。。
之前经常会出现打开网页之后屏蔽的特别慢的问题，现在才发现是ga请求卡住了

## v4.2.0更新说明

增加了同步机制，可以通过配置Gitee信息，实现多端同步

## v5.0.0更新说明

汉化，内置常用网站屏蔽配置

## v5.0.1更新说明

鼠标放到生效规则上，出现的屏蔽详情提示框，只显示已屏蔽的内容详情，方便调试查看。

