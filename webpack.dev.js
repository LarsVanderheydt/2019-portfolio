const merge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {

  devtool: 'inline-source-map',

  devServer: {
    contentBase: './dist/',
    host: "192.168.0.129",
    port: 3000,
    // https: true
  }
});
