var util = require('./util');

function Pdf(app) {
  this.app = app;
  this.scale = 0.75;
  this.elem = null;
  this.doc = null;
}

Pdf.prototype.setup = function (parent) {
  this.elem = util.createElement(parent);
};

Pdf.prototype.loadNew = function (pdfPath) {
  if (this.doc !== null) {
    $(this.elem).empty();
  }
  this.doc = PDFJS.getDocument(pdfPath);

  var renderPage = this.renderPage.bind(this);
  this.doc.then(function (pdf) {
    var numPages = pdf.numPages;
    for (var i = 1; i <= numPages; i++) {
      pdf.getPage(i).then(renderPage);
    }
  });
};

Pdf.prototype.renderPage = function (page) {
  var viewport = page.getViewport(this.scale);
  var $canvas = $("<canvas></canvas>");

  //Set the canvas height and width to the height and width of the viewport
  var canvas = $canvas.get(0);
  var context = canvas.getContext("2d");
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  //Append the canvas to the pdf container div
  var pageContainer = $('<div class="page-container"></div>');
  pageContainer.appendTo($(this.elem));
  pageContainer.css("height", canvas.height + "px").css("width", canvas.width + "px");
  pageContainer.append($canvas);

  var canvasOffset = $canvas.offset();
  var $textLayerDiv = $("<div />")
      .addClass("textLayer")
      .css("height", viewport.height + "px")
      .css("width", viewport.width + "px")
      .offset({top: canvasOffset.top, left: canvasOffset.left});

  // The following few lines of code set up scaling on the context if we are on
  // a HiDPI display
  var outputScale = getOutputScale(context);
  if (outputScale.scaled) {
    var cssScale = 'scale(' + (1 / outputScale.sx) + ', ' +
        (1 / outputScale.sy) + ')';
    CustomStyle.setProp('transform', canvas, cssScale);
    CustomStyle.setProp('transformOrigin', canvas, '0% 0%');

    if ($textLayerDiv.get(0)) {
      CustomStyle.setProp('transform', $textLayerDiv.get(0), cssScale);
      CustomStyle.setProp('transformOrigin', $textLayerDiv.get(0), '0% 0%');
    }
  }

  context._scaleX = outputScale.sx;
  context._scaleY = outputScale.sy;
  if (outputScale.scaled) {
    context.scale(outputScale.sx, outputScale.sy);
  }

  pageContainer.append($textLayerDiv);

  page.getTextContent().then(function (textContent) {

    var textLayer = new TextLayerBuilder({
      textLayerDiv: $textLayerDiv.get(0),
      pageIndex: 0
    });

    textLayer.setTextContent(textContent);

    var renderContext = {
      canvasContext: context,
      viewport: viewport,
      textLayer: textLayer
    };

    page.render(renderContext);
  });
};

module.exports = Pdf;