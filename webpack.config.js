var path = require('path');

module.exports = {
  // mode:"production",
  mode:"development",
  context: __dirname + "/app",
  entry: {
    "colorRangeExplorer.min": "./index.js",
    "RenderWorker": './RenderWorker.js'
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name].js"
  },
  resolve: {
    modules: ["app", "node_modules"],
    extensions: [ ".js"]
  },
  plugins: [],
}