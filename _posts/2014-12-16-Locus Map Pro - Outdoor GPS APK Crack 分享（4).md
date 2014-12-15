---
layout : post
title : "准备运行需要的数据"
category: ""
tags: [android, 逆向工程, smali]
summary: "应用程序可以运行了，但是提示运行需要下载大约5M的数据，点击下载，总是提示网络错误。怎么办呢？"
---

应用程序可以运行了，但是提示运行需要下载大约5M的数据，点击下载，总是提示网络错误。怎么办呢？
### 准备运行需要的数据
分析代码，并综合热心网友提供的信息。发现所谓的需要的数据就是两个.so文件:libproj.so和libjsqlite.so。
下载数据需要验证用户的购买信息。支持google play、三星应用市场和德国应用市场的账户信息。
要攻克账号这块，困难重重。
只好从别的地方下功夫了。
热心网友提供了apk的钛备份数据。里面有下载好的.so文件。当然了只有热心网友的手机芯片的版本armv7.这对国内用户差不多就够了。
我们就制作armv7特别版吧。

把两个so文件拷贝到lib\armeabi-v7a目录。

现在看看哪里加载了这两个so文件。
搜索"proj"或"jsql"(包括引号部分)，找到了文件My.2.smali.

```

.class public Lo/My;
.super Ljava/lang/Object;
.source ""


# static fields
.field private static final _cb8a:[Ljava/lang/String;

.field private static final _efbda5:Ljava/lang/String;



# direct methods
.method static constructor <clinit>()V
    .locals 3

    .line 0
    const-class v0, Lo/My;

    invoke-virtual {v0}, Ljava/lang/Class;->getSimpleName()Ljava/lang/String;

    move-result-object v0

    sput-object v0, Lo/My;->_efbda5:Ljava/lang/String;

    .line 28
    const/4 v0, 0x3

    new-array v0, v0, [Ljava/lang/String;

    const-string v1, "database_sqlcipher"

    const/4 v2, 0x0

    aput-object v1, v0, v2

    const-string v1, "sqlcipher_android"

    const/4 v2, 0x1

    aput-object v1, v0, v2

    const-string v1, "stlport_shared"

    const/4 v2, 0x2

    aput-object v1, v0, v2

    sput-object v0, Lo/My;->_cb8a:[Ljava/lang/String;

    return-void
.end method

.method public constructor <init>()V
    .locals 0

    .line 0
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method


#检查需要的so温家你是否存在
.method public static _cb8a()Z
    .locals 11

    .line 0
    new-instance v0, Ljava/io/File;

    invoke-static {}, Lo/KI;->_d980()Landroid/content/ContextWrapper;

    move-result-object v1

    invoke-virtual {v1}, Landroid/content/Context;->getFilesDir()Ljava/io/File;

    move-result-object v1

    const-string v2, "_libraries.conf"

    invoke-direct {v0, v1, v2}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    .line 50
    move-object v4, v0

    invoke-virtual {v0}, Ljava/io/File;->exists()Z

    move-result v0

    if-eqz v0, :cond_0

    invoke-virtual {v4}, Ljava/io/File;->length()J

    move-result-wide v0

    const-wide/16 v2, 0x0

    cmp-long v0, v0, v2

    if-nez v0, :cond_1

    .line 51
    :cond_0
    sget-object v0, Lo/My;->_efbda5:Ljava/lang/String;

    const-string v1, "areDataReady(), missing config file"

    invoke-static {v0, v1}, Lo/_c994;->_cb8b(Ljava/lang/String;Ljava/lang/String;)V

    .line 52
    const/4 v0, 0x0

    return v0

    .line 57
    :cond_1
    :try_start_0
    invoke-static {v4}, Lo/OJ;->_cabb(Ljava/io/File;)Ljava/lang/String;

    move-result-object v0

    .line 58
    move-object v5, v0

    if-eqz v0, :cond_2

    invoke-virtual {v5}, Ljava/lang/String;->length()I

    move-result v0

    if-nez v0, :cond_3

    .line 59
    :cond_2
    sget-object v0, Lo/My;->_efbda5:Ljava/lang/String;

    const-string v1, "areDataReady(), empty content of config file"

    invoke-static {v0, v1}, Lo/_c994;->_cb8b(Ljava/lang/String;Ljava/lang/String;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    .line 60
    const/4 v0, 0x0

    return v0

    .line 64
    :cond_3
    :try_start_1
    invoke-static {v5}, Lo/OO;->_efbda5(Ljava/lang/String;)Lo/aac;

    move-result-object v0

    .line 65
    move-object v5, v0

    const-string v1, "version"

    invoke-virtual {v0, v1}, Lo/aac;->get(Ljava/lang/Object;)Ljava/lang/Object;

    move-result-object v0

    invoke-static {v0}, Lo/Mn;->_cb8a(Ljava/lang/Object;)I

    move-result v0

    .line 66
    move v6, v0

    const/4 v1, 0x1

    if-eq v0, v1, :cond_4

    .line 67
    sget-object v0, Lo/My;->_efbda5:Ljava/lang/String;

    const-string v1, "areDataReady(), old version, require update"

    invoke-static {v0, v1}, Lo/_c994;->_cb8b(Ljava/lang/String;Ljava/lang/String;)V
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_0

    .line 68
    const/4 v0, 0x0

    return v0

    .line 72
    :cond_4
    :try_start_2
    invoke-static {}, Lo/KI;->_cabf()I

    move-result v0

    if-eq v6, v0, :cond_5

    .line 73
    sget-object v0, Lo/My;->_efbda5:Ljava/lang/String;

    const-string v1, "areDataReady(), invalid downloaded version, require update"

    invoke-static {v0, v1}, Lo/_c994;->_cb8b(Ljava/lang/String;Ljava/lang/String;)V
    :try_end_2
    .catch Ljava/lang/Exception; {:try_start_2 .. :try_end_2} :catch_0

    .line 74
    const/4 v0, 0x0

    return v0

    .line 78
    :cond_5
    :try_start_3
    const-string v0, "files"

    invoke-virtual {v5, v0}, Lo/aac;->get(Ljava/lang/Object;)Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Lo/ZZ;

    move-object v5, v0

    .line 79
    const/4 v6, 0x0

    invoke-virtual {v5}, Lo/ZZ;->size()I

    move-result v7

    :goto_0
    if-ge v6, v7, :cond_a

    .line 80
    invoke-virtual {v5, v6}, Lo/ZZ;->get(I)Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Lo/aac;

    .line 81
    move-object v8, v0

    const-string v1, "type"

    invoke-virtual {v0, v1}, Lo/aac;->get(Ljava/lang/Object;)Ljava/lang/Object;

    move-result-object v0

    invoke-static {v0}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v9

    .line 82
    const-string v0, "name"

    invoke-virtual {v8, v0}, Lo/aac;->get(Ljava/lang/Object;)Ljava/lang/Object;

    move-result-object v0

    invoke-static {v0}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v10

    .line 83
    const-string v0, "hash"

    invoke-virtual {v8, v0}, Lo/aac;->get(Ljava/lang/Object;)Ljava/lang/Object;

    move-result-object v0

    invoke-static {v0}, Ljava/lang/String;->valueOf(Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v8

    .line 86
    invoke-static {v9, v10}, Lo/My;->_efbda5(Ljava/lang/String;Ljava/lang/String;)Ljava/io/File;

    move-result-object v0

    .line 87
    move-object v9, v0

    if-eqz v0, :cond_6

    invoke-virtual {v9}, Ljava/io/File;->exists()Z

    move-result v0

    if-nez v0, :cond_7

    .line 88
    :cond_6
    sget-object v0, Lo/My;->_efbda5:Ljava/lang/String;

    new-instance v1, Ljava/lang/StringBuilder;

    const-string v2, "areDataReady(), file \'null\' or not exists, file:"

    invoke-direct {v1, v2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v1, v9}, Ljava/lang/StringBuilder;->append(Ljava/lang/Object;)Ljava/lang/StringBuilder;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-static {v0, v1}, Lo/_c994;->_cb8b(Ljava/lang/String;Ljava/lang/String;)V
    :try_end_3
    .catch Ljava/lang/Exception; {:try_start_3 .. :try_end_3} :catch_0

    .line 89
    const/4 v0, 0x0

    return v0

    .line 93
    :cond_7
    :try_start_4
    invoke-virtual {v9}, Ljava/io/File;->getAbsolutePath()Ljava/lang/String;

    move-result-object v0

    invoke-static {v0}, Lo/OK;->_cb8e(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    .line 94
    move-object v10, v0

    if-eqz v0, :cond_8

    invoke-virtual {v10, v8}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_9

    .line 95
    :cond_8
    sget-object v0, Lo/My;->_efbda5:Ljava/lang/String;

    new-instance v1, Ljava/lang/StringBuilder;

    const-string v2, "areDataReady(), invalid MD5, file:"

    invoke-direct {v1, v2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v1, v9}, Ljava/lang/StringBuilder;->append(Ljava/lang/Object;)Ljava/lang/StringBuilder;

    move-result-object v1

    const-string v2, ", hash:\'"

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    invoke-virtual {v1, v8}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    const-string v2, "\', \'"

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    invoke-virtual {v1, v10}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    const-string v2, "\'"

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-static {v0, v1}, Lo/_c994;->_cb8b(Ljava/lang/String;Ljava/lang/String;)V
    :try_end_4
    .catch Ljava/lang/Exception; {:try_start_4 .. :try_end_4} :catch_0

    .line 97
    const/4 v0, 0x0

    return v0

    .line 79
    :cond_9
    :try_start_5
    add-int/lit8 v6, v6, 0x1

    goto/16 :goto_0

    .line 102
    :cond_a
    sget-object v0, Lo/My;->_efbda5:Ljava/lang/String;

    const-string v1, "areDataReady(), everything ready"

    invoke-static {v0, v1}, Lo/_c994;->_cb8b(Ljava/lang/String;Ljava/lang/String;)V
    :try_end_5
    .catch Ljava/lang/Exception; {:try_start_5 .. :try_end_5} :catch_0

    .line 103
    const/4 v0, 0x1

    return v0

    .line 104
    :catch_0
    move-exception v5

    .line 105
    sget-object v0, Lo/My;->_efbda5:Ljava/lang/String;

    const-string v1, "areDataReady()"

    invoke-static {v0, v1, v5}, Lo/_c994;->_cb8a(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Exception;)V

    .line 106
    invoke-static {v4}, Lo/OJ;->_e1909d(Ljava/io/File;)Z

    .line 109
    const/4 v0, 0x1

    return v0
.end method

#加载libproj.so
.method public static _cb8b()V
    .locals 3

    .line 0
    const-string v1, "proj"

    const-string v0, "lib"

    invoke-static {v0, v1}, Lo/My;->_efbda5(Ljava/lang/String;Ljava/lang/String;)Ljava/io/File;

    move-result-object v0

    move-object v2, v0

    invoke-virtual {v0}, Ljava/io/File;->exists()Z

    move-result v0

    if-eqz v0, :cond_0

    invoke-virtual {v2}, Ljava/io/File;->getAbsolutePath()Ljava/lang/String;

    move-result-object v0

    invoke-static {v0}, Ljava/lang/System;->load(Ljava/lang/String;)V

    return-void

    :cond_0
    invoke-static {v1}, Ljava/lang/System;->loadLibrary(Ljava/lang/String;)V

    .line 116
    return-void
.end method

#加载libjsqlite.so
.method public static _cb8e()V
    .locals 3

    .line 0
    const-string v1, "jsqlite"

    const-string v0, "lib"

    invoke-static {v0, v1}, Lo/My;->_efbda5(Ljava/lang/String;Ljava/lang/String;)Ljava/io/File;

    move-result-object v0

    move-object v2, v0

    invoke-virtual {v0}, Ljava/io/File;->exists()Z

    move-result v0

    if-eqz v0, :cond_0

    invoke-virtual {v2}, Ljava/io/File;->getAbsolutePath()Ljava/lang/String;

    move-result-object v0

    invoke-static {v0}, Ljava/lang/System;->load(Ljava/lang/String;)V

    return-void

    :cond_0
    invoke-static {v1}, Ljava/lang/System;->loadLibrary(Ljava/lang/String;)V

    .line 122
    return-void
.end method

.method public static _efbda5()I
    .locals 1

    .line 0
    const/4 v0, 0x1

    return v0
.end method

.method private static _efbda5(Ljava/lang/String;Ljava/lang/String;)Ljava/io/File;
    .locals 4

    .line 0
    const-string v0, "lib"

    invoke-virtual {p0, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_0

    .line 137
    new-instance v0, Ljava/io/File;

    invoke-static {}, Lo/KI;->_d980()Landroid/content/ContextWrapper;

    move-result-object v1

    invoke-virtual {v1}, Landroid/content/Context;->getFilesDir()Ljava/io/File;

    move-result-object v1

    new-instance v2, Ljava/lang/StringBuilder;

    const-string v3, "lib"

    invoke-direct {v2, v3}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-virtual {v2, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v2

    const-string v3, ".so"

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-direct {v0, v1, v2}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    return-object v0

    .line 139
    :cond_0
    const-string v0, "file"

    invoke-virtual {p0, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_1

    .line 140
    new-instance v0, Ljava/io/File;

    invoke-static {}, Lo/KI;->_d980()Landroid/content/ContextWrapper;

    move-result-object v1

    invoke-virtual {v1}, Landroid/content/Context;->getFilesDir()Ljava/io/File;

    move-result-object v1

    invoke-direct {v0, v1, p1}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    return-object v0

    .line 142
    :cond_1
    const/4 v0, 0x0

    return-object v0
.end method


```

把两个so加载函数分别修改为

```

#加载libproj.so
.method public static _cb8b()V
    .locals 3

    .line 0
    const-string v1, "proj"

    :cond_0
    invoke-static {v1}, Ljava/lang/System;->loadLibrary(Ljava/lang/String;)V

    .line 116
    return-void
.end method

#加载libjsqlite.so
.method public static _cb8e()V
    .locals 3

    .line 0
    const-string v1, "jsqlite"

    :cond_0
    invoke-static {v1}, Ljava/lang/System;->loadLibrary(Ljava/lang/String;)V

    .line 122
    return-void
.end method

```

现在修改.method public static _cb8a()Z函数内容为 ：

```
.method public static _cb8a()Z
    const/4 v0, 0x1

    return v0
.end method

```

重新编译打包运行，还是提示需要下载。
搜索调用My._cb8a方法的地方。
找到下面几个文件
>./com/asamm/locus/core/StartScreen$iF.3.smali:    invoke-static {}, Lo/My;->_cb8a()Z
./com/asamm/locus/core/StartScreen$iF.3.smali:    invoke-static {}, Lo/My;->_cb8a()Z
./o/_c4bd.smali:    invoke-static {}, Lo/My;->_cb8a()Z
./o/_efbe83.smali:    invoke-static {}, Lo/My;->_cb8a()Z
./o/My.2.smali:    sput-object v0, Lo/My;->_cb8a:[Ljava/lang/String;

StartScreen$iF.3.smali像是和启动界面相关的。
我们来看一下：
找到下面这个方法。
```
.method public _efbda5(ZZ)Z
    .locals 1

    .line 0
    if-nez p1, :cond_0

    invoke-static {}, Lo/My;->_cb8a()Z

    move-result v0

    if-nez v0, :cond_1

    :cond_0
    const/4 v0, 0x1

    return v0

    :cond_1
    const/4 v0, 0x0

    return v0
.end method

```
我们把它修改会始终返回false,
```
.method public _efbda5(ZZ)Z
    .locals 1

    const/4 v0, 0x0

    return v0

.end method

```

再次打包，启动APK，发现不再提示需要下载数据了。

但是我们仍然没有成功，我们又遇到了别的问题。
