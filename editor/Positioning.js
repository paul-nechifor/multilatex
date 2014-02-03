function Positioning(prefs) {
  this.prefs = prefs;
  this.width = -1;
  this.height = -1;
  this.sepSize = 7;
  this.menuSize = 40;
  this.vertPaneRatios = prefs.vals.vertPaneRatios;
  this.sepCollapsed = prefs.vals.sepCollapsed;
  this.horizSep = 0.4;
  this.vertPaneHeight = -1;
  this.vertPaneRealWidth = [-1, -1, -1];
  this.horizRealWidth = [-1, -1];
}

Positioning.prototype.realign = function (width, height) {
  this.width = width;
  this.height = height;

  this.vertPaneHeight = height - this.menuSize;

  this.realignPanes(width);
  this.horizRealign();
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

Positioning.prototype.horizRealign = function () {
  var total = this.vertPaneHeight - this.sepSize;
  this.horizRealWidth[0] = Math.floor(total * this.horizSep);
  this.horizRealWidth[1] = total - this.horizRealWidth[0];
};

Positioning.prototype.onSepCollapse = function (index, collapsed) {
  this.sepCollapsed[index] = collapsed;
  this.prefs.set({sepCollapsed: this.sepCollapsed});
  this.prefs.save();
};

Positioning.prototype.onSepDrag = function (index, dx) {
  var total = this.width - 2 * this.sepSize;
  var realWidth = this.vertPaneRatios.map(function (w) {
    return w * total;
  });

  realWidth[index] += dx;
  realWidth[index + 1] -= dx;

  for (var i = 0; i < 3; i++) {
    if (realWidth[i] < 150) {
      return;
    }
  }

  this.vertPaneRatios = realWidth.map(function (w) {
    return w / total;
  });
};

Positioning.prototype.onSepStopDrag = function () {
  this.prefs.set({vertPaneRatios: this.vertPaneRatios});
  this.prefs.save();
};

module.exports = Positioning;
