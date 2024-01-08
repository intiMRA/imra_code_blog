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

Recently I encountered a bug working on a new feature, it turned out to do with a function that was being overloaded form a super class with default arguments. In this article I will be sharing what I learned and provide some ideas on how to prevent this issue. You can find the code [here](https://github.com/intiMRA/Function-Overload-Swift/blob/main/Contents.swift). Let's get into it!

## The Problem

When calling a specific function, we were getting an unexpected outcome. It turned out it was because we added a default parameter to a function that was being overloaded, the fix was simple but it took a long time to find out what was happening. Now after doing some investigation, it became even more clear why inheritance needs to be used with extreme care to prevent unknown behavior in your code. When overloading functions with default arguments, Here is what I learned:

* The function with the smallest number of parameters will be prioritised.
* The functions in the super class will be prioritized
* Inheritance and default arguments are a double edged sword

## Deep Dive

To show what I learned I will provide some code examples: 

```swift
protocol Animal {
    func eat(food: String, kgs: Int)
    func eat(food: String)
}
extension Animal {
    func eat(food: String = "corn") {
        self.eat(food: food)
    }
}

class Dog: Animal {
    let name: String
    
    init(name: String) {
        self.name = name
    }
    func eat(food: String = "dog food", kgs: Double = 1.1) {
        print("\(name) eats precisely \(kgs) kgs of \(food) everyday")
    }
    
    func eat(food: String = "dog food", kgs: Int = 1) {
        print("\(name) eats \(kgs) kgs of \(food) everyday")
    }
    
    func eat(food: String = "dog food") {
        print("\(name) eats \(food) everyday")
    }
}

class GoldenRetriever: Dog {
    override func eat(food: String = "dog food", kgs: Double = 1.1) {
        print("A golden retriever named \(name) eats precisely \(kgs) kgs of \(food) everyday")
    }
}
```