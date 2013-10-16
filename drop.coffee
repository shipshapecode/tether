# Finally a dropdown which understands where it is.


$ = jQuery
isIE = not not /msie [\w.]+/.exec navigator.userAgent.toLowerCase()


# Extracted from jQuery UI Core (to remove dependency)
# https://github.com/jquery/jquery-ui/blob/24756a978a977d7abbef5e5bce403837a01d964f/ui/jquery.ui.core.js#L60
$.fn.extend
    scrollParent: ->
        scrollParent = undefined

        if (isIE and (/(static|relative)/).test(@css('position'))) or (/absolute/).test(@css('position'))
            scrollParent = @parents().filter(->
                (/(relative|absolute|fixed)/).test($.css(this, 'position')) and (/(auto|scroll)/).test($.css(this, 'overflow') + $.css(this, 'overflow-y') + $.css(this, 'overflow-x'))
            ).eq(0)

        else
            scrollParent = @parents().filter(->
                (/(auto|scroll)/).test $.css(this, 'overflow') + $.css(this, 'overflow-y') + $.css(this, 'overflow-x')
            ).eq(0)

        return (/fixed/).test(this.css('position')) or (if not scrollParent.length then $('html') else scrollParent)

debounce = 0
if isIE
    debounce = 100

$ ->

    drop.updateBodyClasses()

    $(document).on 'openDrop.drop, closeDrop.drop', (event) -> drop.updateBodyClasses()

    resizePending = false
    $(window).on 'resize', ->
        return if resizePending

        resizePending = true
        setTimeout ->
            resizePending = false
            $.each drop.dropTargets, (i, $target) ->
                if $target.drop 'isOpened'
                    $target.drop 'positionDrop'
        , debounce

drop =

    baseClassNames:
        drop: 'drop'
        opened: 'drop-opened'
        closed: 'drop-closed'
        allClosed: 'drop-all-closed'

    defaults:
        trigger: 'click'
        attach: 'bottomLeft'
        constrainToScrollParent: true
        constrainToWindow: true
        className: ''
        closedOnInit: true
        dropTag: 'div'
        content: 'drop'

    dropTargets: []

    updateBodyClasses: ->
        anyOpen = false

        $.each drop.dropTargets, (i, $target) -> anyOpen = true if $target.drop 'isOpened'

        if anyOpen
            $('body').addClass(drop.baseClassNames.opened).removeClass(drop.baseClassNames.allClosed)
        else
            $('body').removeClass(drop.baseClassNames.opened).addClass(drop.baseClassNames.allClosed)


jQueryMethods =

    init: (opts) -> this.each ->
        $target = $ @
        options = $.extend {}, drop.defaults, opts
        $target.data 'drop', options
        drop.dropTargets.push $target
        $target.drop 'drop'

    drop: ->
        $target = $ @
        options = $target.data().drop

        $target.drop 'setupDrop'
        $target.drop 'setupEvents'


    setupDrop: ->
        $target = $ @
        options = $target.data().drop

        options.$drop = $ document.createElement options.dropTag
        options.$drop.addClass drop.baseClassNames.drop
        options.$drop.addClass options.className

        if options.closedOnInit
            options.$drop.addClass drop.baseClassNames.closed

        options.$drop.append options.content

        $('body').append options.$drop

        $target

    setupEvents: ->
        $target = $ @
        options = $target.data().drop

        $scrollParent = $target.scrollParent()

        $scrollParent.bind 'scroll.drop', -> $target.drop 'positionDrop'
        $(window).bind 'scroll.drop', -> $target.drop 'positionDrop'

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
        $(@).data().drop.$drop.hasClass(drop.baseClassNames.opened)

    openDrop: ->
        $target = $ @
        options = $target.data().drop

        $target.drop 'positionDrop'

        options.$drop
            .addClass(drop.baseClassNames.opened)
            .removeClass(drop.baseClassNames.closed)

        $(document).trigger
            type: 'openDrop'
            $drop: $target

        $target

    closeDrop: ->
        $target = $ @
        options = $target.data().drop

        options.$drop
            .addClass(drop.baseClassNames.closed)
            .removeClass(drop.baseClassNames.opened)

        $(document).trigger
            type: 'closeDrop'
            $drop: $target

        $target

    positionDrop: ->
        $target = $ @
        options = $target.data().drop

        targetOffset = $target.offset()
        $scrollParent = $target.scrollParent()
        scrollParentOffset = $scrollParent.offset()

        targetOuterHeight = $target.outerHeight()
        targetOuterWidth = $target.outerWidth()

        dropOuterHeight = options.$drop.outerHeight()
        dropOuterWidth = options.$drop.outerWidth()

        windowScrollTop = $(window).scrollTop()
        windowScrollLeft = $(window).scrollLeft()

        if options.attach in ['bottomLeft', 'bottomRight']
            top = targetOffset.top + targetOuterHeight

            if options.attach is 'bottomLeft'
                left = targetOffset.left

            if options.attach is 'bottomRight'
                left = targetOffset.left + targetOuterWidth - dropOuterWidth

            if options.constrainToScrollParent
                top = Math.min(Math.max(top, scrollParentOffset.top), scrollParentOffset.top + $scrollParent.outerHeight() - dropOuterHeight)
                left = Math.min(Math.max(left, scrollParentOffset.left), scrollParentOffset.left + $scrollParent.outerWidth() - dropOuterWidth)

        if options.constrainToWindow
            windowConstrainedTop = Math.min(Math.max(top, windowScrollTop), $(window).height() + windowScrollTop - dropOuterHeight)
            left = Math.min(Math.max(left, windowScrollLeft), $(window).width() + windowScrollLeft - dropOuterWidth)

            if top isnt windowConstrainedTop
                top = targetOffset.top - dropOuterHeight

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