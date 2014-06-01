exports.createElement = (parent, type, classes) ->
  type = type or 'div'
  element = document.createElement type
  parent.appendChild element
  element.setAttribute 'class', classes if classes
  element
