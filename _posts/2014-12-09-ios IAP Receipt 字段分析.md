---
layout : post
title : "iOS IAP Receipt 字段分析"
category: "iOS开发"
tags: [ios, iap, receipt]
summary: "objc.io上也有一篇文章Receipt Validation介绍了如何进行recipt本地验证。但提供的例子中没有获取iap的字段的代码。对于不熟悉asn语法的同学，分析这块信息也是个不小的挑战。"
---

### ios IAP Receipt 字段分析
从iOS 7开始，ios提供了本地iap信息验证功能。wwdc上也提供了代码例子片段。
[**objc.io**](http://www.objc.io/)上也有一篇文章[Receipt Validation](http://www.objc.io/issue-17/receipt-validation.html)介绍了如何进行recipt本地验证。但提供的例子中没有获取iap的字段的代码。
对于不熟悉asn语法的同学，分析这块信息也是个不小的挑战。

下面是我根据文章中的代码写的获取iap字段的代码。

```
……
case 5:
                    // Computed GUID (SHA-1 Hash)
                    hashData = [[NSData alloc] initWithBytes:(const void *)ptr length:length];
                    break;
//IAP 字段分析开始
//iap字段内痛的字段类型为17                    
                case 17:
                {
                    const unsigned char *ptr1 = ptr;
                    const unsigned char *end1 = ptr1 + length;
                    const unsigned char *str_ptr1;
                    int type1 = 0, str_type1 = 0;
                    int xclass1 = 0, str_xclass1 = 0;
                    long length1 = 0, str_length1 = 0;
                    ASN1_get_object(&ptr1, &length1, &type1, &xclass1, end - ptr);
                    //iap信息是一组字段，根字段是set类型
                    if (type1 != V_ASN1_SET) {
                        break;
                    }
                    while (ptr1 < end1) {
                        ASN1_INTEGER *integer1;
                        
                        // Parse the attribute sequence (a SEQUENCE is expected)
                        ASN1_get_object(&ptr1, &length1, &type1, &xclass1, end1 - ptr1);
                        if (type1 != V_ASN1_SEQUENCE) {
                            // Validation fails
                        }
                        
                        const unsigned char *seq_end1 = ptr1 + length1;
                        long attr_type1 = 0;
                        long attr_version1 = 0;
                        
                        // Parse the attribute type (an INTEGER is expected)
                        ASN1_get_object(&ptr1, &length1, &type1, &xclass1, end1 - ptr1);
                        if (type1 != V_ASN1_INTEGER) {
                            // Validation fails
                        }
                        integer1 = c2i_ASN1_INTEGER(NULL, &ptr1, length1);
                        attr_type1 = ASN1_INTEGER_get(integer1);
                        ASN1_INTEGER_free(integer1);
                        
                        // Parse the attribute version (an INTEGER is expected)
                        ASN1_get_object(&ptr1, &length1, &type1, &xclass1, end1 - ptr1);
                        if (type1 != V_ASN1_INTEGER) {
                            // Validation fails
                        }
                        integer1 = c2i_ASN1_INTEGER(NULL, &ptr1, length1);
                        attr_version1 = ASN1_INTEGER_get(integer1);
                        ASN1_INTEGER_free(integer1);
                        
                        // Check the attribute value (an OCTET STRING is expected)
                        ASN1_get_object(&ptr1, &length1, &type1, &xclass1, end1 - ptr1);
                        if (type1 != V_ASN1_OCTET_STRING) {
                            // Validation fails
                        }
                        
                        switch (attr_type1) {
                            case 1701: //购买的产品数量
                                str_ptr1 = ptr1;
                                ASN1_get_object(&str_ptr1, &str_length1, &str_type1, &str_xclass1, seq_end1 - str_ptr1);
                                if (str_type1 == V_ASN1_INTEGER) {
                                    // We store the decoded string for later
                                    productQuantry = 0;
                                    for(int i=0; i<str_length1; i++){
                                        productQuantry = (productQuantry << 8) + *(unsigned char*)(str_ptr1 + i);
                                    }
                                    
                                }
                                break;
                            case 1702: //购买的产品名称
                                str_ptr1 = ptr1;
                                ASN1_get_object(&str_ptr1, &str_length1, &str_type1, &str_xclass1, seq_end1 - str_ptr1);
                                if (str_type1 == V_ASN1_UTF8STRING) {
                                    // We store the decoded string for later
                                    productIdentifier = [[NSString alloc] initWithBytes:str_ptr1 length:str_length1 encoding:NSUTF8StringEncoding];
                                }
                                break;
                                
                            case 1704: //产品购买时间
                                str_ptr1 = ptr1;
                                ASN1_get_object(&str_ptr1, &str_length1, &str_type1, &str_xclass1, seq_end1 - str_ptr1);
                                if (str_type1 == V_ASN1_IA5STRING) {
                                    // The date is stored as a string that needs to be parsed
                                    NSString *dateString = [[NSString alloc] initWithBytes:str_ptr1 length:str_length1 encoding:NSASCIIStringEncoding];
                                    purchaseDate = [formatter dateFromString:dateString];
                                }
                                break;
                            case 1706: //最初的购买时间
                                str_ptr1 = ptr1;
                                ASN1_get_object(&str_ptr1, &str_length1, &str_type1, &str_xclass1, seq_end1 - str_ptr1);
                                if (str_type1 == V_ASN1_IA5STRING) {
                                    // The date is stored as a string that needs to be parsed
                                    NSString *dateString = [[NSString alloc] initWithBytes:str_ptr1 length:str_length1 encoding:NSASCIIStringEncoding];
                                    originalPurchaseDate = [formatter dateFromString:dateString];
                                }
                                break;
                            //处理其他字段
                            ……
                            default:
                                
                                break;
                        }
                        
                        
                        ptr1 += length1;
                    }
                }
                    break;
//IAP 字段分析完毕
                case 21:
                ……
```
参考文章:
[Receipt Validation](http://www.objc.io/issue-17/receipt-validation.html)
