---
title: 'Draggable Views In SwiftUI'
excerpt: 'This blog is a simple explanation on how to implement drag-n-drop in your swiftUI app!'
coverImage: '${basePath}/assets/blog/dynamic-routing/gif.gif'
date: '2020-03-16T05:35:07.322Z'
author:
  name: Inti Albuquerque
  picture: '${basePath}/assets/blog/authors/gif.gif'
ogImage:
  url: '${basePath}/assets/blog/dynamic-routing/gif.gif'
---

Recently, while working on a feature that involved rearranging views through drag-and-drop on the screen, I developed a solution that I'd like to share in this article. I'll walk you through the creation of a reusable draggable element for SwiftUI. Let's dive in!
The code for this post can be found on my [github](https://github.com/intiMRA/Draggable-Element-SwiftUI/tree/main/DragNDrop).
Simple View
Let's envision creating an app where users can arrange fruits on the screen in their preferred order. For this example, let's consider using grapes, oranges, and pears as the fruits to be organized.