import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ReduxAsyncConnect } from 'redux-async-connect';
import { Router, browserHistory, useRouterHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { IntlProvider } from 'react-intl';
import useScroll from 'scroll-behavior/lib/useStandardScroll'
import createBrowserHistory from 'history/lib/createBrowserHistory'

import moment from 'moment';
import messages from '../../common/data/messages/index';

import configureStore from '../../common/configure-store';
import getRoutes from '../../common/routes';

import IntlUtils from './utils/IntlUtils';

import '../styles/core.css';
import '../styles/fonts.css';

const store = configureStore(browserHistory, window.__INITIAL_STATE__);
const createScrollHistory = useScroll(createBrowserHistory);
const appHistory = useRouterHistory(createScrollHistory)();
const history = syncHistoryWithStore(appHistory, store);

const reactRoot = document.getElementById('root');

const localization = navigator.languages ?
  navigator.languages[0] : (navigator.language || navigator.userLanguage);
const locale = localization.indexOf('-') ? localization.split('-')[0] : localization;

const filter = (item) => !item.deferred;
const renderAsync = (props) => <ReduxAsyncConnect {...props} filter={filter} />;

const component = (
  <Router render={renderAsync} history={history}>
    {getRoutes(store)}
  </Router>
);

function runApp() {
  moment.locale(locale);

  ReactDOM.render(
    <IntlProvider locale={locale} messages={messages[locale]}>
      <Provider store={store} key="provider">
        {component}
      </Provider>
    </IntlProvider>,
    reactRoot
  );

  if (__DEVELOPMENT__) {
    const Perf = require('react-addons-perf');

    window.React = React; // enable debugger
    window.Perf = Perf; // performance tool

    if (!reactRoot || !reactRoot.firstChild || !reactRoot.firstChild.attributes
      || !reactRoot.firstChild.attributes['data-react-checksum']) {
      console.error(// eslint-disable-line no-console
        `Server-side React render was discarded. Make sure that your
        initial render does not contain any client-side code.`
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
  .then(runApp);
