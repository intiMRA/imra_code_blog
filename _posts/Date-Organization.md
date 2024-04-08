---
title: 'Date Organization In Swift'
excerpt: 'Throughout my time developing Mobile applications for iOS, I have come across a problem with dates several times. They were all over the place! In this article I will talk about a way that I found very helpful to solve this issue.'
coverImage: '${basePath}/assets/blog/function-overload/cover.png'
date: '2024-01-10T01:00:00Z'
author:
  name: Inti Albuquerque
  picture: '${basePath}/assets/blog/authors/inti.jpg'
ogImage:
  url: '${basePath}/assets/blog/function-overload/cover.png'
---

Throughout my time developing Mobile applications for iOS, I have come across a problem with dates several times. They were all over the place! In this article I will talk about a way that I found very helpful to solve this issue. The code for this article can be found [here](https://github.com/intiMRA/DateHelper).

## The Problem

Often when developing Mobile applications, we do not think of future use cases for the component or feature that we are developing. I found that this is especially true when it comes to dates, they are all over the place! Often in the formats similar to this: "yyyy mm dd HH MM". This can be quite messy, hard to read and when someone needs to use the same logic, they en up copying it. Would it not be nice to have a centralized place where date formats can live and we can call upon methods without having to go to stack overflow and to remind our selves how tho extract the number of days from a date? Fear not in this article I will give you the solution!

## Deep Dive

### Date Formats

For the purpose of simplicity I will use some less complex date formats that are more easily understood. One being "dd-mm-yyyy" and the other being "dd mm yyyy", note that the "yyyy" is lower cased if uppercased it will have a potentially [unwanted effect](https://stackoverflow.com/questions/15133549/difference-between-yyyy-and-yyyy-in-nsdateformatter#:~:text=yyyy%20specifies%20the%20calendar%20year,should%20use%20the%20calendar%20year). 

``` swift
    enum DateFormats: String {
        case ddMmYyyySpaced = "dd mm yyyy"
        case ddMmYyyyDashed = "dd-mm-yyyy"
        private static let formatter = DateFormatter()
        
        static func format(date: Date, with format: DateFormats) -> String {
            formatter.dateFormat = format.rawValue
            return formatter.string(from: date)
        }
        
        static func date(from string: String, with format: DateFormats) -> Date? {
            formatter.dateFormat = format.rawValue
            return formatter.date(from: string)
        }
    }
```

Here we have put the formats into an enum with clear labels so people in the future can use the formats with ease rather than spelling the date format each time.

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
