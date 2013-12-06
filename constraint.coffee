MIRROR_ATTACH =
    left: 'right'
    right: 'left'
    top: 'bottom'
    bottom: 'top'
    middle: 'middle'

getBounds = (tether, to) ->
  if to is 'scrollParent'
    to = tether.scrollParent[0]
  else if to is 'window'
    to = [pageXOffset, pageYOffset, innerWidth + pageXOffset, innerHeight + pageYOffset]

  if to.nodeType?
    $to = $ to
    pos = $to.offset()

    to = [pos.left, pos.top, $to.outerWidth() + pos.left, $to.outerHeight() + pos.top]

  to

Tether.modules.push
  position: ({top, left, targetAttachment}) ->
    return unless @options.constraints

    height = @$element.outerHeight()
    width = @$element.outerWidth()
    targetHeight = @$target.outerHeight()
    targetWidth = @$target.outerWidth()

    for constraint in @options.constraints
      {to, changeAttachment, changeTargetAttachment, pin} = constraint

      bounds = getBounds @, to

      if changeTargetAttachment
        if (top < bounds[1] and targetAttachment.top is 'top')
          top += targetHeight

        if (top + height > bounds[3] and targetAttachment.top is 'bottom')
          top -= targetHeight

        if (left < bounds[0] and targetAttachment.left is 'left')
          left += targetWidth

        if (left + width > bounds[2] and targetAttachment.left is 'right')
          left -= targetWidth

      if changeAttachment
        if (top < bounds[1] and @attachment.top is 'bottom')
          top += height

        if (top + height > bounds[3] and @attachment.top is 'top')
          top -= height

        if (left < bounds[0] and @attachment.left is 'right')
          left += width

        if (left + width > bounds[2] and @attachment.left is 'left')
          left -= width

      if pin
        top = Math.max(top, bounds[1])
        if top + height > bounds[3]
          top = bounds[3] - height

        left = Math.max(left, bounds[0])
        if left + width > bounds[2]
          left = bounds[2] - width

    {top, left}
