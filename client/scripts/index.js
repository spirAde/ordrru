import 'babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';

import { IntlProvider } from 'react-intl';

import { ReduxRouter, reduxReactRouter } from 'redux-router';
import { Provider } from 'react-redux';

import createHistory from 'history/lib/createBrowserHistory';

import messages from '../../common/data/messages/index';

import configureStore from '../../common/configure-store';
import getRoutes from '../../common/routes';

import IntlUtils from './utils/IntlUtils';

import '../styles/core.css';
import '../styles/fonts.css';

const store = configureStore(reduxReactRouter, getRoutes, createHistory, window.__INITIAL_STATE__);
const reactRoot = document.getElementById('root');

const localization = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
const locale = localization.indexOf('-') ? localization.split('-')[0] : localization;

const component = (
  <IntlProvider locale={locale} messages={messages[locale]}>
    <Provider store={store} key="provider">
      <ReduxRouter routes={getRoutes(store)} />
    </Provider>
  </IntlProvider>
);

function runApp() {
  ReactDOM.render(component, reactRoot);

  if (__DEVELOPMENT__) {
    const Perf = require('react-addons-perf');

    window.React = React; // enable debugger
    window.Perf = Perf; // performance tool

    if (!reactRoot || !reactRoot.firstChild || !reactRoot.firstChild.attributes || !reactRoot.firstChild.attributes['data-react-checksum']) {
      console.error(// eslint-disable-line no-console
        'Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.'
      );
    }
  }

  if (__DEVTOOLS__) {
    const DevTools = require('./containers/DevTools.jsx');
    ReactDOM.render(
      <IntlProvider locale={locale} messages={messages[locale]}>
        <Provider store={store} key="provider">
          <div>
            {component}
            <DevTools />
          </div>
        </Provider>
      </IntlProvider>,
      reactRoot
    );
  }
}

IntlUtils.loadPolyfill(locale)
  .then(IntlUtils.loadLocaleData.bind(this, locale))
  .then(runApp)
  .catch(err => console.error(
    err// eslint-disable-line no-console
  ));
