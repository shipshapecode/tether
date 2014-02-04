Repositioning
-----

Tethers will be automatically repositioned when the page is resized, and when any element containing the Tether is scrolled.
If the element moves for some other reason (e.g. with javascript), Tether won't know to reposition the element.

#### Manually Repositioning

The simplest way to reposition every Tether on the page is to call `Tether.position()`.  It will efficiently reposition every
Tether in a single repaint, making it more efficient than manually repositioning many Tethers individually.

```javascript
Tether.position()
```

#### Repositioning a Single Tether

If you have many Tethers on screen, it may be more efficient to just reposition the tether that needs it.  You can do this
by calling the `.position` method on the Tether instance:

```javascript
tether = new Tether({ ... })

// Later:
tether.position()
```
