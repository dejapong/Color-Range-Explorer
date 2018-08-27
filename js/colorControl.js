var ColorControl = function(handleValues) {
  BaseControl.call(this);
  this.x = 0;
  this.y = 0;
  this.height = 20;
  this.width = 0;
  this.hovering = false;
}

ColorControl.prototype = Object.create(BaseControl.prototype);

ColorControl.prototype.resize = function (width, height) {
  this.height = height;
  this.width = width;
}

ColorControl.prototype.redraw = function(ctx, map, scale) {
  ctx.setTransform(1,0,0,1,0,0);

  let mapSize = map.max - map.min;
  let scaleSize = scale.max - scale.min;
  let imgData = ctx.createImageData(this.width, this.height);

  for (let row = 0; row < this.height; row++ ) {
    let rowPixIndex = row * this.width * 4;

    for (let column = 0; column < this.width; column++) {

      let columnFraction = (column) / this.width;
      let value = columnFraction * scaleSize + scale.min;
      let color = map.evaluate(value);
      let colPixIndex = column * 4;

      for (let k = 0; k < color.length; k++) {
        imgData.data[rowPixIndex + colPixIndex + k] = color[k];
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  if (this.hovering) {
    ctx.lineWidth = 5;
    ctx.strokeRect(0,0,this.width, this.height);
  }

}