import loopback from 'loopback';

import { isObject, forEach } from 'lodash';

const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
const _loggerCache = {};

export default function mkLogger() {
	const scope = Array.prototype.slice.call(arguments).join(':');
	if (_loggerCache[scope]) return _loggerCache[scope];

	const ctx = scope ? mkLogger.bind(null, scope) : mkLogger.bind(null);

	forEach(LOG_LEVELS, level => {
		ctx[level] = mkLoggerLevel(level, scope);
	});

	_loggerCache[scope] = ctx;

	return ctx;
}

function mkLoggerLevel(level, scope) {
	return function() {
		const loopbackContext = loopback.getCurrentContext();
		if (!loopbackContext) return;

		var logger = loopbackContext.get('logger');

		if (!logger) {
			return console.error('Logger missing from Loopback Context');
		}

		var params = arguments;

		if (scope) {
			if (isObject(params[0])) {
				params[0].scope = scope;
			} else {
				params = Array.prototype.slice.call(arguments);
				params.unshift({ scope: scope });
			}
		}

		return logger[level].apply(logger, params);
	};
}
