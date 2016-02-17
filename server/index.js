'use strict';

var environment = process.env.NODE_ENV || 'development';

require('dotenv').config({path: 'envs/.env.' + environment});
require('babel-core/register')({
  plugins: ['transform-runtime'],
  presets: ['es2015', 'stage-0', 'react']
});
require('css-modules-require-hook')();

global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVTOOLS__ = process.env.DEVTOOLS;
global.__DEVELOPMENT__ = process.env.DEVELOPMENT;
global.__SSR__ = process.env.SSR;

var path = require('path');
var WebpackIsomorphicTools = require('webpack-isomorphic-tools');
var isomorphicTools = new WebpackIsomorphicTools(require('../webpack/isomorphic-tools'));
/*
var areIntlLocalesSupported = require('intl-locales-supported');

var localesMyAppSupports = ['ru'];

if (global.Intl) {
  if (!areIntlLocalesSupported(localesMyAppSupports)) {
    require('intl');
    Intl.NumberFormat = IntlPolyfill.NumberFormat;
    Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
  }
} else {
  global.Intl = require('intl');
}
*/

global.isomorphicTools = isomorphicTools
  .development(__DEVELOPMENT__)
  .server(path.resolve(__dirname, '..'), function() {
    var server = require('../server/server.' + environment + '.js');
    //server.start();
  });
