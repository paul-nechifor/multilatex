$(document).ready(function () {
  var form = $('.form-create');

  var location = form.find('.location');

  function showError(error) {
    form.find('.alert').show();
    form.find('.alert p').text(JSON.stringify(error));
  }

  form.submit(function (event) {
    event.preventDefault();

    var postData = {
      location: location.val()
    };

    $.post('/api/create', postData, function (data) {
      if (!data.ok) {
        showError(data.error);
        return;
      }

      window.location = data.createdLocation;
    });
  });
});

var SubModel = Backbone.Model.extend({
  defaults: {
    title: 'Sub',
    active: false,
    icon: ''
  }
});

var NewModel = SubModel.extend({
  defaults: _.extend({}, SubModel.prototype.defaults, {
    title: 'New',
    icon: 'plus-sign',
    projectTitle: 'New Project',
    projectLocation: 'new-location'
  })
});

var UploadModel = SubModel.extend({
  defaults: _.extend({}, SubModel.prototype.defaults, {
    title: 'Upload',
    icon: 'cloud-upload'
  })
});

var SubTabView = Backbone.View.extend({
  tagName: 'li',
  template: _.template($('#sub-tab-template').html()),
  events: {
    'click a' : 'setActive'
  },
  initialize: function () {
    this.listenTo(this.model, 'change', this.render);
  },
  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    if (this.model.attributes.active) {
      this.$el.addClass('active');
    } else {
      this.$el.removeClass('active');
    }
    return this;
  },
  setActive: function (active) {
    var what = active !== undefined ? active : true;
    if (this.model.attributes.active === what) {
      return;
    }
    this.model.set({active: what});
  }
});

var NewView = Backbone.View.extend({
  el: $('#new'),

  initialize: function () {
    this.listenTo(this.model, 'change:active', this.render);
    this.render();
  },
  render: function () {
    this.$el.get(0).style.display =
        this.model.attributes.active ? 'block' : 'none';
  }
});

var UploadView = Backbone.View.extend({
  el: $('#upload'),

  initialize: function () {
    this.listenTo(this.model, 'change:active', this.render);
    $('#fileupload').fileupload({
      url: '/api/upload',
      dataType: 'json',
      done: this.onDone.bind(this),
      progressall: this.onProgressAll.bind(this)
    }).prop('disabled', !$.support.fileInput)
    .parent().addClass($.support.fileInput ? undefined : 'disabled');
    this.render();
  },

  render: function () {
    this.$el.get(0).style.display =
      this.model.attributes.active ? 'block' : 'none';
  },

  onProgressAll: function (e, data) {
    var progress = parseInt(data.loaded / data.total * 100, 10);
    $('#progress .progress-bar').css('width', progress + '%');
  },

  onDone: function (e, data) {
    var res = data.result;

    if (!res.ok) {
      this.cleanUp();
      this.error(res.error);
      return;
    }

    window.location = res.createdLocation;
  },
  cleanUp: function () {
    this.$el.empty();
  },
  error: function (text) {
    var errorTemplate = _.template($('#alert-template').html());
    this.$el.html(errorTemplate({text: text}));
  }
});

var AppView = Backbone.View.extend({
  initialize: function (obj) {
    this.activeTab = null;
    this.subs = obj.subs;
    this.tabsUl = $('#tabs-ul');
    this.subs.each(this.addOne, this);
    this.listenTo(this.subs, 'change:active', this.onActivate);
    this.subs.models[0].set({active: true});
  },
  addOne: function (sub) {
    var v = new SubTabView({model: sub});
    this.tabsUl.append(v.render().el);
  },
  onActivate: function (tab) {
    if (!tab.attributes.active) {
      return;
    }
    if (this.activeTab) {
      this.activeTab.set({active: false});
    }
    this.activeTab = tab;
  }
});

function main() {
  var newM = new NewModel();
  var uploadM = new UploadModel();
  var subs = new Backbone.Collection();
  subs.add(newM);
  subs.add(uploadM);
  var newV = new NewView({model: newM});
  var uploadV = new UploadView({model: uploadM});

  var app = new AppView({
    subs: subs
  });
}

$(document).ready(main);
