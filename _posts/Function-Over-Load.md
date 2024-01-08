---
title: 'Function Oveverload In Class Extensions Swift'
excerpt: 'Recently I encountered a bug working on a new feature, it turned out to do with a function that was being overloaded form a super class with preset arguments. In this article I will be sharing what I learned and provide some ideas on how to prevent this issue.'
coverImage: '${basePath}/assets/blog/function-overload/cover.png'
date: '2020-03-16T05:35:07.322Z'
author:
  name: Inti Albuquerque
  picture: '${basePath}/assets/blog/authors/gif.gif'
ogImage:
  url: '${basePath}/assets/blog/function-overload/cover.png'
---

Recently I encountered a bug working on a new feature, it turned out to do with a function that was being overloaded form a super class with preset arguments. In this article I will be sharing what I learned and provide some ideas on how to prevent this issue. You can find the code [here](https://github.com/intiMRA/Function-Overload-Swift/blob/main/Contents.swift). Let's get into it!

```swift
import Foundation

protocol Animal {
    func eat(food: String, kgs: Int)
    func eat(food: String)
}

extension Animal {
    func eat(food: String = "corn") {
        self.eat(food: food)
    }
}
```
