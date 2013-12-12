(function() {
  var DOWN, DropSelect, ENTER, ESCAPE, SPACE, Select, UP, getFocusedSelect, lastCharacter, searchText, searchTextTimeout, strIsRepeatedCharacter;

  DropSelect = Drop.createContext();

  ENTER = 13;

  ESCAPE = 27;

  SPACE = 32;

  UP = 38;

  DOWN = 40;

  strIsRepeatedCharacter = function(str) {
    var char, letter, _i, _len, _ref;
    if (!(str.length > 1)) {
      return false;
    }
    letter = str.charAt(0);
    _ref = str.split('');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      char = _ref[_i];
      if (char !== letter) {
        return false;
      }
    }
    return true;
  };

  getFocusedSelect = function() {
    var $focusedTarget;
    $focusedTarget = $('.drop-select-target-focused:first');
    return ($focusedTarget != null ? $focusedTarget.length : void 0) && $focusedTarget.data('select');
  };

  searchText = '';

  searchTextTimeout = void 0;

  lastCharacter = void 0;

  $(window).on('keypress', function(e) {
    var newCharacter, select;
    select = getFocusedSelect();
    if (!select) {
      return;
    }
    if (e.charCode === 0) {
      return;
    }
    newCharacter = String.fromCharCode(e.charCode);
    if (strIsRepeatedCharacter(searchText) && !strIsRepeatedCharacter(searchText + newCharacter)) {
      searchText = newCharacter;
    } else {
      searchText += newCharacter;
      if (lastCharacter === newCharacter) {
        searchText += newCharacter;
      }
    }
    lastCharacter = newCharacter;
    if (e.keyCode === SPACE) {
      e.preventDefault();
    }
    if (select.dropSelect.isOpened()) {
      select.highlightOptionByText(searchText);
    } else {
      select.selectOptionByText(searchText);
    }
    clearTimeout(searchTextTimeout);
    return searchTextTimeout = setTimeout(function() {
      return searchText = '';
    }, 500);
  });

  $(window).on('keydown', function(e) {
    var select, _ref, _ref1;
    select = getFocusedSelect();
    if (!select) {
      return;
    }
    if ((_ref = e.keyCode) === UP || _ref === DOWN || _ref === ESCAPE) {
      e.preventDefault();
    }
    if (select.dropSelect.isOpened()) {
      switch (e.keyCode) {
        case UP:
        case DOWN:
          return select.moveHighlight(e.keyCode);
        case ENTER:
          return select.selectHighlightedOption();
        case ESCAPE:
          select.dropSelect.close();
          return select.$target.focus();
      }
    } else {
      if ((_ref1 = e.keyCode) === UP || _ref1 === DOWN || _ref1 === SPACE) {
        return select.dropSelect.open();
      }
    }
  });

  Select = (function() {
    function Select(options) {
      this.options = options;
      this.$select = $(this.options.el);
      this.setupTarget();
      this.renderTarget();
      this.setupDrop();
      this.renderDrop();
      this.setupSelectEvents();
    }

    Select.prototype.setupTarget = function() {
      var $options,
        _this = this;
      $options = this.$select.find('option');
      this.$target = $('<a href="javascript:;" class="drop-select-target drop-select-theme-default"></a>');
      this.$target.data('select', this);
      this.$target.on('click', function() {
        if (!_this.dropSelect.isOpened()) {
          return _this.$target.focus();
        } else {
          return _this.$target.blur();
        }
      });
      this.$target.on('focus', function() {
        return _this.$target.addClass('drop-select-target-focused');
      });
      this.$target.on('blur', function(e) {
        if (_this.dropSelect.isOpened()) {
          if (e.relatedTarget && !$(e.relatedTarget).parents('.drop:first').is(_this.dropSelect.$drop)) {
            return _this.dropSelect.close();
          }
        } else {
          return _this.$target.removeClass('drop-select-target-focused');
        }
      });
      return this.$select.after(this.$target).hide();
    };

    Select.prototype.renderTarget = function() {
      this.$target.text(this.$select.find('option:selected').text());
      return this.$target.append('<b></b>');
    };

    Select.prototype.setupDrop = function() {
      var _this = this;
      this.dropSelect = new DropSelect({
        target: this.$target[0],
        className: 'drop-select-theme-default',
        attach: 'bottom left',
        constrainToWindow: true,
        constrainToScrollParent: false,
        openOn: 'click'
      });
      this.dropSelect.$drop.on('click', '.drop-select-option', function(e) {
        return _this.selectOption(e.target);
      });
      this.dropSelect.$drop.on('mousemove', '.drop-select-option', function(e) {
        return _this.highlightOption(e.target);
      });
      this.dropSelect.$drop.on('dropopen', function() {
        var $selectedOption, offset, _ref;
        $selectedOption = _this.dropSelect.$drop.find('[data-selected="true"]');
        if (((_ref = _this.options) != null ? _ref.autoAlign : void 0) === true) {
          offset = _this.dropSelect.$drop.offset().top - ($selectedOption.offset().top + $selectedOption.outerHeight());
          _this.dropSelect.tether.offset.top = -offset;
        }
        return _this.highlightOption($selectedOption[0]);
      });
      return this.dropSelect.$drop.on('dropclose', function() {
        return _this.$target.removeClass('drop-select-target-focused');
      });
    };

    Select.prototype.renderDrop = function() {
      var $dropSelectOptions;
      $dropSelectOptions = $('<ul class="drop-select-options"></ul>');
      this.$select.find('option').each(function() {
        var $option;
        $option = $(this);
        return $dropSelectOptions.append("<li data-selected=\"" + ($option.is(':selected')) + "\" class=\"drop-select-option\" data-value=\"" + this.value + "\">" + ($option.text()) + "</li>");
      });
      return this.dropSelect.$drop.find('.drop-content').html($dropSelectOptions[0]);
    };

    Select.prototype.setupSelectEvents = function() {
      var _this = this;
      return this.$select.on('change', function() {
        _this.renderDrop();
        return _this.renderTarget();
      });
    };

    Select.prototype.selectOptionByText = function(text) {
      var $option, currentHighlightedIndex, i, isRepeatedCharacter, option, options, optionsChecked;
      options = this.$select.find('option').toArray();
      currentHighlightedIndex = this.$select.find('option:selected').index();
      if (currentHighlightedIndex == null) {
        return;
      }
      isRepeatedCharacter = strIsRepeatedCharacter(text);
      i = currentHighlightedIndex;
      if (isRepeatedCharacter) {
        i += 1;
      }
      optionsChecked = 0;
      while (optionsChecked < options.length) {
        if (i > options.length - 1) {
          i = 0;
        }
        option = options[i];
        $option = $(option);
        if ((isRepeatedCharacter && $option.text().toLowerCase().charAt(0) === text.toLowerCase().charAt(0)) || $option.text().toLowerCase().substr(0, text.length) === text.toLowerCase()) {
          this.$select.val($option.val()).change();
          return;
        }
        optionsChecked += 1;
        i += 1;
      }
    };

    Select.prototype.highlightOptionByText = function(text) {
      var $option, currentHighlightedIndex, i, isRepeatedCharacter, option, options, optionsChecked;
      if (!this.dropSelect.isOpened()) {
        return;
      }
      options = this.dropSelect.$drop.find('.drop-select-option').toArray();
      currentHighlightedIndex = this.dropSelect.$drop.find('.drop-select-option-highlight').index();
      if (currentHighlightedIndex == null) {
        return;
      }
      isRepeatedCharacter = strIsRepeatedCharacter(text);
      i = currentHighlightedIndex;
      if (isRepeatedCharacter) {
        i += 1;
      }
      optionsChecked = 0;
      while (optionsChecked < options.length) {
        if (i > options.length - 1) {
          i = 0;
        }
        option = options[i];
        $option = $(option);
        if ((isRepeatedCharacter && $option.text().toLowerCase().charAt(0) === text.toLowerCase().charAt(0)) || $option.text().toLowerCase().substr(0, text.length) === text.toLowerCase()) {
          this.highlightOption(option);
          this.scrollDropContentToOption(option);
          return;
        }
        optionsChecked += 1;
        i += 1;
      }
    };

    Select.prototype.highlightOption = function(option) {
      this.dropSelect.$drop.find('.drop-select-option-highlight').removeClass('drop-select-option-highlight');
      return $(option).addClass('drop-select-option-highlight');
    };

    Select.prototype.moveHighlight = function(directionKeyCode) {
      var $currentHighlight, $newHighlight;
      $currentHighlight = this.dropSelect.$drop.find('.drop-select-option-highlight');
      if (!$currentHighlight.length) {
        return this.highlightOption(this.dropSelect.$drop.find('.drop-select-option:first'));
      }
      $newHighlight = directionKeyCode === UP ? $currentHighlight.prev() : $currentHighlight.next();
      if (!$newHighlight.length) {
        return;
      }
      this.highlightOption($newHighlight[0]);
      return this.scrollDropContentToOption($newHighlight[0]);
    };

    Select.prototype.scrollDropContentToOption = function(option) {
      var $content, $option;
      $option = $(option);
      $content = this.dropSelect.$drop.find('.drop-content');
      if ($content[0].scrollHeight > $content[0].clientHeight) {
        return $content.scrollTop($option.offset().top - ($content.offset().top - $content.scrollTop()));
      }
    };

    Select.prototype.selectHighlightedOption = function() {
      return this.selectOption(this.dropSelect.$drop.find('.drop-select-option-highlight')[0]);
    };

    Select.prototype.selectOption = function(option) {
      var _this = this;
      this.$select.val($(option).data('value')).change();
      return setTimeout((function() {
        _this.dropSelect.close();
        return _this.$target.focus();
      }), 0);
    };

    return Select;

  })();

  window.Select = Select;

}).call(this);
