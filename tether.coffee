$ = jQuery

isIE = /msie [\w.]+/.test navigator.userAgent.toLowerCase()

# Extracted from jQuery UI Core (to remove dependency)
# https://github.com/jquery/jquery-ui/blob/24756a978a977d7abbef5e5bce403837a01d964f/ui/jquery.ui.core.js#L60
getScrollParent = ($el) ->
  position = $el.css('position')

  if position is 'fixed'
    return true

  scrollParent = undefined

  if position is 'absolute' or (isIE and position in ['static', 'relative'])
    scrollParent = $el.parents().filter(->
        $.css(@, 'position') in ['relative', 'absolute', 'fixed'] and /(auto|scroll)/.test($.css(@, 'overflow') + $.css(@, 'overflow-y') + $.css(@, 'overflow-x'))
    ).first()
  else
    scrollParent = $el.parents().filter(->
        /(auto|scroll)/.test($.css(@, 'overflow') + $.css(@, 'overflow-y') + $.css(@, 'overflow-x'))
    ).first()

  if scrollParent.length
    return scrollParent
  else
    return $('html')

DEBOUNCE = 16
debounce = (fn, time=DEBOUNCE) ->
  pending = false

  return ->
    return if pending

    args = arguments

    pending = true
    setTimeout =>
      pending = false
      fn.apply @, args
    , time

tethers = []

position = ->
  for tether in tethers
    tether.position()

if isIE
  position = debounce position

$(window).on 'resize', position
$(window).on 'scroll', position

MIRROR_LR =
  center: 'center'
  left: 'right'
  right: 'left'

MIRROR_TB =
  middle: 'middle'
  top: 'bottom'
  bottom: 'top'

OFFSET_MAP =
  top: '0'
  left: '0'
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

offsetToPx = (offset, element) ->
  if typeof offset.left is 'string' and offset.left.indexOf('%') isnt -1
    offset.left = parseFloat(offset.left, 10) / 100 * $(element).outerWidth()
  if typeof offset.top is 'string' and offset.top.indexOf('%') isnt -1
    offset.top = parseFloat(offset.top, 10) / 100 * $(element).outerHeight()

  offset

parseAttachment = parseOffset = (value) ->
  [top, left] = value.split(' ')

  {top, left}

# element
# attachment (top left)
# offset (0 0)
# target
# targetAttachment (auto auto)
# targetOffset (0 0)
class Tether
  @modules: []

  constructor: (options) ->
    tethers.push @

    @history = []

    @setOptions options

  setOptions: (@options) ->
    defaults =
      offset: '0 0'
      targetOffset: '0 0'
      targetAttachment: 'auto auto'

    @options = $.extend defaults, @options
      
    {@element, @target} = @options

    @$element = $ @element
    @$target = $ @target

    @targetAttachment = parseAttachment @options.targetAttachment
    @attachment = parseAttachment @options.attachment
    @offset = parseOffset @options.offset
    @targetOffset = parseOffset @options.targetOffset

    if @scrollParent?
      @scrollParent.off 'scroll', @position

    @scrollParent = getScrollParent $ @target
    @scrollParent.on 'scroll', @position

    unless @options.enabled is false
      @enable()

    @position()

  enable: ->
    @addClass 'tether-enabled'
    @enabled = true

    @position()

  disable: ->
    @removeClass 'tether-enabled'
    @enabled = false

  updateAttachClasses: (elementAttach=@attachment, targetAttach=@targetAttachment) ->
    sides = ['left', 'top', 'bottom', 'right', 'middle', 'center']
  
    @$element.removeClass "tether-target-on-#{ side }" for side in sides
    @$element.addClass "tether-target-on-#{ elementAttach.top }" if elementAttach.top
    @$element.addClass "tether-target-on-#{ elementAttach.left }" if elementAttach.left

    @$target.removeClass "tether-element-on-#{ side }" for side in sides
    @$target.addClass "tether-element-on-#{ targetAttach.top }" if targetAttach.top
    @$target.addClass "tether-element-on-#{ targetAttach.left }" if targetAttach.left

  addClass: (classes) ->
    @$element.addClass classes
    @$target.addClass classes

  removeClass: (classes) ->
    @$element.removeClass classes
    @$target.removeClass classes

  position: =>
    return unless @enabled

    # Turn 'auto' attachments into the appropriate corner or edge
    targetAttachment = autoToFixedAttachment(@targetAttachment, @attachment)

    # Get an actual px offset from the attachment
    offset = offsetToPx attachmentToOffset(@attachment), @element
    targetOffset = offsetToPx attachmentToOffset(targetAttachment), @target

    # Add the manually provided offset
    offset = addOffset offset, offsetToPx(@offset, @element)
    targetOffset = addOffset targetOffset, offsetToPx(@targetOffset, @target)

    @updateAttachClasses @attachment, targetAttachment

    targetPos = @$target.offset()
    elementPos = @$element.offset()

    # It's now our goal to make (element position + offset) == (target position + target offset)
    left = targetPos.left + targetOffset.left - offset.left
    top = targetPos.top + targetOffset.top - offset.top

    for module in Tether.modules
      ret = module.position.call(@, {left, top, targetAttachment, targetPos, elementPos})

      if not ret?
        continue
      else if ret is false
        return false
      else
        {top, left} = ret

    width = @$element.outerWidth()
    height = @$element.outerHeight()

    next = {
      page:
        top: top
        bottom: document.body.scrollHeight - top - height
        left: left
        right: document.body.scrollWidth - left - width
      viewport:
        top: top - pageYOffset
        bottom: pageYOffset - top - height + innerHeight
        left: left - pageXOffset
        right: pageXOffset - left - width + innerWidth
    }

    $offsetParent = @$target.offsetParent()
    offsetPosition = $offsetParent.offset()

    offsetPosition.right = document.body.scrollWidth - offsetPosition.left - $offsetParent.width()
    offsetPosition.bottom = document.body.scrollHeight - offsetPosition.top - $offsetParent.height()

    if next.page.top >= offsetPosition.top and next.page.bottom >= offsetPosition.bottom
      if next.page.left >= offsetPosition.left and next.page.right >= offsetPosition.right

        scrollTop = $offsetParent.scrollTop()
        scrollLeft = $offsetParent.scrollLeft()

        next.offset =
          top: next.page.top - offsetPosition.top + scrollTop
          left: next.page.left - offsetPosition.left + scrollLeft
          right: next.page.right - offsetPosition.right - scrollLeft
          bottom: next.page.bottom - offsetPosition.bottom - scrollTop

    @move next

    @history.unshift next

    if @history.length > 3
      @history.pop()

  move: (position) ->
    same = {}

    for type of position
      same[type] = {}

      for key of position[type]
        found = false

        for point in @history
          unless point[type]?[key] is position[type][key]
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

      $offsetParent = @$target.offsetParent()

      if @$element.offsetParent()[0] isnt $offsetParent[0]
        @$element.detach()
        $offsetParent.append @$element

      transcribe same.offset, position.offset

      moved = true

    else
      css.position = 'absolute'
      css.top = "#{ position.page.top }px"
      css.left = "#{ position.page.left }px"

    if not moved and not @$element.parent().is('body')
      @$element.detach()
      $(document.body).append @$element

    write = false
    for key, val of css
      if @$element.css(key) isnt val
        write = true
        break

    if write
      @$element.css css

window.Tether = Tether
