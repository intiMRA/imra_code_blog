---
title: 'Simplifying View Logic Using Enums'
excerpt: 'When Programming views in SwiftUI, we often need to deal with states dependent on many variables, when that happens the logic in the view quickly becomes messy and not as readable. In this article, we will explore how to make that logic lighter and more readable using enums to represent these states.'
coverImage: '${basePath}/assets/blog/implicit-view-logic-using-enums/cover.png'
date: '2024-06-25T01:00:00Z'
author:
  name: Inti Albuquerque
  picture: '${basePath}/assets/blog/authors/inti.jpg'
ogImage:
  url: '${basePath}/assets/blog/implicit-view-logic-using-enums/cover.png'
---

When Programming views in SwiftUI, we often need to deal with states dependent on many variables, when that happens the logic in the view quickly becomes messy and not as readable. In this article, we will explore how to make that logic lighter and more readable using enums to represent these states.
The code for this article can be found [here](https://github.com/intiMRA/Simplifying-View-Logic-Using-Enums).

## The Problem

If statements are great, but we have all seen some bad usage of them where it quickly becomes unreadable and requires you to thoroughly study the code to understand what is going on. Here is an example:

```Swift
if viewModel.colorsModel.shouldShowColorOne, viewModel.colorsModel.shouldShowColorTwo {
    if viewModel.colorsModel.mix {
        Text("mix")
        rectangle
            .foregroundStyle(viewModel.colorsModel.color1.mix(with: viewModel.colorsModel.color2, by: 0.5))
    }
    else {
        HStack {
            VStack {
                Text("color1")
                rectangle
                    .foregroundStyle(viewModel.colorsModel.color1)
            }
            
            VStack {
                Text("color2")
                rectangle
                    .foregroundStyle(viewModel.colorsModel.color2)
            }
        }
    }
}
else if viewModel.colorsModel.shouldShowColorOne {
    VStack {
        Text("color1")
        rectangle
            .foregroundStyle(viewModel.colorsModel.color1)
    }
}
else if viewModel.colorsModel.shouldShowColorTwo {
    VStack {
        Text("color2")
        rectangle
            .foregroundStyle(viewModel.colorsModel.color1)
    }
}
```

Here is what the app looks like:
![Fig 1](/imra_code_blog/assets/blog/implicit-view-logic-using-enums/basic.gif)

So what is going on here? We have three booleans that we have to keep track of ```viewModel.colorsModel.shouldShowColorOne, viewModel.colorsModel.shouldShowColorTwo and viewModel.colorsModel.mix```. We can see that ```viewModel.colorsModel.mix``` is dependent on the other two values. We can also see that the ```shouldShowColor``` values can each allow the view to show something as well as having a different outcome when they are both together. This logic is not very implicit and it is difficult to know what is going on here. This is where enums can come for the rescue.

## Using Enums

Enums are great for representing states, they are implicit and have well-defined values. For these examples, we can explore 4 different distinct states: ```showBothColors, showMixedColors, showColor and emptyState```, each of these will have values associated with them. Now our view can consume these states instead of relying on the boolean values directly:

```Swift
switch viewModel.viewState {
case .showBothColors(let color1, let color2):
    HStack {
        VStack {
            Text("color1")
            rectangle
                .foregroundStyle(color1)
        }
        
        VStack {
            Text("color2")
            rectangle
                .foregroundStyle(color2)
        }
    }
case .showMixedColors(let color1, let color2):
    VStack {
        Text("mix")
        rectangle
            .foregroundStyle(color1.mix(with: color2, by: 0.5))
    }
case .showColor(let color, let title):
    VStack {
        Text(title)
        rectangle
            .foregroundStyle(color)
    }
case .emptyState:
    Text("Please select your colors")
}
```

And this is what our viewModel looks like:

```Swift
@Observable
class ContentViewModel {
    private var colorsModel = ColorsModel(mix: false, color1: nil, color2: nil)
    
    var viewState: ViewStates = .emptyState
    
    func updateState() {
        if let color1 = colorsModel.color1, let color2 = colorsModel.color2 {
            if colorsModel.mix {
                viewState = .showMixedColors(color1: color1, color2: color2)
            }
            else {
                viewState = .showBothColors(color1: color1, color2: color2)
            }
        }
        else if let color1 = colorsModel.color1 {
            viewState = .showColor(color: color1, title: "Color 1")
        }
        else if let color2 = colorsModel.color2 {
            viewState = .showColor(color: color2, title: "Color 2")
        }
        else {
            viewState = .emptyState
        }
    }
    
    func didTapButtonOne(with color: Color?) {
        colorsModel.color1 = color
        updateState()
    }
    
    func didTapButtonTwo(with color: Color?) {
        colorsModel.color2 = color
        updateState()
    }
    
    func mixedBinding() -> Binding<Bool> {
        .init {
            self.colorsModel.mix
        } set: { newValue in
            if newValue != self.colorsModel.mix {
                self.colorsModel.mix = newValue
                self.updateState()
            }
        }

    }
}
```

This gives us two things:

1. We can now see what is going on in the view much easier because of the distinct and human readable states
2. We can unit test the display logic, given that it is now in the view model

## Take Away

Whenever dealing with specific states, enums can be an ideal tool to represent these. Using enums instead of booleans for View display can make the logic easier to read and potentially make that code unit testable, finally, we can keep the entire logic for the display in one place instead of having it split across view and view model, which allows for easier updates to the code.

Hope you guys had fun reading this, and as always the code can be found [here](https://github.com/intiMRA/Simplifying-View-Logic-Using-Enums).
