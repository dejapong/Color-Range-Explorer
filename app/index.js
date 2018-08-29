"use strict"

import RangeControls from "RangeControls";
import Output from "Output";
import ColorMap from "ColorMap";

window.ColorRangeExplorer = function (id, options = {}) {


  options = Object.assign({
    inputSelection : null,
    currentInput : null,
    mapSelection : null,
    currentMap : "rainbow",
    levelSelection : false,
    numLevels : 5,
    scaleMin : 0,
    scaleMax : 1,
    mapMin : 0,
    mapMax : 1,
    imageMin : 0,
    imageMax : 1,
    title : ""
  }, options );


  let container = document.getElementById(id);
  let rangeControls = new RangeControls(options);
  let output = new Output(rangeControls);

  let extScaleControls = document.createElement("div");
  let minInput = document.createElement("input");
  let maxInput = document.createElement("input");
  let titleSpan = document.createElement("span");

  extScaleControls.className = "colorRangeScaleCtrls";
  minInput.className = "colorRangeMinInput";
  maxInput.className = "colorRangeMaxInput";
  minInput.size = 7;
  maxInput.size = 7;
  minInput.tabIndex = 1;
  maxInput.tabIndex = 2;
  titleSpan.innerHTML = options.title;

  extScaleControls.appendChild(minInput);
  extScaleControls.appendChild(titleSpan);
  extScaleControls.appendChild(maxInput);

  let extColorControls = document.createElement("div");
  let inputLabel = document.createElement("label");
  let inputSelect = document.createElement("select");
  let mapLabel = document.createElement("label");
  let mapSelect = document.createElement("select");
  let levelsLabel = document.createElement("label");
  let levelsInput = document.createElement("input");

  extColorControls.className = "colorRangeExtCtrls";
  inputLabel.innerHTML = "Input";
  mapLabel.innerHTML = "Map";
  levelsLabel.innerHTML = "Levels";
  levelsInput.size = 5;

  if (options.inputSelection) {
    for (let inputPath of options.inputSelection) {
      let option = document.createElement("option");
      option.value = inputPath;
      option.innerHTML = inputPath;
      inputSelect.appendChild(option);
    }
    extColorControls.appendChild(inputLabel);
    extColorControls.appendChild(inputSelect);
  }

  if (options.mapSelection) {
    for (let type of options.mapSelection) {
      let option = document.createElement("option");
      option.value = type;
      option.innerHTML = type;
      mapSelect.appendChild(option);
    }
    extColorControls.appendChild(mapLabel);
    extColorControls.appendChild(mapSelect);
  }
  if (options.levelSelection) {
    extColorControls.appendChild(levelsLabel);
    extColorControls.appendChild(levelsInput);
  }

  container.appendChild(extColorControls);
  container.appendChild(output.container);
  container.appendChild(rangeControls.container);
  container.appendChild(extScaleControls);

  output.addEventListener("resize", function(event) {
    Object.assign(container.style, {width: `${event.width}px`});
    rangeControls.resize(event.width, rangeControls.height);
  });

  let redrawTimeout;
  rangeControls.addEventListener("change", (e) => {
    output.redraw();
    minInput.value = rangeControls.scale.min.toFixed(2);
    maxInput.value = rangeControls.scale.max.toFixed(2);
    levelsInput.value = rangeControls.map.levels;
  } );

  minInput.addEventListener("change", function (e) {
    rangeControls.setScaleMin(e.target.value);
    rangeControls.scale.dX = 0;
  });

  maxInput.addEventListener("change", function (e) {
    rangeControls.setScaleMax(e.target.value);
    rangeControls.scale.dX = 0;
  });

  levelsInput.addEventListener("change", function (e) {
    rangeControls.setLevels(e.target.value);
  });

  inputSelect.addEventListener("change", function (e) {
    output.loadImage(this.value, options.imageMin, options.imageMax);
  });

  mapSelect.addEventListener("change", function (e) {
    rangeControls.map.setType(this.value);
    rangeControls.redraw();
    output.redraw();
  });

  if (options.currentInput) {
    output.loadImage(options.currentInput, options.imageMin, options.imageMax);
  }

  if (options.currentMap) {
    rangeControls.map.setType(options.currentMap);
  }
}

window.ColorRangeExplorer.COLOR_MAP_TYPES = Object.keys(ColorMap.types);