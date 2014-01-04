function App(opts) {
  this.opts = opts;
  this.gui = new Gui(this, opts);
  this.wss = new WebSocketServer(this);
}

App.prototype.load = function () {
  var that = this;
  
  this.gui.setup();
  this.wss.setup(function () {
    that.initProject();
  });
};

App.prototype.initProject = function () {
  var that = this;
  this.wss.callMsg('openProject', this.opts.projectId, function (msg) {
    if (msg.error) {
      alert('Project error.');
      console.log(msg.error);
      return;
    }
    
    that.setupProjectTree(msg.project);
  });
};

App.prototype.onMessage_someMessage = function (msg) {
};

App.prototype.setupProjectTree = function (project) {
    var treeView = this.gui.project.tree;
    treeView.root.changeName(project.location);
    treeView.fillWith(project.headTree, project.headFile);
};
