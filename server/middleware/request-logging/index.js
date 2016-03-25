import { merge, pick } from 'lodash';
import bunyan from 'bunyan';
import util from 'util';

const APP_ROOT = process.cwd();

var DEFAULT_CONFIG = {
	// Extended config which is removed
	features: ['ip', 'method', 'url', 'referer', 'userAgent', 'body', 'responseTime', 'statusCode'],
	parseUA: false,
	truncateBody: false,

	bunyan: {
		name: 'loopback-requests',
		serializers: {
			req: bunyan.stdSerializers.req,
			res: bunyan.stdSerializers.res,
			err: bunyan.stdSerializers.err
		},
		streams: [{
			type: 'file',
			path: `${APP_ROOT}/logs/requests.log`,
			level: 'info'
		}]
	}
};

export default function(config) {
	config = merge(DEFAULT_CONFIG, config);

	const logger = bunyan.createLogger(config.bunyan);

	return function(req, res, next) {
		const startTime = process.hrtime();

		const logCtx = { requestId: req.id };

		if (req.accessToken) {
			logCtx.accessToken = req.accessToken.id;
			logCtx.userId = req.accessToken.userId;
		}

		const childLogger = logger.child(logCtx, true);

		res.on('finish', function() {
			childLogger.info(buildPayload(), 'request done');
		});

		res.on('close', function() {
			childLogger.warn(buildPayload(), 'socket closed');
		});

		next();

		function buildPayload() {
			let payload;
			const hrResponseTime = process.hrtime(startTime);
			const responseTime = hrResponseTime[0] * 1e3 + hrResponseTime[1] / 1e6;

			const properties = {
				ip: req.ip || req.connection.remoteAddress ||
					(req.socket && req.socket.remoteAddress) || (req.socket.socket && req.socket.socket.remoteAddress),
				method: req.method,
				url: (req.baseUrl || '') + (req.url || ''),
				referer: req.header('referer') || req.header('referrer'),
				userAgent: req.header('user-agent'),
				body: req.body,
				httpVersion: req.httpVersionMajor + '.' + req.httpVersionMinor,
				responseTime: responseTime,
				hrResponseTime: hrResponseTime,
				statusCode: res.statusCode,
				requestHeaders: req.headers,
				responseHeaders: res._headers,
				req: req,
				res: res
			};

			if (!config.features || config.features === '*') {
				payload = properties;
			} else {
				payload = pick(properties, config.features);
				console.log('properties', properties);
				console.log('config.features', config.features);
				console.log('payload', payload);
			}

			/*if (payload.userAgent && config.parseUA) {
				payload.userAgent = useragent.parse(payload.userAgent);
			}*/

			if (payload.body && config.truncateBody) {
				if (config.truncateBody) {
					config.truncateBody = 20;
				}
				payload.body = util.inspect(payload.body).substring(0, config.truncateBody);
			}

			return payload;
		}
	};
};
