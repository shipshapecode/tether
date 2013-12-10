Tether.modules.push
  position: ({top, left}) ->
    return unless @options.shift

    shift = @options.shift.split(' ')
    shift[1] or= shift[0]

    [shiftTop, shiftLeft] = shift
    
    top += parseFloat(shiftTop, 10)
    left += parseFloat(shiftLeft, 10)

    {top, left}
