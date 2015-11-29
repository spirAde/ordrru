'use strict';

require('dotenv').config({path: 'envs/.env.development'});

import loopback from 'loopback';
import boot from 'loopback';

import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import webpackConfig from '../webpack/development.config';
const compiler = webpack(webpackConfig);

const host = process.env.HOST;
const port = parseInt(process.env.PORT) + 1;

const serverOptions = {
  contentBase: `http://${host}:${port}`,
  quiet: true,
  noInfo: true,
  hot: true,
  inline: true,
  lazy: false,
  publicPath: webpackConfig.output.publicPath,
  headers: {'Access-Control-Allow-Origin': '*'},
  stats: {colors: true}
};

const app = loopback();

app.use(webpackDevMiddleware(compiler, serverOptions));
app.use(webpackHotMiddleware(compiler));

boot(app, __dirname);

app.listen(port, () => {
  console.info('==> ✓ Webpack development server listening on port %s', port);
});
