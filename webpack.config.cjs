const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpackBoilerplate = require('webpack-boilerplate');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new webpackBoilerplate()
  ]
}
