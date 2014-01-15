function Modal(app) {
  this.app = app;
}

Modal.prototype.setup = function () {
};

Modal.prototype.showEditorSettings = function () {
  var prefs = this.app.prefs;
  var onStart = {
    editorFontSize: prefs.vals.editorFontSize,
    editorShowLines: prefs.vals.editorShowLines
  };

  var model = new EditorSettingsModel(onStart);
  var opts = {
    model: model,
    inner: new EditorModalView({model: model}),
    onAccept: function () {
      prefs.save();
    },
    onReject: function () {
      prefs.set(onStart);
    }
  };

  this.newModal(opts, onStart);
};

Modal.prototype.newModal = function (opts, listenTo) {
  var view = new ModalView(opts);
  view.$el.appendTo($('body')).modal({});

  var prefs = this.app.prefs;

  var change = function (key) {
    return function () {
      var vals = {};
      vals[key] = opts.model.attributes[key];
      prefs.set(vals);
    };
  };

  for (var key in listenTo) {
    view.listenTo(opts.model, 'change:' + key, change(key));
  }
};

var EditorSettingsModel = Backbone.Model.extend({
  defaults: {
    title: 'Editor Settings',
    editorShowLines: true,
    editorFontSize: 14
  }
});

var EditorModalView = Backbone.View.extend({
  events: {
    'click #show-lines': 'toggleShowLines',
    'click .less-btn': 'decreaseFontSize',
    'click .more-btn': 'increaseFontSize',
    'change input#font-size': 'changeFontSize',
    'keypress input#font-size': 'changeFontSize'
  },
  initialize: function () {
    this.template = _.template($('#editor-modal-template').html());
  },
  render: function () {
    this.setElement(this.template(this.model.toJSON()));
    return this.$el;
  },
  toggleShowLines: function () {
    this.model.set({editorShowLines: !this.model.attributes.editorShowLines});
  },
  changeFontSize: function () {
    var that = this;
    // Timeout to process the current key.
    setTimeout(function () {
      var size = parseInt(this.$('#font-size').val());
      that.updateFontSize(size);
    }, 0);
  },
  decreaseFontSize: function () {
    var size = parseInt(this.$('#font-size').val());
    this.updateFontSize(size - 1);
  },
  increaseFontSize: function () {
    var size = parseInt(this.$('#font-size').val());
    this.updateFontSize(size + 1);
  },
  updateFontSize: function (size) {
    if (isNaN(size)) {
      return;
    }
    size = Math.max(8, Math.min(size, 28));
    if (this.model.attributes.editorFontSize !== size) {
      this.model.set({editorFontSize: size});
    }
    this.$('#font-size').val(size);
  }
});

var ModalView = Backbone.View.extend({
  events: {
    'click .close': 'close',
    'click .close-btn': 'close',
    'click .save-btn': 'save'
  },
  initialize: function (opts) {
    this.opts = opts;
    this.template = _.template($('#modal-template').html());
    this.inner = opts.inner;
    this.render();
  },
  render: function () {
    this.setElement(this.template(this.model.toJSON()));
    this.inner.render().appendTo(this.$('.modal-body'));
  },
  close: function () {
    this.remove();
    this.opts.onReject();
  },
  save: function () {
    this.remove();
    this.opts.onAccept();
  }
});

module.exports = Modal;
