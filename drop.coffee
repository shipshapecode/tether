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

sortAttach = (str) ->
    [first, second] = str.split(' ')

    if first in ['left', 'right']
        [first, second] = [second, first]

    [first, second].join(' ')

MIRROR_ATTACH =
    left: 'right'
    right: 'left'
    top: 'bottom'
    bottom: 'top'
    middle: 'middle'

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
            attach: 'bottom left'
            trigger: 'click'
            constrainToScrollParent: true
            constrainToWindow: true
            className: ''
            closedOnInit: true
            content: 'drop'

    $.extend true, drop, defaults, options

    $(document).on 'dropopen.drop, dropclose.drop', -> drop.updateBodyClasses()

    drop.updateBodyClasses = ->
        # There is only one body, so despite the context concept, we still iterate through all
        # drops created in any context before applying the class.

        anyOpen = false
        for _drop in allDrops when _drop.isOpened()
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

            @setupElements()
            @setupEvents()
            @setupTether()

        setupElements: ->
            @$drop = $ '<div>'
            @$drop.addClass drop.classNames.drop
            @$drop.addClass @options.className

            @$dropContent = $ '<div>'
            @$dropContent.addClass drop.classNames.dropContent
            @$dropContent.append @options.content

            @$drop.append @$dropContent

            @$drop.addClass drop.classNames.closed

        setupTether: ->
            # Tether expects two attachment points, one in the target element, one in the
            # drop.  We use a single one, and use the order as well, to allow us to put
            # the drop on either side of any of the four corners.  This magic converts between
            # the two:
            dropAttach = @options.attach.split(' ')
            dropAttach[0] = MIRROR_ATTACH[dropAttach[0]]
            dropAttach = dropAttach.join(' ')

            constraints = []
            if @options.constrainToScrollParent
              constraints.push
                to: 'scrollParent'
                pin: true
                changeAttachY: 'together'

            if @options.constrainToWindow
              constraints.push
                to: 'window'
                pin: true
                changeAttachY: 'together'

            @tether = new Tether
                element: @$drop[0]
                target: @$target[0]
                attachment: sortAttach(dropAttach)
                targetAttachment: sortAttach(@options.attach)
                offset: '0 0'
                targetOffset: '0 0'
                enabled: false
                constraints: constraints

        setupEvents: ->
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
            if @isOpened()
                @close()
            else
                @open()

        open: ->
            unless @$drop.parent().length
                $('body').append @$drop

            @$target
                .addClass(drop.classNames.opened)
                .removeClass(drop.classNames.closed)

            @$drop
                .addClass(drop.classNames.opened)
                .removeClass(drop.classNames.closed)

            @$drop.trigger
                type: 'dropopen'
                drop: @

            @tether.enable()

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

            @tether.disable()

        # TODO Add classes
    drop

window.Drop = createContext()

$ ->
    Drop.updateBodyClasses()
