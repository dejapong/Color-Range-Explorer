export default ColorMap;

function ColorMap(min = 0, max = 1, levels = 10) {
  this.min = min;
  this.max = max;
  this.scaleMin = 0;
  this.scaleMax = 1;
  this.scaleSize = 1;
  this.rangeSize = 1;
  this.scalingRatio = 1;
  this.rangeSize = 1;
  this.levels = levels;
  this.setType("rainbow");
}

ColorMap.types = {
  "rainbow" : function(value){
    let rnValue = this._recodedNormalizedValue(value);
    let red = rnValue * 3.5 - 1.0;
    let green = rnValue < 0.5 ? rnValue * 2.0 : rnValue * -2.0 + 2.0;
    let blue = rnValue * -2.0 + 1;
    return this._clippedNormalizedUint8Array([red, green, blue]);
  },
  "heat" :  function(value){
    let rnValue = this._recodedNormalizedValue(value);
    let red = rnValue * 3 ;
    let green = rnValue * 3 - 1;
    let blue = rnValue * 3 - 2;
    return this._clippedNormalizedUint8Array([red, green, blue]);
  },
  "twoColor" : function(value) {
    let rnValue = this._recodedNormalizedValue(value);
    let red = rnValue >= 0.5 ? 1 * rnValue: 0;
    let green = 0;
    let blue = rnValue < 0.5 ? 1 * rnValue : 0;
    return this._clippedNormalizedUint8Array([red, green, blue]);
  },
  "terrain" : function(value) {
    let rnValue = this._recodedNormalizedValue(value);
    let out = [0, 0, 0];
    if (rnValue < .25) {
      out[1] = rnValue * 3;
      out[2] = rnValue * 4 + .25;
    } else if (rnValue < 0.3) {
      out[0] = 0.9 * rnValue * 4;
      out[1] = 0.9 * rnValue * 4;
      out[2] = 0.7 * rnValue * 4;
    } else if (rnValue < 0.9) {
      out[0] = 0.4 * (0.4 - rnValue) + 0.1;
      out[1] = 0.8 * (0.8 - rnValue) + 0.3;
      out[2] = 0.4 * (0.4 - rnValue) + 0.1;
    } else {
      out[0] = (rnValue - 0.9)/0.2 + 0.2;
      out[1] = (rnValue - 0.9)/0.2 + 0.2;
      out[2] = (rnValue - 0.9)/0.2 + 0.2;
    }
    return this._clippedNormalizedUint8Array(out);
  }
}

/* Given any value, returns the value recoded for the number of color levels, normalized by the value range of this color map */
ColorMap.prototype._recodedNormalizedValue = function(value) {
  let levelSize = 1 / this.levels;
  let clipped = Math.max(Math.min(value, this.max), this.min);
  let normalizedValue = (clipped - this.min)/(this.max - this.min);
  let recodedValue = Math.floor(normalizedValue / levelSize) * levelSize;
  return recodedValue;
}

ColorMap.prototype._clippedNormalizedUint8Array = function(colors) {
  let normalized = [];

  for (let i =0 ; i < colors.length; i++) {
    normalized[i] = Math.round(Math.min(1, Math.max(0, colors[i])) * 255);
  }

  return normalized;
}

ColorMap.prototype.setType = function(type) {
  this.type = type;
  this.evaluate = ColorMap.types[type];
}
