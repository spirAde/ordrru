import qs from 'query-string';

import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { IntlProvider } from 'react-intl';

import createHistory from 'history/lib/createMemoryHistory';

import { match, reduxReactRouter } from 'redux-router/server';
import { ReduxRouter } from 'redux-router';
import { Provider } from 'react-redux';

import PrettyError from 'pretty-error';

import Root from './root.jsx';
import configureStore from '../common/configure-store';
import getRoutes from '../common/routes';

import messages from '../common/data/messages/index';

const pretty = new PrettyError();

export default function renderApplication(url, locale) {

  if (__DEVELOPMENT__) {
    isomorphicTools.refresh();
  }

  const store = configureStore(reduxReactRouter, getRoutes, createHistory);

  return new Promise((resolve) => {

    store.dispatch(match(url, (error, redirectLocation, routerState) => {

      let status = 200;
      let content = '';

      if (error) {

        console.error('ROUTER ERROR:', pretty.render(error));

        status = 500;
        content = '<!doctype html>\n' + ReactDOMServer.renderToString(<Root assets={isomorphicTools.assets()} store={store} locale={locale}/>);

        return resolve({status, content});
      }
      if (redirectLocation) {
        //
      } else if (!routerState) {

        status = 500;
        content = '<!doctype html>\n' + ReactDOMServer.renderToString(<Root assets={isomorphicTools.assets()} store={store} locale={locale}/>);

        return resolve({status, content});
      } else {

        if (!__SSR__) {

          content = '<!doctype html>\n' + ReactDOMServer.renderToString(<Root assets={isomorphicTools.assets()} store={store} locale={locale}/>);

          return resolve({status, content});
        }

        if (routerState.location.search && !routerState.location.query) {
          routerState.location.query = qs.parse(routerState.location.search);
        }

        store.getState().router.then(() => {
          const component = (
            <IntlProvider locale={locale} messages={messages[locale]} >
              <Provider store={store} key="provider">
                <ReduxRouter />
              </Provider>
            </IntlProvider>
          );

          content = '<!doctype html>\n' + ReactDOMServer.renderToString(
            <Root assets={isomorphicTools.assets()} component={component} store={store} locale={locale}/>
          );

          return resolve({status, content});
        })
        .catch((error) => {

          console.error('DATA FETCHING ERROR:', pretty.render(error));

          status = 500;
          content = '<!doctype html>\n' + ReactDOMServer.renderToString(<Root assets={isomorphicTools.assets()} store={store} locale={locale}/>);

          return resolve({status, content});
        });
      }
    }));
  });
};
