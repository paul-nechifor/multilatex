var util = require('./util');

var MENU = [
  {
    group: 0,
    title: 'Project',
    glyph: 'folder-open',
    subs: [
      {title: 'Commit', action: 'commit'},
      {title: 'Download project', href: 'head?action=download'}
    ]
  },
  {
    group: 0,
    title: 'Editor',
    glyph: 'align-left',
    subs: [
      {title: 'Settings', action: 'editorSettings'}
    ]
  },
  {
    group: 1,
    title: 'Build',
    action: 'build',
    glyph: 'play'
  },
  {
    group: 1,
    title: 'View Build Log',
    action: 'showBuildLog',
    glyph: 'list-alt'
  },
  {
    group: 2,
    title: 'Fullscreen',
    action: 'fullscreen',
    glyph: 'fullscreen',
    tooltipPlacement: 'left'
  }
];

function MenuBar(app, opts) {
  this.app = app;
  this.elem = opts.menuElem;
  this.groups = [
    new MenuGroup(this, 'main-menu', false),
    new MenuGroup(this, 'buttons-menu', false),
    new MenuGroup(this, 'right-menu', true)
  ];
}

MenuBar.prototype.setup = function () {
  for (var i = 0, len = this.groups.length; i < len; i++) {
    this.groups[i].setup(this.elem);
  }

  this.constructIt();
};

MenuBar.prototype.constructIt = function () {
  for (var i = 0, len = MENU.length; i < len; i++) {
    this.add(MENU[i]);
  }
};

MenuBar.prototype.add = function (opts) {
  this.groups[opts.group].add(opts);
};

function MenuGroup(bar, id, right) {
  this.bar = bar;
  this.id = id;
  this.right = right;
  this.elem = null;
  this.items = [];
}

MenuGroup.prototype.setup = function (parent) {
  this.elem = util.createElement(parent, 'ul', 'nav navbar-nav');
  this.elem.setAttribute('id', this.id);
  if (this.right) {
    $(this.elem).addClass('navbar-right');
  }
};

MenuGroup.prototype.add = function (opts) {
  var item = new MenuItem(this, opts);
  this.items.push(item);
  item.setup(this.elem);
};

function MenuItem(group, opts) {
  this.group = group;
  this.opts = opts;
  this.elem = null;
  this.a = null;
  this.ul = null;
  this.subs = [];
}

MenuItem.prototype.setup = function (parent) {
  this.elem = util.createElement(parent, 'li');
  this.a = util.createElement(this.elem, 'a');
  if (this.opts.href) {
    this.a.setAttribute('href', this.opts.href);
  } else {
    this.a.setAttribute('href', 'javascript:void(0)');
  }

  if (this.opts.action) {
    var actions = this.group.bar.app.actions;
    var action = this.opts.action;
    this.a.addEventListener('click', function () {
      actions[action]();
    });
  }

  $(this.a).tooltip({
    title: this.opts.title,
    placement: this.opts.tooltipPlacement || 'right'
  });

  if (this.opts.subs) {
    this.setupMenu();
  }

  if (this.opts.glyph) {
    util.createElement(this.a, 'i', 'glyphicon glyphicon-' + this.opts.glyph);
  }
};

MenuItem.prototype.setupMenu = function () {
  $(this.elem).addClass('dropdown');
  var $a = $(this.a);
  $a.addClass('dropdown-toggle');
  $a.attr('data-toggle', 'dropdown');

  this.ul = util.createElement(this.elem, 'ul', 'dropdown-menu');

  for (var i = 0, len = this.opts.subs.length; i < len; i++) {
    this.add(this.opts.subs[i]);
  }
};

MenuItem.prototype.add = function (opts) {
  var sub = new MenuSub(this, opts);
  this.subs.push(sub);
  sub.setup(this.ul);
};

function MenuSub(item, opts) {
  this.item = item;
  this.opts = opts;
  this.elem = null;
}

MenuSub.prototype.setup = function (parent) {
  this.elem = util.createElement(parent, 'li');
  var a = util.createElement(this.elem, 'a');
  a.textContent = this.opts.title;
  a.setAttribute('href', this.opts.href || 'javascript:void(0)');

  if (this.opts.action) {
    var actions = this.item.group.bar.app.actions;
    var action = this.opts.action;
    a.addEventListener('click', function () {
      actions[action]();
    });
  }
};

module.exports = MenuBar;
