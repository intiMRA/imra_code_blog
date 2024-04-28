---
title: 'Date Organization In Swift'
excerpt: 'If you are using DateFormatter and have inconsistent date formats throughout your app, than you would that dates can be a little bit of a pain in iOS. Throughout my time developing Mobile applications for iOS, I have come across several problems with dates several times. They were all over the place! In this article I will talk about a way that I found very helpful to solve the dates inconsistency issue.'
coverImage: '${basePath}/assets/blog/date-organization/cover.jpeg'
date: '2024-01-10T01:00:00Z'
author:
  name: Inti Albuquerque
  picture: '${basePath}/assets/blog/authors/inti.jpg'
ogImage:
  url: '${basePath}/assets/blog/date-organization/cover.jpeg'
---

If you are using DateFormatter and have inconsistent date formats throughout your app, than you would that dates can be a little bit of a pain in iOS. Throughout my time developing Mobile applications for iOS, I have come across several problems with dates several times. They were all over the place! In this article I will talk about a way that I found very helpful to solve the dates inconsistency issue. The code for this article can be found [here](https://github.com/intiMRA/DateHelper).

Note: This article is aimed at people that are using DateFormatter as their primary way of formatting Dates, whether being because of old date formats in databases, legacy code or any other reason. Otherwise I'd recommend using Data.FormatStyle like such:

``` swift
let date = Date()

date.formatted(date: .complete, time: .standard)
```

This will give you something like this ```Monday, 8 April 2024 at 8:17:29 AM```.
But if you are still using `DateFormatter`, it might be worth reading on!

## Organising date formats

Often when developing mobile applications, we do not think of future use cases for the component or feature that we are developing. I found that this is especially true when it comes to dates, they are all over the place!
we often use formats similar to this: "yyyy mm dd HH MM". This can be quite messy, hard to read and when someone needs to use the same logic, they end up copying it. Would it not be nice to have a centralized place where date formats can live and we can call upon methods without having to go to stack overflow and to remind our selves how tho extract the number of days from a date? Fear not in this article I will give you the solution!

For the purpose of simplicity I will use some less complex date formats that are more easily understood. One being "dd-MM-yyyy" and the other being "dd MM yyyy".

``` swift
enum DateFormats: String {
    case ddMmYyyySpaced = "dd MM yyyy"
    case ddMmYyyyDashed = "dd-MM-yyyy"
    private static let formatter = DateFormatter()
    
    func stringFormat(date: Date) -> String {
        DateFormats.formatter.dateFormat = self.rawValue
        return DateFormats.formatter.string(from: date)
    }
    
    func date(from string: String) -> Date? {
        DateFormats.formatter.dateFormat = self.rawValue
        return DateFormats.formatter.date(from: string)
    }
}
```

Here we have put the formats into an enum with clear labels so people in the future can use the formats with ease rather than spelling the date format each time.

### Side note

Note that the "yyyy" is  lowercased. The uppercased version will have a potentially [unwanted effect](https://stackoverflow.com/questions/15133549/difference-between-yyyy-and-yyyy-in-nsdateformatter#:~:text=yyyy%20specifies%20the%20calendar%20year,should%20use%20the%20calendar%20year). A similar thing happens if "MM" is lowercased.

## Date to string conversions

Now we need a way to use these date formats in our code without having to write too much boilerplate code.

``` swift
extension Date {    
    func asString(with format: DateFormats) -> String {
        format.stringFormat(date: self)
    }
}

extension String {
    func asDate(with format: DateFormats) -> Date? {
        format.date(from: self)
    }
}
```

We now have functions we can call on Date and String that will make date handling much much easier. We can use them like so:

``` swift
let dateString = "20-11-1996"
let date = dateString.asDate(with: .ddMmYyyyDashed)
let spacedDateString = date?.asString(with: .ddMmYyyySpaced)
```

The output loos like this:
20 11 1996

## Functions for date manipulations

There are a lot of date manipulation use cases that are used on iOS app, to keep it simple I'll show you three functions that are used pretty often in my experience when dealing with dates:

``` swift
extension Date {
    func addingDays(_ days: Int, calendar: Calendar = .current) -> Date? {
       calendar.date(byAdding: .day, value: days, to: self)
    }
    
    func isSameDay(as date: Date, calendar: Calendar = .current) -> Bool {
        return calendar.isDate(self, equalTo: date, toGranularity: .day)
    }
    
    func daysFrom(date: Date, calendar: Calendar = .current) -> Int? {
        if let days = calendar.dateComponents([.day], from: self, to: date).day {
            return days
        }
        return nil
    }
}
```

The ```addingDays(_ days: Int, calendar: Calendar = .current)``` function is pretty self explanatory, it advances the date by the given number of days.

```isSameDay(as date: Date, calendar: Calendar = .current)``` is also pretty straight forward, it will return true if the days are the same.
Finally ```daysFrom(date: Date, calendar: Calendar = .current)``` returns the difference in days from one date to another. These can be used like this:

``` swift
date?.addingDays(1)
date?.daysFrom(date: "21-11-1996".asDate(with: .ddMmYyyyDashed) ?? .now)
date?.isSameDay(as: "20-11-1996".asDate(with: .ddMmYyyyDashed) ?? .now)
```

This will give us:
21-11-1996, the original date advanced by a day.

1, the difference between 21 Nov to 20 Nov in days.

true, It is the same yea,  month and day therefore it returns true.

## Takeaways

Dealing with dates can be tricky, but if our code is well organized it is actually pretty straightforward. In this article I showed you one way of organizing your dates, there are several other ways it can be done too, that can reduce boiler plate and improve code readability.

I hope you enjoyed the reading and as always the code can be found [here on my GitHub](https://github.com/intiMRA/DateHelper).
