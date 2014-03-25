if not @Tether?
  throw new Error "You must include the utils.js file before tether.js"

Tether = @Tether

{getScrollParent, getSize, getOuterSize, getBounds, getOffsetParent, extend, addClass, removeClass, updateClasses, defer, flush, getScrollBarSize} = Tether.Utils

within = (a, b, diff=1) ->
  a + diff >= b >= a - diff

transformKey = do ->
  el = document.createElement 'div'

  for key in ['transform', 'webkitTransform', 'OTransform', 'MozTransform', 'msTransform']
    if el.style[key] isnt undefined
      return key

tethers = []

position = ->
  for tether in tethers
    tether.position(false)

  flush()

now = ->
  performance?.now?() ? +new Date

do ->
  lastCall = null
  lastDuration = null
  pendingTimeout = null

  tick = ->
    if lastDuration? and lastDuration > 16
      # We voluntarily throttle ourselves if we can't manage 60fps
      lastDuration = Math.min(lastDuration - 16, 250)

      # Just in case this is the last event, remember to position just once more
      pendingTimeout = setTimeout tick, 250
      return

    if lastCall? and (now() - lastCall) < 10
      # Some browsers call events a little too frequently, refuse to run more than is reasonable
      return

    if pendingTimeout?
      clearTimeout pendingTimeout
      pendingTimeout = null

    lastCall = now()

    position()

    lastDuration = now() - lastCall

  for event in ['resize', 'scroll', 'touchmove']
    window.addEventListener event, tick

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

    if @targetModifier is 'scroll-handle'
      @scrollParent = @target
    else
      @scrollParent = getScrollParent @target

    unless @options.enabled is false
      @enable(position)

  getTargetBounds: ->
    if @targetModifier?
      switch @targetModifier
        when 'visible'
          if @target is document.body
            {top: pageYOffset, left: pageXOffset, height: innerHeight, width: innerWidth}
          else
            bounds = getBounds @target

            out =
              height: bounds.height
              width: bounds.width
              top: bounds.top
              left: bounds.left

            out.height = Math.min(out.height, bounds.height - (pageYOffset - bounds.top))
            out.height = Math.min(out.height, bounds.height - ((bounds.top + bounds.height) - (pageYOffset + innerHeight)))
            out.height = Math.min(innerHeight, out.height)
            out.height -= 2

            out.width = Math.min(out.width, bounds.width - (pageXOffset - bounds.left))
            out.width = Math.min(out.width, bounds.width - ((bounds.left + bounds.width) - (pageXOffset + innerWidth)))
            out.width = Math.min(innerWidth, out.width)
            out.width -= 2

            if out.top < pageYOffset
              out.top = pageYOffset
            if out.left < pageXOffset
              out.left = pageXOffset

            out

        when 'scroll-handle'
          target = @target
          if target is document.body
            target = document.documentElement

            bounds =
              left: pageXOffset
              top: pageYOffset
              height: innerHeight
              width: innerWidth
          else
            bounds = getBounds target

          style = getComputedStyle target

          hasBottomScroll = target.scrollWidth > target.clientWidth or 'scroll' is [style.overflow, style.overflowX] or @target isnt document.body

          scrollBottom = 0
          if hasBottomScroll
            scrollBottom = 15

          height = bounds.height - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth) - scrollBottom

          out =
            width: 15
            height: height * 0.975 * (height / target.scrollHeight)
            left: bounds.left + bounds.width - parseFloat(style.borderLeftWidth) - 15

          fitAdj = 0
          if height < 408 and @target is document.body
            fitAdj = -0.00011 * Math.pow(height, 2) - 0.00727 * height + 22.58

          if @target isnt document.body
            out.height = Math.max out.height, 24

          scrollPercentage = @target.scrollTop / (target.scrollHeight - height)
          out.top = scrollPercentage * (height - out.height - fitAdj) + bounds.top + parseFloat(style.borderTopWidth)

          if @target is document.body
            out.height = Math.max out.height, 24

          out
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

    if @scrollParent isnt document
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

    if @_addAttachClasses?.length
        # updateAttachClasses can be called more than once in a position call, so
        # we need to clean up after ourselves such that when the last defer gets
        # ran it doesn't add any extra classes from previous calls.
        @_addAttachClasses.splice 0, @_addAttachClasses.length

    add = @_addAttachClasses ?= []
    add.push "#{ @getClass('element-attached') }-#{ elementAttach.top }" if elementAttach.top
    add.push "#{ @getClass('element-attached') }-#{ elementAttach.left }" if elementAttach.left
    add.push "#{ @getClass('target-attached') }-#{ targetAttach.top }" if targetAttach.top
    add.push "#{ @getClass('target-attached') }-#{ targetAttach.left }" if targetAttach.left

    all = []
    all.push "#{ @getClass('element-attached') }-#{ side }" for side in sides
    all.push "#{ @getClass('target-attached') }-#{ side }" for side in sides

    defer =>
      return unless @_addAttachClasses?

      updateClasses @element, @_addAttachClasses, all
      updateClasses @target, @_addAttachClasses, all

      @_addAttachClasses = undefined

  position: (flushChanges=true) =>
    # flushChanges commits the changes immediately, leave true unless you are positioning multiple
    # tethers (in which case call Tether.Utils.flush yourself when you're done)

    return unless @enabled

    @clearCache()

    # Turn 'auto' attachments into the appropriate corner or edge
    targetAttachment = autoToFixedAttachment(@targetAttachment, @attachment)

    @updateAttachClasses @attachment, targetAttachment

    elementPos = @cache 'element-bounds', => getBounds @element
    {width, height} = elementPos

    if width is 0 and height is 0 and @lastSize?
      # We cache the height and width to make it possible to position elements that are
      # getting hidden.
      {width, height} = @lastSize
    else
      @lastSize = {width, height}

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
      ret = module.position.call(@, {left, top, targetAttachment, targetPos, @attachment, elementPos, offset, targetOffset, manualOffset, manualTargetOffset, scrollbarSize})

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
        left: left

      # It's position relative to the viewport (fixed positioning)
      viewport:
        top: top - pageYOffset
        bottom: pageYOffset - top - height + innerHeight
        left: left - pageXOffset
        right: pageXOffset - left - width + innerWidth
    }

    if document.body.scrollWidth > window.innerWidth
      scrollbarSize = @cache 'scrollbar-size', getScrollBarSize
      next.viewport.bottom -= scrollbarSize.height

    if document.body.scrollHeight > window.innerHeight
      scrollbarSize = @cache 'scrollbar-size', getScrollBarSize
      next.viewport.right -= scrollbarSize.width

    if document.body.style.position not in ['', 'static'] or document.body.parentElement.style.position not in ['', 'static']
      # Absolute positioning in the body will be relative to the page, not the 'initial containing block'
      next.page.bottom = document.body.scrollHeight - top - height
      next.page.right = document.body.scrollWidth - left - width

    if @options.optimizations?.moveElement isnt false and not @targetModifier?
      offsetParent = @cache 'target-offsetparent', => getOffsetParent @target
      offsetPosition = @cache 'target-offsetparent-bounds', -> getBounds offsetParent
      offsetParentStyle = getComputedStyle offsetParent
      elementStyle = getComputedStyle @element
      offsetParentSize = offsetPosition

      offsetBorder = {}
      for side in ['Top', 'Left', 'Bottom', 'Right']
        offsetBorder[side.toLowerCase()] = parseFloat offsetParentStyle["border#{ side }Width"]

      offsetPosition.right = document.body.scrollWidth - offsetPosition.left - offsetParentSize.width + offsetBorder.right
      offsetPosition.bottom = document.body.scrollHeight - offsetPosition.top - offsetParentSize.height + offsetBorder.bottom

      if next.page.top >= (offsetPosition.top + offsetBorder.top) and next.page.bottom >= offsetPosition.bottom
        if next.page.left >= (offsetPosition.left + offsetBorder.left) and next.page.right >= offsetPosition.right
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

    if flushChanges
      flush()

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

    transcribe = (same, pos) =>
      if @options.optimizations?.gpu isnt false
        if same.top
          css.top = 0
          yPos = pos.top
        else
          css.bottom = 0
          yPos = -pos.bottom

        if same.left
          css.left = 0
          xPos = pos.left
        else
          css.right = 0
          xPos = -pos.right


        css[transformKey] = "translateX(#{ Math.round xPos }px) translateY(#{ Math.round yPos }px)"

        if transformKey isnt 'msTransform'
          # The Z transform will keep this in the GPU (faster, and prevents artifacts),
          # but IE9 doesn't support 3d transforms and will choke.
          css[transformKey] += " translateZ(0)"

      else
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

    else if same.offset? and same.offset.top and same.offset.left
      css.position = 'absolute'

      offsetParent = @cache 'target-offsetparent', => getOffsetParent @target

      if getOffsetParent(@element) isnt offsetParent
        defer =>
          @element.parentNode.removeChild @element
          offsetParent.appendChild @element

      transcribe same.offset, position.offset

      moved = true

    else
      css.position = 'absolute'
      transcribe {top: true, left: true}, position.page

    if not moved and @element.parentNode.tagName isnt 'BODY'
      @element.parentNode.removeChild @element
      document.body.appendChild @element

    # Any css change will trigger a repaint, so let's avoid one if nothing changed
    writeCSS = {}
    write = false
    for key, val of css
      elVal = @element.style[key]

      if elVal isnt '' and val isnt '' and key in ['top', 'left', 'bottom', 'right']
        elVal = parseFloat elVal
        val = parseFloat val

      if elVal isnt val
        write = true
        writeCSS[key] = css[key]

    if write
      defer =>
        extend @element.style, writeCSS

Tether.position = position

@Tether = extend _Tether, Tether
