---
title: 'SwiftUI Navigation'
excerpt: 'Recently I was playing around with navigation in SwiftUI, and came up with a way to navigate between screens using the iOS 16 stack navigation feature. I found it interesting and decided to share.'
coverImage: '${basePath}/assets/blog/swiftUI-navigation/cover.png'
date: '2024-01-10T01:00:00Z'
author:
  name: Inti Albuquerque
  picture: '${basePath}/assets/blog/authors/inti.jpg'
ogImage:
  url: '${basePath}/assets/blog/swiftUI-navigation/cover.png'
---

Recently I was playing around with navigation in SwiftUI, and came up with a way to navigate between screens using the iOS 16 stack navigation feature. I found it interesting and decided to share, you can find the code [here](https://github.com/intiMRA/SwiftUINavigation/tree/main/Navigation). Let's set sail!

## The Problem

While stack navigation in SwiftUI is awesome, it is easy to use it in a chaotic way. here is that I mean:
Imagine you have to navigate to a View that requires a viewModel, you could implement the navigation in this way:

```swift
@Observable class NextViewModel {
    var text: String
}

struct NextView: View {
    @State var viewModel: NextViewModel
    ...
}
```

```swift
struct ContentView: View {
    @State var stack = NavigationPath()
    var body: some View {
        NavigationStack(path: $stack) {
            Button("Go to next view") {
                stack.append("nextView")
            }
            .navigationDestination(for: String.self) { destination in
                if destination == "nextView" {
                    NextView(viewModel: NextViewModel(text: "some text"))
                }
            }
        }
    }
}
```

This works, but it seems like a recipe for chaos where you would have to check all these string manually and make sure all cases are covered. It also makes it difficult to reuse this navigation for other views, one would have to duplicate the ```navigationDestination``` basically everywhere we need to use it potentially leading to unexpected behaviour once we have a deeper view hierarchy. My solution is to:
  
1. Wrap the NavigationStack into a Router
2. use enums to represent the views
3. have a centralised place to handle the navigation

## Deep Dive

### Router

The first step I took was to create a router. This is just an observable object that wraps the navigation stack and has a few helper functions. I also made a protocol to facilitate the usage of the helper functions:

```swift
protocol NavigationDestination: Equatable, Hashable { }

@Observable class Router {
   
    var stack = NavigationPath()
    
    func navigate(to destination: any NavigationDestination) {
        stack.append(destination)
    }
    
    func pop() {
        stack.removeLast()
    }
    
    func popToRoot() {
        stack.removeLast(stack.count - 1)
    }
}
```

After I created an enum to represent the Views that can be pushed on to the stack:

```swift
enum Destination: NavigationDestination {
    case firstView(FirstViewModel)
    case secondView(SecondViewModel)
}
```

At the beginning I had the ```navigate to destination``` function take in a ```Destination```, however this would require all navigation destinations to be part of the same enum, making it hard to distinguish between different navigation flows, so I went with the ```NavigationDestination``` protocol instead. Having the navigation destinations represented in this way makes it easier create the views later on without having to check for string constants.

### Centralising View Creation

The next idea I had was to extract the ```navigationDestination``` function and put it in a centralised place where it can be easily reused if we have different entry points for a View. This can be achieved by creating an extension of the View class like so:

```swift
    func navigator(router: Router) -> some View {
        self
            .navigationDestination(for: Destination.self) { destination in
                switch destination {
                case .firstView(let viewModel):
                    FirstView(viewModel: viewModel)
                        .environment(router)
                case .secondView(let viewModel):
                    SecondView(viewModel: viewModel)
                        .environment(router)
                }
            }
    }
```

This way we do not need to repeat this same code whenever we require to navigate to these views form another entry point. Note that this function takes in a router as a parameter, this is so we can pass we can enable navigation for the sub views.

### Putting It To Use

For simplicity I created a two views called FirstView and Second view that are mostly identical for this example, I will also cut down on the code a little to make the article more concise you can always check the entire code on my GitHub. both these views have a view model that takes in a text and each view also has its own color so we can distinguish which view is which. The Content View can navigate to any of these two views, and the two views can navigate between each other.

```swift
struct ContentView: View {
    @State var router = Router()
    var body: some View {
        NavigationStack(path: $router.stack) {
            VStack {
                Button("Navigate to FristView") {
                    router.navigate(to: Destination.firstView(.init(text: "first view from content view")))
                }
                
                Button("Navigate to SecondView") {
                    router.navigate(to: Destination.secondView(.init(text: "second view from content view")))
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(.black)
            .navigator(router: router)
        }
    }
}
```

```swift
struct FirstView: View {
    @Environment(Router.self) var router
    @State var viewModel: FirstViewModel
    var body: some View {
            VStack {
                Text(viewModel.text)
                    .bold()
                
                Button("Navigate to SecondView") {
                    router.navigate(to: Destination.secondView(.init(text: "second view from first view")))
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(.pink)
    }
}

@Observable class FirstViewModel: Equatable, Hashable {
    static func == (lhs: FirstViewModel, rhs: FirstViewModel) -> Bool {
        lhs.text == rhs.text
    }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(text)
    }
    
    var text: String
    init(text: String) {
        self.text = text
    }
}
```

The second View is essentially the same. We have ```@Environment(Router.self) var router```, this is being injected from the ```navigator``` function so we can push more views into the stack. Another thing to note in that we do not need to add the ```navigator``` to the second View because it is in the hierarchy from the ContentView. Here is how it looks like:

![Fig 1](/imra_code_blog/assets/blog/swiftUI-navigation/recording-1.gif)

### Extending Functionality

These changes make it really easy to add another route that we can navigate to like so:

we add a new enum to represent the new destinations

```swift
enum SecondaryDestination: NavigationDestination {
    case thirdView(ThirdViewModel)
    case forthView(ForthViewModel)
}
```

We add another View extension for the view creation

```swift
func secondaryNavigator(router: Router) -> some View {
    self
        .navigationDestination(for: SecondaryDestination.self) { destination in
            switch destination {
            case .thirdView(let viewModel):
                ThirdView(viewModel: viewModel)
                    .environment(router)
            case .forthView(let viewModel):
                ForthView(viewModel: viewModel)
                    .environment(router)
            }
        }
}
```

and now we can update our first and second View to use it:

```swift
struct FirstView: View {
    @Environment(Router.self) var router
    @State var viewModel: FirstViewModel
    var body: some View {
            VStack {
                Text(viewModel.text)
                    .bold()
                
                Button("Navigate to SecondView") {
                    router.navigate(to: PrimaryDestination.secondView(.init(text: "second view from first view")))
                }
                Button("Navigate to Third") {
                    router.navigate(to: SecondaryDestination.thirdView(.init(text: "third view from first view")))
                }
                Button("Navigate to Forth") {
                    router.navigate(to: SecondaryDestination.forthView(.init(text: "forth view from first view")))
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(.pink)
            .secondaryNavigator(router: router)
    }
}
```

And this is how it looks like:

![Fig 2](/imra_code_blog/assets/blog/swiftUI-navigation/recording-2.gif)

## Take Aways

SwiftUI stack navigation improved the way to navigate between views a lot better! If we make the way we navigate in between views implicit we can elevate it even further, this way we can avoid unwanted behaviour and enforce well structured and understandable code.
Hopefully you enjoyed the reading! and again the code used in this article can be found [here](https://github.com/intiMRA/SwiftUINavigation/tree/main/Navigation).