---
layout : post
title : "翻译Load a Dll From Memory!"
category: "文章翻译"
tags: [翻译]
summary: "第一次翻译的文章，发表在看雪论坛。一篇讲述如何从内存中加载DLL的技术的文章"
---

#### 前言
本篇指南是讲解如何不借助文件系统的帮助来从内存中载入DLL的技术。
    作者：Joachim Bauch
    联系方式: mail◎joachim-bauch.de
    版权： Creative Commons License(by-sa)
#### 内容提纲
- 简介
- PE 文件格式
- DOS header /DOS stub 格式
- PE header 格式
- Section header 格式
- 加载library
- 分配内存空间
- 拷贝Section内容到目标位置
- 基址重定位
- 内存访问权限设置
- 通知library被进程加载
- 调用导出函数
- 释放library
- MemoryModule工具包
- 下载地址
- 已知的问题
- License
- 移植版本
- 版权声明

#### 简介
  Windows平台提供的加载library的API（LoadLibarary, LoadLibraryEx）只能加载文件系统中的Library. 没有体哦那个从内存中加载Dll的功能。但是，有些情况下又需要这样的功能。譬如，你不想在发布包中包含很多文件，又或者你想给那些逆向工作者一些苦头吃。这时一个常见的做法是先把dll文件写到一个临时文件中，然后从临时文件中导入它。当程序终止时把临时文件删除。
PE文件格式
  绝大多数包含执行代码的二进制文件（.exe、 .dll、 .sys）都有相同的文件格式。这种文件格式包括下面几个部分：
  
- DOS header
- DOS stub
- PE header
- Section header
- Section 1
- Section 2
- …
- Section n

下面将简单描述各个组成部分。（注：在头文件winnt.h中可以找到下面要介绍的所有数据结构）
- DOS header /DOS stub 格式
DOS格式部分有两部分组成。分别是DOS header和DOS stub
DOS头部存在的作用仅仅是为了向后兼容的目的。跟在DOS header后面的是DOS Stub数据，DOS stub用来显示一条错误信息来告诉用户该文件不能在DOS模式下运行。
  微软对DOS Header的声明如下：

``` C
  typedef struct _IMAGE_DOS_HEADER {      // DOS .EXE header
    WORD   e_magic;                     // Magic number
    WORD   e_cblp;                      // Bytes on last page of file
    WORD   e_cp;                        // Pages in file
    WORD   e_crlc;                      // Relocations
    WORD   e_cparhdr;                   // Size of header in paragraphs
    WORD   e_minalloc;                  // Minimum extra paragraphs needed
    WORD   e_maxalloc;                  // Maximum extra paragraphs needed
    WORD   e_ss;                        // Initial (relative) SS value
    WORD   e_sp;                        // Initial SP value
    WORD   e_csum;                      // Checksum
    WORD   e_ip;                        // Initial IP value
    WORD   e_cs;                        // Initial (relative) CS value
    WORD   e_lfarlc;                    // File address of relocation table
    WORD   e_ovno;                      // Overlay number
    WORD   e_res[4];                    // Reserved words
    WORD   e_oemid;                     // OEM identifier (for e_oeminfo)
    WORD   e_oeminfo;                   // OEM information; e_oemid specific
    WORD   e_res2[10];                  // Reserved words
    LONG   e_lfanew;                    // File address of new exe header
    } IMAGE_DOS_HEADER, *PIMAGE_DOS_HEADER;
```

- PE header 格式
  PE Header用来描述和section相关的信息。可执行文件用section来保存执行代码和数据，以及从其他模块导入的函数的信息和本模块导出的函数信息等。
  PE Header的定义如下：
``` C
typedef struct _IMAGE_NT_HEADERS {
    DWORD Signature;
    IMAGE_FILE_HEADER FileHeader;
    IMAGE_OPTIONAL_HEADER32 OptionalHeader;
} IMAGE_NT_HEADERS32, *PIMAGE_NT_HEADERS32;
```
- FileHeader字段描述了文件的物理格式，如目录信息、Symbols的信息等。
``` C
typedef struct _IMAGE_FILE_HEADER {
    WORD    Machine;
    WORD    NumberOfSections;
    DWORD   TimeDateStamp;
    DWORD   PointerToSymbolTable;
    DWORD   NumberOfSymbols;
    WORD    SizeOfOptionalHeader;
    WORD    Characteristics;
} IMAGE_FILE_HEADER, *PIMAGE_FILE_HEADER;
```   
- 字段OptionalHeader保存模块的逻辑信息，这些信息包括需要的操作系统版本，需要的内存大小和入口点信息。
- 
``` C 
typedef struct _IMAGE_OPTIONAL_HEADER {
    //
    // Standard fields.
    //

    WORD    Magic;
    BYTE    MajorLinkerVersion;
    BYTE    MinorLinkerVersion;
    DWORD   SizeOfCode;
    DWORD   SizeOfInitializedData;
    DWORD   SizeOfUninitializedData;
    DWORD   AddressOfEntryPoint;
    DWORD   BaseOfCode;
    DWORD   BaseOfData;

    //
    // NT additional fields.
    //

    DWORD   ImageBase;
    DWORD   SectionAlignment;
    DWORD   FileAlignment;
    WORD    MajorOperatingSystemVersion;
    WORD    MinorOperatingSystemVersion;
    WORD    MajorImageVersion;
    WORD    MinorImageVersion;
    WORD    MajorSubsystemVersion;
    WORD    MinorSubsystemVersion;
    DWORD   Win32VersionValue;
    DWORD   SizeOfImage;
    DWORD   SizeOfHeaders;
    DWORD   CheckSum;
    WORD    Subsystem;
    WORD    DllCharacteristics;
    DWORD   SizeOfStackReserve;
    DWORD   SizeOfStackCommit;
    DWORD   SizeOfHeapReserve;
    DWORD   SizeOfHeapCommit;
    DWORD   LoaderFlags;
    DWORD   NumberOfRvaAndSizes;
    IMAGE_DATA_DIRECTORY DataDirectory[IMAGE_NUMBEROF_DIRECTORY_ENTRIES];
} IMAGE_OPTIONAL_HEADER32, *PIMAGE_OPTIONAL_HEADER32;
```

字段DataDirectory保存着模块中定义的（IMAGE_NUMBEROF_DIRECTORY_ENTRIES）
个逻辑项(Conpontents)的入口:
Index Desription
0 导出函数块
1 导入函数块
2 资源块
4 异常信息块
5 基地址重定位表块
6 调试信息块
7 架构(Architecture)特定的数据块
8 全局指针块
9 线程本地存储块
10  载入配置块
11  Bound imports
12  导入地址表块
13  延迟加载导入块
14  COM运行时描述块
  
对于只是加载DLL的任务来说，我们仅仅用到导入块和基地址重定位表块。不过为了调用导出的函数，我们还需要用到导出函数块。
Section header格式
  这一部分数据保存在PE header部分的OPtionalHeader字段后面。为了方便定位section header的位置，微软提供了一个宏定义IMAGE_FIRST_SECTION，它的值等于SectionHeader的开始地址相对于PE Header基地址的位移。
  Section header实际上是一个存储着文件中每一个Section的信息的列表：
  
``` C 
typedef struct _IMAGE_SECTION_HEADER {
    BYTE    Name[IMAGE_SIZEOF_SHORT_NAME];
    union {
            DWORD   PhysicalAddress;
            DWORD   VirtualSize;
    } Misc;
    DWORD   VirtualAddress;
    DWORD   SizeOfRawData;
    DWORD   PointerToRawData;
    DWORD   PointerToRelocations;
    DWORD   PointerToLinenumbers;
    WORD    NumberOfRelocations;
    WORD    NumberOfLinenumbers;
    DWORD   Characteristics;
} IMAGE_SECTION_HEADER, *PIMAGE_SECTION_HEADER;
```
  而一个Section中可以包含代码，数据，重定位信息，资源，导出导入函数等信息。
#### 加载Library
  为了模拟PE loader的过程，我们首先必须弄清楚从把文件读入内存中开始到准备好可以被程序使用为止，都需要执行那些步骤。
  当我们调用LoadLibrary时，Windows主要做了了以下工作：
1. 打开指定的文件并检查DOS和PE头部。
2. 在PEHeader.OptionalHeader.ImageBase处分配PEHeader.Optionalheader.SizeOfImage个字节的内存。
3. 分析section header,从IMAGE_SECTION_HEADER结构中的VirtualAddress属性中获取每个section的开始地址相对与ImageBase的位移。把section中的内容拷贝到正确的位置。
4. 如果分配的地址不同于ImageBase, 代码和数据块中的参数必须做相应的调整。这一步就是传说中的relocation.
5. Library中用到的导入信息也必须通过加载相应的模块来解决。
6. 各个section对应的内存区必须根据各个Section的特征来进行访问限制。这时那些标记为可以丢弃的section占用的内存可以被释放。这些section通常保存都是导入时需要用到的临时数据（例如基地址重定位信息）的。
7. 现在library已经被成功的加载了，现在可以使用Dll_PROCESS_ATTACH标志来调用library的入口函数通知library正在被进程加载。

下面我们将详细的描述各个步骤。
- 分配内存
  为了利用window提供了设置内存块访问限制的功能，必须使用VirtualAlloc来预订（或分配）library需要的所有内存。因为我们需要约束对这些内存的访问。例如我们应该阻止对代码区和常量区的写操作。
  OptionalHeader中保存有Library需要的内存块的大小。如果可能，我们必须预订ImageBase中指定的内存。
``` C
  Memory = VirtualAlloc((LPVOID)(PEHeader->OptionalHeader.ImageBase),
      PEHeader->OptionalHeader.SizeOfImage,
      MEM_RESERVE, PAGE_READWRITE);
```
  如果预订到的地址不是ImageBase中指定的地址，那么必须执行后面描述的基地址重定位步骤。
- 拷贝Section的内容
分配内存以后，就可以把section中的内容拷贝到系统中了。这时需要通过分析Section Header中的数据来找到section部分的数据在文件中的位置和在内存中的目标位置。
在数据拷贝之前，需要先提交要使用的内存块。
``` C
Dest = VirtualAlloc(baseAddress + section->VirtualAddress,
    Section->SizeOfRawData,
MEM_COMMIT,
PAGE_READWRITE);
```
  对于没有在文件中保存数据（如保存运行中用到的参数的section）的区块，SizeOfRawData字段的值为0.这时你可以用OptionalHeader字段中的SizeOfInitializedData 或 SizeOfUninitializedData字段。具体选用那个字段取决于section的Characteristics字段中IMAGE_SCN_CNT_INITIALIZED_DATA和IMAGE_SCN_CNT_UNINITIALIZED_DATA标志位的值。
- 基地址重定位
  Library中的代码/数据section中的用到的所有内存地址都以一种相对于基地址位移的方式进行保存。而基地址则保存在OptionalHeader的ImageBase字段中。如果library不能被加载到指定的基地址，那么这些内存地址的地址都必须进行调整，术语称之为重定位。PE文件中的基地址重定位表保存这些需要重定位的内存地址。我们可以在OptionalHeader的DataDirectory字段中保存的第5个字典入口处找到基地址重定位表。
  这个表由一系列的IMAGE_BASE_RELOCATION数据结构组成。
``` C
typedef struct _IMAGE_BASE_RELOCATION {
    DWORD   VirtualAddress;
    DWORD   SizeOfBlock;
//  WORD    TypeOffset[1];
} IMAGE_BASE_RELOCATION;
```
重定位表包含（SizeOfBlock – IMAGE_SIZEOF_BASE_RELOCATION）/ 2个项，每个项由16位bit组成。其中高4位bit定义了重定位的类型，低12位定义了相对于VirtualAddress的位移。
  在DLL文件中仅有以下类型有效
  IMAGE_REL_BASED_ABSOLUTE
    没有重定位操作，仅用作填充
  IMAGE_REL_BASED_HIGHLOW
    用分配到的地址与ImageBase的差值再加上offset处的32位地址的和作为重定位后的地址。.
- 处理导入信息
  OptionalHeader中DataDirectory字段中的第一个(基于0开始)选项(entry)中包含了一组library列表，保存着本library需要用到的所有library.列表中的选项的格式定义如下：
``` C
  typedef struct _IMAGE_IMPORT_DESCRIPTOR {
    union {
          DWORD   Characteristics;            // 0 for terminating null import descriptor
DWORD   OriginalFirstThunk;         // RVA to original unbound IAT (PIMAGE_THUNK_DATA)
    };
    DWORD   TimeDateStamp;                  // 0 if not bound,
                                            // -1 if bound, and real date\time stamp
                                            //     in IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT (new BIND)
                                            // O.W. date/time stamp of DLL bound to (Old BIND)

    DWORD   ForwarderChain;                 // -1 if no forwarders
    DWORD   Name;
    DWORD   FirstThunk;                     // RVA to IAT (if bound this IAT has actual addresses)
} IMAGE_IMPORT_DESCRIPTOR;
```
Name项保存着引用到的library名字（如kernel32.dll）的C字符串指针。OriginalFirstThunk项为一个列表指针，指向需要从外部导入的函数名的列表。FirstThunk项保存的也是一个列表指针。给指针指向一系列函数地址，这些地址需要用引用的函数的地址来填充。
  处理导入函数时，需要并行的访问这两个表，导入第一个表中函数名指定的函数，同时把返回地址保存在第二个列表相应的位置上。
``` C
    nameRef = (DWORD*)(baseAddress + importDesc->OriginalFirstThunk);
    symbolRef = (DWORD *)(baseAddress + importDest->FirstThunk);
    for( ; *nameRef; nameRef++, symbolRef++){
      PIMAGE_IMPORT_BY_NAME thunkData = 
(PIMAGE_IMPORT_BY_NAME)(codeBase + *nameRef);
      *symbolRef = (DWORD)GetProcAddress(handle, (LPCSTR)&thunkData->Name);
      if(*funcRef == 0){
        handleImportError():
        return;
      }
    }
```
- 内存访问权限设置
  每一个section的Characteristics字段中保存有该section的访问许可权限。访问权限可以是下列值中的一个或它们的组合。
  IMAGE_SCN_MEN_EXCEUTE
      表示该section中包含的数据是可执行的代码
  IMAGE_SCN_MEN_READ
      表示该section中的数据是只读的
  IMAGE_SCN_MEN_WRITE
      表示该section中的数据是可写的。
  section中的权限最后会被映射到下列内存权限值中的一个
    PAGE_NOACCESS
    PAGE_WRITECOPY
    PAGE_READONLY
    PAGE_READWRITE
    PAGE_EXECUTE
    PAGE_EXECUTE_WRITECOPY
    PAGE_EXECUTE_READ
    PAGE_EXECUTE_READWRITE
    现在我们可以用ViretualProtect函数来给内存加上访问限制。加上限制后，当以不被许可的方式访问内存时windows将会抛出一个异常。
    除了前面提到的3中权限外，下面两种权限也可以被加到section中
    IMAGE_SCN_MEN_DISCARDABLE
      该section中的内容在完成导入后可以丢弃。通常为重定位表section设置这个标识。
    IMAGE_SCN_MEN_NOT_CACHED
      如果section中设置这个标识，那么windows将不会对该section的内存数据进行缓存。同时会额外给section占用的内存指定PAGE_NOCACHE保护权限
    
#### 通知library被进程加载
    加载的最后一步是调用DLL的入口点函数(入口点函数由AddressOfEntryPoint指定), 通知library它应经被加载到一个进程中了。
    入口点函数的定义如下：
``` C
    typedef BOOL (WINAPI * DllEntryProc)(HINSTANCE hinstDll, DWORD fdwReason, LPVOID lpReserved);
```
    所以我们最后要执行的代码就是:
``` C
DllEntryProc entry = (DllEntryProc)(baseAddress 
+ PEHeader->OptionalHeader.AddressOfEntryPoint);
    (*entry)((HINSTANCE)baseAddress, DLL_PROCESS_ATTACH, 0);
```
    以后我们就可以像使用其他正常加载的library一样使用该library中的导出函数了。
#### 调用导出函数
    为了调用library中的导出函数，我们需要找出要调用的函数名对应到symbol的入口点。
    OptionalHeader中的DataDirectory字段中的第0项中保存指向导出函数的信息记录的指针。
    导出函数记录的定义如下：
``` C
    typedef struct _IMAGE_EXPORT_DIRECTORY {
    DWORD   Characteristics;
    DWORD   TimeDateStamp;
    WORD    MajorVersion;
    WORD    MinorVersion;
    DWORD   Name;
    DWORD   Base;
    DWORD   NumberOfFunctions;
    DWORD   NumberOfNames;
    DWORD   AddressOfFunctions;     // RVA from base of image
    DWORD   AddressOfNames;         // RVA from base of image
    DWORD   AddressOfNameOrdinals;  // RVA from base of image
} IMAGE_EXPORT_DIRECTORY, *PIMAGE_EXPORT_DIRECTORY;
```
    第一步要找出函数名在导出Symbols中的ordinal number.因此我们要同时顺序的遍历AddressOfNames数组和AddressOfNameOrDinals数组直到找到要调用的函数名,同时也找到了函数对应的ordinal number。
  AddressOfFunctions数组中的第ordinal number个元素中保存的就是我们要调用的函数地址。

#### 释放library
  要释放自定义加载的libiary，仅需执行一下步骤:
    1. 用下面的方式调用入口点函数
``` C
    DllEntryProc entry = (DllEntryProc)(baseAddress + PEHeader->OptionalHeader.AddrssOfEntryPoint);
      (*entry)((HINSTANCE)baseAddress, DLL_PROCESS_DETACH/* 原文中本处使用的是 DLL_PROCESS_ATTACH 估计为笔误*/, 0);
```
    2. 释放加载的library.
    3. 释放分配的内存
#### MemoryModule工具包
  MemoryModule是一个用来从内存中载入DLL的C语言工具包。
  它的接口非常类似Windows 提供的载入library的API接口
``` C
    typedef void *HMEMORYMODULE;
    HMEMORYMODULE MemoryLoadLibrary(const void *(;
    FARPROC MemoryGetProcAddress(HMEMORYMODULE, const char* );
    void MenoryFreeLibrary(HMEMORYMODULE);
```
##### 下载位置
  你总是可以从Subversion服务器http://fancycode.com/viewcvs/MemofyModule/trunk/下载最新的版本。
  下面是已经发布的版本中的下载地址：
  version 0.02(使用Mozilla许可证发布版)
    http://www.joachim-bauch.de/tutorials/downloads/MemoryModule-0.0.2.zip
  Version 0.01(第一次公开发布版)
      http://www.joachim-bauch.de/tutorials/downloads/MemoryModule-0.0.1.zip
##### 已知的问题
  所有分配的内存都是使用PAGE_READWRITE模式提交的，而没有使用Section中设置的权限，我不肯定这一决定在所有的情况下都正确。
##### License
  Since version 0.0.2, the MemoryModule library is released under the Mozilla Public License(MPL).Version 0.0.1 has been released under the Lesser General Public License(LGPL).
  It is provided as-is without ANY warranty. You may use it at your own risk.
  以上授权文件不做翻译，以免误导大家。我已经尽可能的保证了上面的话和原文一致。但是建议此部分读者最好阅读原版。
##### 版本移植
  Thomas heller 把MemoryModule增加到py2exe中用来创建可以被Python脚本执行的单一文件。
  Martin Offenwanger 把MemoryModule移植到了Delphi平台，你可以访问下面的地址下载。
  http://www.dsplayer.de/open_source_projects/BTMemoryModule.zip    
#### 版权声明
  MemoryModule Library 和 本指南 版权所有(c)2004-2006 Joachim Bauch.
