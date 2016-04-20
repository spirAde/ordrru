import cookie from 'cookie';
import PrettyError from 'pretty-error';
import moment from 'moment';

import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { match, createMemoryHistory, RouterContext } from 'react-router';
import { trigger } from 'redial';
import { syncHistoryWithStore } from 'react-router-redux';

import { configureStore } from '../common/configure-store';
import createRoutes from '../common/routes';
import messages from '../common/data/messages/index';

import Root from './root.jsx';

const pretty = new PrettyError();

export function initializeApp(locale, location, forUser) {
	return new Promise((resolve, reject) => {
		const memoryHistory = createMemoryHistory(location);
		const store = configureStore(memoryHistory, forUser);
		const { dispatch, getState } = store;

		const history = syncHistoryWithStore(memoryHistory, store);

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

		match({ history, location, routes: createRoutes(store) },
			(error, redirectLocation, renderProps) => {
				if (redirectLocation) {
					res.redirect(redirectLocation.pathname + redirectLocation.search);
				} else if (error) {
					console.error('ROUTER ERROR:', pretty.render(error));
					res.status(500);
					hydrateOnClient();
				} else if (renderProps) {
					const { components } = renderProps;

					const locals = {
						path: renderProps.location.pathname,
						query: renderProps.location.query,
						params: renderProps.params,

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
}

export function renderApp() {
	const referenceDatetime = moment().toDate();
}
