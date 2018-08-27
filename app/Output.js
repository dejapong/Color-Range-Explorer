import EventEmitter from "EventEmitter";

export default Output;

function Output(selector) {
  EventEmitter.call(this);

  this.container = document.createElement("div");
  this.tooltip = document.createElement("div");
  Object.assign(this.tooltip.style, {display:"none", position: "absolute"})

  this.canvas = document.createElement("canvas");
  this.container.appendChild(this.canvas);
  this.container.appendChild(this.tooltip);
  this.ctx = this.canvas.getContext('2d');
  this.selector = selector;

  this.canvas.addEventListener("mousemove", this._onMouseMove.bind(this))
  this.canvas.addEventListener("mouseout", this._onMouseOut.bind(this))
  this.tooltip.className = "colorRangeTooltip";
}

Output.prototype = Object.create(EventEmitter.prototype);

Output.prototype._onMouseOut = function(e) {
  Object.assign(this.tooltip.style, {display:"none"});
}

Output.prototype._onMouseMove = function(e) {
  let pixelIndex = 4 * (e.offsetY * this.canvas.width + e.offsetX);
  Object.assign(this.tooltip.style, {display:"block", left: e.pageX, top: e.pageY + 20})
  this.tooltip.innerHTML = this._valueFromPixel(this.rawImageData.data, pixelIndex).toFixed(2);
}

Output.prototype._valueFromPixel = function(data, index) {
  let r = data[index + 0];
  let g = data[index + 1];
  let b = data[index + 2];
  return (r  + g + b) / 3 / 255;
}

Output.prototype.loadImage = function(url) {
  let img = new Image();

  img.onload = ()=> {
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    this.ctx.drawImage(img, 0, 0);
    this.rawImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

    let event = new Event("resize");
    event.width = img.width;
    event.height = img.height;

    this.dispatchEvent(event);
    requestAnimationFrame(this.redraw.bind(this));
  };

  img.src = url;
}

Output.prototype.redraw = function() {

  if (this.rawImageData && this.selector) {

    let outputData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
    let inputData = this.rawImageData;

    for (let i =0; i < inputData.data.length ; i +=4) {
      let value = this._valueFromPixel(inputData.data, i);
      let colors = this.selector.evaluate(value);
      let dr = colors[0];
      let dg = colors[1];
      let db = colors[2];
      let da = inputData.data[i + 3];

      outputData.data[i + 0] = dr;
      outputData.data[i + 1] = dg;
      outputData.data[i + 2] = db;
      outputData.data[i + 3] = da;
    }

    this.ctx.putImageData(outputData, 0, 0)
  }
}
