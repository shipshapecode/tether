###

Drop - Finally a dropdown which understands where it is.

    - Attach to 8 different locations
    - Attach options diagram:

           top-left  top-right
                 |    |
      left-top --TARGET-- right-top
   left-bottom --TARGET-- right-bottom
                 |    |
         bottom-left bottom-right

###


$ = jQuery
isIE = /msie [\w.]+/.test navigator.userAgent.toLowerCase()

DEBOUNCE = if isIE then 100 else 0
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

removePrefixedClasses = ($el, prefix) ->
    $el.attr 'class', (index, className) ->
        className.replace(new RegExp("\\b#{ prefix }\\S+", 'g'), '').replace(/\s+/g, ' ')

$ ->
    drop.updateBodyClasses()

    $(document).on 'openDrop.drop, closeDrop.drop', (event) -> drop.updateBodyClasses()

    $(window).on 'resize', debounce(-> drop.positionAll())
    $(window).on 'scroll.drop', debounce(-> drop.positionAll())

drop =
    baseClassNames:
        drop: 'drop'
        dropContent: 'drop-content'
        opened: 'drop-opened'
        closed: 'drop-closed'
        allClosed: 'drop-all-closed'
        attachPrefix: 'drop-attached-'

    defaults:
        attach: 'bottom-left'
        trigger: 'click'
        constrainToScrollParent: true
        constrainToWindow: true
        className: ''
        closedOnInit: true
        content: 'drop'
        prerender: false # TODO - this would allow drop to be rendered before being opened

    dropTargets: []

    positionAll: ->
        $.each drop.dropTargets, (i, $target) ->
            if $target.drop 'isOpened'
                $target.drop 'positionDrop'

    updateBodyClasses: ->
        anyOpen = false

        $.each drop.dropTargets, (i, $target) ->
            if $target.drop 'isOpened'
                anyOpen = true
                return false

        if anyOpen
            $('body').addClass(drop.baseClassNames.opened).removeClass(drop.baseClassNames.allClosed)
        else
            $('body').removeClass(drop.baseClassNames.opened).addClass(drop.baseClassNames.allClosed)

jQueryMethods =
    init: (opts) -> @each ->
        $target = $ @
        drop.dropTargets.push $target

        options = $.extend {}, drop.defaults, opts

        if options.attach and not (options.attachFirst or options.attachSecond)
            attachSplit = options.attach.split('-')
            options.attachFirst = attachSplit[0]
            options.attachSecond = attachSplit[1]

        $target.data 'drop', options
        $target.drop 'drop'

    drop: ->
        $target = $ @
        options = $target.data().drop

        $target.drop 'setupDrop'
        $target.drop 'setupEvents'

    setupDrop: ->
        $target = $ @
        options = $target.data().drop

        options.$drop = $ '<div>'
        options.$drop.addClass drop.baseClassNames.drop
        options.$drop.addClass options.className

        options.$dropContent = $ '<div>'
        options.$dropContent.addClass drop.baseClassNames.dropContent
        options.$dropContent.append options.content

        options.$drop.append options.$dropContent

        $target.drop 'attach', options.attachFirst, options.attachSecond

        if options.closedOnInit
            options.$drop.addClass drop.baseClassNames.closed

        $target

    setupEvents: ->
        $target = $ @
        options = $target.data().drop

        $scrollParent = scrollParent($target)

        position = -> $target.drop 'positionDrop' if $target.drop 'isOpened'

        $scrollParent.on 'scroll.drop', debounce(position)

        if options.trigger is 'click'
            $target.bind 'click.drop', -> $target.drop 'toggleDrop'

            $(document).bind 'click.drop', (event) ->
                return unless $target.drop 'isOpened'

                # Clicking inside dropdown
                if $(event.target).is(options.$drop[0]) or options.$drop.find(event.target).length
                    return

                # Clicking target
                if $(event.target).is($target[0]) or $target.find(event.target).length
                    return

                $target.drop 'closeDrop'

        $target

    toggleDrop: ->
        $target = $ @
        options = $target.data().drop

        if $target.drop 'isOpened'
            $target.drop 'closeDrop'
        else
            $target.drop 'openDrop'

        $target

    isOpened: ->
        $(@).data('drop').$drop.hasClass(drop.baseClassNames.opened)

    openDrop: ->
        $target = $ @
        options = $target.data().drop

        unless options.$drop.parent().length
            $('body').append options.$drop

        $target.drop 'positionDrop'

        $target
            .addClass(drop.baseClassNames.opened)
            .removeClass(drop.baseClassNames.closed)

        options.$drop
            .addClass(drop.baseClassNames.opened)
            .removeClass(drop.baseClassNames.closed)

        options.$drop.trigger
            type: 'openDrop'
            $drop: $target

        $target

    closeDrop: ->
        $target = $ @
        options = $target.data().drop

        $target
            .addClass(drop.baseClassNames.closed)
            .removeClass(drop.baseClassNames.opened)

        options.$drop
            .addClass(drop.baseClassNames.closed)
            .removeClass(drop.baseClassNames.opened)

        options.$drop.trigger
            type: 'closeDrop'
            $drop: $target

        $target

    attach: (attachFirst, attachSecond) ->
        $target = $ @
        options = $target.data('drop')

        $([$target[0], options.$drop[0]]).each ->
            $el = $(@)
            removePrefixedClasses($el, drop.baseClassNames.attachPrefix)
            $el.addClass("#{ drop.baseClassNames.attachPrefix }#{ attachFirst }-#{ attachSecond }")

    positionDrop: ->
        $target = $ @
        options = $target.data().drop

        targetOffset = $target.offset()
        $scrollParent = scrollParent($target)
        scrollParentOffset = $scrollParent.offset()

        targetOuterHeight = $target.outerHeight()
        targetOuterWidth = $target.outerWidth()

        dropOuterHeight = options.$drop.outerHeight()
        dropOuterWidth = options.$drop.outerWidth()

        windowScrollTop = $(window).scrollTop()
        windowScrollLeft = $(window).scrollLeft()

        # Above and below target

        if options.attachFirst is 'bottom'
            top = targetOffset.top + targetOuterHeight

        if options.attachFirst is 'top'
            top = targetOffset.top - dropOuterHeight

        if options.attachSecond is 'left'
            left = targetOffset.left

        if options.attachSecond is 'right'
            left = targetOffset.left + targetOuterWidth - dropOuterWidth

        # Left and right of target

        if options.attachFirst is 'right'
            left = targetOffset.left + targetOuterWidth

        if options.attachFirst is 'left'
            left = targetOffset.left - dropOuterWidth

        if options.attachSecond is 'top'
            top = targetOffset.top

        if options.attachSecond is 'bottom'
            top = targetOffset.top + targetOuterHeight - dropOuterHeight

        # Constraints

        unless $scrollParent.is('html')
            if options.constrainToScrollParent or options.attachFirst in ['left', 'right']
                top = Math.min(Math.max(top, scrollParentOffset.top), scrollParentOffset.top + $scrollParent.outerHeight() - dropOuterHeight)

            if options.constrainToScrollParent or options.attachFirst in ['top', 'bottom']
                left = Math.min(Math.max(left, scrollParentOffset.left), scrollParentOffset.left + $scrollParent.outerWidth() - dropOuterWidth)

        if options.constrainToWindow
            wasConstrained = false

            topMin = windowScrollTop
            topMax = $(window).height() + windowScrollTop - dropOuterHeight

            leftMin = windowScrollLeft
            leftMax = $(window).width() + windowScrollLeft - dropOuterWidth

            if options.attachFirst in ['top', 'bottom']

                if top < topMin
                    wasConstrained = true
                    top = topMin
                    top = targetOffset.top + targetOuterHeight
                    $target.drop('attach', 'bottom', options.attachSecond)

                if top > topMax
                    wasConstrained = true
                    top = topMax
                    top = targetOffset.top - dropOuterHeight
                    $target.drop('attach', 'top', options.attachSecond)

            if options.attachFirst in ['left', 'right']

                if left < leftMin
                    wasConstrained = true
                    left = leftMin
                    left = targetOffset.left + targetOuterWidth
                    $target.drop('attach', 'right', options.attachSecond)

                else if left > leftMax
                    wasConstrained = true
                    left = leftMax
                    left = targetOffset.left - dropOuterWidth
                    $target.drop('attach', 'left', options.attachSecond)

            $target.drop('attach', options.attachFirst, options.attachSecond) unless wasConstrained

            top = Math.min(Math.max(top, topMin), topMax)
            left = Math.min(Math.max(left, leftMin), leftMax)

        oldTop = parseInt(options.$drop.css('top'), 10)
        oldLeft = parseInt(options.$drop.css('left'), 10)

        return $target if oldTop is top and oldLeft is left

        options.$drop[0].style.top = top + 'px'
        options.$drop[0].style.left = left + 'px'

        $target


window.drop = drop


$.fn.drop = (options) ->
    if jQueryMethods[options]
        jQueryMethods[options].apply this, Array::slice.call(arguments, 1)
    else if typeof options is 'object' or not options
        jQueryMethods.init.apply this, arguments
    else
        $.error "jQuery.drop: Method #{ options } does not exist"
