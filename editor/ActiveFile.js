function ActiveFile(project, fid) {
  this.project = project;
  this.fid = fid;
  this.shareJsId = encodeURIComponent(project.doc._id + ' ' + fid);
  this.watcher = new FileWatcher(this);
  this.elems = {};
}

ActiveFile.prototype.load = function (callback) {
  var that = this;
  this.project.app.gui.editor.setActiveFile(this, function () {
    if (callback) {
      callback();
    }
    that.watcher.start();
    that.project.app.gui.project.setSelected(that.fid);
    that.project.app.gui.project.tree.items[that.fid].collapse(false);
  });
};

ActiveFile.prototype.close = function () {
  this.project.app.gui.editor.clearActiveFile();
  this.watcher.stop();
  this.cleanElems();
};

ActiveFile.prototype.newElems = function (elems) {
  var item = this.project.app.gui.project.tree.items[this.fid];
  if (!item) {
    throw new Error('Why does this not exit?');
  }


  // Remove the ones who don't exist anymore.
  for (var key in this.elems) {
    if (!elems[key]) {
      this.elems[key].item.remove();
      delete this.elems[key];
    }
  }

  // Add new elements, ignoring existent ones.
  for (var key in elems) {
    if (this.elems[key]) {
      continue;
    }

    var elem = elems[key];
    // So it sorts by line number and then name.
    var name = (1000000 + elem.line) + ':' + elem.name;
    var newItem = item.addItem(name, 'marker', undefined, elem);
    elem.item = newItem;
    this.elems[key] = elem;
  }
};

ActiveFile.prototype.cleanElems = function () {
  for (var key in this.elems) {
    this.elems[key].item.remove();
    delete this.elems[key];
  }
};

function FileWatcher(file) {
  this.file = file;
  this.watchers = [
    function (line) {
      // TODO: Match {, } on the inside.
      var match = line.match(/\\(sub)*section\*?\{([^}]*)\}/);
      if (!match) {
        return null;
      }
      return {
        type: match[1] + 'section',
        name: match[2]
      };
    }
  ];
  this.on = false;
}

FileWatcher.prototype.start = function () {
  this.on = true;

  var that = this;
  var next = function () {
    if (!that.on) {
      return;
    }

    var elems = that.process();
    that.file.newElems(elems);
    setTimeout(next, 5000);
  };

  next();
};

FileWatcher.prototype.stop = function () {
  this.on = false;
};

FileWatcher.prototype.process = function () {
  var text = this.file.project.app.gui.editor.editor.getSession().getValue();
  var lines = text.split('\n');

  var elems = {};

  var i, j, lenI, lenJ;
  var line, res;

  for (i = 0, lenI = lines.length; i < lenI; i++) {
    line = lines[i];
    for (j = 0, lenJ = this.watchers.length; j < lenJ; j++) {
      res = this.watchers[j](line);
      if (res) {
        elems[res.type + ':' + res.name + ':' + (i + 1)] = {
          name: res.name,
          type: res.type,
          line: i + 1
        };
      }
    }
  }

  return elems;
};

module.exports = ActiveFile;
