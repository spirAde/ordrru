require('babel-core/register')({
  plugins: [
    'transform-runtime',
    'add-module-exports',
    'transform-decorators-legacy',
    'transform-react-display-name'
  ],
  presets: ['es2015', 'stage-0', 'react']
});
require('css-modules-require-hook')();

var jsdom = require('jsdom');
var chai = require('chai');
var chaiImmutable = require('chai-immutable');

var doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
var win = doc.defaultView;

global.document = doc;
global.window = win;

global.__CLIENT__ = false;
global.__SERVER__ = true;

Object.keys(window).forEach(function(key) {
  if (!(key in global)) {
    global[key] = window[key];
  }
});

chai.use(chaiImmutable);