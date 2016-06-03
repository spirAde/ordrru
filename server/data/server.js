require('dotenv').config({ path: `envs/.env.development` });

import path from 'path';
import loopback from 'loopback';
import boot from 'loopback-boot';

export default (callback) => {
	const app = loopback();

	app.use('/api', loopback.rest());
	boot(app, path.join(__dirname, '../'));

	app.listen((error) => {
		if (error) return callback(new Error(error));

		callback(null, app);
	});
}
