var BaseControl = function() {
  EventEmitter.call(this);
  this.x = 0;
  this.y = 0;
  this.height = 40;
  this.width = 0;
  this.min = 0;
  this.max = 1;
  this.hovering = false;
}

BaseControl.prototype = Object.create(EventEmitter.prototype);

BaseControl.prototype.handleMouseOver = function(e) {
  if (!this.hovering) {
    this.hovering = true;
    return true;
  }
  return false;
}

BaseControl.prototype.handleMouseOut = function(e) {
  if (this.hovering) {
    this.hovering = false;
    return true;
  }
  return false;
}

BaseControl.prototype.handleMouseDown = function(e) {}
BaseControl.prototype.handleMouseUp = function(e) {}

BaseControl.prototype.handleWheel = function(e) {
  let change = e.deltaY;
  let event = new Event("change");
  event.dX = 0;
  event.dY = 0;
  event.scaleBy = change / this.width;
  event.scaleRatio = e.offsetX / this.width;
  this.dispatchEvent(event);
}

BaseControl.prototype.handleMouseDrag = function(e) {
  let event = new Event("change");
  event.dX = e.screenX - e.userMouse.startingPoint[0];
  event.dY = e.screenY - e.userMouse.startingPoint[1];
  event.scaleBy = 0;
  this.dispatchEvent(event);
}
