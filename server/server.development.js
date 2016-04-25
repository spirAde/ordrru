import path from 'path';

import pick from 'lodash/pick';

import loopback from 'loopback';
import boot from 'loopback-boot';

import cookie from 'cookie';

import moment from 'moment';

import { createServer } from 'http';
import io from 'socket.io';

import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { IntlProvider } from 'react-intl';

import { match, createMemoryHistory, RouterContext } from 'react-router';
import { trigger } from 'redial';
import { syncHistoryWithStore } from 'react-router-redux';

import { Provider } from 'react-redux';

import PrettyError from 'pretty-error';

import Root from './root.jsx';
import { configureStore } from '../common/configure-store';
import { configureReducers, configureManagerReducers } from '../common/reducers/index';
import createRoutes from '../common/routes';

import messages from '../common/data/messages/index';
import { setIsAuthenticated, setManager } from '../client/scripts/actions/manager-actions';

const pretty = new PrettyError();

const app = loopback();

const bootOptions = {
  appRootDir: __dirname,
  bootScripts: ['./boot/preload.js'],
};

app.use('/build', loopback.static(path.join(__dirname, '../build')));
app.use('/icons', loopback.static(path.join(__dirname, '../client/images/icons')));
app.use('/api', loopback.rest());

// entrance for managers, they have their own reducer and own configuration
app.use('/manager', (req, res, next) => {
  if (__DEVELOPMENT__) {
    isomorphicTools.refresh();
  }

  const referenceDatetime = moment().toDate();
  const locale = req.acceptsLanguages(app.get('locales')) || 'ru';

  const reducers = configureManagerReducers();
  const memoryHistory = createMemoryHistory(req.originalUrl);
  const store = configureStore(memoryHistory, reducers);
  const { dispatch, getState } = store;

  const history = syncHistoryWithStore(memoryHistory, store);

  function hydrateOnClient() {
    res.send('<!doctype html>\n' +
      ReactDOMServer.renderToString(
        <Root
          assets={isomorphicTools.assets()}
          store={store}
          locale={locale}
          referenceDatetime={referenceDatetime}
        />
      )
    );
  }

  if (!__SSR__) {
    hydrateOnClient();
    return;
  }

  const AccessToken = app.models.AccessToken;
  const Manager = app.models.Manager;

  const cookies = req.headers.cookie && cookie.parse(req.headers.cookie);
  const token = cookies && cookies.token && JSON.parse(cookies.token);

  if (!token || !token.id || !token.userId || !token.created || !token.ttl) {
    hydrateOnClient();
  } else {
    const accessToken = new AccessToken({ id: token.id });
    accessToken.validate((error, isValid) => {
      if (error || !isValid) {
        hydrateOnClient();
      }

      Manager.findById(token.userId, (error, data) => {
        if (error || !data) {
          hydrateOnClient();
        }

        const manager = pick(
          data, ['firstName', 'secondName', 'middleName', 'position', 'organizationId']
        );

        store.dispatch(setIsAuthenticated(true));
        store.dispatch(setManager(manager));

        match({ history, routes: createRoutes(store), location: req.originalUrl },
          (error, redirectLocation, renderProps) => {
            if (redirectLocation) {
              res.redirect(redirectLocation.pathname + redirectLocation.search);
            } else if (error) {
              console.error('ROUTER ERROR:', pretty.render(error));
              res.status(500);
              hydrateOnClient();
            } else if (renderProps) {
              const { components } = renderProps;

              // Define locals to be provided to all lifecycle hooks:
              const locals = {
                path: renderProps.location.pathname,
                query: renderProps.location.query,
                params: renderProps.params,

                // Allow lifecycle hooks to dispatch Redux actions:
                dispatch,
                getState
              };

              trigger('fetch', components, locals)
                .then(() => {
                  const component = (
                    <IntlProvider locale={locale} messages={messages[locale]} >
                      <Provider store={store} key="provider">
                        <RouterContext {...renderProps} />
                      </Provider>
                    </IntlProvider>
                  );

                  global.navigator = { userAgent: req.headers['user-agent'] };

                  const RootComponent = (
                    <Root
                      assets={ isomorphicTools.assets() }
                      component={component}
                      store={store}
                      locale={locale}
                      referenceDatetime={referenceDatetime}
                    />
                  );

                  //console.log('SERVER', ReactDOMServer.renderToString(RootComponent));
                  res.status(200);
                  res.send('<!doctype html>\n' +
                    ReactDOMServer.renderToString(RootComponent)
                  );
                })
                .catch(error => pretty.render(error));
            } else {
              res.status(404).send('Not found');
            }
          });
      });
    });
  }
});

// ... for other users
app.use((req, res, next) => {

  if (req.url.split('/')[1] === 'explorer') return next();

  const locale = req.acceptsLanguages(app.get('locales')) || 'ru';

  if (__DEVELOPMENT__) {
    isomorphicTools.refresh();
  }

  const reducers = configureReducers();
  const memoryHistory = createMemoryHistory(req.originalUrl);
  const store = configureStore(memoryHistory, reducers);
  const { dispatch, getState } = store;

  const history = syncHistoryWithStore(memoryHistory, store);

  const referenceDatetime = moment().toDate();

  function hydrateOnClient() {
    res.send('<!doctype html>\n' +
      ReactDOMServer.renderToString(
        <Root
          assets={isomorphicTools.assets()}
          store={store}
          referenceDatetime={referenceDatetime}
        />
      )
    );
  }

  if (!__SSR__) {
    hydrateOnClient();
    return;
  }

  match({ history, routes: createRoutes(store), location: req.originalUrl },
    (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      res.redirect(redirectLocation.pathname + redirectLocation.search);
    } else if (error) {
      console.error('ROUTER ERROR:', pretty.render(error));
      res.status(500);
      hydrateOnClient();
    } else if (renderProps) {
      const { components } = renderProps;

      // Define locals to be provided to all lifecycle hooks:
      const locals = {
        path: renderProps.location.pathname,
        query: renderProps.location.query,
        params: renderProps.params,

        // Allow lifecycle hooks to dispatch Redux actions:
        dispatch,
        getState
      };

      trigger('fetch', components, locals)
        .then(() => {
          const component = (
            <IntlProvider locale={locale} messages={messages[locale]} >
              <Provider store={store} key="provider">
                <RouterContext {...renderProps} />
              </Provider>
            </IntlProvider>
          );

          global.navigator = { userAgent: req.headers['user-agent'] };

          res.status(200);
          res.send('<!doctype html>\n' +
            ReactDOMServer.renderToString(
              <Root
                assets={ isomorphicTools.assets() }
                component={component}
                store={store}
                locale={locale}
                referenceDatetime = {referenceDatetime}
              />
            )
          );
        })
        .catch(error => pretty.render(error));
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
        socket.on('server/ADD_TO_SOCKET_ROOM', (data) => {
          socket.join(data.cityId);
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
