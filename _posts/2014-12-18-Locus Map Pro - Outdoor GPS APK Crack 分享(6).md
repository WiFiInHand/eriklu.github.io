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

重新打包，启动，发现APK变为Pro版了。
但体验后发现有些功能，仍然不能是用。
说明还有些功能限制没有解除，如天气.
