var util = require('./util');

function Pdf(app) {
  this.app = app;
  this.elem = null;
  this.doc = null;
}

Pdf.prototype.setup = function (parent) {
  this.elem = util.createElement(parent);
};

Pdf.prototype.loadNew = function (pdfPath) {
  this.doc = PDFJS.getDocument(pdfPath);
  this.redraw();
};

Pdf.prototype.redraw = function () {
  if (this.doc === null) {
    return;
  }

  $(this.elem).empty();
  var renderPage = this.renderPage.bind(this);
  this.doc.then(function (pdf) {
    var numPages = pdf.numPages;
    for (var i = 1; i <= numPages; i++) {
      pdf.getPage(i).then(renderPage);
    }
  });
};

Pdf.prototype.renderPage = function (page) {
  var realWidth = page.pageInfo.view[2];
  var panelWidth = this.app.gui.output.getWidth();
  var viewport = page.getViewport(panelWidth / realWidth);

  var pageContainer = util.createElement(this.elem, 'div', 'page-container');
  var pageStyle = pageContainer.style;
  pageStyle.width = viewport.width + 'px';
  pageStyle.height = viewport.height + 'px';

  var canvas = util.createElement(pageContainer, 'canvas');
  var ctx = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  var textLayer = util.createElement(pageContainer, 'div', 'textLayer');
  var textStyle = textLayer.style;
  textStyle.width = viewport.width + 'px';
  textStyle.height = viewport.height + 'px';

  // Scaling for HiDPI displays.
  var outputScale = getOutputScale(ctx);
  if (outputScale.scaled) {
    var cssScale = 'scale(' + (1 / outputScale.sx) + ', ' +
      (1 / outputScale.sy) + ')';
    CustomStyle.setProp('transform', canvas, cssScale);
    CustomStyle.setProp('transformOrigin', canvas, '0% 0%');

    if (textLayer) {
      CustomStyle.setProp('transform', textLayer, cssScale);
      CustomStyle.setProp('transformOrigin', textLayer, '0% 0%');
    }
  }

  ctx._scaleX = outputScale.sx;
  ctx._scaleY = outputScale.sy;
  if (outputScale.scaled) {
    ctx.scale(outputScale.sx, outputScale.sy);
  }

  page.getTextContent().then(function (textContent) {
    var textLayerBuilder = new TextLayerBuilder({
      textLayerDiv: textLayer,
      pageIndex: 0
    });

    textLayerBuilder.setTextContent(textContent);

    page.render({
      canvasContext: ctx,
      viewport: viewport,
      textLayer: textLayerBuilder
    });
  });
};

module.exports = Pdf;