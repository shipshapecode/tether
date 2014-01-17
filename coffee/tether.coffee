if not Tether?
  throw new Error "You must include the utils.js file before tether.js"

{getScrollParent, getSize, getOuterSize, getBounds, getOffsetParent, extend, addClass, removeClass, updateClasses} = Tether.Utils

debounce = (fn, time=16) ->
  pending = false

  return ->
    return if pending

    args = arguments

    pending = true
    setTimeout =>
      pending = false
      fn.apply @, args
    , time

within = (a, b, diff=1) ->
  a + diff >= b >= a - diff

tethers = []

position = ->
  for tether in tethers
    tether.position()

lastCall = null
for event in ['resize', 'scroll']
  window.addEventListener event, ->
    if not lastCall? or (new Date - lastCall) > 16
      # IE likes to call events a little too frequently
      lastCall = +new Date
      
      position()

MIRROR_LR =
  center: 'center'
  left: 'right'
  right: 'left'

MIRROR_TB =
  middle: 'middle'
  top: 'bottom'
  bottom: 'top'

OFFSET_MAP =
  top: 0
  left: 0
  middle: '50%'
  center: '50%'
  bottom: '100%'
  right: '100%'

autoToFixedAttachment = (attachment, relativeToAttachment) ->
  {left, top} = attachment

  if left is 'auto'
    left = MIRROR_LR[relativeToAttachment.left]

  if top is 'auto'
    top = MIRROR_TB[relativeToAttachment.top]

  {left, top}

attachmentToOffset = (attachment) ->
  return {
    left: OFFSET_MAP[attachment.left] ? attachment.left
    top: OFFSET_MAP[attachment.top] ? attachment.top
  }

addOffset = (offsets...) ->
  out = {top: 0, left: 0}

  for {top, left} in offsets
    if typeof top is 'string'
      top = parseFloat(top, 10)
    if typeof left is 'string'
      left = parseFloat(left, 10)

    out.top += top
    out.left += left

  out

offsetToPx = (offset, size) ->
  if typeof offset.left is 'string' and offset.left.indexOf('%') isnt -1
    offset.left = parseFloat(offset.left, 10) / 100 * size.width
  if typeof offset.top is 'string' and offset.top.indexOf('%') isnt -1
    offset.top = parseFloat(offset.top, 10) / 100 * size.height

  offset

parseAttachment = parseOffset = (value) ->
  [top, left] = value.split(' ')

  {top, left}

class _Tether
  @modules: []

  constructor: (options) ->
    tethers.push @

    @history = []

    @setOptions options, false

    for module in Tether.modules
      module.initialize?.call(@)

    @position()

  getClass: (key) ->
    if @options.classes?[key]
      @options.classes[key]
    else if @options.classes?[key] isnt false
      if @options.classPrefix
        "#{ @options.classPrefix }-#{ key }"
      else
        key
    else
      ''

  setOptions: (@options, position=true) ->
    defaults =
      offset: '0 0'
      targetOffset: '0 0'
      targetAttachment: 'auto auto'
      classPrefix: 'tether'

    @options = extend defaults, @options
      
    {@element, @target, @targetModifier} = @options

    if @target is 'viewport'
      @target = document.body
      @targetModifier = 'visible'
    else if @target is 'scroll-handle'
      @target = document.body
      @targetModifier = 'scroll-handle'

    for key in ['element', 'target']
      if not @[key]?
        throw new Error "Tether Error: Both element and target must be defined"

      if @[key].jquery?
        @[key] = @[key][0]
      else if typeof @[key] is 'string'
        # This breaks viewport and scroll-handle attachment for the moment
        @[key] = document.querySelector @[key]

    addClass @element, @getClass 'element'
    addClass @target, @getClass 'target'

    if not @options.attachment
      throw new Error "Tether Error: You must provide an attachment"

    @targetAttachment = parseAttachment @options.targetAttachment
    @attachment = parseAttachment @options.attachment
    @offset = parseOffset @options.offset
    @targetOffset = parseOffset @options.targetOffset

    if @scrollParent?
      @disable()

    @scrollParent = getScrollParent @target

    unless @options.enabled is false
      @enable(position)

  getTargetBounds: ->
    if @targetModifier?
      switch @targetModifier
        when 'visible'
          {top: pageYOffset, left: pageXOffset, height: innerHeight, width: innerWidth}
        when 'scroll-handle'
          {
            top: pageYOffset + innerHeight * (pageYOffset / document.body.scrollHeight)
            left: innerWidth - 15
            height: innerHeight * 0.98 * (innerHeight / document.body.scrollHeight)
            width: 15
          }
    else
      getBounds @target

  clearCache: ->
    @_cache = {}

  cache: (k, getter) ->
    # More than one module will often need the same DOM info, so
    # we keep a cache which is cleared on each position call
    @_cache ?= {}

    if not @_cache[k]?
      @_cache[k] = getter.call(@)

    @_cache[k]

  enable: (position=true) ->
    addClass @target, @getClass 'enabled'
    addClass @element, @getClass 'enabled'
    @enabled = true

    @scrollParent.addEventListener 'scroll', @position

    if position
      @position()

  disable: ->
    removeClass @target, @getClass 'enabled'
    removeClass @element, @getClass 'enabled'
    @enabled = false

    if @scrollParent?
      @scrollParent.removeEventListener 'scroll', @position

  destroy: ->
    @disable()

    for tether, i in tethers
      if tether is @
        tethers.splice i, 1
        break

  updateAttachClasses: (elementAttach=@attachment, targetAttach=@targetAttachment) ->
    sides = ['left', 'top', 'bottom', 'right', 'middle', 'center']
  
    add = []
    add.push "#{ @getClass('element-attached') }-#{ elementAttach.top }" if elementAttach.top
    add.push "#{ @getClass('element-attached') }-#{ elementAttach.left }" if elementAttach.left
    add.push "#{ @getClass('target-attached') }-#{ targetAttach.top }" if targetAttach.top
    add.push "#{ @getClass('target-attached') }-#{ targetAttach.left }" if targetAttach.left

    all = []
    all.push "#{ @getClass('element-attached') }-#{ side }" for side in sides
    all.push "#{ @getClass('target-attached') }-#{ side }" for side in sides

    updateClasses @element, add, all
    updateClasses @target, add, all

  position: =>
    return unless @enabled

    @clearCache()

    # Turn 'auto' attachments into the appropriate corner or edge
    targetAttachment = autoToFixedAttachment(@targetAttachment, @attachment)

    @updateAttachClasses @attachment, targetAttachment

    elementPos = @cache 'element-bounds', => getBounds @element
    {width, height} = elementPos

    targetSize = targetPos = @cache 'target-bounds', => @getTargetBounds()

    # Get an actual px offset from the attachment
    offset = offsetToPx attachmentToOffset(@attachment), {width, height}
    targetOffset = offsetToPx attachmentToOffset(targetAttachment), targetSize

    manualOffset = offsetToPx(@offset, {width, height})
    manualTargetOffset = offsetToPx(@targetOffset, targetSize)

    # Add the manually provided offset
    offset = addOffset offset, manualOffset
    targetOffset = addOffset targetOffset, manualTargetOffset

    # It's now our goal to make (element position + offset) == (target position + target offset)
    left = targetPos.left + targetOffset.left - offset.left
    top = targetPos.top + targetOffset.top - offset.top

    for module in Tether.modules
      ret = module.position.call(@, {left, top, targetAttachment, targetPos, elementPos, offset, targetOffset, manualOffset, manualTargetOffset})

      if not ret? or typeof ret isnt 'object'
        continue
      else if ret is false
        return false
      else
        {top, left} = ret

    # We describe the position three different ways to give the optimizer
    # a chance to decide the best possible way to position the element
    # with the fewest repaints.
    next = {
      # It's position relative to the page (absolute positioning when
      # the element is a child of the body)
      page:
        top: top
        bottom: document.body.scrollHeight - top - height
        left: left
        right: document.body.scrollWidth - left - width

      # It's position relative to the viewport (fixed positioning)
      viewport:
        top: top - pageYOffset
        bottom: pageYOffset - top - height + innerHeight
        left: left - pageXOffset
        right: pageXOffset - left - width + innerWidth
    }

    if @options.optimizations?.moveElement isnt false and not @targetModifier?
      offsetParent = @cache 'target-offsetparent', => getOffsetParent @target
      offsetPosition = @cache 'target-offsetparent-bounds', -> getBounds offsetParent
      offsetParentStyle = getComputedStyle offsetParent
      elementStyle = getComputedStyle @element
      offsetParentSize = offsetPosition

      offsetBorder = {}
      for side in ['top', 'left', 'bottom', 'right']
        offsetBorder[side] = parseFloat offsetParentStyle["border-#{ side }-width"]

      offsetPosition.right = document.body.scrollWidth - offsetPosition.left - offsetParentSize.width + offsetBorder.right
      offsetPosition.bottom = document.body.scrollHeight - offsetPosition.top - offsetParentSize.height + offsetBorder.bottom

      if next.page.top + 0.5 >= (offsetPosition.top + offsetBorder.top) and next.page.bottom >= offsetPosition.bottom
        if next.page.left + 0.5 >= (offsetPosition.left + offsetBorder.left) and next.page.right >= offsetPosition.right
          # We're within the visible part of the target's scroll parent

          scrollTop = offsetParent.scrollTop
          scrollLeft = offsetParent.scrollLeft

          # It's position relative to the target's offset parent (absolute positioning when
          # the element is moved to be a child of the target's offset parent).
          next.offset =
            top: next.page.top - offsetPosition.top + scrollTop - offsetBorder.top
            left: next.page.left - offsetPosition.left + scrollLeft - offsetBorder.left

    # We could also travel up the DOM and try each containing context, rather than only
    # looking at the body, but we're gonna get diminishing returns.

    @move next

    @history.unshift next

    if @history.length > 3
      @history.pop()

    true

  move: (position) ->
    return if not @element.parentNode?

    same = {}

    for type of position
      same[type] = {}

      for key of position[type]
        found = false

        for point in @history
          unless within(point[type]?[key], position[type][key])
            found = true
            break

        if not found
          same[type][key] = true
     
    css = {top: '', left: '', right: '', bottom: ''}

    transcribe = (same, pos) ->
      if same.top
        css.top = "#{ pos.top }px"
      else
        css.bottom = "#{ pos.bottom }px"

      if same.left
        css.left = "#{ pos.left }px"
      else
        css.right = "#{ pos.right }px"

    moved = false
    if (same.page.top or same.page.bottom) and (same.page.left or same.page.right)
      css.position = 'absolute'
      transcribe same.page, position.page

    else if (same.viewport.top or same.viewport.bottom) and (same.viewport.left or same.viewport.right)
      css.position = 'fixed'
      transcribe same.viewport, position.viewport

    else if same.offset? and (same.offset.top or same.offset.bottom) and (same.offset.left or same.offset.right)
      css.position = 'absolute'

      offsetParent = @cache 'target-offsetparent', => getOffsetParent @target

      if getOffsetParent(@element) isnt offsetParent
        @element.parentNode.removeChild @element
        offsetParent.appendChild @element

      transcribe same.offset, position.offset

      moved = true
      
    else
      css.position = 'absolute'
      css.top = "#{ position.page.top }px"
      css.left = "#{ position.page.left }px"

    if not moved and @element.parentNode.tagName isnt 'BODY'
      @element.parentNode.removeChild @element
      document.body.appendChild @element

    # Any css change will trigger a repaint, so let's avoid one if nothing changed
    write = false
    for key, val of css
      if @element.style[key] isnt val
        write = true
        break

    if write
      extend @element.style, css

window.Tether = extend _Tether, Tether
