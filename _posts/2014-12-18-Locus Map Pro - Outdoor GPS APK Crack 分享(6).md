---
layout : post
title : "解除功能限制"
category: ""
tags: [android, 逆向工程, smali]
summary: "现在应用变成了免费版本，不但有广告，还有很多有用的功能用不了，真着急。"
---

现在应用变成了免费版本，不但有广告，还有很多有用的功能用不了，真着急。

#### 解除功能限制
首先找到com/asamm/locus/utils/Native/Native.smali文件
替换isFullFeatured native方法为下面内容

```
.method public static isFullFeatured(Landroid/app/Application;)Z
    .locals 1
    const v0, 0x1
    return v0
.end method
```

重新打包，启动，发现广告消失了，APK变为Pro版了。
但体验后发现有些功能，如天气仍然不能是用。
说明还有些功能限制没有解除.
Native.smali文件里有一个函数：

```

.method public static native performAction(Landroid/app/Application;Ljava/lang/Runnable;)V
.end method

```
这个native方法是执行一个线程方法。这个方法在执行操作前，会检测是不是全功能版，我们前面在smali（或者Java层面）把代码修改为全功能版。但是**performAction**调用的是native版本的**isFullFeatured**函数，native版本的函数是没有被修改的。
现在我们修改so库中的isFullFeatured函数。

查看Native.smali的static块函数，发现没有直接load so库。

```
# direct methods
.method static constructor <clinit>()V
    .locals 13

    .line 0
    const/16 v0, 0x8f

    new-array v0, v0, [B

    fill-array-data v0, :array_0

    sput-object v0, Lcom/asamm/locus/utils/Native;->_cb8b:[B

    #.......
    # 为了节约篇幅，这里删除了大部分代码
    #.......

    :try_start_18
    #删除释放到sd卡上的so文件
    invoke-virtual {v9}, Ljava/io/File;->delete()Z
    :try_end_18
    .catch Ljava/lang/Exception; {:try_start_18 .. :try_end_18} :catch_1

    return-void

    .line 11
    :catch_1
    return-void

    nop
    
    ……

```

该函数解密加密的so文件，，解密后释放到APK的数据目录。动态加载后，删除解密后的so文件。

在方法的最后几行，找到调用delete函数的地方，注释掉delete函数。
修改后的内容为：
```
# direct methods
.method static constructor <clinit>()V
    .locals 13

    .line 0
    const/16 v0, 0x8f

    new-array v0, v0, [B

    fill-array-data v0, :array_0

    sput-object v0, Lcom/asamm/locus/utils/Native;->_cb8b:[B

    #.......
    # 为了节约篇幅，这里删除了大部分代码
    #.......

    #:try_start_18
    #删除释放到sd卡上的so文件
    #invoke-virtual {v9}, Ljava/io/File;->delete()Z
    #:try_end_18
    #.catch Ljava/lang/Exception; {:try_start_18 .. :try_end_18} :catch_1

    return-void

    .line 11
    :catch_1
    return-void

    nop
    
    ……

```

打包后重新运行程序，退出应用。
如果是用的是模拟器，可以用adb shell或dbms工具，把/data/data/menion.android.locus.pro目录下寻找一个隐藏文件，重命名为libmacore.so，然后拷贝出来，如果是设备，就需要root后才能读出来。

用支持arm指令的反编译程序(推荐IDA)找到**isFullFeatured**函数.
这是我用的工具的指令示意图

![isFullFeatured函数的汇编代码](https://raw.githubusercontent.com/eriklu/eriklu.github.io/master/images/locus_macore.so.png)

我们首先找到返回true的指令代码，查找出对应的指令代码。

我们选择直接短路函数。
arm函数的特征是，寄存器入栈，执行函数指令，寄存器出栈。返回值保存在r0寄存器。

入栈指令
我们修改后的函数指令如下:

```
push.w {r0, r1, r4, r5, r6, r7, r8, lr}
movs r0, #0x1
pop.w  {r2, r3, r4, r5, r6, r7, r8, pc}

```

我们查出来**movs r0, #0x1**的指令字节码为：**01 20** .见上图。
**pop.w  {r2, r3, r4, r5, r6, r7, r8, pc}**的指令字节码为:**BD E8 FC 81**
要修改的代码位置为：**0x00001cb4**

我们用二进制编辑文件打开libmacore.so文件，找到位置**0x00001cb4**，把当前位置的内容替换为：
**01 20 BD E8 FC 81**

修改完毕后保存文件，然后替换lib/armeabi-v7a/libmacore.so文件。

现在我们只支持armv7a,可以把lib目录下的其他三个芯片色目录删除，减小最后输出包的大小。

重新打包，安装测试，现在那些原来不能用的功能，如天气，现在可以用了。

至此：Locus Pro 破解系列完成。

###写在最后
1. 该系列文章是对自己所做工作的整理，为了方便其他爱好者DIY，不是原始的分析过程。所以步骤只是解释了怎么做，而没有提及步骤的发现过程。
2. apk 压缩文件效率比较低。修改过程中可以把解包目录下的unknown目录中的文件拷贝到别的地方，然后用压缩工具添加。我在这样做后，打包时间从3分多钟降为不到2分钟。对频繁打包的同学，可考虑此方法。
3. 破解因为修改短路了部分代码，可能会引起最后做成的apk部分功能不稳定，这可能在所难免。本人能力、财力都有限，不能为破解给您带来的损失负责，测试练习前，请确认您为完全民事行为能力人。
4. 应用中要下载的so文件是关于数据库操作，和数学投影变换的，所以在一定的版本更迭期间，功能应该会保持不变，所以可能可以重复利用。
5. 如果有条件，请支持正版。向开发者反馈，请求提供中文化版本。
6. 行文仓促，难免有错漏和词不达意的地方，阅读时，请包容。

### 最后祝您DIY过程中一切操作顺利。
