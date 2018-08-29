import ColorMap from "ColorMap";

let output = null;
let values = [];

onmessage = function(e) {
  let map = new ColorMap(0,1,1);

  if (e.data.data) {

    let data = e.data.data;
    values.length = 0;

    for (let i =0; i < data.length; i += 4) {
      let r = data[i + 0];
      let g = data[i + 1];
      let b = data[i + 2];
      values.push((e.data.max - e.data.min) * (r  + g + b) / 3 / 255 + e.data.min);
    }

    output = data.slice();

  } else if (e.data.redraw) {

    if (map.type !== e.data.type) {
      map.setType(e.data.type);
    }

    map.min = e.data.mapMin;
    map.max = e.data.mapMax;
    map.levels = e.data.levels;

    for (let i =0; i < values.length; i++) {
      let colors = map.evaluate(Math.max(e.data.scaleMin, Math.min(e.data.scaleMax, values[i])));
      output.set(colors, i * 4);
    }

    self.postMessage(output);

  }
};