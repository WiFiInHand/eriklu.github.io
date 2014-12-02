---
layout : post
title : "Android apk 逆向 -- Android 逆向系列一"
category: "逆向工程"
tags: [Andorid, smali, tool]
summary: "Android apk 逆向 入门知识"
---

### Android apk 逆向 -- Android 逆向系列一
### 入门介绍常用工具介绍

1. ADT android应用开发工具包，用来开发一些代码，必要时可以给应用添加一些自己开发的功能，也可以写一些调试工具类代码。
2. NDK android开发so库的工具包。包含一些工具可以查看so库文件的信息。
3. ApkTool 重量级APK逆向工具，可以把apk文件解包、重打包。最大的问题是经常遇到一些不能识别的资源，终止解包过程。
4. dex2jar 一组工具包，总重要的功能是把dex文件反编译为class文件。另一个重要功能就是给apk文件签名。
5. class文件查看工具: JD-GUI(老牌工具，速度快，有些代码反编译不了)、luyten-0.4.3.jar(能比JD-GUI反编译更多代码，但是功能不及JD-GUI)
6. AXMLPrinter2.jar 显示apk中xml文件的内容。在apktool不能工作时可以帮大忙。
7. BakeSmali 把apk反编译成smali代码的工具。apktool已经集成了该功能。
8. DroidBox apk沙箱模拟器
9. APIMonitor api调用监控工具
10. 反汇编工具：IDA、Hopper Disassembler(Mac平台)
11. 网络抓包工具：wireshark、fidler2、minisniffer、Charles、Eavesdrop(Mac平台)
12. 集成工具: APKDB、ADBIDE
13. 二进制文件编辑工具:UtralEdit、0xED(Mac平台)、Hex Fiend(Mac平台)
14. shell、cygwin 代码查找好帮手
15. 其他工具
	1. 在线base64、MD5、SHA1计算网站
	2. bouncycastle加密套件，android系统内置了该加密套件，而Oracle JDK默认没有内置，有些实现细节的不同会导致相同的代码加解密结果不同。
	3. smali指令表、arm汇编指令表

### 常见目标
1. 解除apk的部分功能限制
2. 寻找apk通讯加密算法
3. 删除广告
4. 探索某些功能的实现方法
5. 汉化
6. 加入广告牟利
7. ……

### 常规步骤
1. 用apktool把apk解包。
	解包命令行：java -jar apktool.jar d xxx.apk -o outdir -f
	如果遇到资源解包出错，可以增加 -r 选项禁用解析资源功能。禁用后输出的资源文件是原始格式，可以用AXMLPrinter2.jar查看
	集成工具会自动调用完成解包。
2. 用解压工具解压apk中的classes.dex文件，用dex2jar工具把dex文件转换成jar文件。
	windows平台可以直接把classes.dex拖动到d2j-dex2jar.bat文件上
	linux/mac平台执行 d2j-dex2jar.sh classes.dex
	最后会在当前目录生成classes-dex2jar.jar
3. 使用DJ-GUI查看classes-dex2jar.jar，寻找相关功能代码，完成自己计划的目标。
4. 根据需要修改smali文件，添加自己想要的功能。这一步会综合使用“常用工具介绍”的各种工具。
5. 用apktool工具重新打包
	重打包命令：java -jar apktool.jar b apkdir -o xxx.apk -f
	这里apktool要用到apt包中的aapt工具，确保合适的配置了path环境变量，包含了aapt所在的路径
6. 用dex2jar工具对生成的apk重新签名
	签名工具为:d2j-apk-sign
	windows平台可以直接把xxx.apk拖动到d2j-apk-sign.bat文件上
	linux/mac平台执行 d2j-apk-sign.sh xxx.apk
7. 把签名后的apk文件，安装到设备上或模拟器上进行测试，若OK结束，否则返回第3步。

### 常见问题
1. apktool提示资源id找不到？

	方法一：使用－r参数，禁用资源解析功能能。如果仅凭代码就可以解决您的问题，这种方法最简单了。

	方法二、升级您的apktool到最新版。

	方法三、寻找合适的 framework.res添加到apktool里面     
		命令行: java -jar apktool.jar if framework.res
2. 用JD-GUI查看代码时部分方法代码不能反编译？

	反编译工具不能完美的翻遍出源代码，特别时混淆后的代码。经验表明含有大量分支和异常的代码容易反编译不了。大型函数反编译不了。

	可以换用luyten试试。

	直接阅读smali代码
3. 为什么JD-GUI中显示的代码中函数名、字段名都是a、b这些无意义的字母。

	因为class代码较容易被反编译，所以一般情况下，开发者都会对对代码进行混淆，来增加逆向的难度。

4. 为什么JD-GUI中显示的代码中函数名、字段名除了a、b这些无意义的字母，还有一些不认识的飞ascii字符。

	也是混淆器的作用。这样生成的文件名不能在window平台长创建。
5. 为什么修改后的apk文件安装不了？

	建议使用adb工具进行安装。
	adb时adt工具包中的工具。
	在手机开启调试模式后，使用下面的命令行安装。
		adb install -r xxx-signed.apk
	失败时会提示原因。根据原因采取相应措施
	
6. 修改后的应用运行中退出。

	可能原因： 
	1. 修改的smali文件存在错误，生成的class文件不能通过虚拟机的校验。
	2. apk中存在签名校验，检测到签名改变后退出。使用adt开发包中的monitor工具查看运行时日志。因为真机的输出消息比较多，建议使用模拟器来测试。

### 修改smali文件注意事项
1. 注意调整.local的参数个数。
2. 充分利用即将要被赋值的变量。
3. 只能使用v0~v15变量。
4. 数值常量使用16进制表示。如0x1
5. 如果增加指令较多，建议写成单独的函数来调用。
