---
layout : post
title : "战胜混淆后的非ASCII字符 -- Android 逆向系列三"
category: "逆向工程"
tags: [Andorid, smali, tool]
summary: "代码被混淆为a、b、c之类已经够逆向者头疼的了。但现在新的混淆工具更进一步把，还使用了ascii字符以外的字符。现在逆向工程师该怎么办？"
---

### 战胜混淆后的非ASCII字符 -- Android 逆向系列三
代码被混淆为a、b、c之类已经够逆向者头疼的了。但现在新的混淆工具更进一步把，还使用了ascii字符以外的字符。

这是利用了java代码支持用unicode做变量名的特性。

这导致两个结果：

1. 视觉上识别困难。
2. 因为不符合windows平台文件名的规范，apktool解包后的文件在windows平台无法成功创建。

#### 这种问题我们怎么解决呢？
##### 借助混淆工具
使用混淆工具重新混淆该apk。这里需要用dex2jar把dex文件转为jar文件。然后再用混淆工具混淆，然后用旧方法分析。

这种方法最大的问题是现在代码中大量的使用反射，需要做很多配置，繁琐且无趣。
#### 修改APKtool的源代码
利用重构的原理，我们可以通过一定的规则把变量名和文件名映射为ascii字符集。

因为apktool是开源的，我们可以通过修改代码来实现这一过程。

其实apktool是利用BakeSmali开源项目来完成dex到smali的处理的。
##### 字符串映射算法
在映射非ASCII字符到ascii字符的过程中，映射后的字符串不能和已经存在的相同。

映射后的变量符合java变量名规则。

这里我们把非ascii字符转变为他的16进制表示，在前面增加一个‘_’字符。连在一起的非ascii字符前面只使用一个‘_’字符。

如果你愿意，也可以把非ascii字符用中文来映射。
``` java
public static String formatProguardString(String str){ 
    try {
        byte[] bytes = str.getBytes("UTF-8");
        ByteArrayOutputStream bao = new ByteArrayOutputStream();
        boolean first = true;
        for(int i=0; i<bytes.length; i++){
            if((bytes[i] < 0) ||(bytes[i] > 126)){ 
                if(first){  
                    bao.write(95);
                    first = false; 
                } 
                bao.write(String.format("%02x", bytes[i]).getBytes()); 
            }else { 
                bao.write(bytes[i]);  
                first = true;   
            }               
        }               
        str = bao.toString();     
    } catch (UnsupportedEncodingException e) { 
        // TODO Auto-generated catch block 
        e.printStackTrace();            
    } catch (IOException e) {   
        // TODO Auto-generated catch block  
        e.printStackTrace();            
    }            
    return str;    
}
```    
##### 修改apktool的代码
代码下载地址:
修改例子：
以brut.apktool.smali/dexlib2/src/main/java/org/jf/dexlib2/dexbacked/DexBackedClassDef.java文件为例：
需要修改三个函数：getType()、getSuperclass()、getInterfaces()
``` java
    @Nonnull    
    @Override   
    public String getType() {  
        String classname = DebugInfo.formatProguardString(dexFile.getType(dexFile.readSmallUint(classDefOffset + ClassDefItem.CLASS_OFFSET)));        
        return classname;    
    }    
    @Nullable    
    @Override    
    public String getSuperclass() {        
        return DebugInfo.formatProguardString(dexFile.getOptionalType(dexFile.readOptionalUint(classDefOffset + ClassDefItem.SUPERCLASS_OFFSET)));    
        
    }    
    @Override    
    public int getAccessFlags() { 
        return dexFile.readSmallUint(classDefOffset + ClassDefItem.ACCESS_FLAGS_OFFSET);   
    }   
    @Nonnull    
    @Override    
    public Set<String> getInterfaces() {        
        final int interfacesOffset = dexFile.readSmallUint(classDefOffset + ClassDefItem.INTERFACES_OFFSET);        
        if (interfacesOffset > 0) {          
            final int size = dexFile.readSmallUint(interfacesOffset); 
            return new FixedSizeSet<String>() { 
                @Nonnull  
                @Override            
                public String readItem(int index) {      
                    return DebugInfo.formatProguardString(dexFile.getType(dexFile.readUshort(interfacesOffset + 4 + (2*index))));               
                }      
                @Override 
                public int size() { return size; }       
            };        
        }        
        return ImmutableSet.of();  
    }
```
###### 要修改的代码：

- brut.apktool.smali/dexlib2/src/main/java/org/jf/dexlib2/dexbacked/DexBackedAnnotationElement.java

要修改的函数：getName()

- brut.apktool.smali/dexlib2/src/main/java/org/jf/dexlib2/dexbacked/DexBackedClassDef.java

要修改的函数：getType()、getSuperclass()、getInterfaces()

- brut.apktool.smali/dexlib2/src/main/java/org/jf/dexlib2/dexbacked/DexBackedField.java

要修改的函数：getName()、 getType()

- brut.apktool.smali/dexlib2/src/main/java/org/jf/dexlib2/dexbacked/DexBackedMethod.java

要修改的函数：getName()、 getReturnType()、getParameterTypes()

- brut.apktool.smali/dexlib2/src/main/java/org/jf/dexlib2/dexbacked/reference/DexBackedFieldReference.java

要修改的函数：getDefiningClass()、 getName()、getType()

- brut.apktool.smali/dexlib2/src/main/java/org/jf/dexlib2/dexbacked/reference/DexBackedMethodReference.java

要修改的函数：getDefiningClass()、 getName()、getParameterTypes()、getReturnType()

- brut.apktool.smali/dexlib2/src/main/java/org/jf/dexlib2/dexbacked/reference/DexBackedStringReference.java

要修改的函数：getString()

- brut.apktool.smali/dexlib2/src/main/java/org/jf/dexlib2/dexbacked/reference/DexBackedTypeReference.java

要修改的函数：getType()
###### 重新编译
修改后重新编译生成新的apktool包。

进入apktool源代码根目录：执行./gradlew build fatjar

编译完成后到“apktool根目录/brut.apktool/apktool-cli/build/libs/apktool-cli.jar即为新生成到apktool.jar
#### 执行效率
处理一个15M的apk(dex文件6M多),速度下降可以忽略不计。
#### 相关处理
Manifester.xml和布局资源文件会用到一些类文件。可能就不幸的遇到了引用了这些名字中含有非ascii字符的类的文件。那还需要用映射函数对这些资源文件做相同处理。
下一次我们讨论怎么对这些文件进行修改。