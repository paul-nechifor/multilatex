function Modal(app) {
  this.app = app;
  this.editorSettings = new EditorSettingsModel();
}

Modal.prototype.setup = function () {
};

Modal.prototype.showEditorSettings = function () {
  var model = this.editorSettings;
  var inner = new EditorModalView({model: model});
  var view = new ModalView({model: model, inner: inner});
  view.$el.appendTo($('body')).modal({});

  var editor = this.app.gui.editor;

  view.listenTo(model, 'change:showLines', function () {
    editor.showGutter(model.attributes.showLines);
  });
};

var EditorSettingsModel = Backbone.Model.extend({
  defaults: {
    title: 'Editor Settings',
    showLines: true,
    fontSize: 14
  }
});

var EditorModalView = Backbone.View.extend({
  events: {
    'click #show-lines': 'toggleShowLines',
    'keypress #font-size': 'changeFontSize'
  },
  initialize: function () {
    this.template = _.template($('#editor-modal-template').html());
  },
  render: function () {
    this.setElement(this.template(this.model.toJSON()));
    return this.$el;
  },
  toggleShowLines: function () {
    this.model.set({showLines: !this.model.attributes.showLines});
  },
  changeFontSize: function () {
    var s = parseInt(this.$('#font-size').val());
    s = Math.max(8, Math.min(s, 28));
    if (this.model.attributes.fontSize !== s) {
      this.model.set({fontSize: s});
    }
  }
});

var ModalView = Backbone.View.extend({
  events: {
    'click .close': 'close',
    'click .close-btn': 'close'
  },
  initialize: function (opts) {
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
  }
});

module.exports = Modal;
