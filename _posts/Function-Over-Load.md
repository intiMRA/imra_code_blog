---
title: 'Method Oveverload In Subclasses Swift'
excerpt: 'Recently I encountered a bug working on a new feature, it turned out to do with a method that was being overloaded from a superclass with default arguments. In this article, I will be sharing what I learned and provide some ideas on how to prevent this issue.'
coverImage: '${basePath}/assets/blog/function-overload/cover.png'
date: '2024-01-10T01:00:00Z'
author:
  name: Inti Albuquerque
  picture: '${basePath}/assets/blog/authors/inti.jpg'
ogImage:
  url: '${basePath}/assets/blog/function-overload/cover.png'
---

Recently I encountered a bug working on a new feature, it turned out to do with a method that was being overloaded from a superclass with default arguments. In this article, I will be sharing what I learned and provide some ideas on how to prevent this issue. You can find the code [here](https://github.com/intiMRA/Function-Overload-Swift/blob/main/Contents.swift). Let's get into it!

## The Problem

When calling a specific method, we were getting an unexpected outcome. It turned out it was because we added a default parameter to a method that was being overloaded, the fix was simple but it took a long time to find out what was happening. Now after doing some investigation, it became even more clear why inheritance needs to be used with extreme care to prevent unknown behaviour in your code. When overloading methods with default arguments, Here is what I learned:

1. The method with the smallest number of parameters will be prioritised.
2. The methods in the superclass will be prioritised
3. Inheritance and default arguments are a double-edged sword

## Deep Dive

### Overloading

For those who do not know, method overloading is when a class has two or more methods with the same name but different parameters:

```swift
class Dog {
    let name: String
    
    init(name: String) {
        self.name = name
    }
    
    func eat() {
        print("A Dog named \(name) eats food everyday")
    }
    
    func eat(food: String = "dog food") {
        print("A Dog named \(name) eats \(food) everyday")
    }
}
let dog = Dog(name: "Rex")
dog.eat()
```

In the example above we have two methods called ```eat```. And if we call the ```eat``` method without a parameter it will print 'A Dog named Rex eats food every day', this might be what you expect, but it is still somewhat confusing.

### Subclassing

Now consider the following examples, what do you think it will print?

```swift
class Dog {
    let name: String
    
    init(name: String) {
        self.name = name
    }
    func eat() {
        print("A Dog named \(name) eats food everyday")
    }
}

class GoldenRetriever: Dog {
    func eat(food: String = "dog food") {
        print("A GoldenRetriever named \(name) eats \(food) everyday")
    }
let dog = Dog(name: "Rex")
dog.eat()
let retriever = GoldenRetriever(name: "Max")
retriever.eat()
}
```

In this example we have a protocol a class, 'Dog' and another class, 'GoldenRetriever', that is a subclass of 'Dog'. We have overloading methods here with default arguments, a recipe for ambiguity!

Chances are you are confused about what it will output, don't worry I did too. This is what we get:

1. A Dog named Rex eats food every day
2. A Dog named Max eats food every day

Both call the ```func eat()``` on 'Dog' class, which might be unexpected for the 'GoldenRetriever' object since the only method in the class is ```func eat(food: String = "dog food")```. It seems like the method with the least parameters are prioritised. Now what happens if we add the food parameter?

```swift
let dog = Dog(name: "Rex")
dog.eat()
let retriever = GoldenRetriever(name: "Max")
retriever.eat(food: "watermelon")
```

1. A Dog named Rex eats food every day
2. A GoldenRetriever named Max eats watermelon every day

Number one is calling the ```func eat()``` on the 'Dog' class, and now number two is calling ```func eat(food: String = "dog food")``` on the 'GoldenRetriever' class. Having a required parameter makes it more obvious what method will be called, especially if we are overriding an overloaded method like so:

```swift
class Dog {
    let name: String
    
    init(name: String) {
        self.name = name
    }
    
    func eat() {
        print("A Dog named \(name) eats food everyday")
    }
    
    func eat(food: String = "dog food") {
        print("A Dog named \(name) eats \(food) everyday")
    }
}

class GoldenRetriever: Dog {
    override func eat(food: String = "dog food") {
        print("A GoldenRetriever named \(name) eats \(food) everyday")
    }
}

let dog = Dog(name: "Rex")
dog.eat()
let retriever = GoldenRetriever(name: "Max")
retriever.eat()
```

This again will print 'A Dog named Rex/Max eats food every day' for both of these calls, so a better idea would be to remove the default parameter at least in the sub class.

```swift
class GoldenRetriever: Dog {
    override func eat(food: String) {
        print("A GoldenRetriever named \(name) eats \(food) everyday")
    }
```

Now it is less ambiguous what method is being called because the argument is required.

## DisfavoredOverload

One way to control what method gets prioritised, it's to use '@_disfavoredOverload' like so:

```swift
class Dog {
    let name: String
    
    init(name: String) {
        self.name = name
    }
    @_disfavoredOverload
    func eat() {
        print("A Dog named \(name) eats food everyday")
    }
}

class GoldenRetriever: Dog {
    func eat(food: String = "dog food") {
        print("A GoldenRetriever named \(name) eats \(food) everyday")
    }
}

let dog = Dog(name: "Rex")
dog.eat()
let retriever = GoldenRetriever(name: "Max")
retriever.eat()
```

Note that the ```func eat(food: String = "dog food")``` is now removed because the compiler now complains that this is ambiguous code when calling 'eat' without any arguments. This is because both eat methods that do not use '_disfavoredOverload' have the same number of parameters therefore we do not have a proper hierarchy to follow.

The code above will output:

1. A Dog named Rex eats food every day
2. A GoldenRetriever named Max eats dog food every day

Number one calls ```func eat()``` on the 'Dog' class since it is the only eat method in that class. However, number two calls ```func eat(food: String = "dog food")``` in the GoldenRetriever class because it is now the 'favoured overload' method.

## Take Aways

What I learned is that method overload + default parameters + inheritance is a recipe for ambiguity. If you overload methods, you should make at most one method with default arguments, all other methods should require parameters to be passed in so we can avoid ambiguity. Another takeaway is that when overriding a method from a superclass, it is best to not use default parameters to assure that the caller knows that they are calling the correct method and not another method in the superclass. Lastly, if you must use method overload, using @_disfavoredOverload could be useful to control method priority.

Hopefully, you enjoyed the reading! and again the code used in this article can be found [here](https://github.com/intiMRA/Function-Overload-Swift/blob/main/Contents.swift).
