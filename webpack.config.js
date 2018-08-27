var path = require('path');

module.exports = {
  mode:"production",
  context: __dirname + "/app",
  entry: "./index.js",
  output: {
    path: __dirname + "/dist",
    filename: "colorRangeExplorer.min.js"
  },
  resolve: {
    modules: ["app", "node_modules"],
    extensions: [ ".js"]
  },
  plugins: [],
}