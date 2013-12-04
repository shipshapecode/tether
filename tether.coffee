isIE = /msie [\w.]+/.test navigator.userAgent.toLowerCase()

# Extracted from jQuery UI Core (to remove dependency)
# https://github.com/jquery/jquery-ui/blob/24756a978a977d7abbef5e5bce403837a01d964f/ui/jquery.ui.core.js#L60
scrollParent = ($el) ->
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


tethers = []

position = ->
  for tether in tethers
    tether.position()

$(window).on 'resize', position
$(window).on 'scroll.drop', position

MIRROR_LR =
  middle: 'middle'
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
    offset.left = parseFloat(offset.left, 10)/100 * $(element).width()
  if typeof offset.top is 'string' and offset.top.indexOf('%') isnt -1
    offset.top = parseFloat(offset.top, 10)/100 * $(element).height()

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
  constructor: (@options) ->
    {@element, @target} = @options

    @$element = $ @element
    @$target = $ @target

    @targetAttachment = parseAttachment @options.targetAttachment
    @attachment = parseAttachment @options.attachment
    @offset = parseOffset @options.offset
    @targetOffset = parseOffset @options.targetOffset

    @scrollParent = scrollParent $ @target

    @scrollParent.on 'scroll', (=> @position())

    tethers.push @

    @history = []
  
    @position()

  position: ->
    # Turn 'auto' attachments into the appropriate corner or edge
    targetAttachment = autoToFixedAttachment(@targetAttachment, @attachment)

    # Get an actual px offset from the attachment
    offset = offsetToPx attachmentToOffset(@attachment), @element
    targetOffset = offsetToPx attachmentToOffset(targetAttachment), @target

    # Add the manually provided offset
    offset = addOffset offset, offsetToPx(@offset, @element)
    targetOffset = addOffset targetOffset, offsetToPx(@targetOffset, @target)

    targetPos = @$target.offset()
    elementPos = @$element.offset()

    # It's now our goal to make (element position + offset) == (target position + target offset)
    left = targetPos.left + targetOffset.left - offset.left
    top = targetPos.top + targetOffset.top - offset.top

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

    if @history.length
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
          unless point[type][key] is position[type][key]
            found = true
            break

        if not found
          same[type][key] = true
     
    css = {}

    transcribe = (same, pos) ->
      if same.top
        css.top = "#{ pos.top }px"
      else
        css.bottom = "#{ pos.bottom }px"

      if same.left
        css.left = "#{ pos.left }px"
      else
        css.right = "#{ pos.right }px"

    if (same.page.top or same.page.bottom) and (same.page.left or same.page.right)
      css.position = 'absolute'
      transcribe same.page, position.page

    else if (same.viewport.top or same.viewport.bottom) and (same.viewport.left or same.viewport.right)
      css.position = 'fixed'
      transcribe same.viewport, position.viewport

    else
      css.position = 'absolute'
      css.top = "#{ position.page.top }px"
      css.left = "#{ position.page.left }px"

    write = false
    for key, val of css
      if @$element.css(key) isnt val
        write = true
        break

    if write
      @$element.css css

window.Tether = Tether
