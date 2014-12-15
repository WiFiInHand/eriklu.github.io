---
layout : post
title : "解密被加密的类"
category: ""
tags: [android, 逆向工程, smali]
summary: "重新打包后，安装，程序直接退出。因为有些需要的类被加密了，解密后反射方法的方法名已经被映射为ascii，所以无法反射出相关方法，导致空指针异常。所以我们需要把类解密出来，并进行处理。"
---

重新打包后，安装，程序直接退出。因为有些需要的类被加密了，解密后反射方法的方法名已经被映射为ascii，所以无法反射出相关方法，导致空指针异常。所以我们需要把类解密出来，并进行处理。
### 解密被加密的类
重新打包后，安装，程序直接退出，查看系统日志，提示如下异常信息。
程序出现空指针异常。
>12-15 09:09:29.264: E/AndroidRuntime(857): FATAL EXCEPTION: main
12-15 09:09:29.264: E/AndroidRuntime(857): java.lang.RuntimeException: Unable to get provider locus.api.core.LocusDataProvider: java.lang.NullPointerException
12-15 09:09:29.264: E/AndroidRuntime(857): 	at android.app.ActivityThread.installProvider(ActivityThread.java:4822)
12-15 09:09:29.264: E/AndroidRuntime(857): 	at android.app.ActivityThread.installContentProviders(ActivityThread.java:4432)
12-15 09:09:29.264: E/AndroidRuntime(857): 	at android.app.ActivityThread.handleBindApplication(ActivityThread.java:4372)
12-15 09:09:29.264: E/AndroidRuntime(857): 	at android.app.ActivityThread.access$1300(ActivityThread.java:141)
12-15 09:09:29.264: E/AndroidRuntime(857): 	at android.app.ActivityThread$H.handleMessage(ActivityThread.java:1294)
12-15 09:09:29.264: E/AndroidRuntime(857): 	at android.os.Handler.dispatchMessage(Handler.java:99)
12-15 09:09:29.264: E/AndroidRuntime(857): 	at android.os.Looper.loop(Looper.java:137)
12-15 09:09:29.264: E/AndroidRuntime(857): 	at android.app.ActivityThread.main(ActivityThread.java:5041)
12-15 09:09:29.264: E/AndroidRuntime(857): 	at java.lang.reflect.Method.invokeNative(Native Method)
12-15 09:09:29.264: E/AndroidRuntime(857): 	at java.lang.reflect.Method.invoke(Method.java:511)
12-15 09:09:29.264: E/AndroidRuntime(857): 	at com.android.internal.os.ZygoteInit$MethodAndArgsCaller.run(ZygoteInit.java:793)
12-15 09:09:29.264: E/AndroidRuntime(857): 	at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:560)
12-15 09:09:29.264: E/AndroidRuntime(857): 	at dalvik.system.NativeStart.main(Native Method)
12-15 09:09:29.264: E/AndroidRuntime(857): Caused by: java.lang.NullPointerException
**12-15 09:09:29.264: E/AndroidRuntime(857): 	at com.asamm.locus.core.MainApplication._cb8b(:103)**
12-15 09:09:29.264: E/AndroidRuntime(857): 	at o._c5a7.onCreate(:43)
12-15 09:09:29.264: E/AndroidRuntime(857): 	at android.content.ContentProvider.attachInfo(ContentProvider.java:1058)
12-15 09:09:29.264: E/AndroidRuntime(857): 	at android.app.ActivityThread.installProvider(ActivityThread.java:4819)
12-15 09:09:29.264: E/AndroidRuntime(857): 	... 12 more

分析异常发现，最后抛出异常的应用层函数为
**12-15 09:09:29.264: E/AndroidRuntime(857): 	at com.asamm.locus.core.MainApplication._cb8b(:103)**

异常中显示了代码行数103(**Locus编译时没有删除调试信息，所以可以显示行号。若删除调试信息，这里显示的是指令位移**)。
直接在MainApplication.smali文件中搜索".line 103"(不包含引号).

```
……
.line 102
    new-instance v0, Lcom/asamm/locus/core/MainApplication$if;

    invoke-direct {v0, p0}, Lcom/asamm/locus/core/MainApplication$if;-><init>(Lcom/asamm/locus/core/MainApplication;)V

    iput-object v0, p0, Lcom/asamm/locus/core/MainApplication;->_cb8e:Lcom/asamm/locus/core/MainApplication$if;

    .line 103
    iget-object v7, p0, Lcom/asamm/locus/core/MainApplication;->_cb8e:Lcom/asamm/locus/core/MainApplication$if;

    move-object v6, v7

    move-object v6, v7

    iget-object v0, v7, Lcom/asamm/locus/core/MainApplication$if;->_efbda5:Lcom/asamm/locus/core/MainApplication;

    invoke-virtual {v0}, Lcom/asamm/locus/core/MainApplication;->getApplicationContext()Landroid/content/Context;

    move-result-object v8

    invoke-static {}, Lo/Mn;->_cb88()Z

    move-result v0

    if-eqz v0, :cond_2

    invoke-static {v8}, Landroid/preference/PreferenceManager;->getDefaultSharedPreferences(Landroid/content/Context;)Landroid/content/SharedPreferences;

    move-result-object v9

    invoke-virtual {v8}, Landroid/content/Context;->getResources()Landroid/content/res/Resources;

    move-result-object v0

    move-object v8, v0

    invoke-virtual {v0}, Landroid/content/res/Resources;->getConfiguration()Landroid/content/res/Configuration;

    move-result-object v10

    const-string v0, "KEY_S_LANGUAGE"

    const-string v1, "default"

    invoke-interface {v9, v0, v1}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    move-object v9, v0

    const-string v1, "default"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_2

    iget-object v0, v10, Landroid/content/res/Configuration;->locale:Ljava/util/Locale;

    invoke-virtual {v0}, Ljava/util/Locale;->getLanguage()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v0, v9}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_2

    const-string v12, "_"

    move-object v11, v9

    new-instance v0, Ljava/util/ArrayList;

    invoke-direct {v0}, Ljava/util/ArrayList;-><init>()V

    invoke-static {v9, v12, v0}, Lo/Mm;->_efbda5(Ljava/lang/String;Ljava/lang/String;Ljava/util/ArrayList;)Ljava/util/ArrayList;

    move-result-object v0

    move-object v11, v0

    invoke-interface {v0}, Ljava/util/List;->size()I

    move-result v0

    const/4 v1, 0x1

    if-ne v0, v1, :cond_1

    new-instance v0, Ljava/util/Locale;

    invoke-direct {v0, v9}, Ljava/util/Locale;-><init>(Ljava/lang/String;)V

    iput-object v0, v7, Lcom/asamm/locus/core/MainApplication$if;->_cb8b:Ljava/util/Locale;

    goto :goto_0

    :cond_1
    new-instance v0, Ljava/util/Locale;

    const/4 v1, 0x0

    invoke-interface {v11, v1}, Ljava/util/List;->get(I)Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Ljava/lang/String;

    const/4 v2, 0x1

    invoke-interface {v11, v2}, Ljava/util/List;->get(I)Ljava/lang/Object;

    move-result-object v2

    check-cast v2, Ljava/lang/String;

    invoke-direct {v0, v1, v2}, Ljava/util/Locale;-><init>(Ljava/lang/String;Ljava/lang/String;)V

    iput-object v0, v7, Lcom/asamm/locus/core/MainApplication$if;->_cb8b:Ljava/util/Locale;

    :goto_0
    iget-object v0, v7, Lcom/asamm/locus/core/MainApplication$if;->_cb8b:Ljava/util/Locale;

    iput-object v0, v10, Landroid/content/res/Configuration;->locale:Ljava/util/Locale;

    invoke-virtual {v8}, Landroid/content/res/Resources;->getDisplayMetrics()Landroid/util/DisplayMetrics;

    move-result-object v0

    invoke-virtual {v8, v10, v0}, Landroid/content/res/Resources;->updateConfiguration(Landroid/content/res/Configuration;Landroid/util/DisplayMetrics;)V

    :cond_2
    iget-object v0, v6, Lcom/asamm/locus/core/MainApplication$if;->_efbda5:Lcom/asamm/locus/core/MainApplication;

    goto :goto_1

    :catchall_0
    move-exception v0

    invoke-virtual {v0}, Ljava/lang/Throwable;->getCause()Ljava/lang/Throwable;

    move-result-object v0

    throw v0

    :goto_1
    :try_start_0
    const/4 v1, 0x1

    new-array v1, v1, [Ljava/lang/Object;

    const/4 v2, 0x0

    aput-object v0, v1, v2

#**加载加密的o.LY类**
    const-string v0, "o.LY"

    invoke-static {v0}, Lo/LY$_e383bb;->_cb8f(Ljava/lang/String;)Ljava/lang/Class;

    move-result-object v0

    const-string v2, "_cb8b"

    const/4 v3, 0x1

    new-array v3, v3, [Ljava/lang/Class;

    const-class v4, Lcom/asamm/locus/core/MainApplication;

    const/4 v5, 0x0

    aput-object v4, v3, v5

    invoke-virtual {v0, v2, v3}, Ljava/lang/Class;->getMethod(Ljava/lang/String;[Ljava/lang/Class;)Ljava/lang/reflect/Method;

    move-result-object v0

    const/4 v2, 0x0
#**抛出异常的实际是下面这句，因为v0为null值**
    invoke-virtual {v0, v2, v1}, Ljava/lang/reflect/Method;->invoke(Ljava/lang/Object;[Ljava/lang/Object;)Ljava/lang/Object;
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_0
……

```

代码中通过调用**o/LY$_e383bb**的**_cb8f**方法加载一个类定义对象。奇怪的是我们翻查了代码，没有发现**o.LY**类的存在。一度我怀疑是**APKTool**工具存在问题，部分类在反编译时丢失了。查看了**apktool**代码，发现dex文件中显示的类的个数和解析出的类的个数相同。分析**o/LY$_e383bb**的**_cb8f**的方法，发现是这里面动态的实现了加载o.LY类。

LY$_e383bb.smali文件又9338行，这里就简单介绍下里面的实现原理。
有一个类加载器和o.LY类的代码被压缩加密后存储为字节数组，存储为类的静态字段。类先解密类加载器代码，然后用类加载器代码加载o.LY类。

现在解释下找到解密后的类的方法。
因为类字节的压缩、加密，解密最终都是通过字节数据来传递的。所以我们先以**[B**来确认代码的相关位置。
解密代码的最后一步，从一个数组中读取一个整数值，来作为最终字节码的长度，然后生成该长度的数组，把字节码最终解密到该数组中。

下面就是找到的符合特征的地方。

```
    :try_start_15
#计算出解密需要的长度
    const/16 v1, 0x26

    aget-byte v1, v16, v1

    and-int/lit16 v1, v1, 0xff

    const/16 v2, 0x27

    aget-byte v2, v16, v2

    shl-int/lit8 v2, v2, 0x8

    int-to-char v2, v2

    or-int/2addr v1, v2

    const/16 v2, 0x28

    aget-byte v2, v16, v2

    and-int/lit16 v2, v2, 0xff

    shl-int/lit8 v2, v2, 0x10

    or-int/2addr v1, v2

    const/16 v2, 0x29

    aget-byte v2, v16, v2

    shl-int/lit8 v2, v2, 0x18

    or-int/2addr v1, v2

#计算解压后代码的动态长度，生成合适大小的数组
    new-array v1, v1, [B

    goto :goto_17

    :catchall_13
    move-exception v0

    invoke-virtual {v0}, Ljava/lang/Throwable;->getCause()Ljava/lang/Throwable;

    move-result-object v0

    throw v0
    :try_end_15
    .catch Ljava/lang/Exception; {:try_start_15 .. :try_end_15} :catch_0

    :goto_17
    :try_start_16
    const/4 v2, 0x1

    new-array v4, v2, [Ljava/lang/Object;

    const/4 v2, 0x0
#数组被放在v4的第一个值中。
    aput-object v1, v4, v2

    const/16 v2, 0x251

    const/16 v5, 0x1f4

    const/16 v6, 0x15

    invoke-static {v2, v5, v6}, Lo/LY$_e383bb;->_cb88(III)Ljava/lang/String;

    move-result-object v2

    invoke-static {v2}, Ljava/lang/Class;->forName(Ljava/lang/String;)Ljava/lang/Class;

    move-result-object v2

    sget-object v5, Lo/LY$_e383bb;->_cabe:[S

    const/4 v6, 0x0

    aget-short v5, v5, v6

    add-int/lit8 v5, v5, 0x1

    and-int/lit8 v6, v5, 0xe

    const/16 v7, 0x252

    invoke-static {v7, v5, v6}, Lo/LY$_e383bb;->_cb88(III)Ljava/lang/String;

    move-result-object v5

    const/4 v6, 0x1

    new-array v6, v6, [Ljava/lang/Class;

    const-class v7, [B

    const/4 v8, 0x0

    aput-object v7, v6, v8

    invoke-virtual {v2, v5, v6}, Ljava/lang/Class;->getMethod(Ljava/lang/String;[Ljava/lang/Class;)Ljava/lang/reflect/Method;

    move-result-object v2

    invoke-virtual {v2, v3, v4}, Ljava/lang/reflect/Method;->invoke(Ljava/lang/Object;[Ljava/lang/Object;)Ljava/lang/Object;

    move-result-object v2
#这里类自己码已经在内存里解密存在于变量v1里面。

```

现在我们借助DebugTool工具，把数组信息输出到硬盘上。
DebugTool是我写的一组smali代码输出工具。可以在下面地址找到它。
[DebugTool](https://github.com/eriklu/SmaliDebugTool)

现在我们在代码中增加输出语句。
修改上面的代码如下。
```
    invoke-virtual {v2, v5, v6}, Ljava/lang/Class;->getMethod(Ljava/lang/String;[Ljava/lang/Class;)Ljava/lang/reflect/Method;

    move-result-object v2

    invoke-virtual {v2, v3, v4}, Ljava/lang/reflect/Method;->invoke(Ljava/lang/Object;[Ljava/lang/Object;)Ljava/lang/Object;

    move-result-object v2
#这里类自己码已经在内存里解密存在于变量v1里面。
   invoke-static {v1}, Ldebug/DebugTool;->log2File([B)V
```

这段代码里v1的值没有被修改过，所以可以直接输出，否则提前保存v1的原始值。
这里类加载器的代码和o.LY的代码都会被输出，o.LY的代码保存在类加载器的后面。所以需要对输出文件处理，提取出o.LY的代码。o.LY的字节码存储为一个dex文件格式。所以我们把它存储为o.LY.dex,让后把它压缩为o.LY.zip，然后重命名为o.LY.apk.
最后是用我们自己编译的apktool工具解出o.LY的smali代码.
因为原来的目录已经存在了ly.smali,所以我们把这个LY.smali重新命名为LY.4.smali，把它拷贝到我们的locus的smali的o目录下。
现在因为我们已经把类代码直接解密出来了，所以不需要在对o.LY的代码解密了，所以替换**o/LY$_e383bb**的内如下：

```
.class public Lo/LY$_e383bb;
.super Ljava/lang/Object;


.method public static _cb8f(Ljava/lang/String;)Ljava/lang/Class;
    .locals 5
    
#这里直接返回o.LY类对象
    const-class v0, Lo/LY;

    check-cast v0, Ljava/lang/Class;

    return-object v0
.end method

```

至此o.LY的代码解密完毕.

重新打包，运行，还是报错。因为还有一个加密的类**o.aA**.
用同样的方法处理，再次打包运行。
现在发现，apk终于可以运行了， 很是兴奋。但是提示需要下载数据，数据还是下载不了。
不要急，接下来我们就解决运行所需要的数据的问题。
