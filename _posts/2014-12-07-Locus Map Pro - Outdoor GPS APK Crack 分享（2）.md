---
layout : post
title : "“Locus Map Pro - Outdoor GPS”  APK Crack 分享（2）"
category: "逆向工程"
tags: [Andorid, smali]
summary: "前面我们发现用apktool把APK解包后，无法重新打包。这是什么原因呢？分析发现这是因为开发者在生成APK包的时候对代码进行了混淆。很多Java类的类名、方法名、字段名都被替换为非ascii字符。导致重新打包失败。例如上一篇我们修改的签名验证的函数就是如此。"
---

### “Locus Map Pro - Outdoor GPS”  APK Crack 分享（2）
#### 问题描述
前面我们发现用apktool把APK解包后，无法重新打包。这是什么原因呢？分析发现这是因为开发者在生成APK包的时候对代码进行了混淆。很多Java类的类名、方法名、字段名都被替换为非ascii字符。导致重新打包失败。例如上一篇我们修改的签名验证的函数就是如此。

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

    ……
.end method
```

我们可以看到函数名不是我们常见的ascii字符。
如果我们想重新打包，就要首先解决这个问题。

#### 把字符串重新映射为ascii码
利用混淆类似的原理。混淆是把ascii字符串映射为非ascii字符，我们需要一个类似的逆向过程。
这里我们借助apktool来帮我们完成这个工作。

apktool的代码是开源的。我们需要对代码做一些修改，让生成类名、字段名、方法名、代码内字符串的部分做一些修改，从而生成ascii字符的名称。

修改apktool源代码的过程在此略过，感兴趣的可以参考[《战胜混淆后的非ASCII字符 -- Android 逆向系列三》](http://eriklu.github.io/%E9%80%86%E5%90%91%E5%B7%A5%E7%A8%8B/%E6%88%98%E8%83%9C%E6%B7%B7%E6%B7%86%E5%90%8E%E7%9A%84%E9%9D%9EASCII%E5%AD%97%E7%AC%A6%20--%20Android%20%E9%80%86%E5%90%91%E7%B3%BB%E5%88%97%E4%B8%89.html)

我们把修改代码后编译出来的apk命名为apktool_modi.jar

#### 重新打包
按照上一篇的重新操作，我们发现可以打包成功了。
让我们暂时停下来休息一下，去解决接下来的挑战。