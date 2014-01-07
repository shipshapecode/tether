isMobile = $(window).width() < 567

MIRROR_ATTACH =
    left: 'right'
    right: 'left'
    top: 'bottom'
    bottom: 'top'
    middle: 'middle'
    center: 'center'

sortAttach = (str) ->
    [first, second] = str.split(' ')

    if first in ['left', 'right']
        [first, second] = [second, first]

    [first, second].join(' ')

init = ->
    # setupHero()
    setupBrowserDemo()

setupHero = ->
    $target = $('.tether-target-demo')

    targetAttachments = [
        'top left'
        'left top'
        'left middle'
        'left bottom'
        'bottom left'
        'bottom center'
        'bottom right'
        'right bottom'
        'right middle'
        'right top'
        'top right'
        'top center'
    ]

    if isMobile
        targetAttachments = [
            'top left'
            'bottom left'
            'bottom right'
            'top right'
        ]

    window.drops = {}

    for targetAttachment in targetAttachments
        dropAttach = targetAttachment.split(' ')
        dropAttach[0] = MIRROR_ATTACH[dropAttach[0]]
        dropAttach = dropAttach.join(' ')

        drops[targetAttachment] = new Tether
            target: $target[0]
            element: $ '<div style="height: 50px; width: 50px"></div>'
            className: 'tooltip-theme-arrows'
            classPrefix: 'tooltip'
            enabled: false
            offset: '0 0'
            targetOffset: '0 0'
            attachment: sortAttach(dropAttach)
            targetAttachment: sortAttach(targetAttachment)
            constraints: [
                to: 'window'
                pin: true
                attachment: 'together'
            ]

        # TODO - remove once zackbloom fixes
        $(drops[targetAttachment].drop).addClass "drop-attached-#{ targetAttachment.replace(' ', '-')}"

    openIndex = 0
    frames = 0
    frameLengthMS = 10

    openAllDrops = ->
        for targetAttachment, drop of drops
            drop.open()

    openNextDrop = ->
        for targetAttachment, drop of drops
            drop.close()

        drops[targetAttachments[openIndex]].open()
        drops[targetAttachments[(openIndex + 6) % targetAttachments.length]].open()

        openIndex = (openIndex + 1) % targetAttachments.length

        if frames > 5
            finalDropState()
            return

        frames += 1

        setTimeout openNextDrop, frameLengthMS * frames

    finalDropState = ->
        drops['top left'].$dropContent.html('Marrying DOM elements for life.')
        drops['bottom right'].$dropContent.html('<a class="button" href="http://github.com/HubSpot/tether">★ On Github</a>')
        drops['top left'].open()
        drops['bottom right'].open()

    if isMobile
        drops['top left'].open()
        drops['bottom right'].open()

    else
        openNextDrop()

setupBrowserDemo = ->
    $browserDemo = $('.browser-demo.showcase')

    $startPoint = $('.browser-demo-start-point')
    $stopPoint = $('.browser-demo-stop-point')

    $iframe = $('.browser-window iframe')
    $browserContents = $('.browser-content .browser-demo-inner')

    $sections = $('.browser-demo-section')

    $('body').append """
        <style>
            table.showcase.browser-demo.fixed-bottom {
                top: #{ $sections.length }00%
            }
        </style>
    """

    $(window).scroll ->
        scrollTop = $(window).scrollTop()

        if $startPoint.position().top < scrollTop and scrollTop + window.innerHeight < $stopPoint.position().top
            $browserDemo.removeClass('fixed-bottom')
            $browserDemo.addClass('fixed')

            $sections.each ->
                $section = $ @

                if $section.position().top < scrollTop < $section.position().top + $section.outerHeight()
                    setSection $section.data('section')

                return true

        else
            $browserDemo.removeAttr('data-section')
            $browserDemo.removeClass('fixed')

            if scrollTop + window.innerHeight > $stopPoint.position().top
                $browserDemo.addClass('fixed-bottom')
            else
                $browserDemo.removeClass('fixed-bottom')

    $iframe.load ->
        iframeWindow = $iframe[0].contentWindow

        $items = $iframe.contents().find('.item')

        $items.each (i) ->
            $item = $(@)

            drop = new iframeWindow.Tether
                target: $item[0]
                className: 'drop-theme-arrows'
                targetAttach: 'right top'
                attach: 'left top'
                constraints: [
                    to: 'window'
                    pin: true
                    attachment: 'together'
                ]
                element: $ '''
                    <ul>
                        <li>Action&nbsp;1</li>
                        <li>Action&nbsp;2</li>
                        <li>Action&nbsp;3</li>
                    </ul>
                '''

            $item.data('drop', drop)

            # TODO - remove once zackbloom fixes
            drop.$drop.addClass "drop-attached-right-top"

    scrollInterval = undefined
    scrollTop = 0
    scrollTopDirection = 1

    setSection = (section) ->
        $browserDemo.attr('data-section', section)

        $('.section-copy').removeClass('active')
        $(""".section-copy[data-section="#{ section }"]""").addClass('active')

        openExampleItem = ->
            if isMobile
                $iframe.contents().find('.item:first').data().drop.open()
            else
                $iframe.contents().find('.item:eq(2)').data().drop.open()

        closeAllItems = ->
            $iframe.contents().find('.item').each -> $(@).data().drop.close() or true

        scrollLeftSection = ->
            scrollInterval = setInterval ->
                $iframe.contents().find('.left').scrollTop scrollTop
                scrollTop += scrollTopDirection
                if scrollTop > 50
                    scrollTopDirection = -1
                if scrollTop < 0
                    scrollTopDirection = 1
            , 30

        stopScrollingLeftSection = ->
            clearInterval scrollInterval

        switch section

            when 'what'
                closeAllItems()
                openExampleItem()
                stopScrollingLeftSection()

            when 'how'
                closeAllItems()
                openExampleItem()
                stopScrollingLeftSection()
                scrollLeftSection()

            when 'why'
                closeAllItems()
                openExampleItem()
                stopScrollingLeftSection()
                scrollLeftSection()

            when 'outro'
                closeAllItems()
                openExampleItem()
                stopScrollingLeftSection()

init()
