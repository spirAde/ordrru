import path from 'path';

import loopback from 'loopback';
import boot from 'loopback-boot';

import { createServer } from 'http';
import io from 'socket.io';

import qs from 'query-string';

import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { IntlProvider } from 'react-intl';

import { match } from 'react-router';
import { ReduxAsyncConnect, loadOnServer } from 'redux-async-connect';
import createHistory from 'react-router/lib/createMemoryHistory';
import { Provider } from 'react-redux';

import PrettyError from 'pretty-error';

import Root from './root.jsx';
import configureStore from '../common/configure-store';
import getRoutes from '../common/routes';

import messages from '../common/data/messages/index';

const pretty = new PrettyError();

const app = loopback();

const bootOptions = {
  appRootDir: __dirname,
  bootScripts: ['./boot/authentication.js', './boot/preload.js'],
};

app.use('/build', loopback.static(path.join(__dirname, '../build')));
app.use('/api', loopback.rest());

app.use((req, res, next) => {

  if (req.url.split('/')[1] === 'explorer') return next();

  const locale = req.acceptsLanguages(app.get('locales')) || 'ru';

  if (__DEVELOPMENT__) {
    isomorphicTools.refresh();
  }

  const history = createHistory(req.originalUrl);
  const store = configureStore(history);

  function hydrateOnClient() {
    res.send('<!doctype html>\n' +
      ReactDOMServer.renderToString(
        <Root assets={isomorphicTools.assets()} store={store} />
      )
    );
  }

  if (!__SSR__) {
    hydrateOnClient();
    return;
  }

  match({ history, routes: getRoutes(store), location: req.originalUrl },
    (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      res.redirect(redirectLocation.pathname + redirectLocation.search);
    } else if (error) {
      console.error('ROUTER ERROR:', pretty.render(error));
      res.status(500);
      hydrateOnClient();
    } else if (renderProps) {
      loadOnServer({...renderProps, store}).then(() => {
        const component = (
          <IntlProvider locale={locale} messages={messages[locale]} >
            <Provider store={store} key="provider">
              <ReduxAsyncConnect {...renderProps} />
            </Provider>
          </IntlProvider>
        );

        res.status(200);

        global.navigator = {userAgent: req.headers['user-agent']};

        res.send('<!doctype html>\n' +
          ReactDOMServer.renderToString(
            <Root
              assets={ isomorphicTools.assets() }
              component={component}
              store={store}
              locale={locale}
            />
          )
        );
      });
    } else {
      res.status(404).send('Not found');
    }
  });
});

app.start = () => {
  boot(app, bootOptions, error => {

    if (error) throw error;

    app.listen(() => {
      app.emit('started');

      const baseUrl = app.get('url').replace(/\/$/, '');

      console.log(`Environment ${process.env.NODE_ENV}`);

      console.log(`Devtools ${process.env.DEVTOOLS}`);
      console.log(`Server side rendering ${process.env.DEVTOOLS}\n`);

      console.log(`==> ✓ Web server listening at: ${baseUrl}`);

      if (app.get('loopback-component-explorer')) {
        var explorerPath = app.get('loopback-component-explorer').mountPath;
        console.log(`==> ✓ Browse your REST API at ${baseUrl}${explorerPath}`);
      }

      const socketServer = createServer(app);

      app.io = io.listen(socketServer);

      app.io.on('connection', socket => {
        socket.emit('action', {
          type: 'SET_SOCKET_ID',
          payload: {
            id: socket.id,
          }
        });
      });

      socketServer.listen(__SOCKET_PORT__, () => {
        const baseUrl = `${__SOCKET_PROTOCOL__}://${__SOCKET_HOST__}:${__SOCKET_PORT__}`;
        console.log(`==> ✓ Socket server listening at: ${baseUrl}`);
      });
    });
  });
};

export default app;
