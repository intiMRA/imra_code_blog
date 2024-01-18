---
title: 'Function Oveverload In Class Extensions Swift'
excerpt: 'Recently I encountered a bug working on a new feature, it turned out to do with a function that was being overloaded form a super class with preset arguments. In this article I will be sharing what I learned and provide some ideas on how to prevent this issue.'
coverImage: '${basePath}/assets/blog/function-overload/cover.png'
date: '2024-01-10T01:00:00Z'
author:
  name: Inti Albuquerque
  picture: '${basePath}/assets/blog/authors/inti.jpg'
ogImage:
  url: '${basePath}/assets/blog/function-overload/cover.png'
---

Recently I encountered a bug working on a new feature, it turned out to do with a function that was being overloaded form a super class with default arguments. In this article I will be sharing what I learned and provide some ideas on how to prevent this issue. You can find the code [here](https://github.com/intiMRA/Function-Overload-Swift/blob/main/Contents.swift). Let's get into it!

## The Problem

When calling a specific function, we were getting an unexpected outcome. It turned out it was because we added a default parameter to a function that was being overloaded, the fix was simple but it took a long time to find out what was happening. Now after doing some investigation, it became even more clear why inheritance needs to be used with extreme care to prevent unknown behaviour in your code. When overloading functions with default arguments, Here is what I learned:

* The function with the smallest number of parameters will be prioritised.
* The functions in the super class will be prioritised
* Inheritance and default arguments are a double edged sword

## Deep Dive

To show what I learned I will provide some code examples: 

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
```

In this example we have a protocol a class, 'Dog' and another class, 'GoldenRetriever', that extends 'Dog'. We have lots of overloading functions here with default arguments, a recipe for ambiguity an disasters!
Have a think what the output of the following code is going to be:

```swift
let dog = Dog(name: "Rex")
dog.eat()
let retriever = GoldenRetriever(name: "Max")
retriever.eat()
```

Chances are you are confused on what it will output, don't worry I did to. This is what we get:

1. A Dog named Rex eats food everyday
2. A Dog named Max eats food everyday

Both call the ```func eat()``` on 'Dog' class, which might be unexpected for the 'GoldenRetriever' object since the only function in the class is ```override func eat(food: String = "dog food")```. I seems like the function with the least parameters are prioritised. Now what happens if we add the food parameter?

```swift
let dog = Dog(name: "Rex")
dog.eat(food: "corn")
let retriever = GoldenRetriever(name: "Max")
retriever.eat(food: "watermelon")
```

1. A Dog named Rex eats corn everyday
2. A GoldenRetriever named Max eats watermelon everyday

Number one is calling the ```func eat(food: String = "dog food")``` on the 'Dog' class, and now number two in calling ```func eat(food: String = "dog food")``` on the 'GoldenRetriever' class.

## DisfavoredOverload

One way to control what function gets prioritised, it's to use '@_disfavoredOverload' like so:

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

Note that the ```func eat(food: String = "dog food")``` is now removed because the compiler now complains that this is ambiguous code when calling 'eat' without any arguments. This is because both eat functions that are not disfavoredOverloaded both have the same number of parameters therefore we do not have a proper hierarchy to follow.

The code above will output:

1. A Dog named Rex eats corn everyday
2. A GoldenRetriever named Max eats dog food everyday

Number one calls ```func eat()``` on the 'Dog' class since it is the only eat function in that class. However, number two calls ```func eat(food: String = "dog food")``` in the GoldenRetriever class because it is now the favored overload function.

## Take Aways

What I learned is that that function overload + default parameters + inheritance is a recipe for disaster. If you overload functions, you should make at most one function with default arguments, all other functions should require parameters to be passed in so we can avoid ambiguity. Another take away is that when overriding a function from a superclass, it is best to not use default parameters to assure that the caller knows that they are calling the correct function and not another function in the super class. Lastly if you must use function overload, using @_disfavoredOverload could be useful to control function priority.

Hopefully you enjoyed the reading! and again the code used in this article can be found [here](https://github.com/intiMRA/Function-Overload-Swift/blob/main/Contents.swift).