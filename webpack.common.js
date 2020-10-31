const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpackDashboard = require('webpack-dashboard/plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

let dir = 'dist';

const copy = new CopyWebpackPlugin([{
    from: `./src/assets`,
    to: `./assets`,
  }, {
    from: `./src/**.html`,
    to: `./`,
    flatten: true,
  }],
  {
    ignore: [`.DS_Store`],
  },
);

module.exports = {
  entry: ['./src/js/index.js', './src/css/style.scss'],

  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, dir),
  },

  resolve: {
    extensions: [`.js`, `.css`, `*`],
    alias: {
      'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
    }
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: `babel-loader`,
        }],
      }, {
        test: /\.vue$/,
        loader: 'vue-loader',
      }, {
        test: /\.(png|jpg)$/,
        loader: 'url-loader'
      }, {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract([
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          'sass-loader'
        ]),
      }, {
        test: /\.html$/,
        loader: `html-loader`,
        options: {
          attrs: [`audio:src`, `img:src`, `video:src`, `source:srcset`], // read src from video, img & audio tag
        },
      },
    ],
  },

  plugins: [
    copy,
    new webpackDashboard(),
    new VueLoaderPlugin(),
    new ExtractTextPlugin({ // define where to save the file
      filename: 'css/[name].bundle.css',
      allChunks: true,
    })
  ],
};
