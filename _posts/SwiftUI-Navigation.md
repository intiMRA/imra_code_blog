---
title: 'SwiftUI Navigation'
excerpt: 'Recently I was playing around with navigation in SwiftUI, and came up with a way to navigate between screens using the iOS 16 stack navigation feature. I found it interesting and decided to share.'
coverImage: '${basePath}/assets/blog/swiftUI-navigation/cover.png'
date: '2024-01-10T01:00:00Z'
author:
  name: Inti Albuquerque
  picture: '${basePath}/assets/blog/swiftUI-navigation/cover.png'
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
  
- Wrap the NavigationStack into a Router
- use enums to represent the views
- have a centralised place to handle the navigation

## Deep Dive


## Take Aways

Hopefully you enjoyed the reading! and again the code used in this article can be found [here](https://github.com/intiMRA/Function-Overload-Swift/blob/main/Contents.swift).
