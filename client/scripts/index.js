import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { trigger } from 'redial';
import { Router, browserHistory, match } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { IntlProvider } from 'react-intl';

import createLocation from 'history/lib/createLocation';

import moment from 'moment';
import messages from '../../common/data/messages/index';

import { configureStore } from '../../common/configure-store';
import { configureReducers, configureManagerReducers } from '../../common/reducers/index';
import createRoutes from '../../common/routes';

import IntlUtils from './utils/IntlUtils';

import '../styles/core.css';
import '../styles/fonts.css';
import '../styles/globals.css';

const location = createLocation(document.location.pathname, document.location.search);
const isMainApplication = location.pathname.indexOf('manager') === -1;

const reactRoot = document.getElementById('root');

const localization = navigator.languages ?
  navigator.languages[0] : (navigator.language || navigator.userLanguage);
const locale = localization.indexOf('-') ? localization.split('-')[0] : localization;

const reducers = isMainApplication ?
  configureReducers() : configureManagerReducers();
const store = configureStore(browserHistory, reducers, window.__INITIAL_STATE__);
const history = syncHistoryWithStore(browserHistory, store);

const { dispatch, getState } = store;

const routes = createRoutes(store);

if (!isMainApplication) {
  require('../styles/manager.css'); // eslint-disable-line global-require
}

function runApp() {
  match({ routes, location }, () => {
    moment.locale(locale);

    ReactDOM.render(
      <IntlProvider locale={locale} messages={messages[locale]}>
        <Provider store={store} key="provider">
          <Router routes={routes} history={history} />
        </Provider>
      </IntlProvider>,
      reactRoot
    );

    if (__DEVELOPMENT__) {
      window.React = React; // enable debugger
      window.Perf = require('react-addons-perf'); // eslint-disable-line global-require

      //const checkUpdate = require('why-did-you-update'); // eslint-disable-line global-require
      //checkUpdate.whyDidYouUpdate(React);

      if (!reactRoot || !reactRoot.firstChild || !reactRoot.firstChild.attributes
        || !reactRoot.firstChild.attributes['data-react-checksum']) {
        console.error(// eslint-disable-line no-console
          `Server-side React render was discarded. Make sure that your
          initial render does not contain any client-side code.`
        );
      }
    }
  });

  history.listen(location => {
    match({ routes, location }, (error, redirectLocation, renderProps) => {
      const { components } = renderProps;

      const locals = {
        path: renderProps.location.pathname,
        query: renderProps.location.query,
        params: renderProps.params,

        dispatch,
        getState,
      };

      if (window.__INITIAL_STATE__) {
        delete window.__INITIAL_STATE__;
      } else {
        trigger('fetch', components, locals);
      }

      trigger('defer', components, locals);
    });
  });
}

IntlUtils.loadPolyfill(locale)
  .then(IntlUtils.loadLocaleData.bind(this, locale))
  .then(runApp);
