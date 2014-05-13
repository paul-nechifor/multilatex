Gui = require './Gui'
WebSocketServer = require './WebSocketServer'
Prefs = require './Prefs'
Project = require './Project'

module.exports = class App
  constructor: (@opts) ->
    @wss = new WebSocketServer this
    @userDoc = null
    @prefs = null
    @gui = null
    @project = new Project this, @opts.projectId
    @actions = {}

  load: ->
    @wss.setup =>
      @loadUserDoc =>
        @prefs = new Prefs this, @userDoc.prefs
        @gui = new Gui this, @opts
        @gui.setup()
        @setupActions()
        @project.load()

  setupActions: ->
    @actions.build = @project.build.bind @project
    @actions.commit = @project.commit.bind @project
    @actions.editorSettings = @gui.modal.showEditorSettings.bind @gui.modal
    @actions.fullscreen = @gui.toggleFullscreen.bind @gui
    @actions.showBuildLog = @gui.modal.showBuildLog.bind @gui.modal

  loadUserDoc: (cb) ->
    @wss.callMsg 'getUserDoc', 1, (msg) =>
      return @panic(msg.error) if msg.error
      @userDoc = msg.userDoc
      cb()

  onMessage_notif: (msg) ->
    @gui.project.notif.add msg

  panic: (error) ->
    alert 'Fatal error.'
    console.log error
    console.trace()
