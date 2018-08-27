"use strict"

import RangeControls from "RangeControls";
import Output from "Output";
import ColorMap from "ColorMap";

window.ColorRangeExplorer = function (id, imagePaths) {

  let container = document.getElementById(id);
  let rangeControls = new RangeControls();
  let output = new Output(rangeControls);

  let extScaleControls = document.createElement("div");
  let minInput = document.createElement("input");
  let maxInput = document.createElement("input");
  let resetBtn = document.createElement("input");

  resetBtn.type = "button";
  resetBtn.value = "Fit Data";
  minInput.className = "colorRangeMinInput";
  maxInput.className = "colorRangeMaxInput";
  minInput.size = 5;
  maxInput.size = 5;
  minInput.tabIndex = 1;
  maxInput.tabIndex = 2;
  resetBtn.tabIndex = 3;
  extScaleControls.appendChild(minInput);
  extScaleControls.appendChild(resetBtn);
  extScaleControls.appendChild(maxInput);

  let extColorControls = document.createElement("div");
  let imageLabel = document.createElement("label");
  let imageSelect = document.createElement("select");
  let mapLabel = document.createElement("label");
  let mapSelect = document.createElement("select");
  let levelsLabel = document.createElement("label");
  let levelsInput = document.createElement("input");

  for (let imagePath of imagePaths) {
    let option = document.createElement("option");
    option.value = imagePath;
    option.innerHTML = imagePath;
    imageSelect.appendChild(option);
  }

  for (let type in ColorMap.types) {
    let option = document.createElement("option");
    option.value = type;
    option.innerHTML = type;
    mapSelect.appendChild(option);
  }

  imageLabel.innerHTML = "Input";
  mapLabel.innerHTML = "Map";
  levelsLabel.innerHTML = "Levels";

  extColorControls.appendChild(imageLabel);
  extColorControls.appendChild(imageSelect);
  extColorControls.appendChild(mapLabel);
  extColorControls.appendChild(mapSelect);
  extColorControls.appendChild(levelsLabel);
  extColorControls.appendChild(levelsInput);

  container.appendChild(extColorControls);
  container.appendChild(output.container);
  container.appendChild(extScaleControls);
  container.appendChild(rangeControls.container);

  output.addEventListener("resize", function(event) {
    Object.assign(container.style, {width: `${event.width}px`});
    rangeControls.resize(event.width, rangeControls.height);
  });

  rangeControls.addEventListener("change", (e) => {
    output.redraw();
    minInput.value = rangeControls.scale.min.toFixed(2);
    maxInput.value = rangeControls.scale.max.toFixed(2);
    levelsInput.value = rangeControls.map.levels;
  } );

  minInput.addEventListener("change", function (e) {
    rangeControls.setScaleMin(e.target.value);
  });

  maxInput.addEventListener("change", function (e) {
    rangeControls.setScaleMax(e.target.value);
  });

  levelsInput.addEventListener("change", function (e) {
    rangeControls.setLevels(e.target.value);
  });

  resetBtn.addEventListener("click", function (e) {
    rangeControls.reset();
  });

  imageSelect.addEventListener("change", function (e) {
    output.loadImage(this.value);
  });

  mapSelect.addEventListener("change", function (e) {
    rangeControls.map.setType(this.value);
    rangeControls.redraw();
    output.redraw();
  });

  output.loadImage(imageSelect.value);
}
