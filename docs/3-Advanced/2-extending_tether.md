Extending Tether
-----

Tether has a module system which can be used to modify Tether's positioning, or just do something each time the Tether is moved.

Tether has an array called `Tether.modules`, push onto it to add a module:

```coffeescript
Tether.modules.push
  position: ({top, left}) ->
    top += 10

    {top, left}
```

Your position function can either return a new object with `top` and `left`, null/undefined to leave the coordinates unchanged, or
false to cancel the positioning.

The position function is passed an object with the following elements:

```javascript
{left, top, targetAttachment, targetPos, elementPos, offset, targetOffset, manualOffset, manualTargetOffset
```

It is called with the Tether instance as its context (`this`).

#### Initialize

Modules can also have an `initialize` function which will be called when a new tether is created.  The initialize function
is also called with the Tether instance as its context.

```coffeescript
Tether.modules.push
  initialize: ->
    console.log "New Tether Created!", @
```

#### Examples

Constraints and shift are both implemented as modules, in the coffee/ directory.
