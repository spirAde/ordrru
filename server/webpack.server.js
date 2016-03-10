var environment = process.env.NODE_ENV || 'local';

require('dotenv').config({path: 'envs/.env.' + environment});

import loopback from 'loopback';
import boot from 'loopback';

import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import webpackConfig from '../webpack/development.config';
const compiler = webpack(webpackConfig);

const host = process.env.HOST || 'localhost';
const port = parseInt(process.env.PORT, 10) + 1 || 3001;

const serverOptions = {
  contentBase: 'http://localhost:3001',
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
