require('dotenv').config({path: 'envs/.env.test'});

require('babel-core/register')({
	plugins: [
		'transform-runtime',
		'add-module-exports',
		'transform-decorators-legacy',
		'transform-react-display-name'
	],
	presets: ['es2015', 'stage-0', 'react']
});
//require('css-modules-require-hook')();

import loopback from 'loopback';
import jsdom from 'jsdom';
import chai from 'chai';
import chaiImmutable from 'chai-immutable';

import { importDB } from './utils/index';

importDB(['Bathhouse', 'Room', 'ACL', 'Order', 'Schedule', 'City', 'Review']);

const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
const win = doc.defaultView;

global.document = doc;
global.window = win;

global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVTOOLS__ = process.env.DEVTOOLS;
global.__DEVELOPMENT__ = process.env.DEVELOPMENT;
global.__SSR__ = process.env.SSR;

global.__PROTOCOL__ = process.env.PROTOCOL;
global.__HOST__ = process.env.HOST;
global.__PORT__ = process.env.PORT;

global.__API_PROTOCOL__ = process.env.API_PROTOCOL;
global.__API_HOST__ = process.env.API_HOST;
global.__API_PORT__ = process.env.API_PORT;

global.__SOCKET_PROTOCOL__ = process.env.SOCKET_PROTOCOL;
global.__SOCKET_HOST__ = process.env.SOCKET_HOST;
global.__SOCKET_PORT__ = process.env.SOCKET_PORT;

Object.keys(window).forEach(function(key) {
	if (!(key in global)) {
		global[key] = window[key];
	}
});

chai.use(chaiImmutable);

const path = require('path');
const WebpackIsomorphicTools = require('webpack-isomorphic-tools');
const isomorphicTools = new WebpackIsomorphicTools(
	require('../webpack/isomorphic-tools')
);

global.isomorphicTools = isomorphicTools
	.development(__DEVELOPMENT__)
	.server(path.resolve(__dirname, '..'), () => {
		const server = require('../server/server.test.js');
		server.start();
	});