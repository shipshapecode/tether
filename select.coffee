DropSelect = Drop.createContext()

ENTER = 13
ESCAPE = 27
SPACE = 32
UP = 38
DOWN = 40

strIsRepeatedCharacter = (str) ->
    return false unless str.length > 1
    letter = str.charAt 0
    for char in str.split ''
        return false if char isnt letter
    return true

getFocusedSelect = ->
    $focusedTarget = $('.drop-select-target-focused:first')
    return $focusedTarget?.length and $focusedTarget.data('select')

searchText = ''
searchTextTimeout = undefined

lastCharacter = undefined

$(window).on 'keypress', (e) ->
    select = getFocusedSelect()
    return unless select

    return if e.charCode is 0

    newCharacter = String.fromCharCode e.charCode

    if strIsRepeatedCharacter(searchText) and not strIsRepeatedCharacter(searchText + newCharacter)
        searchText = newCharacter
    else
        searchText += newCharacter
        searchText += newCharacter if lastCharacter is newCharacter

    lastCharacter = newCharacter

    if e.keyCode is SPACE
        e.preventDefault()

    if select.dropSelect.isOpened()
        select.highlightOptionByText searchText
    else
        select.selectOptionByText searchText

    clearTimeout searchTextTimeout
    searchTextTimeout = setTimeout ->
        searchText = ''
    , 500

$(window).on 'keydown', (e) ->
    select = getFocusedSelect()
    return unless select

    if e.keyCode in [UP, DOWN, ESCAPE]
        e.preventDefault()

    if select.dropSelect.isOpened()
        switch e.keyCode
            when UP, DOWN
                select.moveHighlight e.keyCode
            when ENTER
                select.selectHighlightedOption()
            when ESCAPE
                select.dropSelect.close()
                select.$target.focus()
    else
        if e.keyCode in [UP, DOWN, SPACE]
            select.dropSelect.open()

class Select

    constructor: (@options) ->
        @$select = $ @options.el

        @setupTarget()
        @renderTarget()

        @setupDrop()
        @renderDrop()

        @setupSelectEvents()

    setupTarget: ->
        $options = @$select.find('option')

        @$target = $ '''<a href="javascript:;" class="drop-select-target drop-select-theme-default"></a>'''

        @$target.data 'select', @

        @$target.on 'click', =>
            if not @dropSelect.isOpened()
                @$target.focus()
            else
                @$target.blur()

        @$target.on 'focus', =>
            @$target.addClass('drop-select-target-focused')

        @$target.on 'blur', (e) =>
            if @dropSelect.isOpened()
                if e.relatedTarget and not $(e.relatedTarget).parents('.drop:first').is(@dropSelect.$drop)
                    @dropSelect.close()
            else
                @$target.removeClass('drop-select-target-focused')

        @$select.after(@$target).hide()

    renderTarget: ->
        @$target.text @$select.find('option:selected').text()
        @$target.append '<b></b>'

    setupDrop: ->
        @dropSelect = new DropSelect
            target: @$target[0]
            className: 'drop-select-theme-default'
            attach: 'bottom left'
            constrainToWindow: true
            constrainToScrollParent: false
            openOn: 'click'

        @dropSelect.$drop.on 'click', '.drop-select-option', (e) =>
            @selectOption e.target

        @dropSelect.$drop.on 'mousemove', '.drop-select-option', (e) =>
            @highlightOption e.target

        @dropSelect.$drop.on 'dropopen', =>
            $selectedOption = @dropSelect.$drop.find('[data-selected="true"]')
            if @options?.autoAlign is true
                offset = @dropSelect.$drop.offset().top - ($selectedOption.offset().top + $selectedOption.outerHeight())
                @dropSelect.tether.offset.top = - offset
            @highlightOption $selectedOption[0]

        @dropSelect.$drop.on 'dropclose', =>
            @$target.removeClass('drop-select-target-focused')

    renderDrop: ->
        $dropSelectOptions = $ '<ul class="drop-select-options"></ul>'

        @$select.find('option').each ->
            $option = $ @
            $dropSelectOptions.append """<li data-selected="#{ $option.is(':selected') }" class="drop-select-option" data-value="#{ @value }">#{ $option.text() }</li>"""

        @dropSelect.$drop.find('.drop-content').html $dropSelectOptions[0]

    setupSelectEvents: ->
        @$select.on 'change', =>
            @renderDrop()
            @renderTarget()

    selectOptionByText: (text) ->
        options = @$select.find('option').toArray()
        currentHighlightedIndex = @$select.find('option:selected').index()
        return unless currentHighlightedIndex?

        isRepeatedCharacter = strIsRepeatedCharacter text

        i = currentHighlightedIndex
        i += 1 if isRepeatedCharacter

        optionsChecked = 0

        while optionsChecked < options.length
            i = 0 if i > options.length - 1
            option = options[i]
            $option = $ option

            if (isRepeatedCharacter and $option.text().toLowerCase().charAt(0) is text.toLowerCase().charAt(0)) or $option.text().toLowerCase().substr(0, text.length) is text.toLowerCase()
                @$select.val($option.val()).change()
                return

            optionsChecked += 1
            i += 1

    highlightOptionByText: (text) ->
        return unless @dropSelect.isOpened()

        options = @dropSelect.$drop.find('.drop-select-option').toArray()
        currentHighlightedIndex = @dropSelect.$drop.find('.drop-select-option-highlight').index()
        return unless currentHighlightedIndex?

        isRepeatedCharacter = strIsRepeatedCharacter text

        i = currentHighlightedIndex
        i += 1 if isRepeatedCharacter

        optionsChecked = 0

        while optionsChecked < options.length
            i = 0 if i > options.length - 1
            option = options[i]
            $option = $ option

            if (isRepeatedCharacter and $option.text().toLowerCase().charAt(0) is text.toLowerCase().charAt(0)) or $option.text().toLowerCase().substr(0, text.length) is text.toLowerCase()
                @highlightOption option
                @scrollDropContentToOption option
                return

            optionsChecked += 1
            i += 1

    highlightOption: (option) ->
        @dropSelect.$drop.find('.drop-select-option-highlight').removeClass('drop-select-option-highlight')
        $(option).addClass('drop-select-option-highlight')

    moveHighlight: (directionKeyCode) ->
        $currentHighlight = @dropSelect.$drop.find('.drop-select-option-highlight')

        if not $currentHighlight.length
            return @highlightOption @dropSelect.$drop.find('.drop-select-option:first')

        $newHighlight = if directionKeyCode is UP then $currentHighlight.prev() else $currentHighlight.next()
        return unless $newHighlight.length

        @highlightOption $newHighlight[0]
        @scrollDropContentToOption $newHighlight[0]

    scrollDropContentToOption: (option) ->
        $option = $ option
        $content = @dropSelect.$drop.find('.drop-content')

        if $content[0].scrollHeight > $content[0].clientHeight
            $content.scrollTop $option.offset().top - ($content.offset().top - $content.scrollTop())

    selectHighlightedOption: ->
        @selectOption @dropSelect.$drop.find('.drop-select-option-highlight')[0]

    selectOption: (option) ->
        @$select.val($(option).data('value')).change()

        setTimeout (=>
            @dropSelect.close()
            @$target.focus()
        ), 0

window.Select = Select