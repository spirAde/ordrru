'use strict';

require('dotenv').config({path: 'envs/.env.test'});

module.exports = {
  devtool: 'inline-source-map',
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          stage: 0,
          optional: ['runtime'],
        }
      },
      { test: /\.json/, loader: 'json', exclude: /node_modules/ },
      { test: /\.css$/, loaders: ['style', 'css?modules&importLoaders=1&localIdentName=[local]&sourceMap!postcss'] },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' },
      { test: /\.png(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/png' },
    ],
    postLoaders: [{
      test: /\.js$/,
      exclude: /(test|node_modules)\//,
      loader: 'istanbul-instrumenter'
    }],
    noParse: [
      /node_modules\/sinon\//,
    ],
  },
  resolve: {
    alias: {
      sinon: 'sinon/pkg/sinon'
    }
  },
  externals: {
    jsdom: 'window',
    cheerio: 'window',
    'react/lib/ExecutionEnvironment': true,
    fs: true
  }
};