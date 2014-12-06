---
layout : post
title : "“Locus Map Pro - Outdoor GPS”  APK Crack 分享（1）"
category: "逆向工程"
tags: [Andorid, smali]
summary: "“Locus Map Pro - Outdoor GPS”是一款户外徒步软件。具有记录徒步轨迹，显示加载离线地图等功能。
因为软件是外国公司开发的，没有支持中文。国内用户因为语言的问题使用极不方便。该软件在德国Android App市场，Google Play， 三星市场上架。为了减小开发包的大小，从3.10开始，ApK用到的部分so库需要从服务器上下载。下载过程会检测用户使用的APK市场，并需要登录用户帐号。因为众多周知的原因，我们大陆形成了独特的APK市场。手机厂家的自定义系统中根本没有内置这三家市场软件，导致用户直接下载失败。而APK开发者显然没考虑到中国市场的问题，所以仅仅提示“网络故障”，搞得用户莫名其妙。很多付费购买了APK的用户也无法正常使用。
基于这两点原因，特别是第二条，在开发者没有支持中国市场之前，我们只能自力更生的解决这些问题。"
---

### “Locus Map Pro - Outdoor GPS”  APK Crack 分享（1）
#### APK介绍
“Locus Map Pro - Outdoor GPS”是一款户外徒步软件。具有记录徒步轨迹，显示加载离线地图等功能。
因为软件是外国公司开发的，没有支持中文。国内用户因为语言的问题使用极不方便。该软件在德国Android App市场，Google Play， 三星市场上架。为了减小开发包的大小，从3.10开始，ApK用到的部分so库需要从服务器上下载。下载过程会检测用户使用的APK市场，并需要登录用户帐号。因为众多周知的原因，我们大陆形成了独特的APK市场。手机厂家的自定义系统中根本没有内置这三家市场软件，导致用户直接下载失败。而APK开发者显然没考虑到中国市场的问题，所以仅仅提示“网络故障”，搞得用户莫名其妙。很多付费购买了APK的用户也无法正常使用。
基于这两点原因，特别是第二条，在开发者没有支持中国市场之前，我们只能自力更生的解决这些问题。
#### 研究目的
- 汉化软件，方便国人使用
- 能顺利安装APK

#### 需要解决的问题和困难
- 因为需要重新打包，所以需要绕过APK的签名检测。
- 为了方便安装，需要把要下载的so内置到apk中。
- 因为不需要再下载so文件，所以需要绕过下载检测流程。
- 因为没有产生真正的购买过程，所以增强特性会被禁用，变成免费版本。所以需要解除限制。

现在我们以3.40版本为例，探讨如何解决上面的问题。

#### 解除签名限制
首先用apktool对apk解包
```
java -jar apktool2.0.jar d Locus3.40.apk -f -o outdir
```
输出结果如下：
>I: Using Apktool 2.0.0-Beta7 on Locus3.40.apk
I: Loading resource table...
I: Decoding AndroidManifest.xml with resources...
I: Loading resource table from file: C:\Users\monkey\apktool\framework\1.apk
I: Regular manifest package...
I: Decoding file-resources...
W: Could not decode attr value, using undecoded value instead: ns=, name=style,
value=0x7f0d0066
W: Could not decode attr value, using undecoded value instead: ns=, name=style,
value=0x7f0d0047
W: Could not decode attr value, using undecoded value instead: ns=, name=style,
value=0x7f0d007f
W: Could not decode attr value, using undecoded value instead: ns=, name=style,
value=0x7f0d0066
W: Could not decode attr value, using undecoded value instead: ns=, name=style,
value=0x7f0d006e
I: Decoding values */* XMLs...
**Can't find framework resources for package of id: -1.** You must install proper framework files, see project website for more info.

很不幸，解析资源时遇到不能识别的资源id（原因见黑体部分），解包过程退出。

我们先不处理资源，增加-r参数后，重新解包。
```
java -jar apktool2.0.jar d Locus3.40.apk -f -o outdir -r
```

这次输出如下
I: Using Apktool 2.0.0-Beta7 on Locus3.40.apk
I: Loading resource table...
I: Copying raw resources...
I: Loading resource table...
I: Baksmaling...
I: Copying assets and libs...
I: Copying unknown files/dir...
I: Copying original files...

解包过程顺利完成。

现在我们在smali文件中查找字符串**“Landroid/content/pm/Signature;”**, 在Mn.2.smali中找到下面的函数
``` smali
.method private static ･([Landroid/content/pm/Signature;)Z
    .locals 2

    .line 0
    if-eqz p0, :cond_0

    array-length v0, p0

    if-nez v0, :cond_1

    .line 298
    :cond_0
    const/4 v0, 0x0

    return v0

    .line 299
    :cond_1
    const/4 v0, 0x0

    aget-object v0, p0, v0

    invoke-virtual {v0}, Landroid/content/pm/Signature;->hashCode()I

    move-result v0

    const v1, 0x1a222754

    if-ne v0, v1, :cond_2

    .line 301
    const/4 v0, 0x1

    return v0

    .line 302
    :cond_2
    const/4 v0, 0x0

    aget-object v0, p0, v0

    invoke-virtual {v0}, Landroid/content/pm/Signature;->hashCode()I

    move-result v0

    const v1, -0x53ad97d7

    if-ne v0, v1, :cond_3

    .line 304
    const/4 v0, 0x1

    return v0

    .line 306
    :cond_3
    const/4 v0, 0x0

    return v0
.end method
```

这段代码是计算签名的hashcode，如何值为-0x53ad97d7或0x1a222754就认为签名是合法的。估计签名分别为免费版和pro版的签名证书是不同的。
这里有两种办法来绕过，一种是修改跳转指令：**if-ne**改为**if-eq**;另一种是比较前给**v0**重新赋值为和**v1**相同的值：**const v0, -0x53ad97d7**.
任选一种，修改后重新打包。

```
java -jar  apktool2.0.jar b outdir -f -o Locus3.40_modi.apk
```

I: Using Apktool 2.0.0-Beta7 on out
I: Smaling...
Exception in thread "main" org.jf.dexlib2.writer.util.TryListBuilder$InvalidTryException: Multile overlapping catches for Ljava/lang/Exception; with differenthandlers
        at org.jf.dexlib2.writer.util.TryListBuilder$MutableTryBlock.addHandler(TryListBuilder.java:180)
        at org.jf.dexlib2.writer.util.TryListBuilder.addHandler(TryListBuilder.java:311)
        at org.jf.dexlib2.writer.util.TryListBuilder.massageTryBlocks(TryListBuilder.java:69)
        at org.jf.dexlib2.writer.DexWriter.writeCodeItem(DexWriter.java:881)
        at org.jf.dexlib2.writer.DexWriter.writeDebugAndCodeItems(DexWriter.java:759)
        at org.jf.dexlib2.writer.DexWriter.writeTo(DexWriter.java:214)
        at org.jf.dexlib2.writer.DexWriter.writeTo(DexWriter.java:192)
        at brut.androlib.src.SmaliBuilder.build(SmaliBuilder.java:58)
        at brut.androlib.src.SmaliBuilder.build(SmaliBuilder.java:41)
        at brut.androlib.Androlib.buildSourcesSmali(Androlib.java:337)
        at brut.androlib.Androlib.buildSources(Androlib.java:298)
        at brut.androlib.Androlib.build(Androlib.java:284)
        at brut.androlib.Androlib.build(Androlib.java:258)
        at brut.apktool.Main.cmdBuild(Main.java:233)
        at brut.apktool.Main.main(Main.java:88)
        
很不幸，打包失败了。
使我们修改的原因导致的麽。实践证明，无论我们是否做修改，都无法打包成功。那我们该怎么解决这个问题呢。下一篇我们就来揭晓答案。
