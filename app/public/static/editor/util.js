function createElement(parent, type) {
  type = type || 'div';
  var element = document.createElement(type);
  parent.appendChild(element);
  return element;
}
