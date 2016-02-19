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

export default function renderApplication(url, locale) {

  if (__DEVELOPMENT__) {
    isomorphicTools.refresh();
  }

  const history = createHistory(url);
  const store = configureStore(history);

  match({ history, routes: getRoutes(store), location: url }, (error, redirectLocation, renderProps) => {

    let status = 200;
    let content = '';

    if (redirectLocation) {
      //
    } else if (error) {
      console.error('ROUTER ERROR:', pretty.render(error));

      status = 500;
      content = '<!doctype html>\n' + ReactDOMServer.renderToString(
          <Root
            assets={isomorphicTools.assets()}
            store={store}
            locale={locale}
          />
        );

      //return resolve({status, content});
    } else if (renderProps) {
      console.log('renderProps');
      loadOnServer({...renderProps, store }).then(() => {
        console.log('loadOnServer');
        const component = (
          <IntlProvider locale={locale} messages={messages[locale]} >
            <Provider store={store} key="provider">
              <ReduxAsyncConnect {...renderProps} />
            </Provider>
          </IntlProvider>
        );

        content = '<!doctype html>\n' + ReactDOMServer.renderToString(
            <Root
              assets={ isomorphicTools.assets() }
              component={component}
              store={store}
              locale={locale}
            />
          );

        console.log(content);
        //return resolve({status, content});
      });
    } else {
      status = 404;
      //return resolve({status, content});
    }
  });
};
