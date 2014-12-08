---
layout : post
title : "IOS7、IOS8 autoLayout的一个区别"
category: "逆向工程"
tags: [ios, autolayout]
summary: "加载view并执行自动布局时IOS7和IOS8机制是有差别的。在IOS7上，**viewDidLoad**执行时，自动布局应该已经执行完毕。 在IOS 8上， **viewDidLoad**执行时，自动布局尚未完成， **viewWillAppear**执行时，自动布局才完成。这是界面开始显示。"
---

### IOS7、IOS8 autoLayout的一个区别
最近学习**autolayout**。根视图有一个子视图。当一个点击事件发生时，子视图从屏幕底部移动到顶部。在**storyboard**里面设计子视图约束时，没办法设置顶部约束常量为一个屏幕高度。所以该在**viewDidLoad**里面来设置。代码如下：

``` object-c
- (void)viewDidLoad {
    ……
    NSLayoutConstraint *myConstaint = nil;
    NSArray *constaints = [self.view constraints];
    for(NSLayoutConstraint *constaint in constaints){
        if(constaint.firstItem==self.viewW && constaint.secondItem==self.view && constaint.firstAttribute == NSLayoutAttributeTop){
            myConstaint = constaint;
            break;
        }
    }
    
    //代码1
    myConstaint.constant = screen_height;
    
}
```

在IOS 7上代码运行正常。但是在IOS 8上，执行到代码1处，**myConstaint**的值为**nil**。不论**viewW**是否处于hidden状态。

在IOS8上，把上面代码放在**viewWillAppear**.执行到代码1处，**myConstaint**的值**不**为**nil**。

看来在加载view并执行自动布局时IOS7和IOS8机制是有差别的。在IOS7上，**viewDidLoad**执行时，自动布局应该已经执行完毕。 在IOS 8上， **viewDidLoad**执行时，自动布局尚未完成， **viewWillAppear**执行时，自动布局才完成。这是界面开始显示。