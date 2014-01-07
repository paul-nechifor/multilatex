function Positioning(opts) {
  this.width = -1;
  this.height = -1;
  this.sepSize = 7;
  this.menuSize = 40;
  this.vertPaneRatios = opts.vertPanes || [0.2, 0.45, 0.35];
  this.sepCollapsed = opts.sepCollapsed || [false, false];
  this.vertPaneHeight = -1;
  this.vertPaneRealWidth = [-1, -1, -1];
}

Positioning.prototype.realign = function (width, height) {
  this.width = width;
  this.height = height;

  this.vertPaneHeight = height - this.menuSize;

  this.realignPanes(width);
};

Positioning.prototype.realignPanes = function (width) {
  var total = width - 2 * this.sepSize;

  // Cloning the ratios.
  var weight = this.vertPaneRatios.slice(0);

  // Eliminating the collapsed from the weights.
  if (this.sepCollapsed[0]) {
    weight[1] += weight[0];
    weight[0] = 0;
  }
  if (this.sepCollapsed[1]) {
    weight[1] += weight[2];
    weight[2] = 0;
  }

  // Transforming weights to ratios.
  var totalWeight = weight.reduce(function(pv, cv) { return pv + cv; }, 0);
  weight = weight.map(function (w) { return w / totalWeight; });

  // Transforming to pixels.
  var ws = this.vertPaneRealWidth;
  ws[0] = Math.floor(weight[0] * total);
  ws[2] = Math.floor(weight[2] * total);
  ws[1] = total - ws[0] - ws[2]; // The center gets the rest.
};

Positioning.prototype.dragPane = function (index, ammount) {
  var total = this.width - 2 * this.sepSize;
  var realWidth = this.vertPaneRatios.map(function (w) {
    return w * total;
  });

  realWidth[index] += ammount;
  realWidth[index + 1] -= ammount;

  for (var i = 0; i < 3; i++) {
    if (realWidth[i] < 150) {
      return;
    }
  }
  
  this.vertPaneRatios = realWidth.map(function (w) {
    return w / total;
  });
};

module.exports = Positioning;
