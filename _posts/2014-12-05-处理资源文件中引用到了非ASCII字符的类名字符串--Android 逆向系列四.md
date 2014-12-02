---
layout : post
title : "处理资源文件中引用到了非ASCII字符的类名字符串--Android 逆向系列四"
category: "逆向工程"
tags: [Andorid, smali]
summary: "上一篇中提到了如何映射处理CLASS代码中的非ASCII代码。但是随之而来出现了一个新问题。就是有时候AndroidManifest.xml文件和布局文件中会引用到这些类。现在类型被映射了，而xml文件中相应的字符串没有被修改。那么重新打包签名安装后运行时会出现找不到相关的类，导致应用运行失败。现在我们就来解决这个问题。"
---


#### 处理资源文件中引用到了非ASCII字符的类名字符串

上一篇中提到了如何映射处理CLASS代码中的非ASCII代码。但是随之而来出现了一个新问题。就是有时候AndroidManifest.xml文件和布局文件中会引用到这些类。现在类型被映射了，而xml文件中相应的字符串没有被修改。那么重新打包签名安装后运行时会出现找不到相关的类，导致应用运行失败。

所以我们需要一种方法来处理这个问题。

1. 如果资源文件可以被apktool顺利解析，那么解析后的xml文件是字符文件，可以直接按映射关系进行修改。这种方法比较费事，也易出错。建议用工具自动化遍历解析后的xml文件替换处理。
2. 资源文件不能被apktool顺利解析。那么需要使用-r选项来禁用xml资源解析。这时生成的xml文件为编码后的二进制格式，所以需要开发工具来进行处理。

#### Android XML文件中字符串的存储方式
Android XML文件中字符串被以表格的形式存储在文件的头部。
##### Android XML开始部分的字节含义如下:

- 0-3 文件魔术数
- 4-7 文件大小(下图紫色框处)
- 8-11 字符串表帧头字节 0x01001c00
- 12-15 字符串表帧大小，Little indian格式(下图红色框处)
- 16-19 字符串个数，Little indian格式(下图绿色框处)
- 20-23 资源字符串个数，Little indian格式(下图绿色框处)
- 24-27 字符串编码方式。0:UTF-16; 0x00000100:UTF-8 (下图蓝色框处)
- 28-31 字符串内容位移。以帧头为基地址开始计算。(下图橙色框处)
- 32-35 资源字符串内容位移。以帧头为基地址开始计算。(下图橙色框处)
- 36-x 字符串位移地址表，4字节为一个数组，个数为前面计算出来的字符串个数。(下图褐色框处)
- x+1- 字符串编码表。

![字符串表帧](https://github.com/eriklu/eriklu.github.io/blob/master/images/android_xml.png)

##### 字符串编码表的项组成：

- 00-01 字符串长度/2 （红线标注处）
- 02-x 字符编码数据, x=2+字符串长度＊2（蓝线标注处）
- x+1-x+2 0000为结尾字符（绿线标注处）
![字符串项](https://github.com/eriklu/eriklu.github.io/blob/master/images/android_xml_string_item.png)
#### 解析处理Android XML文件中的字符串
现在我们了解了字符串的存储位置和编码方式，就可以写代码来处理xml字符串了。

#####处理过程中的一些注意细节

- 记得替换文件大小（4-7字节）、字符串表帧大小（12-15字节）和资源字符串的位移地址（32-35字节）
- 正确计算字符串表的大小。需要考虑是否存在资源字符串
- 字符串编码表长度需要4字节补齐

#### 参考实现代码
[AXMLStringTransformer.java](https://github.com/eriklu/SmaliDebugTool/blob/master/SmaliDebugTool/java/misc/AXMLStringTransformer.java)