## Tether

[![GitHub
version](https://badge.fury.io/gh/HubSpot%2Ftether.svg)](http://badge.fury.io/gh/HubSpot%2Ftether)

Tether is a JavaScript library for efficiently making an absolutely positioned element stay next to another element on the page.

It aims to be the canonical implementation of this type of positioning, such that you can build products, not positioning libraries.

Take a look at the documentation for a more detailed explanation of why you should star it now to remember it for your next project.

## What to Use Tether for and When to Use It 
Tether is a full-blown functional library for JavaScript, allowing you to connect elements with other elements. This may sound simple at first, but let us consider the complexity of linking several elements together in a dynamic way. Although absolutely positioning elements is sometimes reasonable, the more flexible an application becomes, the more limiting this method will be.

> Without the use of Tether, adding an element and linking it with another one that has already been positioned at the center of the screen, basically requires us to continuously relocate and reposition the element when scrolling up and down the website. 

Almost every application contains at least one element that overlaps others and that needs to be added to the website. The functional Tether library can be applied in a variety of ways. It can, for instance, be used in the following scenarios:

### Dropdown
Tether allows you to create professional and customizable [drop-down lists](http://github.hubspot.com/select/docs/welcome/) with ease. 

### Tooltips
Tether is perfectly well suited to display messages within your application as short text notes [like tooltips](http://github.hubspot.com/tooltip/docs/welcome/).  

### Infoboxes
Several elements, like [hover-activated popups, lists, etc.](http://github.hubspot.com/drop/docs/welcome/), can be implemented and put into effect with the help of our outstanding application.

### Advantages of using Tether
Tether includes a couple of useful features and advantages that can be easily and completely integrated into your existing projects:

* Optimized GPU-acceleration for realignments of up to 60fps
* Reliable positioning of all corners, edges, or in between different points
* Elements which are falsely placed off-screen, will be repositioned and correctly displayed by Tether
* Tether has been specifically designed and optimized to connect with other libraries


### Restrictions
Please consider that not all browser functions may be supported when using Tether with Internet Explorer 8. If your application is expected to guarantee the complete functionality of Internet Explorer 8, we must unfortunately discourage the use of Tether.

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
