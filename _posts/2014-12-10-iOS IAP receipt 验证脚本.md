---
layout : post
title : "iOS IAP receipt 验证脚本"
category: "iOS开发"
tags: [ios, iap, receipt, shell, curl]
summary: "一个iap reciept脚本验证工具。完全借助操作系统自带的工具。"
---

以前写的一个iap reciept脚本验证工具。完全借助操作系统自带的工具。

```
#!/bin/sh
#echo $#
#把一个App App Store的IPA返回的recipt的二进制格式文件发往服务器验证
if [ $# -eq 0 ]  
then
   echo "need a file as argment" 
   exit 1
else
   if [ -f $1 ] ; then
       base64Str=`base64 $1`
       param=`printf {\"receipt-data\":\"%s\"} ${base64Str}`
       echo "base64编码格式内容"
       echo ${param}

       echo "================ 发往生产服务器验证 ========================="
       curl -d ${param} "https://buy.itunes.apple.com/verifyReceipt"
       echo ""
       echo "================ 发往测试服务器验证 ========================="
       curl -d ${param} "https://sandbox.itunes.apple.com/verifyReceipt"
       echo "================ 状态码解释 ================================"
       echo "status     0 : Success."
       echo "status 21000 : The App Store could not read the JSON object you provided."
       echo "status 21002 : The data in the receipt-data property was malformed."
       echo "status 21003 : The receipt could not be authenticated."
       echo "status 21004 : status The shared secret you provided does not match the shared secret on file for your account."
       echo "status 21005 : The receipt server is not currently available."
       echo "status 21006 : This receipt is valid but the subscription has expired. When this status code is returned to your server, the receipt data is also decoded and returned as part of the response."
       echo "status 21007 : This receipt is a sandbox receipt, but it was sent to the production service for verification."
       echo "status 21008 : This receipt is a production receipt, but it was sent to the sandbox service for verification."
    else
        echo "文件$1不存在"
    fi 
fi

```


[下载脚本文件](https://raw.githubusercontent.com/eriklu/eriklu.github.io/master/resources/iap_receipt_valid.sh)
[下载iap receipt文件例子](https://raw.githubusercontent.com/eriklu/eriklu.github.io/master/resources/iap_receipt_example.dat)
