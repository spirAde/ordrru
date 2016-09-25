import fs from 'fs';

import loopback from 'loopback';

import { merge } from 'lodash';
import bunyan from 'bunyan';
import uuid from 'uuid';
import LoopBackContext from 'loopback-context';

const APP_ROOT = process.cwd();

const DEFAULT_CONFIG = {
	name: 'loopback',
	serializers: {
		req: bunyan.stdSerializers.req,
		res: bunyan.stdSerializers.res,
		err: bunyan.stdSerializers.err
	},
	streams: [
		{
			type: 'stream',
			stream: process.stderr,
			level: 'error'
		},
		{
			type: 'file',
			path: `${APP_ROOT}/logs/common.log`,
			level: (process.env.NODE_ENV !== 'production') ? 'debug' : 'info'
		}
	]
};

export default function(config) {
	config = merge(DEFAULT_CONFIG, config);

	const logPath = `${APP_ROOT}/logs`;

	if (!fs.existsSync(logPath)) {
		try {
			fs.mkdirSync(logPath);
		} catch (e) {}
	}

	const logger = bunyan.createLogger(config);

	return function(req, res, next) {
		req.id = res.id = req.id || uuid.v4();
		res.setHeader('Request-Id', req.id);

		const logCtx = { requestId: req.id };

		if (req.accessToken) {
			logCtx.accessToken = req.accessToken.id;
			logCtx.userId = req.accessToken.userId;
		}

		req.log = logger.child(logCtx, true);

		const loopbackContext = LoopBackContext.getCurrentContext();

		if (loopbackContext) loopbackContext.set('logger', req.log);

		next();
	};
};
