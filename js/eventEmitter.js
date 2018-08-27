function EventEmitter() {
  this.listeners = {};
}

EventEmitter.prototype.addEventListener = function(type, callback) {

  if (!(type in this.listeners)) {
    this.listeners[type] = [];
  }

  let index = this.listeners[type].indexOf(callback);

  if (index == -1) {
    this.listeners[type].push(callback);
  }
}

EventEmitter.prototype.removeEventListener = function(type, callback) {

  if ((type in this.listeners)) {
    let index = this.listeners[type].indexOf(callback);
    if (index > -1) {
      this.listeners[type].splice(index, 1);
    }
  }

  return index;
}

EventEmitter.prototype.dispatchEvent = function(event) {

  if (event.type in this.listeners) {

    var callbacks = this.listeners[event.type];

    for (var i = 0, l = callbacks.length; i < l; i++) {
      callbacks[i].call(this, event);
    }

    return !event.defaultPrevented;
  } else {
    return true;
  }

}
