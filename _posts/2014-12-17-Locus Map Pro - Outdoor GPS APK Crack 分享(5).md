---
layout : post
title : "处理资源中的非ascii字符"
category: ""
tags: [android, 逆向工程, smali]
summary: "下载数据终于想办法绕过去了，但是启动应用后，应用还是退出了，究竟是什么原因呢？"
---

下载数据终于想办法绕过去了，但是启动应用后，应用还是退出了，究竟是什么原因呢？

### 处理资源中的非ascii字符
现在启动应用，应用异常退出，抛出异常信息如下:
>12-15 11:51:59.396: E/AndroidRuntime(32656): FATAL EXCEPTION: main
12-15 11:51:59.396: E/AndroidRuntime(32656): java.lang.RuntimeException: Unable to start activity ComponentInfo{menion.android.locus.pro/com.asamm.locus.basic.MainActivityBasic}: android.view.InflateException: Binary XML file line #162: Error inflating class o.ﾇ
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:2180)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.app.ActivityThread.handleLaunchActivity(ActivityThread.java:2230)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.app.ActivityThread.access$600(ActivityThread.java:141)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1234)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.os.Handler.dispatchMessage(Handler.java:99)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.os.Looper.loop(Looper.java:137)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.app.ActivityThread.main(ActivityThread.java:5041)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at java.lang.reflect.Method.invokeNative(Native Method)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at java.lang.reflect.Method.invoke(Method.java:511)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at com.android.internal.os.ZygoteInit$MethodAndArgsCaller.run(ZygoteInit.java:793)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:560)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at dalvik.system.NativeStart.main(Native Method)
12-15 11:51:59.396: E/AndroidRuntime(32656): Caused by: android.view.InflateException: Binary XML file line #162: Error inflating class o.ﾇ
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.view.LayoutInflater.createViewFromTag(LayoutInflater.java:698)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.view.LayoutInflater.rInflate(LayoutInflater.java:746)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.view.LayoutInflater.rInflate(LayoutInflater.java:749)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.view.LayoutInflater.rInflate(LayoutInflater.java:749)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.view.LayoutInflater.rInflate(LayoutInflater.java:749)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.view.LayoutInflater.inflate(LayoutInflater.java:489)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.view.LayoutInflater.inflate(LayoutInflater.java:396)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.view.LayoutInflater.inflate(LayoutInflater.java:352)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.view.View.inflate(View.java:16465)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at o._efbe83.onCreate(:284)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.app.Activity.performCreate(Activity.java:5104)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.app.Instrumentation.callActivityOnCreate(Instrumentation.java:1080)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:2144)
12-15 11:51:59.396: E/AndroidRuntime(32656):    ... 11 more
**12-15 11:51:59.396: E/AndroidRuntime(32656): Caused by: java.lang.ClassNotFoundException: Didn't find class "o.ﾇ" on path: /data/app/menion.android.locus.pro-1.apk**
12-15 11:51:59.396: E/AndroidRuntime(32656):    at dalvik.system.BaseDexClassLoader.findClass(BaseDexClassLoader.java:65)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at java.lang.ClassLoader.loadClass(ClassLoader.java:501)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at java.lang.ClassLoader.loadClass(ClassLoader.java:461)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.view.LayoutInflater.createView(LayoutInflater.java:552)
12-15 11:51:59.396: E/AndroidRuntime(32656):    at android.view.LayoutInflater.createViewFromTag(LayoutInflater.java:687)
12-15 11:51:59.396: E/AndroidRuntime(32656):    ... 23 more

提示很明显找不到一个类:**"o.ﾇ"**。

这是因为资源中引用到了类名，而这个类名现在已经不存在了。
我们需要把资源中的类名替换为新的类名。
需要替换的文件有Androidmanifeste.xml和layout文件夹下的xml文件。

如何替换资源中的特殊字符，请参考我的博客:
[处理资源文件中引用到了非ASCII字符的类名字符串--Android 逆向系列四](http://eriklu.github.io/%E9%80%86%E5%90%91%E5%B7%A5%E7%A8%8B/%E5%A4%84%E7%90%86%E8%B5%84%E6%BA%90%E6%96%87%E4%BB%B6%E4%B8%AD%E5%BC%95%E7%94%A8%E5%88%B0%E4%BA%86%E9%9D%9EASCII%E5%AD%97%E7%AC%A6%E7%9A%84%E7%B1%BB%E5%90%8D%E5%AD%97%E7%AC%A6%E4%B8%B2--Android%20%E9%80%86%E5%90%91%E7%B3%BB%E5%88%97%E5%9B%9B.html)
我已经提供了代码的参考实现：
[AXMLStringTransformer.java](https://github.com/eriklu/SmaliDebugTool/blob/master/SmaliDebugTool/java/misc/AXMLStringTransformer.java)
我们把资源文件处理后，重新打包，运行。
应用终于启动了，但是应用变成了免费版本。
