---
title: 'Memory Leaks'
excerpt: 'An important but often overlooked skill for a good iOS Developer is to be able to spot and fix memory leaks to ensure applications behave as expected. Memory leaks happen when an object is not properly deallocated from memory and persists in memory after it is not required anymore, memory leaks can cause crashes or slow down applications, hence the importance of fixing them.'
coverImage: '${basePath}/assets/blog/memory-leaks/cover.png'
date: '2024-06-25T01:00:00Z'
author:
  name: Inti Albuquerque
  picture: '${basePath}/assets/blog/authors/inti.jpg'
ogImage:
  url: '${basePath}/assets/blog/memory-leaks/cover.png'
---

An important but often overlooked skill for a good iOS Developer is to be able to spot and fix memory leaks to ensure applications behave as expected. Memory leaks happen when an object is not properly deallocated from memory and persists in memory after it is not required anymore, memory leaks can cause crashes or slow down applications, hence the importance of fixing them.

## How To Avoid Leaks

The way Swift decides to deallocate an object is based on a counter "telling" the ARC how many other objects have a reference to the object that should be deallocated. When that counter reaches zero, the  ARC then deallocates that memory space. Memory leaks happen when there is a "false" count for an object. This can happen if an object obj1 holds another object obj2 and obj2 also holds obj1 for example, this will cause a circular dependency hence not allowing the count of either object to get to zero causing a memory leak. To prevent that we need to tell the ARC not to count one of those links. 2 keywords can be used for that in swift ```weak``` and ```unowned```, both of these words tell the ARC something like "do not care about this link, feel free to yeet this object". The difference between the two is that ```weak``` will check if the reference to that object is nil and not crash your app if the object has been deallocated whereas ```unowned``` does not check if it is nil and therefore will crash your app if the object has been deallocated. My recommendation would be to use ```weak``` unless your app needs to be extremely time-sensitive (you are saving one nil check).

example:

``` swift
class OBJ {
    var name: String = ""
}
var obj: OBJ? = OBJ()
unowned var obj1 = obj
weak var obj2 = obj

obj?.name = "john"

print(obj?.name)
print(obj1?.name)
print(obj2?.name)

obj = nil

print(obj?.name)
print(obj2?.name)
print(obj1?.name)
```

This will crash on the last ```print``` after ```obj = nil``` because the object is already deallocated and is unowned, but the first and second prints will not crash.

## Debugging A Memory Leak Using the Memory Graph

### What Is The Memory Graph

Some tools allow you to find and debug a memory leak in Xcode. My favourite too for that is the memory graph, it can be found in the debug toolbar when running your app in Xcode.  ![Fig 1](/imra_code_blog/assets/blog/memory-leaks/memory-debug.png)

This will open a graph of your app's memory, where you can see the objects that your app created and is using. on the left side, you will see where the object belongs to and on the right you can see the links between objects.

![Fig 2](/imra_code_blog/assets/blog/memory-leaks/memory-graph.png)

### Solving A Memory Leak

For this article, I have made a simple (and useless) app found [here](https://github.com/intiMRA/Leaks-App/tree/main/leaksApp). This app allows users to select a name, by navigating to different screens, I know, not super exciting!
This app creates a memory leak when navigating between screens like this:
![Fig 3](/imra_code_blog/assets/blog/memory-leaks/create-leak.gif)

if we open our memory graph after navigating between screens we will see this:
![Fig 4](/imra_code_blog/assets/blog/memory-leaks/memory-leak-graph-example.png)

We can see that we have 2 of each viewModels although we would expect both of them to be deallocated. To find out what is going on we can look at the left side of the graph and see what is retaining each of the view models and we can see this:
![Fig 5](/imra_code_blog/assets/blog/memory-leaks/circular-dependency.png)

The bold line indicates a ```strong``` link between the dependencies and here we can see that arrows are pointing both ways meaning we have a circular dependency, eg. one object holding another object that holds the first object. To solve this, we need to look at the places where these links are created and rationalize if they should be ```strong``` or ```weak``` links. In other words, should this link prevent the objects from being deallocated.

For this example we have this code:

```swift
@Observable
class MainViewModel {
    var name: String?
    var childViewModel: ProfileViewModel?
    
    init(name: String? = nil) {
        self.name = name
    }
    func update(name: String) {
        self.name = name
    }
    
    func createViewModel() {
        self.childViewModel = .init(name: name, updateName: {
            self.update(name: self.childViewModel?.name ?? "")
        })
    }
}

@Observable
class ProfileViewModel {
    let updateName: () -> Void
    let names = ["peter", "john", "bob"]
    var name: String?
    
    init(name: String?, updateName: @escaping () -> Void) {
        self.name = name
        self.updateName = updateName
    }
}
```

Looking at the code you can see that we have 2 links ``` var childViewModel: ProfileViewModel?``` and the ```updateName``` closure, which captures ```self```(MainViewModel). Now we need to decide which link should be weakened so we can get rid of this circular dependency.
Here we cannot weaken the ``` var childViewModel: ProfileViewModel?``` link because that will cause the ```childViewModel``` to be deallocated straight away because this is the only place where this object is referenced, which leaves us with the ```updateName``` closure. To solve the cycle we can do this:

```swift
    func createViewModel() {
        self.childViewModel = .init(name: name, updateName: { [weak self] in
            self?.update(name: self?.childViewModel?.name ?? "")
        })
    }
```

Now if we do the safe flow as in the GIF above, we should not get any memory leaks and these two objects should not be present in the memory graph anymore!
![Fig 6](/imra_code_blog/assets/blog/memory-leaks/solved-leak.png)

The larger your application gets, the harder it will be to find and eliminate the sources of memory leaks. However, the concept stays the same but with more variables to take into account, for example, the circular dependency could include 5 objects that are linked together strongly where they shouldn't be.

## Takeaways

Dealing with memory leaks can be tricky, nevertheless, it is a skill that every good iOS engineer should have in their arsenal. There are many ways that memory leaks can be caused but at its core, a memory leak is just a link between objects that should not be taken into account by the ARC and can be solved by observing the links between objects and rationalizing which ones should prevent deallocation and which ones should not.
