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
  this.renderWorker = new Worker('/assets/Color-Range-Explorer/dist/RenderWorker.js');

  this.renderWorker.onmessage = this._renderMessage.bind(this);
}

Output.prototype = Object.create(EventEmitter.prototype);

Output.prototype._onMouseOut = function(e) {
  Object.assign(this.tooltip.style, {display:"none"});
}

Output.prototype._onMouseMove = function(e) {
  let pixelIndex = 4 * (e.offsetY * this.canvas.width + e.offsetX);
  Object.assign(this.tooltip.style, {display:"block", left: `${e.pageX}px`, top: `${e.pageY + 20}px`});
  this.tooltip.innerHTML = this._valueFromPixel(this.rawImageData.data, pixelIndex).toFixed(2);
}

Output.prototype._valueFromPixel = function(data, index) {
  let r = data[index + 0];
  let g = data[index + 1];
  let b = data[index + 2];
  return (this.max - this.min) * (r  + g + b) / 3 / 255 + this.min;
}

Output.prototype._renderMessage = function(e) {
  this.outputData.data.set(e.data);
  requestAnimationFrame(()=>this.ctx.putImageData(this.outputData, 0, 0));
  this.drawing = false;
  if (this.nextRedrawRequest) {
    this.redraw();
  }
}

Output.prototype.loadImage = function(url, min, max) {
  let img = new Image();
  this.min = min;
  this.max = max;

  img.onload = ()=> {
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    this.ctx.drawImage(img, 0, 0);
    this.rawImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

    let event = new Event("resize");
    event.width = img.width;
    event.height = img.height;

    this.dispatchEvent(event);
    this.renderWorker.postMessage({
      data: this.rawImageData.data,
      min : min,
      max : max
    });

    this.outputData = this.ctx.createImageData(img.width, img.height);
    this.redraw();
  };

  img.src = url;
}

Output.prototype.redraw = function() {

  if (this.drawing || !this.nextRedrawRequest) {
    this.nextRedrawRequest = {
      redraw : true,
      mapMin : this.selector.map.min,
      mapMax : this.selector.map.max,
      scaleMin : this.selector.scale.min,
      scaleMax : this.selector.scale.max,
      levels : this.selector.map.levels,
      type : this.selector.map.type
    };
  }

  if (!this.drawing && this.outputData) {
    this.drawing = true;
    this.renderWorker.postMessage(this.nextRedrawRequest);
    this.nextRedrawRequest = null;
  }
}

