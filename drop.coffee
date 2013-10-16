# Finally a dropdown which understands where it is.

pluginName = 'drop'


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

        return (/fixed/).test(this.css('position')) or (if not scrollParent.length then $(document) else scrollParent)


defaults =
    trigger: 'click'


methods =

    init: (opts) -> this.each ->
        $el = $ @
        options = $.extend {}, defaults, opts
        $el.data pluginName, options
        $el[pluginName] 'drop'

    drop: ->
        $el = $ @
        options = $el.data pluginName

        $el[pluginName] 'setupDrop'
        $el[pluginName] 'setupEvents'
        $el[pluginName] 'positionDrop'

    setupDrop: ->
        $el = $ @
        options = $el.data pluginName

        options.$drop = $('<div class="drop" style="display: none; background: pink; position: absolute; padding: 20px">stuff</div>')
        $('body').append options.$drop

        $el

    setupEvents: ->
        $el = $ @
        options = $el.data pluginName

        $scrollParent = $el.scrollParent()

        $scrollParent.bind 'scroll.drop', -> $el[pluginName] 'positionDrop'

        if options.trigger is 'click'
            $el.bind 'click.drop', -> $el[pluginName] 'toggleDrop'

            $scrollParent.bind 'click.drop', (event) ->
                if $(event.target).is($el[0]) or $el.find(event.target).length
                    return
                $el[pluginName] 'hideDrop'

        $el

    toggleDrop: ->
        $el = $ @
        options = $el.data pluginName

        if options.$drop.is(':hidden')
            $el[pluginName] 'showDrop'
        else
            $el[pluginName] 'hideDrop'

        $el

    showDrop: ->
        $el = $ @
        options = $el.data pluginName
        options.$drop.show()
        $el

    hideDrop: ->
        $el = $ @
        options = $el.data pluginName
        options.$drop.hide()
        $el

    positionDrop: ->
        $el = $ @
        options = $el.data pluginName

        targetOffset = $el.offset()
        $scrollParent = $el.scrollParent()
        scrollParentOffset = $scrollParent.offset()

        options.$drop.css
            top: Math.min(Math.max(targetOffset.top + $el.outerHeight(), scrollParentOffset.top), scrollParentOffset.top + $scrollParent.outerHeight() - options.$drop.outerHeight())
            left: Math.min(Math.max(targetOffset.left, scrollParentOffset.left), scrollParentOffset.left + $scrollParent.outerWidth() - options.$drop.outerWidth())

        $el


$.fn[pluginName] = (options) ->
    if methods[options]
        methods[options].apply this, Array::slice.call(arguments, 1)
    else if typeof options is 'object' or not options
        methods.init.apply this, arguments
    else
        $.error "jQuery.#{ pluginName }: Method #{ options } does not exist"