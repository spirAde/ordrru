'use strict';

require('dotenv').config({path: 'envs/.env.development'});

var fs = require('fs');
var path = require('path');

var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CleanPlugin = require('clean-webpack-plugin');
var WebpackIsomorphicTools = require('webpack-isomorphic-tools');

var WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');
var isomorphicTools = new WebpackIsomorphicToolsPlugin(require('./isomorphic-tools'));

var postcss = [
  require('postcss-nested'),
  require('postcss-import'),
  require('postcss-custom-properties')
];

module.exports = {
  devtool: 'inline-source-map',
  context: path.resolve(__dirname, '..'),
  entry: [
    './client/scripts/index.js'
  ],
  output: {
    path: path.join(__dirname, '..', 'build'),
    filename: '[name]-[hash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: '/build/'
  },
  progress: true,
  resolve: {
    modulesDirectories: [
      'client',
      'node_modules',
      'common'
    ],
    extensions: ['', '.json', '.js']
  },
  module: {
    /*preLoaders: [
     {
     test: /\.jsx$|\.js$/,
     loader: 'eslint-loader'
     }
     ],*/
    loaders: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css?modules&importLoaders=1&localIdentName=[local]&sourceMap!postcss'),
        include: path.join(__dirname, '..', 'client')
      },
      {
        test: /\.(js|jsx)$/,
        loader: 'babel',
        include: [path.join(__dirname, '..', 'client'), path.join(__dirname, '..', 'common')],
        exclude: path.join(__dirname, '..', 'client', 'models'),
      },
      {
        test: /\.json/,
        loader: 'json',
        exclude: /node_modules/,
      },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" },
      { test: isomorphicTools.regular_expression('images'), loader: 'url-loader?limit=10240' }
    ]
  },

  postcss: postcss,

  plugins: [
    new CleanPlugin('../build'),
    new ExtractTextPlugin('bundle.css', { allChunks: true }),
    new webpack.IgnorePlugin(/webpack-stats\.json$/),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: process.env.DEVELOPMENT,
      __DEVTOOLS__: process.env.DEVTOOLS,
      __SSR__: process.env.SSR
    }),

    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),

    isomorphicTools
  ]
};