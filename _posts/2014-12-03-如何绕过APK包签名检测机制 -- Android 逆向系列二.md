---
layout : post
title : "如何绕过APK包签名检测机制 -- Android 逆向系列二"
category: "逆向工程"
tags: [Andorid, smali, tool]
summary: "为了保证APK数据的完整性和不被篡改。现代手机系统引入了app的签名机制。从Sybian、J2ME到现在的IOS APP和Android APP, 都采用了这一机制。 yingyo"
---

#### APK文件的签名机制
为了保证APK数据的完整性和不被篡改。现代手机系统引入了app的签名机制。从Sybian、J2ME到现在的IOS APP和Android APP, 都采用了这一机制。这一机制的原理是对APP中的所有文件使用Hash算法生成文件指纹，然后用文件名和指纹数据生成一个签名文件列表文件，然后再用开发者的私钥对生成的文件进行签名。把开发者的公钥信息和签名信息保存在发布的APP文件中。设备安装应用时会重新计算文件的指纹，用APP中公钥来验证签名是否一致，来判断APP是否被篡改。因为逆向人员没有开发者的私钥，所以在对APK文件修改后，不能生成匹配的签名，为了能在设备上安装，只能使用自己的证书对APK重新签名。这样会导致APK中证书信息的变化。因为这个机制的存在，APK可以在代码中检查公钥信息是不是发生了变化，从而检测出APK包的内容是否被篡改。

#### 签名信息的获取

``` java
PackageInfo packageInfo = m_context.getPackageInfo(m_context.getPackageName() ,PackageManager.GET_SIGNATURES); 
Signature[] signatures = packageInfo.signatures; 
//检查签名信息是否是开发者的
……    
```

##### 在Java代码中使用签名检测机制
因为在检测代码中用到了android.content.pm.Signature类，所以可以通过查找包含Landroid/content/pm/Signature的文件来定位相关代码。然后通过修改跳转分支，或替换开发者使用的信息来绕过签名检测机制。
##### 在.so代码中使用签名检测机制
因为java中的代码签名检测机制容易被绕过，所以不少开发者把代码检测机制放到了.so文件中。

.so是汇编代码，不象smali文件那么容易分析和修改，增加了逆向的难度。

.so文件中其实本质也是通过回调java代码中的m_context.getPackageInfo(m_context.getPackageName() ,PackageManager.GET_SIGNATURES);来获取签名信息的。

因为这个方法需要一个Context对象。所以native方法需要一个传递一个Context参数。所以我们可以生成一个Context Proxy对象， 该Proxy对象在返回签名信息时返回修改前的签名信息。
参考代码如下:

``` java
class ProxyPackageManager extends PackageManager{
    private PackageManager target;    
    public  MyPackageManager(PackageManager pm){ 
           this.target = pm;    
    }    
    @Override    
    public PackageInfo getPackageInfo(String packageName, int flags) throws NameNotFoundException { 
         System.out.println("getPackageInfo " + packageName + " " + flags);        
         if(flags == PackageManager.GET_SIGNATURES){           
             return new MyPackageInfo();        
          }else {            
             target.getPackageInfo(packageName, flags);        
          }        

          return null;    
    }    
         //其他代理方法    
          ……
 }

class MyPackageInfo extends PackageInfo{    
	public MyPackageInfo(){        
		this.signatures = initSignatures(); //初始化签名信息    
	}
}
```

#### 创建和开发者公钥相同的证书呢？
如果检测代码只是检测公钥的内容，这个方法理论上也是可以的。但是创建和开发者公钥相同的证书的需要的知识和操作难度较高，故不做讨论。公钥一般包含两部分信息，这里说的相同是指其中的一部分相同。对于RSA就是指q相同，m不相同。