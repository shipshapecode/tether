## Tether

[![GitHub
version](https://badge.fury.io/gh/HubSpot%2Ftether.svg)](http://badge.fury.io/gh/HubSpot%2Ftether)

Tether is a JavaScript library for efficiently making an absolutely positioned element stay next to another element on the page.

It aims to be the canonical implementation of this type of positioning, such that you can build products, not positioning libraries.

Take a look at the documentation for a more detailed explanation of why you should star it now to remember it for your next project.

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

#Tether 


##What to Use Tether for and When to Use It

For those who might be new to JavaScript libraries, a library is simply a JavaScript file (or files) that contain useful JavaScript code to help achieve tasks easier and faster.  Since Tether is a JavaScript **UI** (User Interface) library it contains several pieces of useful code to help you to manage the way your website or web app appears.

Tether's goal to is to help you position your elements side-by-side when needed. 

###When to Use It

Let's say you've built yourself your dream project, that fancy web app that's sure to become the next big thing! 

An important feature of your new app is to allow users to comment on shared photos. However, due to limited vertical space and the overall layout of your new app, you'd like to display the comments **next** to the image, similar to Instagram's layout.

Your HTML code might look something like this:

```
<div class="container">
	...
	<img src="my_awesome_pic" alt="cool-pic" class="element"/>
	<div class="comment_box">
		...
		...
		...
	</div>
	...
</div>
```
Now, you could achieve this with some CSS using it's `position` property, but going this route can be a pain considering many of `position`'s values actually take elements **out** of their natural DOM flow, ie if you have an element at the bottom of your HTML document, using `position: absolute` or `position: fixed` might actually move it all the way to the top of your website in the browser.

Not only that, but you're left to make all the proper adjustments to make sure **other** elements aren't negatively affected also. Not to mention, you'll want your comment box to be **responsive**. Which coding manually is a challenge all on it's own.

###Here's how to properly position your elements with Tether:

After downloading or `cloning` the repo and including the `tether.js` (in `/src/`) in your HTML file:

1. In your JavaScript file, create a `new` instance of the `Tether` object (or constructor function for those a bit more advanced) :
```
new Tether({});
```

2. Within the `{}` (curly braces) enter your preferences. Tether's extensive list of options can be found here in the [Tether documentation] (http://github.hubspot.com/tether/)
```
new Tether({
	element: comment_box,
	target: my_awesome_pic,
	attachment: 'top right'
	targetAttachment: 'top left'
});
```

Now you have a perfectly placed comment section to go with your awesome pic! It'll even stay attached to the element when a user resizes their browser window.

There are tons of other useful features of Tether as well, instead of "comment boxes" you could also build:

* Tooltips for useful hints and tricks
* Dropdown menus
* Autocomplete popups for forms
* and other endless and creative possibilities 





## Contributing

We encourage contributions of all kinds. If you would like to contribute in some way, please review our [guidelines for contributing](CONTRIBUTING.md).


## License
Copyright &copy; 2014-2016 HubSpot - [MIT License](LICENSE)
