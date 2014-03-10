{getBounds, updateClasses, defer} = @Tether.Utils

@Tether.modules.push
  position: ({top, left}) ->
    {height, width} = @cache 'element-bounds', => getBounds @element

    targetPos = @getTargetBounds()

    bottom = top + height
    right = left + width

    abutted = []
    if top <= targetPos.bottom and bottom >= targetPos.top
      for side in ['left', 'right']
        if targetPos[side] in [left, right]
          abutted.push side

    if left <= targetPos.right and right >= targetPos.left
      for side in ['top', 'bottom']
        if targetPos[side] in [top, bottom]
          abutted.push side

    allClasses = []
    addClasses = []
    
    sides = ['left', 'top', 'right', 'bottom']
    allClasses.push @getClass('abutted')
    for side in sides
      allClasses.push "#{ @getClass('abutted') }-#{ side }"

    if abutted.length
      addClasses.push @getClass('abutted')
    for side in abutted
      addClasses.push "#{ @getClass('abutted') }-#{ side }"

    defer =>
      updateClasses @target, addClasses, allClasses
      updateClasses @element, addClasses, allClasses

    true
