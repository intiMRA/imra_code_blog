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

    func eat(food: String = "corn", kgs: Int = 1) {
        self.eat(food: food, kgs: kgs)
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

In this example we have a protocol, 'Animal', a class, 'Dog', that implements that protocol and another class, 'GoldenRetriever', that extends 'Dog'. We have lots of overloading functions here with default arguments, a recipe for ambiguity an disasters!
Have a think what the output of the following code is going to be:

```swift
let animal: Animal = Dog(name: "Sasha")
animal.eat()
let dog = Dog(name: "Rex")
dog.eat()
let retriever = GoldenRetriever(name: "Max")
retriever.eat()
```

Chances are you are confused on what it will output, don't worry I did to. This is what we get:

1. Sasha eats corn everyday
2. Rex eats dog food everyday
3. Max eats dog food everyday

Number one is calling the function on the extension of the 'Animal' protocol which then calls the ```func eat(food: String = "dog food")``` on the 'Dog' Class with the food argument being 'corn'. Hence the output 'Sasha eats corn everyday'.
Number two and three print both call the ```func eat(food: String = "dog food")``` on 'Dog' class, which might be unexpected for the 'GoldenRetriever' object since the only function in the class is ```override func eat(food: String = "dog food", kgs: Double = 1.1)```. I seems like the function with the least parameters are prioritised. Now what happens if we add the kgs parameter?

```swift
let animal: Animal = Dog(name: "Sasha")
animal.eat(kgs: 1)
let dog = Dog(name: "Rex")
dog.eat(kgs: 2)
let retriever = GoldenRetriever(name: "Max")
retriever.eat(kgs: 3)
```

1. Sasha eats 1 kgs of corn everyday
2. Rex eats 2 kgs of dog food everyday
3. Max eats 3 kgs of dog food everyday

Number one is the same scenario as the example above. Number two is again calling the ```func eat(food: String = "dog food", kgs: Int = 1)``` on the 'Dog' class, here the compiler is inferring the type to be an int so it calls the int function. Lastly we can try to use one more variation of the function using doubles:

```swift
let dog = Dog(name: "Rex")
dog.eat(kgs: 2.1)
let retriever = GoldenRetriever(name: "Max")
retriever.eat(kgs: 3.1)
```

1. Rex eats precisely 2.1 kgs of dog food everyday
2. A golden retriever named Max eats precisely 3.1 kgs of dog food everyday

Finally we get what we expect! the 'Dog' calls the function in the 'Dog' class and the 'GoldenRetriever' calls the function in 'GoldenRetriever' class.

## DisfavoredOverload

One way to control what function gets prioritised, it's to use '@_disfavoredOverload' like so:

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
    
    func eat(food: String = "corn", kgs: Int = 1) {
        self.eat(food: food, kgs: kgs)
    }
}

class Dog: Animal {
    let name: String
    
    init(name: String) {
        self.name = name
    }

    func eat(food: String = "dog food", kgs: Int = 1) {
        print("\(name) eats \(kgs) kgs of \(food) everyday")
    }
    
    @_disfavoredOverload
    func eat(food: String = "dog food") {
        print("\(name) eats \(food) everyday")
    }
}

class GoldenRetriever: Dog {
    override func eat(food: String = "dog food", kgs: Int = 1) {
        print("A golden retriever named \(name) eats \(kgs) kgs of \(food) everyday")
    }
}
let animal: Animal = Dog(name: "Sasha")
animal.eat()
let dog = Dog(name: "Rex")
dog.eat()
let retriever = GoldenRetriever(name: "Max")
retriever.eat()
```

Note that the ```func eat(food: String = "dog food", kgs: Double = 1.1)``` is now removed because the compiler now complains that this is ambiguous code when calling 'eat' without any arguments. This is because both eat functions that are not disfavoredOverloaded both have the same number of parameters therefore we do not have a proper hierarchy to follow.

The code above will output:

1. Sasha eats corn everyday
2. Rex eats 1 kgs of dog food everyday
3. A golden retriever named Max eats 1 kgs of dog food everyday

Number one calls the extension in the protocol, which then calls the eat function with one argument in the 'Dog' class. Number two and three now call ```func eat(food: String = "dog food", kgs: Int = 1)``` on their respective classes. This can come in quite handy in some scenarios, however I would not recommend using it often as it allows for ambiguous code.

## Take Aways

What I learned is that that function overload + default parameters + inheritance is a recipe for disaster. If you overload functions, you should make at most one function with default arguments, all other functions should require parameters to be passed in so we can avoid ambiguity. Another take away is that when overriding a function from a superclass, it is best to not use default parameters to assure that the caller knows that they are calling the correct function and not another function in the super class. Lastly if you must use function overload, using @_disfavoredOverload could be useful to control function priority.

Hopefully you enjoyed the reading! and again the code used in this article can be found [here](https://github.com/intiMRA/Function-Overload-Swift/blob/main/Contents.swift).
