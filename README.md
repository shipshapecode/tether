## Tether

[![GitHub
version](https://badge.fury.io/gh/HubSpot%2Ftether.svg)](http://badge.fury.io/gh/HubSpot%2Ftether)

[Tether](http://github.hubspot.com/tether/) is a small, focused JavaScript library for defining and managing the position of user interface (UI) elements in relation to one another on a web page. It is a tool for web developers building features that require certain UI elements to be precisely positioned based on the location of another UI element.

There are often situations in UI development where elements need to be attached to other elements, but placing them right next to each other in the [DOM tree](https://en.wikipedia.org/wiki/Document_Object_Model) can be problematic based on the context. For example, what happens if the element we’re attaching other elements to is fixed to the center of the screen? Or what if the element is inside a scrollable container? How can we prevent the attached element from being clipped as it disappears from view while a user is scrolling? Tether can solve all of these problems and more.

Some common UI elements that have been built with Tether are [tooltips](http://github.hubspot.com/tooltip/docs/welcome), [select menus](http://github.hubspot.com/select/docs/welcome), [dropdown menus](http://github.hubspot.com/drop/docs/welcome), and [guided tours](http://github.hubspot.com/shepherd/docs/welcome). Tether is flexible and can be used to [solve](http://github.hubspot.com/tether/examples/out-of-bounds/) [all](http://github.hubspot.com/tether/examples/content-visible) [kinds](http://github.hubspot.com/tether/examples/element-scroll) [of](http://github.hubspot.com/tether/examples/enable-disable) [interesting]() [problems](http://github.hubspot.com/tether/examples/viewport); it ensures UI elements stay where they need to be, based on the various user interactions (click, scroll, etc) and layout contexts (fixed positioning, inside scrollable containers, etc).

Please have a look at the [documentation](http://github.hubspot.com/tether/) for a more detailed explanation of why you might need Tether for your next project.

## Install

__npm__
```sh
$ npm install tether
```

__bower__
```sh
$ bower install tether
```

## Usage

[![Tether Docs](http://i.imgur.com/YCx8cLr.png)](http://github.hubspot.com/tether/#usage)

[Demo & API Documentation](http://github.hubspot.com/tether/)


## Contributing

We encourage contributions of all kinds. If you would like to contribute in some way, please review our [guidelines for contributing](CONTRIBUTING.md).


## License
Copyright &copy; 2014-2016 HubSpot - [MIT License](LICENSE)
