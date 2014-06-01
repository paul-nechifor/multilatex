util = require './util'
Pdf = require './Pdf'

module.exports = class OutputView
  constructor: (app) ->
    @app = app
    @elem = null
    @pdf = new Pdf app

  setup: (parent, pos) ->
    @elem = util.createElement parent, 'div', 'output-view'
    @setupElem()
    @pdf.setup @elem
    @realign pos

  setupElem: ->
    s = @elem.style
    s.height = '100%'
    s.cssFloat = 'left'
    s.overflow = 'auto'
    s.position = 'relative'

  realign: (pos) ->
    s = @elem.style
    if pos.sepCollapsed[1]
      s.display = 'none'
    else
      s.display = 'block'
      s.width = pos.vertPaneRealWidth[2] + 'px'
    return

  getWidth: ->
    parseFloat @elem.style.width

  onStopDrag: (separatorSide) ->
    @pdf.redraw()
