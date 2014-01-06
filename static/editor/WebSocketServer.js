function WebSocketServer(app) {
  this.app = app;
  this.ws = null;
  this.callbacks = {};
}

WebSocketServer.prototype.setup = function (callback) {
  var host = window.document.location.host.replace(/:.*/, '');
  this.ws = new WebSocket('ws://' + host + ':3000');

  var messageFuncs = {};
  var handler = this.app;

  for (var name in handler) {
    if (name.indexOf('onMessage_') === 0) {
      var msgName = name.substring('onMessage_'.length, name.length);
      messageFuncs[msgName] = handler[name].bind(handler);
    }
  }

  var that = this;
  this.ws.onmessage = function (event) {
    var json = JSON.parse(event.data);
    var type = json[0];
    var msg = json[1];
    var func = messageFuncs[type];
    if (func) {
      func(msg);
      return;
    }
    
    var list = that.callbacks[type];
    if (!list || list.length === 0) return;
    var head = list.shift();
    head(msg);
  };

  this.ws.onerror = this.onError.bind(this);
  this.ws.onclose = this.onClose.bind(this);
  this.ws.onopen = callback;
};

WebSocketServer.prototype.sendMsg = function (type, msg) {
  this.ws.send(JSON.stringify([type, msg]));
};

WebSocketServer.prototype.onError = function (event) {
  console.log('onerror', event);
};

WebSocketServer.prototype.onClose = function (event) {
  console.log('onclose', event);
};

WebSocketServer.prototype.callMsg = function (type, msg, callback) {
  // Add the callback to the list.
  var list = this.callbacks[type];
  if (!list) {
    list = [callback];
    this.callbacks[type] = list;
  } else {
    list.push(callback);
  }
  
  this.sendMsg(type, msg);
};