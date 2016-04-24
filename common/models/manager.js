export default (Manager) => {

	Manager.remoteMethod(
		'verify',
		{
			http: { path: '/verify', verb: 'post' },
			description: 'verify manager access token and existence',
			accepts: {
				arg: 'token',
				type: 'string',
				required: true,
				description: 'access token'
			},
			returns: { arg: 'status', type: 'boolean', description: 'status of validation' },
		}
	);

	Manager.verify = (token, next) => {

		const app = Manager.app;
		const AccessToken = app.models.AccessToken;

		const accessToken = new AccessToken({ id: token });

		accessToken.validate((error, isValid) => {
			if (error || !isValid) {
				const error = new Error();
				error.statusCode = 422;
				error.message = 'Token is incorrect';
				error.code = 'TOKEN_INCORRECT';

				return next(error);
			}

			AccessToken.findById(token, (error, data) => {
				if (error || !data) {
					const error = new Error();
					error.statusCode = 422;
					error.message = 'Token is incorrect';
					error.code = 'TOKEN_INCORRECT';

					return next(error);
				}

				Manager.exists(data.userId, (error, exists) => {
					if (error || !exists) {
						const error = new Error();
						error.statusCode = 422;
						error.message = 'Token is incorrect';
						error.code = 'TOKEN_INCORRECT';

						return next(error);
					}

					next(null, true);
				});
			});
		});
	}
};
