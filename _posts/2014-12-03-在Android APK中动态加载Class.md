---
layout : post
title : "在Android APK中动态加载Class"
category: "逆向工程"
tags: [Andorid, smali, tool]
summary: "在Android APK中动态加载Class"
---

### 在Android APK中动态加载Class

java语言是支持动态加载class的，方法是定义一个ClassLoader，实现findClass方法
在find方法读取class字节，然后调用Class defineClass(String className, byte[] bytes, int offset, int length);方法来动态载入类代码。

``` java
//一份来自网上的MyClassLoader代码示例。
public class MyClassLoader extends ClassLoader { 
    private String fileName; 
 
    public MyClassLoader(String fileName) { 
        this.fileName = fileName; 
    } 
 
    protected Class<?> findClass(String className) throws ClassNotFoundException { 
        Class clazz = this.findLoadedClass(className); 
        if (null == clazz) { 
            try { 
                String classFile = getClassFile(className); 
                FileInputStream fis = new FileInputStream(classFile); 
                FileChannel fileC = fis.getChannel(); 
                ByteArrayOutputStream baos = new 
                ByteArrayOutputStream(); 
                WritableByteChannel outC = Channels.newChannel(baos); 
                ByteBuffer buffer = ByteBuffer.allocateDirect(1024); 
                while (true) { 
                    int i = fileC.read(buffer); 
                    if (i == 0 || i == -1) { 
                        break; 
                    } 
                    buffer.flip(); 
                    outC.write(buffer); 
                    buffer.clear(); 
                } 
                fis.close(); 
                byte[] bytes = baos.toByteArray(); 
                
                //把字节流转化为类
                 clazz = defineClass(className, bytes, 0, bytes.length);
            } catch (FileNotFoundException e) { 
                e.printStackTrace(); 
            } catch (IOException e) { 
                e.printStackTrace(); 
            } 
        } 
        return clazz; 
    } 
    private byte[] loadClassBytes(String className) throws 
    ClassNotFoundException { 
        try { 
            String classFile = getClassFile(className); 
            FileInputStream fis = new FileInputStream(classFile); 
            FileChannel fileC = fis.getChannel(); 
            ByteArrayOutputStream baos = new 
            ByteArrayOutputStream(); 
            WritableByteChannel outC = Channels.newChannel(baos); 
            ByteBuffer buffer = ByteBuffer.allocateDirect(1024); 
            while (true) { 
            int i = fileC.read(buffer); 
            if (i == 0 || i == -1) { 
            break; 
            } 
            buffer.flip(); 
            outC.write(buffer); 
            buffer.clear(); 
            } 
            fis.close(); 
            return baos.toByteArray(); 
        } catch (IOException fnfe) { 
            throw new ClassNotFoundException(className); 
        } 
    } 
    
    private String getClassFile(String name) { 
        StringBuffer sb = new StringBuffer(fileName); 
        name = name.replace('.', File.separatorChar) + ".class"; 
        sb.append(File.separator + name); 
        return sb.toString(); 
    } 
} 

```

#### 动态加载类的使用场景
- 保护核心代码。对核心代码加密，运行时解密加载。
- 对业务容易变化的逻辑封装，实现动态升级，修复bug。
- 实现类似动态语言的特性。
- 执行远程代码

#### Android APK中动态加载Class字节代码
Android APK运行在Dalvik虚拟机上，执行的是Dalvik虚拟机代码。同时Dalvik对JDK的类加载机制做了修改，所以不能直接用Java虚拟机上的方法。
下面我们来讨论下实现方法。
主要需要两部分工作。
##### 字节码转换
首先需要把Class代码转为Dalvik虚拟机支持的字节码。这个可以通过dex2jar中的对d2j-jar2dex工具来实现。
首先把要转化的class文件用压缩工具，压缩为jar文件，然后转化为dex文件。
##### 在APK中动态加载
动态加载步骤如下：
- 获取dex文件字节码（如果已加密，需要先解密）。
- 获得一个ClassLoader实例。
- 利用反射机制获取到DexFile类的openDexFile方法，并设置权限为可访问。用字节码对象为参数调用该方法。
- 利用反射机制DexFile类的defineClass方法，并设置权限为可访问。用类名字符串，类加载器实例，openDexFile的返回值作为最后一个参数执行该方法，就可以返回要加载的类。
 

``` java
byte[] dexFileBytes = getDexFileBytes();//获取dexfile字节
	  ClassLoader classLoader = ClassLoader.getSystemClassLoader();
	  Method openDexFileMethod = DexFile.class.getDeclaredMethod("openDexFile", new Class[] {byte[].class});
	  openDexFileMethod.setAccessible(true);
	  int k = ((Integer)openDexFileMethod.invoke(null, new Object[]{dex1})).intValue();
	  
	  Method defineClassMethod = DexFile.class.getDeclaredMethod("defineClass", new Class[] {String.class, ClassLoader.class, Integer.TYPE});
	  defineClassMethod.setAccessible(true);
	  
	  Class importClass= (Class)defineClassMethod.invoke(null, new Object[]{"packagename/classname", classLoader, k});
	  
	  Method[] methods = importClass.getDeclaredMethods();
	  for(Method m : methods){
		  System.out.println(m.getName());
	  }
```

这里，动态加载原理基本就讲解完毕。内存加载机制4.0+系统有用。4.0前的系统仍需要先释放到硬盘上才能加载。

#### 更进一步
1. 可以制作成的dex文件加密保存，运行时读取后再解密。
2. 可以给要加密的类A定义一个静态子类B，子类内实现加载类方法。用到A类的地方，一律改为通过A.B来获得。编译完成后，可以直接删除A.class.
3. 处理动态加载类字节码的过程尽可能自动化。



