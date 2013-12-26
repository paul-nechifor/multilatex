function TreeViewContainer(tv) {
  this.tv = tv;
  this.elem = null;
  this.dirs = [];
  this.files = [];
  this.names = {};
}

TreeViewContainer.prototype.setup = function (parent) {
  this.elem = createElement(parent, 'ul');
};

TreeViewContainer.prototype.add = function (opts) {
  if (opts.name in this.names) {
    throw new Error("That name exists.");
  }
  
  var item = new TreeViewItem(this.tv, opts);
  
  var li = document.createElement('li');
  var typeList = item.isDir ? this.dirs : this.files;
  var index = this.getIndex(typeList, opts.name);
  
  if (index > 0 && index < typeList.length) {
    typeList.splice(index, 0, item);
    this.elem.insertBefore(li, typeList[index].elem);
  } else {
    typeList.push(item);
    if (item.isDir && this.files.length > 0) {
      this.elem.insertBefore(li, this.files[0].elem);
    } else {
      this.elem.appendChild(li);
    }
  }
    
  this.names[item.name] = item;
  
  item.setup(li);
  
  return item;
};

TreeViewContainer.prototype.getIndex = function (typeList, newName) {
  var i = 0;
  var len = typeList.length;
  for (; i < len; i++) {
    if (typeList[i] >= newName) {
      break;
    }
  }
  return i;
};
