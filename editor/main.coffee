App = require './App'

main = ->
  # TODO: If the resolution is too small, go back since the editor is not
  # supported on mobile.

  app = new App
    workspaceElem: $('#workspace').get 0
    menuElem: $('#menu').get 0
    projectId: window.projectId
  app.load()

  window.showBuildLog = ->
    app.actions.showBuildLog()

  window.gotoFileLine = (fileId, lineNo) ->
    app.gui.editor.gotoFileLine fileId, lineNo

$(document).ready main
