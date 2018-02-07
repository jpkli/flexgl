const path = require('path');

module.exports = {
  entry: './src/bundle.js',
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'flexgl.js'
  }
};
