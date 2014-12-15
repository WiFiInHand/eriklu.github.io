---
layout : post
title : "Blaze Video Magic 3.0 注册机制分析"
category: "逆向工程"
tags: [OllyDbg,C,汇编]
summary: "为了在魅族 Mini Player 上看电影，使用了这款影音转换工具。因为要注册，所以起了逆向出注册算法的念头。这也是第一次逆向成功的比较大的商业程序。刚开始断断续续的摸索了半年，没什么进展。后来集中精力用了一周时间，终于攻克了。"
---

### 详细步骤
1. 首先对GetDlgItemTextA, GetDlgItemTextW下断点， 注册测试时OD没有断下来.
    然后改下GetWindowTextA, GetWindowTextW断点，这时因为空间的label的显示也会中断，所以需要5－6次才能找到程序读
     用户名和序列号的代码。
     此时再用OD进行字符串搜索，可以找到“User Name can not be empty!”等字符串信息，因为这些信息是保存在ini文件中的，刚开始是不行的。
     其实也可以不对函数下断点，尝试注册几次，再查找字符串就会事半功倍。
     找到字符串后，跟随进入来到以下代码处

``` 
  00C69890  /$  6A FF         push    -1
  00C69892  |.  68 CA38C800   push    00C838CA                         ;  SE 处理程序安装
  00C69897  |.  64:A1 0000000>mov     eax, dword ptr fs:[0]
  00C6989D  |.  50            push    eax
  00C6989E  |.  64:8925 00000>mov     dword ptr fs:[0], esp
  00C698A5  |.  81EC B0000000 sub     esp, 0B0
  00C698AB  |.  53            push    ebx
  00C698AC  |.  55            push    ebp
  00C698AD  |.  56            push    esi
  00C698AE  |.  57            push    edi
  00C698AF  |.  8BF9          mov     edi, ecx
  00C698B1  |.  897C24 24     mov     dword ptr [esp+24], edi
  00C698B5  |.  8B87 D0010000 mov     eax, dword ptr [edi+1D0]
  00C698BB  |.  85C0          test    eax, eax
  00C698BD  |.  75 07         jnz     short 00C698C6
  00C698BF  |.  33C0          xor     eax, eax
  00C698C1  |.  E9 AD050000   jmp     00C69E73
  00C698C6  |>  6A 00         push    0
  00C698C8  |.  8D4C24 58     lea     ecx, dword ptr [esp+58]
  00C698CC  |.  E8 6FDEFFFF   call    00C67740
  00C698D1  |.  8B87 D0010000 mov     eax, dword ptr [edi+1D0]
  00C698D7  |.  8D4C24 54     lea     ecx, dword ptr [esp+54]
  00C698DB  |.  50            push    eax
  00C698DC  |.  C78424 CC0000>mov     dword ptr [esp+CC], 0
  00C698E7  |.  E8 64E0FFFF   call    00C67950
  00C698EC  |.  8D4C24 54     lea     ecx, dword ptr [esp+54]
  00C698F0  |.  E8 81010100   call    00C79A76
  00C698F5  |.  83F8 01       cmp     eax, 1                           ;  (initial cpu selection)
  00C698F8  |.  74 46         je      short 00C69940
  00C698FA  |.  8D8C24 B40000>lea     ecx, dword ptr [esp+B4]
  00C69901  |.  C78424 C80000>mov     dword ptr [esp+C8], 2
  00C6990C  |.  E8 9C390100   call    00C7D2AD
  00C69911  |.  8D8C24 B00000>lea     ecx, dword ptr [esp+B0]
  00C69918  |.  C68424 C80000>mov     byte ptr [esp+C8], 1
  00C69920  |.  E8 88390100   call    00C7D2AD
  00C69925  |.  8D4C24 54     lea     ecx, dword ptr [esp+54]
  00C69929  |.  C78424 C80000>mov     dword ptr [esp+C8], -1
  00C69934  |.  E8 10FE0000   call    00C79749
  00C69939  |.  33C0          xor     eax, eax
  00C6993B  |.  E9 33050000   jmp     00C69E73
  00C69940  |>  8D8C24 B40000>lea     ecx, dword ptr [esp+B4]
  00C69947  |.  51            push    ecx
  00C69948  |.  8D4C24 18     lea     ecx, dword ptr [esp+18]
  00C6994C  |.  E8 D1360100   call    00C7D022
  00C69951  |.  8D9424 B00000>lea     edx, dword ptr [esp+B0]
  00C69958  |.  8D4C24 10     lea     ecx, dword ptr [esp+10]
  00C6995C  |.  52            push    edx
  00C6995D  |.  C68424 CC0000>mov     byte ptr [esp+CC], 3
  00C69965  |.  E8 B8360100   call    00C7D022
  00C6996A  |.  68 905FC900   push    00C95F90
  00C6996F  |.  8D4C24 1C     lea     ecx, dword ptr [esp+1C]
  00C69973  |.  C68424 CC0000>mov     byte ptr [esp+CC], 4
  00C6997B  |.  E8 9B390100   call    00C7D31B
  00C69980  |.  8D4C24 14     lea     ecx, dword ptr [esp+14]
  00C69984  |.  C68424 C80000>mov     byte ptr [esp+C8], 5
  00C6998C  |.  E8 35EF0000   call    00C788C6
  00C69991  |.  8D4C24 14     lea     ecx, dword ptr [esp+14]
  00C69995  |.  E8 E0EE0000   call    00C7887A
  00C6999A  |.  8B4424 14     mov     eax, dword ptr [esp+14]
  00C6999E  |.  8B48 F8       mov     ecx, dword ptr [eax-8]
  00C699A1  |.  85C9          test    ecx, ecx
  00C699A3  |.  0F85 8C000000 jnz     00C69A35                         //字符串跟随的话，直接到这里。 这里是判断用户名是否为空的跳转
  00C699A9  |.  6A 40         push    40                               ; /Arg3 = 00000040
  00C699AB  |.  68 905FC900   push    00C95F90                         ; |Arg2 = 00C95F90
  00C699B0  |.  68 A035C900   push    00C935A0                         ; |user name can not be empty!
  00C699B5  |.  8BCF          mov     ecx, edi                         ; |
  00C699B7  |.  E8 04F5FFFF   call    00C68EC0                         ; \Converte.00C68EC0
  00C699BC  |.  8D4C24 18     lea     ecx, dword ptr [esp+18]
  00C699C0  |.  C68424 C80000>mov     byte ptr [esp+C8], 4
  00C699C8  |.  E8 E0380100   call    00C7D2AD
  00C699CD  |.  8D4C24 10     lea     ecx, dword ptr [esp+10]
  00C699D1  |.  C68424 C80000>mov     byte ptr [esp+C8], 3
  00C699D9  |.  E8 CF380100   call    00C7D2AD
  00C699DE  |.  8D4C24 14     lea     ecx, dword ptr [esp+14]
  00C699E2  |.  C68424 C80000>mov     byte ptr [esp+C8], 0
  00C699EA  |.  E8 BE380100   call    00C7D2AD
  00C699EF  |.  8D8C24 B40000>lea     ecx, dword ptr [esp+B4]
  00C699F6  |.  C78424 C80000>mov     dword ptr [esp+C8], 7
  00C69A01  |.  E8 A7380100   call    00C7D2AD
  00C69A06  |.  8D8C24 B00000>lea     ecx, dword ptr [esp+B0]
  00C69A0D  |.  C68424 C80000>mov     byte ptr [esp+C8], 6
  00C69A15  |.  E8 93380100   call    00C7D2AD
  00C69A1A  |.  8D4C24 54     lea     ecx, dword ptr [esp+54]
  00C69A1E  |.  C78424 C80000>mov     dword ptr [esp+C8], -1
  00C69A29  |.  E8 1BFD0000   call    00C79749
  00C69A2E  |.  33C0          xor     eax, eax
  00C69A30  |.  E9 3E040000   jmp     00C69E73
  00C69A35  |>  8D4C24 10     lea     ecx, dword ptr [esp+10]
  00C69A39  |.  E8 88EE0000   call    00C788C6
  00C69A3E  |.  8D4C24 10     lea     ecx, dword ptr [esp+10]
  00C69A42  |.  E8 33EE0000   call    00C7887A
  00C69A47  |.  8B4C24 10     mov     ecx, dword ptr [esp+10]
  00C69A4B  |.  8B41 F8       mov     eax, dword ptr [ecx-8]
  00C69A4E  |.  85C0          test    eax, eax
  00C69A50  |.  0F85 8C000000 jnz     00C69AE2                         ;序列号是否为空的跳转
  00C69A56  |.  6A 40         push    40                               ; /Arg3 = 00000040
  00C69A58  |.  68 905FC900   push    00C95F90                         ; |Arg2 = 00C95F90
  00C69A5D  |.  68 8035C900   push    00C93580                         ; |serial number can not be empty!
  00C69A62  |.  8BCF          mov     ecx, edi                         ; |
  00C69A64  |.  E8 57F4FFFF   call    00C68EC0                         ; \Converte.00C68EC0
  00C69A69  |.  8D4C24 18     lea     ecx, dword ptr [esp+18]
  00C69A6D  |.  C68424 C80000>mov     byte ptr [esp+C8], 4
  00C69A75  |.  E8 33380100   call    00C7D2AD
  00C69A7A  |.  8D4C24 10     lea     ecx, dword ptr [esp+10]
  00C69A7E  |.  C68424 C80000>mov     byte ptr [esp+C8], 3
  00C69A86  |.  E8 22380100   call    00C7D2AD
  00C69A8B  |.  8D4C24 14     lea     ecx, dword ptr [esp+14]
  00C69A8F  |.  C68424 C80000>mov     byte ptr [esp+C8], 0
  00C69A97  |.  E8 11380100   call    00C7D2AD
  00C69A9C  |.  8D8C24 B40000>lea     ecx, dword ptr [esp+B4]
  00C69AA3  |.  C78424 C80000>mov     dword ptr [esp+C8], 9
  00C69AAE  |.  E8 FA370100   call    00C7D2AD
  00C69AB3  |.  8D8C24 B00000>lea     ecx, dword ptr [esp+B0]
  00C69ABA  |.  C68424 C80000>mov     byte ptr [esp+C8], 8
  00C69AC2  |.  E8 E6370100   call    00C7D2AD
  00C69AC7  |.  8D4C24 54     lea     ecx, dword ptr [esp+54]
  00C69ACB  |.  C78424 C80000>mov     dword ptr [esp+C8], -1
  00C69AD6  |.  E8 6EFC0000   call    00C79749
  00C69ADB  |.  33C0          xor     eax, eax
  00C69ADD  |.  E9 91030000   jmp     00C69E73
  00C69AE2  |>  8D4C24 30     lea     ecx, dword ptr [esp+30]          ;  开始注册判断, 在esp+30处写入0xca5b4c. esp + 34处写入3456789ABCDEFGHJKLMNPQRSTUVWXY
  00C69AE6  |.  E8 05EBFFFF   call    00C685F0                         ;  在esp+30处写入0xca5b4c. esp + 34处写入3456789ABCDEFGHJKLMNPQRSTUVWXY；这个字符串实际是个字典性质的。
  00C69AEB  |.  8B8F D4010000 mov     ecx, dword ptr [edi+1D4]         ;  ecx=[0012fc28]: 00ce1b84
  00C69AF1  |.  8D5424 30     lea     edx, dword ptr [esp+30]
  00C69AF5  |.  52            push    edx                              ; /Arg1
  00C69AF6  |.  C68424 CC0000>mov     byte ptr [esp+CC], 0A            ; |
  00C69AFE  |.  E8 5DDBFFFF   call    00C67660                         ; \func_c67660(int *) 计算key1,key2,key3的值存放在一些全局变量理
                                                                       ; 这是个非常重要的函数，它的功能是：
                                                                       ; 从C:\Documents and Settings\All Users\Application Data\BlazeVideo\VideoMagic3\BlazeVideoMagic.dll(其实是一个ini文件)
                                                                       ; 中读取VersionInfo节中KEY1, KEY2, KEY3中的数据，然后作一步转换，然后再查表截取掉无效的值
                                                                       ; 然后把这个值进行atoi运算。
                                                                       ; 这其中KEY1, KEY2de都是一个数字分别为0x65，0x889e， 我分别用V1, V2表示
                                                                       ; KEY3的转换截取过程都和KEY1, KEY2一样,但是他的结果为用|分开的几个数字
                                                                       ; 程序分别对各个小节进行atoi操作。
                                                                       ; 实际结果为3个小节，小节的值分别为0xEF、0x89EF、0x23
                                                                       ; 我用V3_len表示小节个数；V3表示指值的数组指针。
                                                                       ; 计算结果保存在全局变量中
  00C69B03  |.  8B7424 10     mov     esi, dword ptr [esp+10]
  00C69B07  |.  8D4C24 30     lea     ecx, dword ptr [esp+30]
  00C69B0B  |.  56            push    esi                              ; /Arg1
  00C69B0C  |.  E8 7F030000   call    00C69E90                         ; 
  00C69B11  |.  85C0          test    eax, eax
  00C69B13  |.  0F84 C3000000 je      00C69BDC                         ;  
  00C69B19  |.  A1 8448C900   mov     eax, dword ptr [C94884]          ;这个值主要用来判断运算过程中使用的缓冲区是与分配的还是临时分配的。在分析过程中没有意义
  00C69B1E  |.  894424 20     mov     dword ptr [esp+20], eax
  00C69B22  |.  894424 1C     mov     dword ptr [esp+1C], eax
  00C69B26  |.  8D4424 1C     lea     eax, dword ptr [esp+1C]
  00C69B2A  |.  8D4C24 20     lea     ecx, dword ptr [esp+20]
  00C69B2E  |.  50            push    eax
  00C69B2F  |.  51            push    ecx
  00C69B30  |.  56            push    esi
  00C69B31  |.  8D4C24 3C     lea     ecx, dword ptr [esp+3C]
  00C69B35  |.  C68424 D40000>mov     byte ptr [esp+D4], 0C
  00C69B3D  |.  E8 2EC0FFFF   call    00C65B70                         ;  
  00C69B42  |.  8B5424 1C     mov     edx, dword ptr [esp+1C]
  00C69B46  |.  8D4C24 30     lea     ecx, dword ptr [esp+30]          
  00C69B4A  |.  52            push    edx                              ; /Arg1
  00C69B4B  |.  E8 30BFFFFF   call    00C65A80                         ; 逆序计算序列号中的数字在3456789ABCDEFGHJKLMNPQRSTUVWXY中的索引
                                                                       ; 组成一个30进制的数，然后吧这个30进制的数转换为16进制存放在edx,eax
                                                                       ; 为了说明方便，我把这个数称为SN.
  00C69B50  |.  B9 08000000   mov     ecx, 8
  00C69B55  |.  894424 28     mov     dword ptr [esp+28], eax
  00C69B59  |.  E8 12490000   call    00C6E470                         ;  edx, eax,算术右移cl位, 我们把结果称为x. x = SN >> 8;
  00C69B5E  |.  32DB          xor     bl, bl
  00C69B60  |.  8BF8          mov     edi, eax
  00C69B62  |.  8BEA          mov     ebp, edx
  00C69B64  |.  33F6          xor     esi, esi
  00C69B66  |>  8BCE          /mov     ecx, esi
  00C69B68  |.  8BC7          |mov     eax, edi
  00C69B6A  |.  8BD5          |mov     edx, ebp
  00C69B6C  |.  E8 FF480000   |call    00C6E470
  00C69B71  |.  83C6 08       |add     esi, 8
  00C69B74  |.  02D8          |add     bl, al
  00C69B76  |.  83FE 40       |cmp     esi, 40
  00C69B79  |.^ 7C EB         \jl      short 00C69B66
  00C69B7B  |.  8A4424 28     mov     al, byte ptr [esp+28]
  00C69B7F  |.  F6D3          not     bl
  00C69B81  |.  3AD8          cmp     bl, al                           ; 至此实际是验证SN的8个字节的计算和是否为0xFF，可以溢出 
  00C69B83  |.  75 31         jnz     short 00C69BB6                   ; 如果不为FF则认为是无效序列号
  00C69B85  |.  A1 7860C900   mov     eax, dword ptr [C96078]          ; V3_len; 我后面会解释V3_len, V3指什么
  00C69B8A  |.  33DB          xor     ebx, ebx
  00C69B8C  |.  85C0          test    eax, eax
  00C69B8E  |.  7E 26         jle     short 00C69BB6                   ; 失败
  00C69B90  |.  BE 6460C900   mov     esi, 00C96064                    ; V3的指针
  00C69B95  |>  8B06          /mov     eax, dword ptr [esi]
  00C69B97  |.  99            |cdq
  00C69B98  |.  52            |push    edx
  00C69B99  |.  50            |push    eax
  00C69B9A  |.  55            |push    ebp
  00C69B9B  |.  57            |push    edi
  00C69B9C  |.  E8 2F490000   |call    00C6E4D0                        ; 求余数arg2:arg1 % arg4:arg3
  00C69BA1  |.  0BC2          |or      eax, edx                        ；如果x是v3中的一个值的倍数，则注册成功。
  00C69BA3  |.  0F84 D0000000 |je      00C69C79                        ; 成功
  00C69BA9  |.  A1 7860C900   |mov     eax, dword ptr [C96078]
  00C69BAE  |.  43            |inc     ebx
  00C69BAF  |.  83C6 04       |add     esi, 4
  00C69BB2  |.  3BD8          |cmp     ebx, eax
  00C69BB4  |.^ 7C DF         \jl      short 00C69B95
  00C69BB6  |>  8D4C24 1C     lea     ecx, dword ptr [esp+1C]          ; 走向失败
  00C69BBA  |.  C68424 C80000>mov     byte ptr [esp+C8], 0B
  00C69BC2  |.  E8 E6360100   call    00C7D2AD
  00C69BC7  |.  8D4C24 20     lea     ecx, dword ptr [esp+20]
  00C69BCB  |.  C68424 C80000>mov     byte ptr [esp+C8], 0A
  00C69BD3  |.  E8 D5360100   call    00C7D2AD
  00C69BD8  |.  8B7C24 24     mov     edi, dword ptr [esp+24]
  00C69BDC  |>  6A 40         push    40                               ; /Arg3 = 00000040
  00C69BDE  |.  68 905FC900   push    00C95F90                         ; |Arg2 = 00C95F90
  00C69BE3  |.  68 6435C900   push    00C93564                         ; |invalid registration info.
  00C69BE8  |.  8BCF          mov     ecx, edi                         ; |
  00C69BEA  |.  E8 D1F2FFFF   call    00C68EC0                         ; \Converte.00C68EC0
  
  以下为函数00C67660的分析过程
00C67660  /$  6A FF         push    -1
00C67662  |.  68 A834C800   push    00C834A8                         ;  G_00CA34A8; SE 处理程序安装
00C67667  |.  64:A1 0000000>mov     eax, dword ptr fs:[0]
00C6766D  |.  50            push    eax
00C6766E  |.  64:8925 00000>mov     dword ptr fs:[0], esp
00C67675  |.  83EC 18       sub     esp, 18                          ;  6个临时变量
00C67678  |.  53            push    ebx
00C67679  |.  56            push    esi
00C6767A  |.  57            push    edi                              ;  3个临时变量
00C6767B  |.  6A 00         push    0                                ; /func_00c67130的第3个参数
00C6767D  |.  68 A42DC900   push    00C92DA4                         ; |Arg2 = 00C92DA4 ASCII "VersionInfo"
00C67682  |.  8BF1          mov     esi, ecx                         ; |
00C67684  |.  68 8830C900   push    00C93088                         ; |Arg1 = 00C93088 ASCII "KEY1"
00C67689  |.  E8 A2FAFFFF   call    00C67130                         ; \Converte.00C67130  返回值为V1
00C6768E  |.  6A 00         push    0                                ; /Arg3 = 00000000
00C67690  |.  68 A42DC900   push    00C92DA4                         ; |Arg2 = 00C92DA4 ASCII "VersionInfo"
00C67695  |.  68 8030C900   push    00C93080                         ; |Arg1 = 00C93080 ASCII "KEY2"
00C6769A  |.  8BCE          mov     ecx, esi                         ; |
00C6769C  |.  8BF8          mov     edi, eax                         ; |
00C6769E  |.  E8 8DFAFFFF   call    00C67130                         ; \func_00c87130(arg1, arg2, 0)；返回值为计算结果V2
在这里我们可以看到对KEY3的处理和kEY1、KEY2是不同的
00C676A3  |.  8BD8          mov     ebx, eax
00C676A5  |.  6A 00         push    0                                ; /Arg4 = 00000000
00C676A7  |.  68 A42DC900   push    00C92DA4                         ; |Arg3 = 00C92DA4 ASCII "VersionInfo"
00C676AC  |.  8D4424 14     lea     eax, dword ptr [esp+14]          ; |temp6
00C676B0  |.  68 7830C900   push    00C93078                         ; |Arg2 = 00C93078 ASCII "KEY3"
00C676B5  |.  50            push    eax                              ; |Arg1
00C676B6  |.  8BCE          mov     ecx, esi                         ; |
00C676B8  |.  E8 33F8FFFF   call    00C66EF0                         ; \计算结果,参数1(即temp6)为指向结果的指针
00C676BD  |.  8B4424 0C     mov     eax, dword ptr [esp+C]
00C676C1  |.  33C9          xor     ecx, ecx
00C676C3  |.  894C24 14     mov     dword ptr [esp+14], ecx          ;  arg1 = 0
00C676C7  |.  8D5424 10     lea     edx, dword ptr [esp+10]          ;  temp5
00C676CB  |.  894C24 18     mov     dword ptr [esp+18], ecx          ;  temp3
00C676CF  |.  52            push    edx
00C676D0  |.  894C24 20     mov     dword ptr [esp+20], ecx          ;  temp2
00C676D4  |.  50            push    eax
00C676D5  |.  C74424 34 000>mov     dword ptr [esp+34], 0
00C676DD  |.  C74424 18 000>mov     dword ptr [esp+18], 0            ;  temp5
00C676E5  |.  894C24 28     mov     dword ptr [esp+28], ecx          ;  temp1
00C676E9  |.  E8 02FFFFFF   call    00C675F0                         ;  func_c675f0(&_temp5, str) temp5中存放着3个字节的数字值，可以把temp理解为一个整数数组的指针
00C676EE  |.  83C4 08       add     esp, 8
00C676F1  |.  8D4C24 10     lea     ecx, dword ptr [esp+10]
00C676F5  |.  6A 00         push    0
00C676F7  |.  6A 00         push    0
00C676F9  |.  50            push    eax
00C676FA  |.  51            push    ecx
00C676FB  |.  8B4C24 44     mov     ecx, dword ptr [esp+44]
00C676FF  |.  53            push    ebx
00C67700  |.  57            push    edi
00C67701  |.  E8 5A0F0000   call    00C68660                         ;  func_C68660(V1, V2, V3, V3_len, 0, 0); ecx 把结果值V1, V2, V3,V3_len存放在全局变量里
00C67706  |.  8D4C24 0C     lea     ecx, dword ptr [esp+C]
00C6770A  |.  8BF0          mov     esi, eax
00C6770C  |.  C74424 2C FFF>mov     dword ptr [esp+2C], -1
00C67714  |.  E8 945B0100   call    00C7D2AD                         ;释放缓冲区内存
00C67719  |.  8B4C24 24     mov     ecx, dword ptr [esp+24]
00C6771D  |.  8BC6          mov     eax, esi
00C6771F  |.  5F            pop     edi
00C67720  |.  5E            pop     esi
00C67721  |.  5B            pop     ebx
00C67722  |.  64:890D 00000>mov     dword ptr fs:[0], ecx
00C67729  |.  83C4 24       add     esp, 24
00C6772C  \.  C2 0400       retn    4
00C6772F      90            nop
00C67730   >  8B01          mov     eax, dword ptr [ecx]
00C67732   .  50            push    eax
00C67733   .  FF15 A452C800 call    dword ptr [<&OLEAUT32.#6>]       ;  OLEAUT32.SysFreeString
00C67739   .  C3            retn

函数 00C67130 的分析  
00C67130  /$  6A FF         push    -1
00C67132  |.  68 5034C800   push    00C83450                         ;  SE 处理程序安装
00C67137  |.  64:A1 0000000>mov     eax, dword ptr fs:[0]
00C6713D  |.  50            push    eax
00C6713E  |.  64:8925 00000>mov     dword ptr fs:[0], esp
00C67145  |.  83EC 08       sub     esp, 8
00C67148  |.  53            push    ebx
00C67149  |.  55            push    ebp
00C6714A  |.  8B2D 5052C800 mov     ebp, dword ptr [<&KERNEL32.Multi>;  kernel32.MultiByteToWideChar
00C67150  |.  56            push    esi
00C67151  |.  57            push    edi
00C67152  |.  8B7C24 28     mov     edi, dword ptr [esp+28]
00C67156  |.  6A 00         push    0                                ; /WideBufSize = 0
00C67158  |.  6A 00         push    0                                ; |WideCharBuf = NULL
00C6715A  |.  6A FF         push    -1                               ; |StringSize = FFFFFFFF (-1.)
00C6715C  |.  57            push    edi                              ; |StringToMap
00C6715D  |.  6A 00         push    0                                ; |Options = 0
00C6715F  |.  894C24 28     mov     dword ptr [esp+28], ecx          ; |temp1= ecx参数
00C67163  |.  6A 00         push    0                                ; |CodePage = CP_ACP
00C67165  |.  C74424 28 FFF>mov     dword ptr [esp+28], -1           ; |temp2=-1
00C6716D  |.  FFD5          call    ebp                              ; \MultiByteToWideChar
00C6716F  |.  8BF0          mov     esi, eax
00C67171  |.  4E            dec     esi
00C67172  |.  56            push    esi
00C67173  |.  6A 00         push    0
00C67175  |.  FF15 A852C800 call    dword ptr [<&OLEAUT32.#4>]       ;  OLEAUT32.SysAllocStringLen
00C6717B  |.  8BD8          mov     ebx, eax
00C6717D  |.  85DB          test    ebx, ebx
00C6717F  |.  74 0B         je      short 00C6718C
00C67181  |.  56            push    esi
00C67182  |.  53            push    ebx
00C67183  |.  6A FF         push    -1
00C67185  |.  57            push    edi
00C67186  |.  6A 00         push    0
00C67188  |.  6A 00         push    0
00C6718A  |.  FFD5          call    ebp
00C6718C  |>  895C24 28     mov     dword ptr [esp+28], ebx
00C67190  |.  8B4424 2C     mov     eax, dword ptr [esp+2C]
00C67194  |.  6A 00         push    0
00C67196  |.  6A 00         push    0
00C67198  |.  6A FF         push    -1
00C6719A  |.  50            push    eax
00C6719B  |.  6A 00         push    0
00C6719D  |.  6A 00         push    0
00C6719F  |.  C74424 38 000>mov     dword ptr [esp+38], 0
00C671A7  |.  FFD5          call    ebp
00C671A9  |.  8BF0          mov     esi, eax
00C671AB  |.  4E            dec     esi
00C671AC  |.  56            push    esi
00C671AD  |.  6A 00         push    0
00C671AF  |.  FF15 A852C800 call    dword ptr [<&OLEAUT32.#4>]       ;  OLEAUT32.SysAllocStringLen
00C671B5  |.  8BF8          mov     edi, eax
00C671B7  |.  85FF          test    edi, edi
00C671B9  |.  74 0F         je      short 00C671CA
00C671BB  |.  8B4C24 2C     mov     ecx, dword ptr [esp+2C]
00C671BF  |.  56            push    esi
00C671C0  |.  57            push    edi
00C671C1  |.  6A FF         push    -1
00C671C3  |.  51            push    ecx
00C671C4  |.  6A 00         push    0
00C671C6  |.  6A 00         push    0
00C671C8  |.  FFD5          call    ebp
00C671CA  |>  897C24 2C     mov     dword ptr [esp+2C], edi          ;  tohere: 2Ascii参数字符串变为Uncicode，temp1=ecx参数,temp2=-1
00C671CE  |.  8B5424 14     mov     edx, dword ptr [esp+14]          ;  temp1
00C671D2  |.  C64424 20 01  mov     byte ptr [esp+20], 1             ;  temp_20
00C671D7  |.  8B42 0C       mov     eax, dword ptr [edx+C]
00C671DA  |.  8B5424 30     mov     edx, dword ptr [esp+30]          ;  arg3
00C671DE  |.  52            push    edx
00C671DF  |.  8D5424 14     lea     edx, dword ptr [esp+14]          ;  temp2
00C671E3  |.  8B08          mov     ecx, dword ptr [eax]
00C671E5  |.  52            push    edx
00C671E6  |.  53            push    ebx
00C671E7  |.  57            push    edi
00C671E8  |.  50            push    eax
00C671E9  |.  FF51 28       call    dword ptr [ecx+28]               ;  计算结果,结果为一个数字存放在(即temp2中) 重点在这里
                                                                     ;  这里是调用一个类的第11个虚函数，我把这个类称为ClassA.
00C671EC  |.  8B35 A452C800 mov     esi, dword ptr [<&OLEAUT32.#6>]  ;  OLEAUT32.SysFreeString
00C671F2  |.  57            push    edi
00C671F3  |.  FFD6          call    esi                              ;  <&OLEAUT32.#6>
00C671F5  |.  53            push    ebx
00C671F6  |.  FFD6          call    esi
00C671F8  |.  8B4C24 18     mov     ecx, dword ptr [esp+18]
00C671FC  |.  8B4424 10     mov     eax, dword ptr [esp+10]
00C67200  |.  5F            pop     edi
00C67201  |.  5E            pop     esi
00C67202  |.  5D            pop     ebp
00C67203  |.  5B            pop     ebx
00C67204  |.  64:890D 00000>mov     dword ptr fs:[0], ecx
00C6720B  |.  83C4 14       add     esp, 14
00C6720E  \.  C2 0C00       retn    0C

                     
ClassA的第11个虚函数
67001753    B8 C89C0067     mov     eax, 67009CC8                    ; func_67001753(base_vfunc, section, key, int &, int)
67001758    E8 FF160000     call    67002E5C
6700175D    51              push    ecx
6700175E    53              push    ebx
6700175F    33DB            xor     ebx, ebx
67001761    395D 0C         cmp     dword ptr [ebp+C], ebx
67001764    56              push    esi
67001765    57              push    edi
67001766    0F84 81000000   je      670017ED
6700176C    395D 10         cmp     dword ptr [ebp+10], ebx
6700176F    74 7C           je      short 670017ED
67001771    395D 14         cmp     dword ptr [ebp+14], ebx
67001774    74 77           je      short 670017ED
67001776    895D F0         mov     dword ptr [ebp-10], ebx          ; temp1=0
67001779    FF75 18         push    dword ptr [ebp+18]               ; arg5
6700177C    8B45 08         mov     eax, dword ptr [ebp+8]           ; arg1
6700177F    8D55 F0         lea     edx, dword ptr [ebp-10]          ; &temp1
67001782    895D FC         mov     dword ptr [ebp-4], ebx
67001785    8B08            mov     ecx, dword ptr [eax]
67001787    52              push    edx
67001788    FF75 10         push    dword ptr [ebp+10]
6700178B    FF75 0C         push    dword ptr [ebp+C]
6700178E    50              push    eax
6700178F    FF51 20         call    dword ptr [ecx+20]               ; 计算结果，字符串缓冲区存放在参数4（即temp1）中
                                                                     ; ClassA的第11个虚函数又调用ClassA的第9个虚函数
67001792    3BC3            cmp     eax, ebx
67001794    7D 04           jge     short 6700179A
67001796    8BD8            mov     ebx, eax
67001798    EB 46           jmp     short 670017E0
6700179A    8B45 F0         mov     eax, dword ptr [ebp-10]
6700179D    3BC3            cmp     eax, ebx
6700179F    8945 10         mov     dword ptr [ebp+10], eax
670017A2    75 04           jnz     short 670017A8
670017A4    33F6            xor     esi, esi
670017A6    EB 2C           jmp     short 670017D4
670017A8    50              push    eax
670017A9    FF15 08A00067   call    dword ptr [<&KERNEL32.lstrlenW>] ; kernel32.lstrlenW
670017AF    8D7C00 02       lea     edi, dword ptr [eax+eax+2]
670017B3    8BC7            mov     eax, edi
670017B5    83C0 03         add     eax, 3
670017B8    24 FC           and     al, 0FC
670017BA    E8 61120000     call    67002A20
670017BF    8BF4            mov     esi, esp
670017C1    53              push    ebx
670017C2    53              push    ebx
670017C3    57              push    edi
670017C4    56              push    esi
670017C5    6A FF           push    -1
670017C7    FF75 10         push    dword ptr [ebp+10]
670017CA    881E            mov     byte ptr [esi], bl
670017CC    53              push    ebx
670017CD    53              push    ebx
670017CE    FF15 04A00067   call    dword ptr [<&KERNEL32.WideCharTo>; kernel32.WideCharToMultiByte ;把ClassA第9个虚函数返回的缓冲区中的值从Unicode改为Ascii. 
670017D4    56              push    esi
670017D5    FF15 28A10067   call    dword ptr [<&SHLWAPI.StrToIntA>] ; SHLWAPI.StrToIntA  ;把结果转换为数字。
670017DB    8B4D 14         mov     ecx, dword ptr [ebp+14]
670017DE    8901            mov     dword ptr [ecx], eax
670017E0    FF75 F0         push    dword ptr [ebp-10]
670017E3    FF15 18A10067   call    dword ptr [<&OLEAUT32.#6_SysFree>; OLEAUT32.SysFreeString
670017E9    8BC3            mov     eax, ebx
670017EB    EB 05           jmp     short 670017F2
670017ED    B8 57000780     mov     eax, 80070057
670017F2    8B4D F4         mov     ecx, dword ptr [ebp-C]
670017F5    8D65 E4         lea     esp, dword ptr [ebp-1C]
670017F8    64:890D 0000000>mov     dword ptr fs:[0], ecx
670017FF    5F              pop     edi
67001800    5E              pop     esi
67001801    5B              pop     ebx
67001802    C9              leave
67001803    C2 1400         retn    14

ClassA的第9个虚函数
67001468    B8 909C0067     mov     eax, 67009C90                    ; func_20_67009c40(base_func, section, key, int &, 0)
6700146D    E8 EA190000     call    67002E5C                         ; build Seh帧
67001472    81EC 08040000   sub     esp, 408
67001478    8B4D 08         mov     ecx, dword ptr [ebp+8]
6700147B    53              push    ebx
6700147C    33DB            xor     ebx, ebx
6700147E    56              push    esi
6700147F    3859 04         cmp     byte ptr [ecx+4], bl
67001482    57              push    edi
67001483    75 13           jnz     short 67001498
67001485    E8 C3040000     call    6700194D
6700148A    85C0            test    eax, eax
6700148C    75 0A           jnz     short 67001498
6700148E    B8 07000480     mov     eax, 80040007
67001493    E9 3F010000     jmp     670015D7
67001498    395D 0C         cmp     dword ptr [ebp+C], ebx
6700149B    0F84 31010000   je      670015D2
670014A1    395D 10         cmp     dword ptr [ebp+10], ebx
670014A4    0F84 28010000   je      670015D2
670014AA    395D 14         cmp     dword ptr [ebp+14], ebx
670014AD    0F84 1F010000   je      670015D2
670014B3    FF75 0C         push    dword ptr [ebp+C]
670014B6    B9 00010000     mov     ecx, 100
670014BB    33C0            xor     eax, eax
670014BD    8DBD EDFBFFFF   lea     edi, dword ptr [ebp-413]
670014C3    889D ECFBFFFF   mov     byte ptr [ebp-414], bl
670014C9    F3:AB           rep     stos dword ptr es:[edi]
670014CB    8B3D 08A00067   mov     edi, dword ptr [<&KERNEL32.lstrl>; kernel32.lstrlenW
670014D1    FFD7            call    edi
670014D3    8D7400 02       lea     esi, dword ptr [eax+eax+2]
670014D7    8BC6            mov     eax, esi
670014D9    83C0 03         add     eax, 3
670014DC    24 FC           and     al, 0FC
670014DE    E8 3D150000     call    67002A20
670014E3    8BC4            mov     eax, esp                         ; 在栈上为字符串分配空间
670014E5    53              push    ebx
670014E6    53              push    ebx
670014E7    56              push    esi
670014E8    8B35 04A00067   mov     esi, dword ptr [<&KERNEL32.WideC>; kernel32.WideCharToMultiByte
670014EE    50              push    eax
670014EF    6A FF           push    -1
670014F1    8945 F0         mov     dword ptr [ebp-10], eax          ; temp1
670014F4    FF75 0C         push    dword ptr [ebp+C]
670014F7    8818            mov     byte ptr [eax], bl
670014F9    53              push    ebx
670014FA    53              push    ebx
670014FB    FFD6            call    esi
670014FD    FF75 10         push    dword ptr [ebp+10]
67001500    FFD7            call    edi
67001502    8D4400 02       lea     eax, dword ptr [eax+eax+2]
67001506    8945 0C         mov     dword ptr [ebp+C], eax
67001509    83C0 03         add     eax, 3
6700150C    24 FC           and     al, 0FC
6700150E    E8 0D150000     call    67002A20
67001513    8BFC            mov     edi, esp
67001515    53              push    ebx
67001516    53              push    ebx
67001517    FF75 0C         push    dword ptr [ebp+C]
6700151A    881F            mov     byte ptr [edi], bl
6700151C    57              push    edi
6700151D    6A FF           push    -1
6700151F    FF75 10         push    dword ptr [ebp+10]
67001522    53              push    ebx
67001523    53              push    ebx
67001524    FFD6            call    esi
67001526    8B45 08         mov     eax, dword ptr [ebp+8]
67001529    83C0 04         add     eax, 4
6700152C    50              push    eax
6700152D    8D85 ECFBFFFF   lea     eax, dword ptr [ebp-414]
67001533    68 01040000     push    401
67001538    50              push    eax
67001539    68 F8ED0067     push    6700EDF8
6700153E    57              push    edi
6700153F    FF75 F0         push    dword ptr [ebp-10]
; 以上为在栈分配空间空间，key, section字符串Unicode到ascii的转换 和参数入栈
; 在这里需要留意GetPrivateProfileStringA用到的文件名
67001542    FF15 10A00067   call    dword ptr [<&KERNEL32.GetPrivate>; kernel32.GetPrivateProfileStringA
67001548    83F8 01         cmp     eax, 1
6700154B    0F82 81000000   jb      670015D2
67001551    8D85 ECFBFFFF   lea     eax, dword ptr [ebp-414]
67001557    8D4D 0C         lea     ecx, dword ptr [ebp+C]           ; 参数2的地址
6700155A    50              push    eax
6700155B    E8 C5070000     call    67001D25                         ; 把从ini中读到的字符串值复制到堆上，参数2指向分配的空间地址
67001560    FF75 18         push    dword ptr [ebp+18]
67001563    8B4D 08         mov     ecx, dword ptr [ebp+8]
67001566    8D45 0C         lea     eax, dword ptr [ebp+C]
67001569    895D FC         mov     dword ptr [ebp-4], ebx
6700156C    53              push    ebx
6700156D    50              push    eax
6700156E    8D45 10         lea     eax, dword ptr [ebp+10]
67001571    50              push    eax
67001572    E8 B7FCFFFF     call    6700122E                         ; 对取到的值进行运算；返回值为计算结果
67001577    8B00            mov     eax, dword ptr [eax]
67001579    6A FF           push    -1
6700157B    50              push    eax
6700157C    C645 FC 01      mov     byte ptr [ebp-4], 1
67001580    E8 A8060000     call    67001C2D                         ; 转化结果为unicode,返回值指向分配的内存
67001585    59              pop     ecx
67001586    8BF0            mov     esi, eax
67001588    59              pop     ecx
67001589    8975 08         mov     dword ptr [ebp+8], esi
6700158C    8D4D 10         lea     ecx, dword ptr [ebp+10]
6700158F    C645 FC 04      mov     byte ptr [ebp-4], 4
67001593    E8 61070000     call    67001CF9
67001598    8D4D 0C         lea     ecx, dword ptr [ebp+C]
6700159B    C645 FC 03      mov     byte ptr [ebp-4], 3
6700159F    E8 55070000     call    67001CF9
670015A4    3BF3            cmp     esi, ebx
670015A6    74 0C           je      short 670015B4
670015A8    56              push    esi
670015A9    FF15 1CA10067   call    dword ptr [<&OLEAUT32.#7_SysStri>; OLEAUT32.SysStringLen
670015AF    83F8 01         cmp     eax, 1
670015B2    73 0E           jnb     short 670015C2
670015B4    56              push    esi
670015B5    FF15 18A10067   call    dword ptr [<&OLEAUT32.#6_SysFree>; OLEAUT32.SysFreeString
670015BB    B8 FFFF0080     mov     eax, 8000FFFF
670015C0    EB 15           jmp     short 670015D7
670015C2    8B45 14         mov     eax, dword ptr [ebp+14]
670015C5    53              push    ebx
670015C6    8930            mov     dword ptr [eax], esi
670015C8    FF15 18A10067   call    dword ptr [<&OLEAUT32.#6_SysFree>; OLEAUT32.SysFreeString
670015CE    33C0            xor     eax, eax
670015D0    EB 05           jmp     short 670015D7
670015D2    B8 57000780     mov     eax, 80070057
670015D7    8B4D F4         mov     ecx, dword ptr [ebp-C]
670015DA    8DA5 E0FBFFFF   lea     esp, dword ptr [ebp-420]
670015E0    64:890D 0000000>mov     dword ptr fs:[0], ecx
670015E7    5F              pop     edi
670015E8    5E              pop     esi
670015E9    5B              pop     ebx
670015EA    C9              leave
670015EB    C2 1400         retn    14

函数6700122E 的分析
6700122E    B8 6B9C0067     mov     eax, 67009C6B
67001233    E8 241C0000     call    67002E5C
67001238    83EC 14         sub     esp, 14
6700123B    53              push    ebx
6700123C    57              push    edi
6700123D    33FF            xor     edi, edi
6700123F    807D 14 FF      cmp     byte ptr [ebp+14], 0FF
67001243    8BD9            mov     ebx, ecx
67001245    897D E0         mov     dword ptr [ebp-20], edi          ; temp5=0
67001248    75 13           jnz     short 6700125D
6700124A    FF75 0C         push    dword ptr [ebp+C]
6700124D    8B4D 08         mov     ecx, dword ptr [ebp+8]
67001250    E8 200A0000     call    67001C75
67001255    8B45 08         mov     eax, dword ptr [ebp+8]
67001258    E9 FB010000     jmp     67001458
6700125D    A1 5CC00067     mov     eax, dword ptr [6700C05C]        ; g_6700c05c
67001262    56              push    esi
67001263    8945 F0         mov     dword ptr [ebp-10], eax          ; temp1=
67001266    8B75 0C         mov     esi, dword ptr [ebp+C]
67001269    397D 10         cmp     dword ptr [ebp+10], edi
6700126C    C745 FC 0100000>mov     dword ptr [ebp-4], 1
67001273    8B0E            mov     ecx, dword ptr [esi]
67001275    8B51 F8         mov     edx, dword ptr [ecx-8]
67001278    0F84 F2000000   je      67001370                         ; 因为在跟踪过程中这里跳转了，所以
                                                                     ; 以下分支没有分析
6700127E    56              push    esi
6700127F    8D4D 0C         lea     ecx, dword ptr [ebp+C]
67001282    E8 EE090000     call    67001C75
67001287    A1 5CC00067     mov     eax, dword ptr [6700C05C]
6700128C    8945 E8         mov     dword ptr [ebp-18], eax
6700128F    8945 EC         mov     dword ptr [ebp-14], eax
67001292    68 F8ED0067     push    6700EDF8
67001297    8D45 EC         lea     eax, dword ptr [ebp-14]
6700129A    68 98C00067     push    6700C098                         ; ASCII "%255s"
6700129F    50              push    eax
670012A0    C645 FC 04      mov     byte ptr [ebp-4], 4
670012A4    E8 0E0F0000     call    670021B7
670012A9    8B36            mov     esi, dword ptr [esi]
670012AB    83C4 0C         add     esp, 0C
670012AE    817E F8 FF00000>cmp     dword ptr [esi-8], 0FF
670012B5    7D 35           jge     short 670012EC
670012B7    8B76 F8         mov     esi, dword ptr [esi-8]
670012BA    B8 FF000000     mov     eax, 0FF
670012BF    2BC6            sub     eax, esi
670012C1    8D4D EC         lea     ecx, dword ptr [ebp-14]
670012C4    50              push    eax
670012C5    8D45 10         lea     eax, dword ptr [ebp+10]
670012C8    50              push    eax
670012C9    E8 420E0000     call    67002110
670012CE    8B00            mov     eax, dword ptr [eax]
670012D0    8D4D 0C         lea     ecx, dword ptr [ebp+C]
670012D3    50              push    eax
670012D4    C645 FC 05      mov     byte ptr [ebp-4], 5
670012D8    FF70 F8         push    dword ptr [eax-8]
670012DB    E8 6E0C0000     call    67001F4E
670012E0    8D4D 10         lea     ecx, dword ptr [ebp+10]
670012E3    C645 FC 04      mov     byte ptr [ebp-4], 4
670012E7    E8 0D0A0000     call    67001CF9
670012EC    8B45 0C         mov     eax, dword ptr [ebp+C]
670012EF    33F6            xor     esi, esi
670012F1    3978 F8         cmp     dword ptr [eax-8], edi
670012F4    7E 56           jle     short 6700134C
670012F6    8A0C06          mov     cl, byte ptr [esi+eax]
670012F9    A1 5CC00067     mov     eax, dword ptr [6700C05C]
670012FE    8945 10         mov     dword ptr [ebp+10], eax
67001301    8A83 08010000   mov     al, byte ptr [ebx+108]
67001307    C645 FC 06      mov     byte ptr [ebp-4], 6
6700130B    F66D 14         imul    byte ptr [ebp+14]
6700130E    32C1            xor     al, cl
67001310    0FB6C0          movzx   eax, al
67001313    50              push    eax
67001314    8D45 10         lea     eax, dword ptr [ebp+10]
67001317    68 90C00067     push    6700C090                         ; ASCII "%02x"
6700131C    50              push    eax
6700131D    E8 950E0000     call    670021B7
67001322    8B45 10         mov     eax, dword ptr [ebp+10]
67001325    83C4 0C         add     esp, 0C
67001328    8D4D F0         lea     ecx, dword ptr [ebp-10]
6700132B    50              push    eax
6700132C    FF70 F8         push    dword ptr [eax-8]
6700132F    E8 1A0C0000     call    67001F4E
67001334    8D4D 10         lea     ecx, dword ptr [ebp+10]
67001337    C645 FC 04      mov     byte ptr [ebp-4], 4
6700133B    E8 B9090000     call    67001CF9
67001340    8B45 0C         mov     eax, dword ptr [ebp+C]
67001343    46              inc     esi
67001344    FE45 14         inc     byte ptr [ebp+14]
67001347    3B70 F8         cmp     esi, dword ptr [eax-8]
6700134A  ^ 7C AA           jl      short 670012F6
6700134C    8D4D EC         lea     ecx, dword ptr [ebp-14]
6700134F    C645 FC 03      mov     byte ptr [ebp-4], 3
67001353    E8 A1090000     call    67001CF9
67001358    8D4D E8         lea     ecx, dword ptr [ebp-18]
6700135B    C645 FC 02      mov     byte ptr [ebp-4], 2
6700135F    E8 95090000     call    67001CF9
67001364    C645 FC 01      mov     byte ptr [ebp-4], 1
67001368    8D4D 0C         lea     ecx, dword ptr [ebp+C]
6700136B    E9 C0000000     jmp     67001430
67001370    81FA FE010000   cmp     edx, 1FE                        ; 0x1FE为ini文件中值的长度
67001376    74 21           je      short 67001399
67001378    BE F8ED0067     mov     esi, 6700EDF8
6700137D    8BC6            mov     eax, esi
6700137F    85C0            test    eax, eax
67001381    74 07           je      short 6700138A
67001383    56              push    esi
67001384    FF15 0CA00067   call    dword ptr [<&KERNEL32.lstrlenA>] ; kernel32.lstrlenA
6700138A    56              push    esi
6700138B    50              push    eax
6700138C    8D4D F0         lea     ecx, dword ptr [ebp-10]
6700138F    E8 AC0A0000     call    67001E40
67001394    E9 9C000000     jmp     67001435
67001399    8945 10         mov     dword ptr [ebp+10], eax          ; arg3
6700139C    8B41 F8         mov     eax, dword ptr [ecx-8]
6700139F    C645 FC 07      mov     byte ptr [ebp-4], 7
670013A3    99              cdq
670013A4    2BC2            sub     eax, edx
670013A6    D1F8            sar     eax, 1
670013A8    85C0            test    eax, eax
670013AA    7E 69           jle     short 67001415
670013AC    8365 0C 00      and     dword ptr [ebp+C], 0

; 以下为一个循环, 对数据进行处理，两个一组组成一个字节。
; 每个字节的运算结果为 ([ebx+108] * i ) ^ value[i];

670013B0    6A 02           push    2
670013B2    8D45 EC         lea     eax, dword ptr [ebp-14]          ; temp2
670013B5    FF75 0C         push    dword ptr [ebp+C]
670013B8    8BCE            mov     ecx, esi
670013BA    50              push    eax
670013BB    E8 8F0C0000     call    6700204F                         ; 分配3字节的缓冲区缓冲区，把字符串的2各字节复制进去,临时变量2指向分配的地址
670013C0    8D45 E8         lea     eax, dword ptr [ebp-18]          ; temp3
670013C3    C645 FC 08      mov     byte ptr [ebp-4], 8
670013C7    50              push    eax
670013C8    68 90C00067     push    6700C090                         ; ASCII "%02x"
670013CD    FF75 EC         push    dword ptr [ebp-14]
670013D0    E8 7A160000     call    67002A4F                         ; temp3 = tohex(temp2)
670013D5    8A83 08010000   mov     al, byte ptr [ebx+108]           ; 
670013DB    83C4 0C         add     esp, 0C
670013DE    F66D 14         imul    byte ptr [ebp+14]                ; arg4
670013E1    3245 E8         xor     al, byte ptr [ebp-18]            ; temp3
670013E4    8D4D 10         lea     ecx, dword ptr [ebp+10]          ; arg2=6000c070
670013E7    8845 E4         mov     byte ptr [ebp-1C], al            ; temp4
670013EA    FF75 E4         push    dword ptr [ebp-1C]
670013ED    57              push    edi
670013EE    E8 87110000     call    6700257A                         ; 参数3指向一个新的内存分配区，该位置保存着刚才运算的字节
670013F3    8D4D EC         lea     ecx, dword ptr [ebp-14]
670013F6    C645 FC 07      mov     byte ptr [ebp-4], 7
670013FA    E8 FA080000     call    67001CF9                         ; free分配的内存
670013FF    8B06            mov     eax, dword ptr [esi]
67001401    8345 0C 02      add     dword ptr [ebp+C], 2
67001405    47              inc     edi
67001406    FE45 14         inc     byte ptr [ebp+14]
67001409    8B40 F8         mov     eax, dword ptr [eax-8]
6700140C    99              cdq
6700140D    2BC2            sub     eax, edx
6700140F    D1F8            sar     eax, 1
67001411    3BF8            cmp     edi, eax
67001413  ^ 7C 9B           jl      short 670013B0

67001415    8D45 10         lea     eax, dword ptr [ebp+10]          ; 参数的地址，参数的值为刚才计算的结果
67001418    8D4D F0         lea     ecx, dword ptr [ebp-10]          ; temp1
6700141B    50              push    eax
6700141C    E8 7B0A0000     call    67001E9C                         ; 计数加1，把地址赋值给ecx指向的值（temp1)
67001421    8D4D F0         lea     ecx, dword ptr [ebp-10]
67001424    E8 05110000     call    6700252E                         ; 计算结果，返回值指向结果缓冲区，temp1中存储有数据长度和有效长度
67001429    C645 FC 01      mov     byte ptr [ebp-4], 1
6700142D    8D4D 10         lea     ecx, dword ptr [ebp+10]
67001430    E8 C4080000     call    67001CF9                         ; 释放内存
67001435    8B4D 08         mov     ecx, dword ptr [ebp+8]
67001438    8D45 F0         lea     eax, dword ptr [ebp-10]
6700143B    50              push    eax
6700143C    E8 34080000     call    67001C75                         ; arg1 = 结果
67001441    8065 FC 00      and     byte ptr [ebp-4], 0
67001445    8D4D F0         lea     ecx, dword ptr [ebp-10]
67001448    C745 E0 0100000>mov     dword ptr [ebp-20], 1
6700144F    E8 A5080000     call    67001CF9
67001454    8B45 08         mov     eax, dword ptr [ebp+8]
67001457    5E              pop     esi
67001458    8B4D F4         mov     ecx, dword ptr [ebp-C]
6700145B    5F              pop     edi
6700145C    5B              pop     ebx
6700145D    64:890D 0000000>mov     dword ptr fs:[0], ecx
67001464    C9              leave
67001465    C2 1000         retn    10

地址 6700252E 处的分析
6700252E    53              push    ebx
6700252F    56              push    esi
67002530    57              push    edi
67002531    8BD9            mov     ebx, ecx
67002533    E8 E5FAFFFF     call    6700201D                         ; 对value的值进行计算，生成两个缓冲区，eax 指向第二个
67002538    8B3B            mov     edi, dword ptr [ebx]             ; 取出第二个缓冲区中的数
6700253A    33F6            xor     esi, esi
6700253C    8A07            mov     al, byte ptr [edi]
6700253E    84C0            test    al, al
67002540    74 34           je      short 67002576
; 因为从ini中读取出的结果进行直接的计算后不是全为有效字符，所以以下循环为
  找到第一个无效字符然后把这个值改为0
67002542    0FB6C0          movzx   eax, al
67002545    50              push    eax
67002546    E8 7D0E0000     call    670033C8                         ; 读表
6700254B    85C0            test    eax, eax
6700254D    59              pop     ecx
6700254E    74 08           je      short 67002558
67002550    85F6            test    esi, esi
67002552    75 06           jnz     short 6700255A
67002554    8BF7            mov     esi, edi
67002556    EB 02           jmp     short 6700255A
67002558    33F6            xor     esi, esi
6700255A    57              push    edi
6700255B    FF15 40A10067   call    dword ptr [<&USER32.CharNextA>]  ; USER32.CharNextA
67002561    8BF8            mov     edi, eax
67002563    8A07            mov     al, byte ptr [edi]
67002565    84C0            test    al, al
67002567  ^ 75 D9           jnz     short 67002542                   ; 以上循环应该是计算有效数字

67002569    85F6            test    esi, esi                         ; 
6700256B    74 09           je      short 67002576
6700256D    2006            and     byte ptr [esi], al
6700256F    8B1B            mov     ebx, dword ptr [ebx]
67002571    2BF3            sub     esi, ebx
67002573    8973 F8         mov     dword ptr [ebx-8], esi
67002576    5F              pop     edi
67002577    5E              pop     esi
67002578    5B              pop     ebx
67002579    C3              retn

从现在看；似乎只要x是v3中某个数的倍数即可。
令x=0x23生成一个序列号，注册时提示成功了，程序自动退出，但是重新启动后发现仍然是未出册状态。
看来再这个时候程序只做了部分检查。

看来还是只能从启动时跟踪来寻找注册算法。
这次对GetPrivateProfileA下条件断点，当文件名为保存注册信息的ini文件名时中断；文件名可以从前面获得。

启动后寻找读Key1时停下来，然后反复按Ctrl + F9直到返回到
00C66530  /$  83EC 6C       sub     esp, 6C
00C66533  |.  53            push    ebx
00C66534  |.  55            push    ebp
00C66535  |.  8BD9          mov     ebx, ecx
00C66537  |.  33ED          xor     ebp, ebp
00C66539  |.  E8 C2EEFFFF   call    00C65400                         ; 第一轮检查,实际就是注册时检测的那部分。
00C6653E  |.  85C0          test    eax, eax                         ; come here
00C66540  |.  74 16         je      short 00C66558
00C66542  |.  8BCB          mov     ecx, ebx
00C66544  |.  E8 17F7FFFF   call    00C65C60                         ; 第二轮检测
00C66549  |.  85C0          test    eax, eax                         ;  
00C6654B      74 0B         je      short 00C66558
00C6654D      8BCB          mov     ecx, ebx
00C6654F  |.  E8 DCFAFFFF   call    00C66030                         ; 第三轮检测
00C66554  |.  85C0          test    eax, eax
00C66556  |.  75 28         jnz     short 00C66580                   ; success
00C66558  |>  8B43 18       mov     eax, dword ptr [ebx+18]
00C6655B  |.  8D4B 18       lea     ecx, dword ptr [ebx+18]
00C6655E  |.  6A 00         push    0
00C66560  |.  6A 08         push    8
00C66562  |.  FF50 1C       call    dword ptr [eax+1C]
00C66565  |.  83F8 01       cmp     eax, 1
00C66568  |.  74 21         je      short 00C6658B
00C6656A  |.  8BCB          mov     ecx, ebx
00C6656C  |.  E8 1F060000   call    00C66B90
00C66571  |.  85C0          test    eax, eax
00C66573  |.  75 66         jnz     short 00C665DB
00C66575  |.  8BCB          mov     ecx, ebx
00C66577  |.  E8 94FEFFFF   call    00C66410
00C6657C  |.  85C0          test    eax, eax
00C6657E  |.  75 5B         jnz     short 00C665DB
00C66580  |>  5D            pop     ebp
00C66581  |.  B8 01000000   mov     eax, 1
00C66586  |.  5B            pop     ebx
00C66587  |.  83C4 6C       add     esp, 6C
00C6658A  |.  C3            retn

第二轮和第三轮检测又重复计算了x, V1, V2, V3, V3_len
所以下面只给出核心算法部分
第二轮
00C65EC7  |> /8D4424 38     |/lea     eax, dword ptr [esp+38]
00C65ECB  |. |8D4C24 20     ||lea     ecx, dword ptr [esp+20]
00C65ECF  |. |50            ||push    eax
00C65ED0  |. |E8 46740100   ||call    00C7D31B
00C65ED5  |. |6A 01         ||push    1
00C65ED7  |. |8D4C24 30     ||lea     ecx, dword ptr [esp+30]
00C65EDB  |. |55            ||push    ebp
00C65EDC  |. |51            ||push    ecx
00C65EDD  |. |8D4C24 20     ||lea     ecx, dword ptr [esp+20]
00C65EE1  |. |C64424 6C 09  ||mov     byte ptr [esp+6C], 9
00C65EE6  |. |E8 B1240100   ||call    00C7839C
00C65EEB  |. |8B00          ||mov     eax, dword ptr [eax]
00C65EED  |. |8D4C24 20     ||lea     ecx, dword ptr [esp+20]
00C65EF1  |. |50            ||push    eax
00C65EF2  |. |C64424 64 0A  ||mov     byte ptr [esp+64], 0A
00C65EF7  |. |E8 2A260100   ||call    00C78526
00C65EFC  |. |8D4C24 2C     ||lea     ecx, dword ptr [esp+2C]
00C65F00  |. |8BD8          ||mov     ebx, eax
00C65F02  |. |C64424 60 09  ||mov     byte ptr [esp+60], 9
00C65F07  |. |E8 A1730100   ||call    00C7D2AD
00C65F0C  |. |8BC3          ||mov     eax, ebx
00C65F0E  |. |B9 1E000000   ||mov     ecx, 1E
00C65F13  |. |99            ||cdq
00C65F14  |. |F7F9          ||idiv    ecx
00C65F16  |. |6A 00         ||push    0
00C65F18  |. |51            ||push    ecx
00C65F19  |. |57            ||push    edi
00C65F1A  |. |56            ||push    esi
00C65F1B  |. |8BDA          ||mov     ebx, edx
00C65F1D  |. |E8 6E850000   ||call    00C6E490
00C65F22  |. |8BC8          ||mov     ecx, eax
00C65F24  |. |8BC3          ||mov     eax, ebx
00C65F26  |. |8BFA          ||mov     edi, edx
00C65F28  |. |C64424 60 08  ||mov     byte ptr [esp+60], 8
00C65F2D  |. |99            ||cdq
00C65F2E  |. |03C8          ||add     ecx, eax
00C65F30  |. |8BF1          ||mov     esi, ecx
00C65F32  |. |8D4C24 20     ||lea     ecx, dword ptr [esp+20]
00C65F36  |. |13FA          ||adc     edi, edx
00C65F38  |. |E8 70730100   ||call    00C7D2AD
00C65F3D  |. |4D            ||dec     ebp
00C65F3E  |.^\79 87         |\jns     short 00C65EC7
00C65F40  |>  8D4C24 14     |lea     ecx, dword ptr [esp+14]         ;  计算序列号的值SN
00C65F44  |.  C64424 60 04  |mov     byte ptr [esp+60], 4
00C65F49  |.  E8 5F730100   |call    00C7D2AD
00C65F4E  |.  B9 08000000   |mov     ecx, 8
00C65F53  |.  8BC6          |mov     eax, esi
00C65F55  |.  8BD7          |mov     edx, edi
00C65F57  |.  E8 14850000   |call    00C6E470
00C65F5C  |.  8BF2          |mov     esi, edx                        ;  计算出x, 开始第二轮的比较
; 以下循环为判断是否有 ((x / V3[i] ) ^ 234fdf ) % 0fffa == V2 成立   ;  如果检测成功，则返回值为1
00C65F5E  |.  8B5424 10     |mov     edx, dword ptr [esp+10]
00C65F62  |.  8BC8          |mov     ecx, eax
00C65F64  |.  8B02          |mov     eax, dword ptr [edx]
00C65F66  |.  99            |cdq
00C65F67  |.  52            |push    edx
00C65F68  |.  50            |push    eax
00C65F69  |.  56            |push    esi
00C65F6A  |.  51            |push    ecx
00C65F6B  |.  E8 E0850000   |call    00C6E550                        ;  64位除法
00C65F70  |.  83F2 00       |xor     edx, 0
00C65F73  |.  6A 00         |push    0
00C65F75  |.  35 DF4F2300   |xor     eax, 234FDF
00C65F7A  |.  68 FAFF0000   |push    0FFFA
00C65F7F  |.  52            |push    edx
00C65F80  |.  50            |push    eax
00C65F81  |.  E8 4A850000   |call    00C6E4D0                        ;  模运算
00C65F86  |.  8BC8          |mov     ecx, eax
00C65F88  |.  A1 6060C900   |mov     eax, dword ptr [C96060]
00C65F8D  |.  8BF2          |mov     esi, edx
00C65F8F  |.  99            |cdq
00C65F90  |.  3BC8          |cmp     ecx, eax
00C65F92  |.  75 04         |jnz     short 00C65F98
00C65F94  |.  3BF2          |cmp     esi, edx
00C65F96  |.  74 66         |je      short 00C65FFE
00C65F98  |>  8B4424 24     |mov     eax, dword ptr [esp+24]         ;  不相等
00C65F9C  |.  8B5424 10     |mov     edx, dword ptr [esp+10]
00C65FA0  |.  8B0D 7860C900 |mov     ecx, dword ptr [C96078]
00C65FA6  |.  40            |inc     eax
00C65FA7  |.  83C2 04       |add     edx, 4
00C65FAA  |.  3BC1          |cmp     eax, ecx
00C65FAC  |.  894424 24     |mov     dword ptr [esp+24], eax
00C65FB0  |.  895424 10     |mov     dword ptr [esp+10], edx
00C65FB4  |.^ 0F8C EAFEFFFF \jl      00C65EA4

00C65FBA  |>  8D4C24 18     lea     ecx, dword ptr [esp+18]
00C65FBE  |.  C64424 60 03  mov     byte ptr [esp+60], 3
00C65FC3  |.  E8 E5720100   call    00C7D2AD
00C65FC8  |.  C64424 60 00  mov     byte ptr [esp+60], 0
00C65FCD  |.  8D4C24 1C     lea     ecx, dword ptr [esp+1C]
00C65FD1  |>  E8 D7720100   call    00C7D2AD
00C65FD6  |>  33F6          xor     esi, esi
00C65FD8  |>  8D4C24 34     lea     ecx, dword ptr [esp+34]
00C65FDC  |.  C74424 60 FFF>mov     dword ptr [esp+60], -1
00C65FE4  |.  E8 67260000   call    00C68650
00C65FE9  |.  8B4C24 58     mov     ecx, dword ptr [esp+58]
00C65FED  |.  8BC6          mov     eax, esi
00C65FEF  |.  5F            pop     edi
00C65FF0  |.  5E            pop     esi
00C65FF1  |.  5D            pop     ebp
00C65FF2  |.  5B            pop     ebx
00C65FF3  |.  64:890D 00000>mov     dword ptr fs:[0], ecx
00C65FFA  |.  83C4 54       add     esp, 54
00C65FFD  |.  C3            retn
00C65FFE  |>  8D4C24 18     lea     ecx, dword ptr [esp+18]
00C66002  |.  C64424 60 03  mov     byte ptr [esp+60], 3
00C66007  |.  E8 A1720100   call    00C7D2AD
00C6600C  |.  8D4C24 1C     lea     ecx, dword ptr [esp+1C]
00C66010  |.  C64424 60 00  mov     byte ptr [esp+60], 0
00C66015  |.  E8 93720100   call    00C7D2AD
00C6601A  |.  BE 01000000   mov     esi, 1
00C6601F  \.^ EB B7         jmp     short 00C65FD8


第三轮
00C66274  |> /8B4C24 18     /mov     ecx, dword ptr [esp+18]
00C66278  |. |33F6          |xor     esi, esi
00C6627A  |. |51            |push    ecx
00C6627B  |. |8D4C24 18     |lea     ecx, dword ptr [esp+18]
00C6627F  |. |33FF          |xor     edi, edi
00C66281  |. |E8 95700100   |call    00C7D31B
00C66286  |. |8B5424 14     |mov     edx, dword ptr [esp+14]
00C6628A  |. |C64424 68 08  |mov     byte ptr [esp+68], 8
00C6628F  |. |8B6A F8       |mov     ebp, dword ptr [edx-8]
00C66292  |. |4D            |dec     ebp
00C66293  |. |85ED          |test    ebp, ebp
00C66295  |. |7C 79         |jl      short 00C66310
00C66297  |> |8D4424 40     |/lea     eax, dword ptr [esp+40]
00C6629B  |. |8D4C24 20     ||lea     ecx, dword ptr [esp+20]
00C6629F  |. |50            ||push    eax
00C662A0  |. |E8 76700100   ||call    00C7D31B
00C662A5  |. |6A 01         ||push    1
00C662A7  |. |8D4C24 30     ||lea     ecx, dword ptr [esp+30]
00C662AB  |. |55            ||push    ebp
00C662AC  |. |51            ||push    ecx
00C662AD  |. |8D4C24 20     ||lea     ecx, dword ptr [esp+20]
00C662B1  |. |C64424 74 09  ||mov     byte ptr [esp+74], 9
00C662B6  |. |E8 E1200100   ||call    00C7839C
00C662BB  |. |8B00          ||mov     eax, dword ptr [eax]
00C662BD  |. |8D4C24 20     ||lea     ecx, dword ptr [esp+20]
00C662C1  |. |50            ||push    eax
00C662C2  |. |C64424 6C 0A  ||mov     byte ptr [esp+6C], 0A
00C662C7  |. |E8 5A220100   ||call    00C78526
00C662CC  |. |8D4C24 2C     ||lea     ecx, dword ptr [esp+2C]
00C662D0  |. |8BD8          ||mov     ebx, eax
00C662D2  |. |C64424 68 09  ||mov     byte ptr [esp+68], 9
00C662D7  |. |E8 D16F0100   ||call    00C7D2AD
00C662DC  |. |8BC3          ||mov     eax, ebx
00C662DE  |. |B9 1E000000   ||mov     ecx, 1E
00C662E3  |. |99            ||cdq
00C662E4  |. |F7F9          ||idiv    ecx
00C662E6  |. |6A 00         ||push    0
00C662E8  |. |51            ||push    ecx
00C662E9  |. |57            ||push    edi
00C662EA  |. |56            ||push    esi
00C662EB  |. |8BDA          ||mov     ebx, edx
00C662ED  |. |E8 9E810000   ||call    00C6E490
00C662F2  |. |8BC8          ||mov     ecx, eax
00C662F4  |. |8BC3          ||mov     eax, ebx
00C662F6  |. |8BFA          ||mov     edi, edx
00C662F8  |. |C64424 68 08  ||mov     byte ptr [esp+68], 8
00C662FD  |. |99            ||cdq
00C662FE  |. |03C8          ||add     ecx, eax
00C66300  |. |8BF1          ||mov     esi, ecx
00C66302  |. |8D4C24 20     ||lea     ecx, dword ptr [esp+20]
00C66306  |. |13FA          ||adc     edi, edx
00C66308  |. |E8 A06F0100   ||call    00C7D2AD
00C6630D  |. |4D            ||dec     ebp
00C6630E  |.^|79 87         |\jns     short 00C66297
00C66310  |> |8D4C24 14     |lea     ecx, dword ptr [esp+14]         ;  计算出序列号的数值SN
00C66314  |. |C64424 68 04  |mov     byte ptr [esp+68], 4
00C66319  |. |E8 8F6F0100   |call    00C7D2AD
00C6631E  |. |B9 08000000   |mov     ecx, 8
00C66323  |. |8BC6          |mov     eax, esi
00C66325  |. |8BD7          |mov     edx, edi
00C66327  |. |E8 44810000   |call    00C6E470                        ；计算出x, 开始第三轮检测
 ; 以下循环为检测是否有 ((((x / V3[i] ) ^ 234fdf ) / 0fffa ) ^ 1F8a ) & 0xFF ==V1满足
00C6632C  |. |8BF2          |mov     esi, edx
00C6632E  |. |8B5424 10     |mov     edx, dword ptr [esp+10]
00C66332  |. |8BC8          |mov     ecx, eax
00C66334  |. |8B02          |mov     eax, dword ptr [edx]
00C66336  |. |99            |cdq
00C66337  |. |52            |push    edx
00C66338  |. |50            |push    eax
00C66339  |. |56            |push    esi
00C6633A  |. |51            |push    ecx
00C6633B  |. |E8 10820000   |call    00C6E550                        ;  64 位除法
00C66340  |. |83F2 00       |xor     edx, 0
00C66343  |. |6A 00         |push    0
00C66345  |. |35 DF4F2300   |xor     eax, 234FDF
00C6634A  |. |68 FAFF0000   |push    0FFFA
00C6634F  |. |52            |push    edx
00C66350  |. |50            |push    eax
00C66351  |. |E8 FA810000   |call    00C6E550                        ;  64位除法
00C66356  |. |8BC8          |mov     ecx, eax
00C66358  |. |A1 5C60C900   |mov     eax, dword ptr [C9605C]         ;  V1
00C6635D  |. |83F2 00       |xor     edx, 0
00C66360  |. |81F1 8A1F0000 |xor     ecx, 1F8A
00C66366  |. |895424 38     |mov     dword ptr [esp+38], edx
00C6636A  |. |81E1 FF000000 |and     ecx, 0FF
00C66370  |. |99            |cdq
00C66371  |. |33F6          |xor     esi, esi
00C66373  |. |3BC8          |cmp     ecx, eax
00C66375  |. |75 04         |jnz     short 00C6637B
00C66377  |. |3BF2          |cmp     esi, edx
00C66379  |. |74 66         |je      short 00C663E1                 ；成功
00C6637B  |> |8B4424 24     |mov     eax, dword ptr [esp+24]
00C6637F  |. |8B5424 10     |mov     edx, dword ptr [esp+10]
00C66383  |. |8B0D 7860C900 |mov     ecx, dword ptr [C96078]
00C66389  |. |40            |inc     eax
00C6638A  |. |83C2 04       |add     edx, 4
00C6638D  |. |3BC1          |cmp     eax, ecx
00C6638F  |. |894424 24     |mov     dword ptr [esp+24], eax
00C66393  |. |895424 10     |mov     dword ptr [esp+10], edx
00C66397  |.^\0F8C D7FEFFFF \jl      00C66274
00C6639D  |>  8D4C24 18     lea     ecx, dword ptr [esp+18]
00C663A1  |.  C64424 68 03  mov     byte ptr [esp+68], 3
00C663A6  |.  E8 026F0100   call    00C7D2AD
00C663AB  |.  C64424 68 00  mov     byte ptr [esp+68], 0
00C663B0  |.  8D4C24 1C     lea     ecx, dword ptr [esp+1C]
00C663B4  |>  E8 F46E0100   call    00C7D2AD
00C663B9  |>  33F6          xor     esi, esi
00C663BB  |>  8D4C24 3C     lea     ecx, dword ptr [esp+3C]
00C663BF  |.  C74424 68 FFF>mov     dword ptr [esp+68], -1
00C663C7  |.  E8 84220000   call    00C68650
00C663CC  |.  8B4C24 60     mov     ecx, dword ptr [esp+60]
00C663D0  |.  8BC6          mov     eax, esi
00C663D2  |.  5F            pop     edi
00C663D3  |.  5E            pop     esi
00C663D4  |.  5D            pop     ebp
00C663D5  |.  5B            pop     ebx
00C663D6  |.  64:890D 00000>mov     dword ptr fs:[0], ecx
00C663DD  |.  83C4 5C       add     esp, 5C
00C663E0  |.  C3            retn
00C663E1  |>  8D4C24 18     lea     ecx, dword ptr [esp+18]
00C663E5  |.  C64424 68 03  mov     byte ptr [esp+68], 3
00C663EA  |.  E8 BE6E0100   call    00C7D2AD
00C663EF  |.  8D4C24 1C     lea     ecx, dword ptr [esp+1C]
00C663F3  |.  C64424 68 00  mov     byte ptr [esp+68], 0
00C663F8  |.  E8 B06E0100   call    00C7D2AD
00C663FD  |.  BE 01000000   mov     esi, 1
00C66402  \.^ EB B7         jmp     short 00C663BB
```

##### 结论
1. 注册码需要满足的条件有3个

```
   x % V3[i] == 0;
   ((x / V3[i] ) ^ 234fdf ) % 0fffa == V2 
   ((((x / V3[i] ) ^ 234fdf ) / 0fffa ) ^ 1F8a ) & 0xFF ==V1
   做注册机时可以先求出 (x / V3[i] ) ^ 234fdf ) ;
   然后求出x;
  
   SN = x * 256 + (0xFF - (sum(x的各个字节) % 0xFF)   
   char* g_dir = "3456789ABCDEFGHJKLMNPQRSTUVWXY";
   while(SN > 0)
   {
  printf("%c", g_dir[SN % 30]);
  SN /= 30;

   }
   printf("%c", '\n');
  ```
    结果即为一个有效的序列号

2. 如果把保存注册信息的ini文件删除，程序自动变为未注册，并且重新计算试用时间。 