import path from 'path';

export default (callback) => {
	require('dotenv').config({ path: `envs/.env.development` });
	const loopback = require('loopback');
	const boot = require('loopback-boot');

	const app = loopback();

	app.use('/api', loopback.rest());

	boot(app, path.join(__dirname, '../'), error => {
		if (error) return callback(new Error(error));

		app.listen((error) => {
			if (error) return callback(new Error(error));

			callback(null, app);
		});
	});
}
