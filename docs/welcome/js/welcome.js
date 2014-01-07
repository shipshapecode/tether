(function() {
  var MIRROR_ATTACH, init, isMobile, setupBrowserDemo, setupHero, sortAttach;

  isMobile = $(window).width() < 567;

  MIRROR_ATTACH = {
    left: 'right',
    right: 'left',
    top: 'bottom',
    bottom: 'top',
    middle: 'middle',
    center: 'center'
  };

  sortAttach = function(str) {
    var first, second, _ref, _ref1;
    _ref = str.split(' '), first = _ref[0], second = _ref[1];
    if (first === 'left' || first === 'right') {
      _ref1 = [second, first], first = _ref1[0], second = _ref1[1];
    }
    return [first, second].join(' ');
  };

  init = function() {
    return setupBrowserDemo();
  };

  setupHero = function() {
    var $target, dropAttach, finalDropState, frameLengthMS, frames, openAllDrops, openIndex, openNextDrop, targetAttachment, targetAttachments, _i, _len;
    $target = $('.tether-target-demo');
    targetAttachments = ['top left', 'left top', 'left middle', 'left bottom', 'bottom left', 'bottom center', 'bottom right', 'right bottom', 'right middle', 'right top', 'top right', 'top center'];
    if (isMobile) {
      targetAttachments = ['top left', 'bottom left', 'bottom right', 'top right'];
    }
    window.drops = {};
    for (_i = 0, _len = targetAttachments.length; _i < _len; _i++) {
      targetAttachment = targetAttachments[_i];
      dropAttach = targetAttachment.split(' ');
      dropAttach[0] = MIRROR_ATTACH[dropAttach[0]];
      dropAttach = dropAttach.join(' ');
      drops[targetAttachment] = new Tether({
        target: $target[0],
        element: $('<div style="height: 50px; width: 50px"></div>'),
        className: 'tooltip-theme-arrows',
        classPrefix: 'tooltip',
        enabled: false,
        offset: '0 0',
        targetOffset: '0 0',
        attachment: sortAttach(dropAttach),
        targetAttachment: sortAttach(targetAttachment),
        constraints: [
          {
            to: 'window',
            pin: true,
            attachment: 'together'
          }
        ]
      });
      $(drops[targetAttachment].drop).addClass("drop-attached-" + (targetAttachment.replace(' ', '-')));
    }
    openIndex = 0;
    frames = 0;
    frameLengthMS = 10;
    openAllDrops = function() {
      var drop, _results;
      _results = [];
      for (targetAttachment in drops) {
        drop = drops[targetAttachment];
        _results.push(drop.open());
      }
      return _results;
    };
    openNextDrop = function() {
      var drop;
      for (targetAttachment in drops) {
        drop = drops[targetAttachment];
        drop.close();
      }
      drops[targetAttachments[openIndex]].open();
      drops[targetAttachments[(openIndex + 6) % targetAttachments.length]].open();
      openIndex = (openIndex + 1) % targetAttachments.length;
      if (frames > 5) {
        finalDropState();
        return;
      }
      frames += 1;
      return setTimeout(openNextDrop, frameLengthMS * frames);
    };
    finalDropState = function() {
      drops['top left'].$dropContent.html('Marrying DOM elements for life.');
      drops['bottom right'].$dropContent.html('<a class="button" href="http://github.com/HubSpot/tether">★ On Github</a>');
      drops['top left'].open();
      return drops['bottom right'].open();
    };
    if (isMobile) {
      drops['top left'].open();
      return drops['bottom right'].open();
    } else {
      return openNextDrop();
    }
  };

  setupBrowserDemo = function() {
    var $browserContents, $browserDemo, $iframe, $sections, $startPoint, $stopPoint, scrollInterval, scrollTop, scrollTopDirection, setSection;
    $browserDemo = $('.browser-demo.showcase');
    $startPoint = $('.browser-demo-start-point');
    $stopPoint = $('.browser-demo-stop-point');
    $iframe = $('.browser-window iframe');
    $browserContents = $('.browser-content .browser-demo-inner');
    $sections = $('.browser-demo-section');
    $('body').append("<style>\n    table.showcase.browser-demo.fixed-bottom {\n        top: " + $sections.length + "00%\n    }\n</style>");
    $(window).scroll(function() {
      var scrollTop;
      scrollTop = $(window).scrollTop();
      if ($startPoint.position().top < scrollTop && scrollTop + window.innerHeight < $stopPoint.position().top) {
        $browserDemo.removeClass('fixed-bottom');
        $browserDemo.addClass('fixed');
        return $sections.each(function() {
          var $section;
          $section = $(this);
          if (($section.position().top < scrollTop && scrollTop < $section.position().top + $section.outerHeight())) {
            setSection($section.data('section'));
          }
          return true;
        });
      } else {
        $browserDemo.removeAttr('data-section');
        $browserDemo.removeClass('fixed');
        if (scrollTop + window.innerHeight > $stopPoint.position().top) {
          return $browserDemo.addClass('fixed-bottom');
        } else {
          return $browserDemo.removeClass('fixed-bottom');
        }
      }
    });
    $iframe.load(function() {
      var $items, iframeWindow;
      iframeWindow = $iframe[0].contentWindow;
      $items = $iframe.contents().find('.item');
      return $items.each(function(i) {
        var $item, drop;
        $item = $(this);
        drop = new iframeWindow.Tether({
          target: $item[0],
          className: 'drop-theme-arrows',
          targetAttach: 'right top',
          attach: 'left top',
          constraints: [
            {
              to: 'window',
              pin: true,
              attachment: 'together'
            }
          ],
          element: $('<ul>\n    <li>Action&nbsp;1</li>\n    <li>Action&nbsp;2</li>\n    <li>Action&nbsp;3</li>\n</ul>')
        });
        $item.data('drop', drop);
        return drop.$drop.addClass("drop-attached-right-top");
      });
    });
    scrollInterval = void 0;
    scrollTop = 0;
    scrollTopDirection = 1;
    return setSection = function(section) {
      var closeAllItems, openExampleItem, scrollLeftSection, stopScrollingLeftSection;
      $browserDemo.attr('data-section', section);
      $('.section-copy').removeClass('active');
      $(".section-copy[data-section=\"" + section + "\"]").addClass('active');
      openExampleItem = function() {
        if (isMobile) {
          return $iframe.contents().find('.item:first').data().drop.open();
        } else {
          return $iframe.contents().find('.item:eq(2)').data().drop.open();
        }
      };
      closeAllItems = function() {
        return $iframe.contents().find('.item').each(function() {
          return $(this).data().drop.close() || true;
        });
      };
      scrollLeftSection = function() {
        return scrollInterval = setInterval(function() {
          $iframe.contents().find('.left').scrollTop(scrollTop);
          scrollTop += scrollTopDirection;
          if (scrollTop > 50) {
            scrollTopDirection = -1;
          }
          if (scrollTop < 0) {
            return scrollTopDirection = 1;
          }
        }, 30);
      };
      stopScrollingLeftSection = function() {
        return clearInterval(scrollInterval);
      };
      switch (section) {
        case 'what':
          closeAllItems();
          openExampleItem();
          return stopScrollingLeftSection();
        case 'how':
          closeAllItems();
          openExampleItem();
          stopScrollingLeftSection();
          return scrollLeftSection();
        case 'why':
          closeAllItems();
          openExampleItem();
          stopScrollingLeftSection();
          return scrollLeftSection();
        case 'outro':
          closeAllItems();
          openExampleItem();
          return stopScrollingLeftSection();
      }
    };
  };

  init();

}).call(this);
