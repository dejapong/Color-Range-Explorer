"use strict";
import EventEmitter from "EventEmitter";
import ColorControl from "ColorControl";
import ScaleControl from "ScaleControl";
import ColorMap from "ColorMap";
import Hammer from "hammerjs"
export default RangeControls;

function RangeControls(options, width = 400, height = 100) {

	EventEmitter.call(this);

	options = Object.assign({
		scaleMin : 0,
		scaleMax : 1,
		mapMin : 0,
		mapMax : 1,
    numLevels : 5
  }, options );
	this.options = options;
	this.container = document.createElement("div");
	this.canvas = document.createElement("canvas");
	this.controls = document.createElement("div");
	this.canvas.className = "colorRangeControls"
	this.container.appendChild(this.canvas);
	this.container.appendChild(this.controls);

	Object.assign(this.canvas.style, {width:"100%",height:`${height}px`,background:"#000"});
	this.ctx = this.canvas.getContext("2d");
	this.width = width;
	this.height = height;

	this.colorBar = new ColorControl();
	this.scale = new ScaleControl(options.scaleMin, options.scaleMax);
	this.map = new ColorMap(options.mapMin, options.mapMax, options.numLevels);
	this.userMouse = { down : false };

	window.addEventListener("mousemove", this._onMouseMove.bind(this));
	window.addEventListener("mousedown", this._onMouseDown.bind(this));
	window.addEventListener("mouseup", this._onMouseUp.bind(this));
	window.addEventListener("dblclick", this._onMouseDblClick.bind(this));
	window.addEventListener("wheel", this._onWheel.bind(this));

	let hammer = new Hammer(this.canvas);
	hammer.get('pinch').set({ enable: true });
	hammer.on("pinchstart", this._onPinchStart.bind(this));
	hammer.on("pinch", this._onPinch.bind(this));

	window.addEventListener("touchmove", this._onTouchMove.bind(this), false);
	window.addEventListener("touchstart", this._onTouchStart.bind(this), false);
	window.addEventListener("touchend", this._onTouchEnd.bind(this), false);

	this.colorBar.addEventListener("change", this._onColorControlChange.bind(this));
	this.scale.addEventListener("change", this._onScaleControlChange.bind(this));

	this.resize(this.width, this.height);
};

RangeControls.prototype = Object.create(EventEmitter.prototype);

RangeControls.prototype._onColorControlChange = function(e) {

	if (e.dX) {
		let unitsMoved = (this.scale.max - this.scale.min) * e.dX / this.width;
		this.map.min = this.userMouse.startingMapValues[0] + unitsMoved;
		this.map.max = this.userMouse.startingMapValues[1] + unitsMoved;
	}

	if (e.scaleBy) {
		let increasedSize = e.scaleBy * (this.map.max - this.map.min);
		let minPos = this.scale.min * (this.map.max - this.map.min);
		let maxPos = this.scale.max * (this.map.max - this.map.min);
		let cursorScaleControlValue = e.scaleRatio * (this.scale.max - this.scale.min) + this.scale.min;
		let mapFrac = (cursorScaleControlValue - this.map.min)/ (this.map.max - this.map.min);
		this.map.min -= increasedSize * mapFrac;
		this.map.max += increasedSize * (1 - mapFrac);
	}

	this.dispatchEvent(e);
	requestAnimationFrame(this.redraw.bind(this));
}

RangeControls.prototype._onScaleControlChange = function(e) {

	if (e.dX) {
		let unitsMoved = (this.scale.max - this.scale.min) * e.dX / this.width;
		this.scale.min = this.userMouse.startingScaleControlValues[0] - unitsMoved;
		this.scale.max = this.userMouse.startingScaleControlValues[1] - unitsMoved;
		this.map.min = this.userMouse.startingMapValues[0] - unitsMoved;
		this.map.max = this.userMouse.startingMapValues[1] - unitsMoved;
	}

	if (e.scaleBy) {
		let increasedSize = e.scaleBy * (this.scale.max - this.scale.min);
		let minPos = this.scale.min * (this.scale.max - this.scale.min);
		let maxPos = this.scale.max * (this.scale.max - this.scale.min);
		let cursorScaleControlValue = e.scaleRatio * (this.scale.max - this.scale.min) + this.scale.min;
		let scaleFrac = (cursorScaleControlValue - this.scale.min) / (this.scale.max - this.scale.min);
		this.setScaleMin(this.scale.min - increasedSize * scaleFrac)
		this.setScaleMax(this.scale.max + increasedSize * (1 - scaleFrac));
	}

	this.dispatchEvent(e);
	requestAnimationFrame(this.redraw.bind(this));
}

RangeControls.prototype._adjustScaleControl = function(distance, origin) {

	let cursorScaleControlValue = origin * (this.scale.max - this.scale.min) + this.scale.min;
	let mapFrac = (cursorScaleControlValue - this.map.min)/ (this.map.max - this.map.min);
	let scaleAmount = distance * (this.map.max-this.map.min) / (this.scale.max-this.scale.min);

	this.map.min -= scaleAmount * mapFrac;
	this.map.max += scaleAmount * (1 - mapFrac);

}

RangeControls.prototype._initUserMouse = function(e) {
	if (e.offsetY > (this.height - this.scale.height)) {
		this.userMouse.down = this.scale;
	} else {
		this.userMouse.down = this.colorBar;
	}
	this.userMouse.startingMapValues = [this.map.min, this.map.max];
	this.userMouse.startingScaleControlValues = [this.scale.min, this.scale.max];
	this.userMouse.startingPoint = [e.screenX, e.screenY];
	e.userMouse = this.userMouse;
}

RangeControls.prototype._onMouseDown = function(e){
	if (e.target == this.canvas) {
		this._initUserMouse(e);
		this.userMouse.down.handleMouseDown(e);
	}
}

RangeControls.prototype._onMouseDblClick = function(e){
	if (e.target == this.canvas) {
		this.reset();
	}
}

RangeControls.prototype._onWheel = function(e){
	if (e.target == this.canvas) {
		this._initUserMouse(e);
		this.userMouse.down.handleWheel(e)
		e.preventDefault();
		this.userMouse.down = null;
	}
}

RangeControls.prototype._onMouseMove = function(e){

	if (this.userMouse.down) {
		e.userMouse = this.userMouse;
		this.userMouse.down.handleMouseDrag(e)
	}

	let redraw = false;
	if (e.target == this.canvas) {
		if (e.offsetY > (this.height - this.scale.height)) {
			redraw = this.scale.handleMouseOver(e) ||
							 this.colorBar.handleMouseOut(e);
		} else {
			redraw = this.colorBar.handleMouseOver(e) ||
							 this.scale.handleMouseOut(e);
		}
	} else {
		redraw = this.colorBar.handleMouseOut(e) ||
						 this.scale.handleMouseOut(e);
	}

	if (redraw) {
		requestAnimationFrame(this.redraw.bind(this));
	}
}

RangeControls.prototype._onMouseUp = function(e){
	if (this.userMouse.down) {
		e.userMouse = this.userMouse;
		this.userMouse.down.handleMouseUp(e)
		this.userMouse.down = null;
	}
}

RangeControls.prototype._onTouchStart = function(e){
	if (e.target == this.canvas) {
		document.body.style.overflow = "hidden";
		e.screenX = e.touches[0].screenX;
		e.screenY = e.touches[0].screenY;
		e.offsetX = e.touches[0].pageX - e.touches[0].target.offsetLeft;
		e.offsetY = e.touches[0].pageY - e.touches[0].target.offsetTop;
		this._initUserMouse(e);
		this.userMouse.down.handleMouseDown(e);
	}
}

RangeControls.prototype._onTouchEnd = function(e){
	document.body.style.overflow = "auto";
	if (this.userMouse.down) {
		e.userMouse = this.userMouse;
		this.userMouse.down.handleMouseUp(e)
		this.userMouse.down = null;
	}
}

RangeControls.prototype._onTouchMove = function(e){

	if (this.userMouse.down) {
		e.screenX = e.touches[0].screenX;
		e.screenY = e.touches[0].screenY;
		e.userMouse = this.userMouse;
		this.userMouse.down.handleMouseDrag(e)
	}
}

RangeControls.prototype._onPinchStart = function(e){
	this.userMouse.lastScale = 1;
}

RangeControls.prototype._onPinch = function(e){
	e.offsetX = e.center.x - e.target.offsetLeft;
	e.offsetY = e.center.y - e.target.offsetTop;
	e.deltaY = this.width * (e.scale - this.userMouse.lastScale);
	this.userMouse.lastScale = e.scale;

	console.log(e.deltaY, );
	this._initUserMouse(e);
	this.userMouse.down.handleWheel(e)
	this.userMouse.down = null;
}

RangeControls.prototype.redraw = function() {
	this.colorBar.redraw(this.ctx, this.map, this.scale);
	this.scale.redraw(this.ctx);
}

RangeControls.prototype.resize = function(width, height) {
	this.canvas.width = width;
	this.canvas.height = height;
	this.colorBar.resize(width, height - this.scale.height);
	this.scale.resize(width, this.scale.height);
	this.scale.y = height - this.scale.height;
	Object.assign(this.canvas.style, {width:width, height:height});
	requestAnimationFrame(this.redraw.bind(this));
	this.dispatchEvent(new Event("change"));
}

RangeControls.prototype.evaluate = function(value) {
	return this.map.evaluate(
		Math.max(this.scale.min,
			Math.min(this.scale.max, value)));
}

RangeControls.prototype.setScaleMin = function(value) {
	/* setting the scale min value should not change the visible portion of the color map
	 it is effectively a color scale about the max scale value */
	let newValue = parseFloat(value);
	if (newValue < this.scale.max) {
		let newSize = this.scale.max - newValue;
		let oldSize = this.scale.max - this.scale.min;
		this._adjustScaleControl(newSize - oldSize, 1);
		this.scale.min = newValue;
	}
	this.dispatchEvent(new Event("change"));
	requestAnimationFrame(this.redraw.bind(this));
}

RangeControls.prototype.setScaleMax = function(value) {
	/* setting the scale max value should not change the visible portion of the color map
	 it is effectively a color scale about the min scale value */
	let newValue = parseFloat(value);
	if (newValue > this.scale.min) {
		let newSize = newValue - this.scale.min;
		let oldSize = this.scale.max - this.scale.min;
		this._adjustScaleControl(newSize - oldSize, 0);
		this.scale.max = newValue;
	}
	this.dispatchEvent(new Event("change"));
	requestAnimationFrame(this.redraw.bind(this));
}

RangeControls.prototype.setLevels = function(value) {
	this.map.levels = parseFloat(value);
	this.dispatchEvent(new Event("change"));
	requestAnimationFrame(this.redraw.bind(this));
}

RangeControls.prototype.reset = function() {
	this.map.min = this.options.imageMin;
	this.map.max = this.options.imageMax;
	this.scale.min = this.options.imageMin;
	this.scale.max = this.options.imageMax;
	this.scale.dX = 0;
	this.dispatchEvent(new Event("change"));
	requestAnimationFrame(this.redraw.bind(this));
}
