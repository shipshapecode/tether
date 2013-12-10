DropSelect = Drop.createContext()

ENTER = 13
ESCAPE = 27
SPACE = 32
UP = 38
DOWN = 40

lastKeysPressed = ''
lastKeysTimeout = undefined

$(window).on 'keydown keypress', (e) ->
    clearTimeout lastKeysTimeout

    $focusedTarget = $('.drop-select-target-focused:first')
    return unless $focusedTarget.length and $focusedTarget.data('select')

    select = $focusedTarget.data('select')

    if select.dropSelect.isOpened() and e.keyCode is ESCAPE
        select.dropSelect.close()
        select.$target.focus()

    if not select.dropSelect.isOpened() and e.keyCode in [UP, DOWN, SPACE]
        select.dropSelect.open()
        e.preventDefault()
        return

    if select.dropSelect.isOpened() and e.keyCode is ENTER
        select.selectHighlightedOption()
        return

    if select.dropSelect.isOpened() and e.keyCode in [UP, DOWN]
        select.moveHighlight if e.keyCode is UP then 'up' else 'down'
        e.preventDefault()
        return

    return if e.charCode is 0

    lastKeysPressed += String.fromCharCode e.charCode
    select.highlightOptionWithText lastKeysPressed

    lastKeysTimeout = setTimeout ->
        lastKeysPressed = ''
    , 500

class Select

    constructor: (@options) ->
        @$select = $ @options.el

        @setupTarget()
        @createDrop()
        @renderDrop()
        @setupEvents()

    setupTarget: ->
        val = @$select.val()
        $options = @$select.find('option')

        if val and val isnt ''
            placeholder = @$select.find('option:selected').text()
        else
            dataPlaceholder = @$select.attr('data-placeholder')

            if dataPlaceholder and dataPlaceholder isnt ''
                placeholder = dataPlaceholder
            else
                placeholder = @$select.find('option:first').text()

        @$target = $ """<a href="javascript:;" class="drop-select-target">#{ placeholder }<b></b></a>"""

        @$target.data 'select', @

        @$target.on 'click', =>
            @$target.focus()

        @$target.on 'focus', =>
            @$target.addClass('drop-select-target-focused')

        @$target.on 'blur', =>
            @dropSelect.close()
            @$target.removeClass('drop-select-target-focused')

        @$select.after(@$target).hide()

    renderTarget: ->
        @$target.text @$select.find('option:selected').text()
        @$target.append '<b></b>'

    getSelectedOption: ->
        @dropSelect.$drop.find('[data-selected="true"]')

    createDrop: ->
        @dropSelect = new DropSelect
            target: @$target[0]
            className: 'drop-select-theme-default'
            attach: 'bottom left'
            constrainToWindow: true
            constrainToScrollParent: true
            trigger: 'click'

        @dropSelect.$drop.on 'dropopen', =>
            @setOptionHighlight @getSelectedOption()[0]

    renderDrop: ->
        $dropSelectOptions = $ '<ul class="drop-select-options"></ul>'

        @$select.find('option').each ->
            $option = $ @
            $dropSelectOptions.append """<li data-selected="#{ $option.is(':selected') }" class="drop-select-option" data-value="#{ @value }">#{ $option.text() }</li>"""

        @dropSelect.$drop.find('.drop-content').html $dropSelectOptions[0]

    highlightOptionWithText: (text) ->
        that = @

        if that.dropSelect.isOpened()
            options = @dropSelect.$drop.find('.drop-select-option').toArray()
            currentHighlightedIndex = @dropSelect.$drop.find('.drop-select-option-highlight').index()
        else
            options = @$select.find('option').toArray()
            currentHighlightedIndex = @$select.find('option:selected').index()

        return unless currentHighlightedIndex?

        optionsChecked = 0
        i = currentHighlightedIndex + 1

        while optionsChecked < options.length
            i = 0 if i > options.length - 1
            break if i is currentHighlightedIndex
            option = options[i]
            $option = $ option

            if not that.dropSelect.isOpened()
                if $option.text().toLowerCase().charAt(0) is text.toLowerCase().charAt(text.length - 1)
                    @$select.val $option.val()
                    @renderDrop()
                    @renderTarget()
                    return
            else
                if $option.text().toLowerCase().substr(0, text.length) is text.toLowerCase()
                    @setOptionHighlight option
                    return

            optionsChecked += 1
            i += 1

    setOptionHighlight: (option) ->
        @dropSelect.$drop.find('.drop-select-option-highlight').removeClass('drop-select-option-highlight')
        $(option).addClass('drop-select-option-highlight')

    selectHighlightedOption: ->
        @selectOption @dropSelect.$drop.find('.drop-select-option-highlight')[0]

    moveHighlight: (direction) ->
        $currentSelection = @dropSelect.$drop.find('.drop-select-option-highlight')

        if not $currentSelection.length
            $newSelection = @dropSelect.$drop.find('.drop-select-option:first')
        else
            $prev = $currentSelection.prev()
            $next = $currentSelection.next()

            if direction is 'up' and $prev.length
                $newSelection = $prev
            else if direction is 'up'
                $newSelection = $currentSelection

            if direction is 'down' and $next.length
                $newSelection = $next
            else if direction is 'down'
                $newSelection = $currentSelection

        @setOptionHighlight $newSelection[0]

    selectOption: (option) ->
        @$select.val($(option).data('value'))
        @renderDrop()
        @renderTarget()

        setTimeout (=>
            @dropSelect.close()
            @$target.focus()
        ), 0

    setupEvents: ->
        @$select.on 'change', ->
            @renderDrop()
            @renderTarget()

        @dropSelect.$drop.on 'click', '.drop-select-option', (e) =>
            @selectOption e.target

        @dropSelect.$drop.on 'mousemove', '.drop-select-option', (e) =>
            @setOptionHighlight e.target

window.Select = Select