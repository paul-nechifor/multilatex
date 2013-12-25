function createElement(parent, type, classes) {
  type = type || 'div';
  var element = document.createElement(type);
  parent.appendChild(element);
  if (classes) {
    element.setAttribute('class', classes);
  }
  return element;
}
