window.Tether ?= {}

getScrollParent = (el) ->
  position = getComputedStyle(el).position

  if position is 'fixed'
    return el

  scrollParent = undefined

  parent = el
  while parent = parent.parentNode
    unless style = getComputedStyle parent
      return parent

    if /(auto|scroll)/.test(style['overflow'] + style['overflow-y'] + style['overflow-x'])
      if position isnt 'absolute' or style['position'] in ['relative', 'absolute', 'fixed']
        return parent

  return document.body

getSize = (el, outer=false) ->
  style = getComputedStyle el
  boxModel = style['box-sizing']

  out = {}
  for dim in ['height', 'width']
    if dim is 'height'
      edges = ['top', 'bottom']
    else
      edges = ['left', 'right']

    size = parseFloat style[dim]

    if outer
      for edge in edges
        if boxModel isnt 'border-box'
          size += parseFloat style["padding-#{ edge }"]
          size += parseFloat style["border-#{ edge }-width"]
    else
      for edge in edges
        if boxModel is 'border-box'
          size -= parseFloat style["padding-#{ edge }"]
          size -= parseFloat style["border-#{ edge }-width"]

    out[dim] = size

  out

getOuterSize = (el) ->
  getSize el, true

getOffset = (el) ->
  doc = el.ownerDocument.documentElement

  box = el.getBoundingClientRect()

  {
    top: box.top + window.pageYOffset - doc.clientTop
    left: box.left + window.pageXOffset - doc.clientLeft
  }

getOffsetParent = (el) ->
  offsetParent = el.offsetParent or document.documentElement

  while offsetParent and offsetParent.tagName isnt 'HTML' and offsetParent.style.position in ['', 'static']
    offsetParent = offsetParent.offsetParent

  offsetParent or document.documentElement

extend = (out={}) ->
  args = []
  Array::push.apply(args, arguments)

  for obj in args[1..] when obj
    for own key, val of obj
      out[key] = val

  out

removeClass = (el, name) ->
  if el.classList?
    el.classList.remove(cls) for cls of name.split(' ')
  else
    el.className = el.className.replace new RegExp("(^| )#{ name.split(' ').join('|') }( |$)", 'gi'), ' '

addClass = (el, name) ->
  if el.classList?
    el.classList.add(cls) for cls of name.split(' ')
  else
    removeClass el, name
    el.className += " #{ name }"

Tether.Utils = {getScrollParent, getSize, getOuterSize, getOffset, getOffsetParent, extend, addClass, removeClass}
