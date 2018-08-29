import BaseControl from "BaseControl";

export default ScaleControl;

function ScaleControl(min, max) {
  BaseControl.call(this);
  this.numMajorTicks = 5;
  this.numMinorDivs = 10;
  this.dX = 0;
  this.min = min;
  this.max = max;
}

ScaleControl.prototype = Object.create(BaseControl.prototype);

ScaleControl.prototype.resize = function (width, height) {
  this.height = height;
  this.width = width;
}

ScaleControl.prototype.redraw = function(ctx) {
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = this.hovering ? 2 : 1;
  ctx.font = this.hovering ? "bold 12px Courier" :  "12px Courier";
  ctx.fillRect(this.x, this.y, this.width, this.height);
  ctx.beginPath();

  ctx.moveTo(this.x, this.y);
  ctx.lineTo(this.x + this.width, this.y);

  let labelHeight = 20;
  let labelPadding = 6;
  let majorTickSpace = (this.width / (this.numMajorTicks - 1));
  let minorTickSpace = (majorTickSpace / this.numMinorDivs );
  let majorTickLowerY = this.y + (this.height - labelHeight);
  let minorTickLowerY = this.y + (this.height - labelHeight) / 2;
  let scaleSize = this.max - this.min;
  let labelY = this.y + this.height - labelPadding;

  for (let i = 0; i < this.numMajorTicks; i ++) {

    let majorX = (this.dX % this.width) + i * majorTickSpace;

    if (majorX < -majorTickSpace) {
      majorX += this.width + majorTickSpace;
    } else if (majorX > this.width + majorTickSpace) {
      majorX -= (this.width + majorTickSpace);
    }

    ctx.moveTo(majorX, this.y);
    ctx.lineTo(majorX, majorTickLowerY);

    for (let j = 1; j < this.numMinorDivs; j ++) {
      let minorX = majorX + j * minorTickSpace;
      if (minorX < -majorTickSpace) {
        minorX += this.width + majorTickSpace;
      } else if (minorX > this.width + majorTickSpace) {
        minorX -= (this.width + majorTickSpace);
      }
      ctx.moveTo(minorX, this.y);
      ctx.lineTo(minorX, minorTickLowerY);
    }

    let label = ((this.min + scaleSize * majorX / this.width) + 0).toFixed(2);
    let labelWidth = ctx.measureText(label).width;
    let labelX = majorX - labelWidth / 2;

    if (labelX < 0 && labelX > -labelWidth) {
      labelX = majorX;
    } else if (labelX + labelWidth > this.width && labelX  < this.width) {
      labelX = majorX - labelWidth;
    }

    ctx.fillStyle = "#000000";
    ctx.fillText(label, labelX, labelY);

  }

  ctx.stroke();
}

ScaleControl.prototype.handleMouseDown = function(e) {
  e.userMouse.startingScaleControlDx = this.dX;
}

ScaleControl.prototype.handleMouseDrag = function(e) {
  this.dX = e.userMouse.startingScaleControlDx + (e.screenX - e.userMouse.startingPoint[0]);
  BaseControl.prototype.handleMouseDrag.call(this, e);
}

