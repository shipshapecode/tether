Tether.modules.push
  position: ({top, left}) ->
    return unless @options.shift

    result = (val) ->
      if typeof val is 'function'
        val.call @, {top, left}
      else
        val

    shift = @options.shift.split(' ')
    shift[1] or= shift[0]

    [shiftTop, shiftLeft] = shift
    
    top += parseFloat(result shiftTop, 10)
    left += parseFloat(result shiftLeft, 10)

    {top, left}
