###

drop - Finally a dropdown which understands where it is.

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

allDrops = []

# Drop can be included in external libraries.  Calling createContext gives you a fresh
# copy of drop which won't interact with other copies on the page (beyond calling the document events).
createContext = (options) ->
    drop = ->
        new DropInstance arguments...

    $.extend drop,
        createContext: createContext
        drops: []

    defaults =
        classNames:
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

    $.extend true, drop, defaults, options

    $(document).on 'dropopen.drop, dropclose.drop', -> drop.updateBodyClasses()

    $(window).on 'resize', debounce(-> drop.positionAll())
    $(window).on 'scroll.drop', debounce(-> drop.positionAll())

    drop.positionAll = ->
        for drop in drop.drops when drop.isOpened()
            drop.position()

    drop.updateBodyClasses = ->
        # There is only one body, so despite the context concept, we still iterate through all
        # drops created in any context before applying the class.

        anyOpen = false
        for drop in allDrops when drop.isOpened()
            anyOpen = true
            break

        if anyOpen
            $('body').addClass(drop.classNames.opened).removeClass(drop.classNames.allClosed)
        else
            $('body').removeClass(drop.classNames.opened).addClass(drop.classNames.allClosed)

    class DropInstance
        constructor: (@options) ->
            @options = $.extend {}, @options.defaults, @options

            @$target = $ @options.target

            drop.drops.push @
            allDrops.push @

            if @options.attach and not (@options.attachFirst or @options.attachSecond)
                attachSplit = options.attach.split('-')
                @options.attachFirst = attachSplit[0]
                @options.attachSecond = attachSplit[1]

            @setupElements()
            @setupEvents()

        setupElements: ->
            @$drop = $ '<div>'
            @$drop.addClass drop.classNames.drop
            @$drop.addClass options.className

            @$dropContent = $ '<div>'
            @$dropContent.addClass drop.classNames.dropContent
            @$dropContent.append @options.content

            @$drop.append @$dropContent

            @attach @options.attachFirst, @options.attachSecond

            if @options.closedOnInit
                @$drop.addClass drop.classNames.closed

        setupEvents: ->
            $scrollParent = scrollParent(@$target)

            position = => @position() if @isOpened()

            $scrollParent.on 'scroll.drop', debounce(position)

            if @options.trigger is 'click'
                @$target.bind 'click.drop', => @toggle()

                $(document).bind 'click.drop', (event) =>
                    return unless @isOpened

                    # Clicking inside dropdown
                    if $(event.target).is(@$drop[0]) or @$drop.find(event.target).length
                        return

                    # Clicking target
                    if $(event.target).is(@$target[0]) or @$target.find(event.target).length
                        return

                    @close()

        isOpened: ->
            @$drop.hasClass(drop.classNames.opened)

        toggle: ->
            if @isOpened
                @close()
            else
                @open()

        open: ->
            unless @$drop.parent().length
                $('body').append @$drop

            @position()

            @$target
                .addClass(drop.classNames.opened)
                .removeClass(drop.classNames.closed)

            @$drop
                .addClass(drop.classNames.opened)
                .removeClass(drop.classNames.closed)

            @$drop.trigger
                type: 'dropopen'
                drop: @

        close: ->
            @$target
                .addClass(drop.classNames.closed)
                .removeClass(drop.classNames.opened)

            @$drop
                .addClass(drop.classNames.closed)
                .removeClass(drop.classNames.opened)

            @$drop.trigger
                type: 'dropclose'
                drop: @

        attach: (attachFirst, attachSecond) ->
            $([@$target[0], @$drop[0]]).each ->
                $el = $(@)
                removePrefixedClasses($el, drop.classNames.attachPrefix)
                $el.addClass("#{ drop.classNames.attachPrefix }#{ attachFirst }-#{ attachSecond }")

        position: ->
            targetOffset = @$target.offset()
            $scrollParent = scrollParent(@$target)
            scrollParentOffset = @$scrollParent.offset()

            targetOuterHeight = @$target.outerHeight()
            targetOuterWidth = @$target.outerWidth()

            dropOuterHeight = @$drop.outerHeight()
            dropOuterWidth = @$drop.outerWidth()

            windowScrollTop = $(window).scrollTop()
            windowScrollLeft = $(window).scrollLeft()

            # Above and below target

            if @options.attachFirst is 'bottom'
                top = targetOffset.top + targetOuterHeight

            if @options.attachFirst is 'top'
                top = targetOffset.top - dropOuterHeight

            if @options.attachSecond is 'left'
                left = targetOffset.left

            if @options.attachSecond is 'right'
                left = targetOffset.left + targetOuterWidth - dropOuterWidth

            # Left and right of target

            if @options.attachFirst is 'right'
                left = targetOffset.left + targetOuterWidth

            if @options.attachFirst is 'left'
                left = targetOffset.left - dropOuterWidth

            if @options.attachSecond is 'top'
                top = targetOffset.top

            if @options.attachSecond is 'bottom'
                top = targetOffset.top + targetOuterHeight - dropOuterHeight

            # Constraints

            unless $scrollParent.is('html')
                if @options.constrainToScrollParent or @options.attachFirst in ['left', 'right']
                    top = Math.min(Math.max(top, scrollParentOffset.top), scrollParentOffset.top + $scrollParent.outerHeight() - dropOuterHeight)

                if @options.constrainToScrollParent or @options.attachFirst in ['top', 'bottom']
                    left = Math.min(Math.max(left, scrollParentOffset.left), scrollParentOffset.left + $scrollParent.outerWidth() - dropOuterWidth)

            if @options.constrainToWindow
                wasConstrained = false

                topMin = windowScrollTop
                topMax = $(window).height() + windowScrollTop - dropOuterHeight

                leftMin = windowScrollLeft
                leftMax = $(window).width() + windowScrollLeft - dropOuterWidth

                if @options.attachFirst in ['top', 'bottom']
                    if top < topMin
                        wasConstrained = true
                        top = topMin
                        top = targetOffset.top + targetOuterHeight
                        @attach 'bottom', @options.attachSecond

                    if top > topMax
                        wasConstrained = true
                        top = topMax
                        top = targetOffset.top - dropOuterHeight
                        @attach 'top', @options.attachSecond

                if @options.attachFirst in ['left', 'right']
                    if left < leftMin
                        wasConstrained = true
                        left = leftMin
                        left = targetOffset.left + targetOuterWidth
                        @attach 'right', @options.attachSecond

                    else if left > leftMax
                        wasConstrained = true
                        left = leftMax
                        left = targetOffset.left - dropOuterWidth
                        @attach 'left', @options.attachSecond

                unless wasConstrained
                    @attach @options.attachFirst, @options.attachSecond

                top = Math.min(Math.max(top, topMin), topMax)
                left = Math.min(Math.max(left, leftMin), leftMax)

            top += 'px'
            left += 'px'

            unless @$drop.css('top') is top and @$drop.css('left') is left
                @$drop[0].style.top = top
                @$drop[0].style.left = left

    drop

window.Drop = createContext()

$ ->
    Drop.updateBodyClasses()
