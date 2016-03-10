export default function createSocketMiddleware(socket, { eventName = 'action' } = {}) {

	const prefix = 'server/';

	return ({ dispatch, getState }) => {

		// Catch all server-side events and dispatch actions
		socket.on(eventName, dispatch);

		return next => action => {
			if (action.meta && action.meta.remote) {
				socket.emit(`${prefix}${action.type}`, action.payload);
			}

			return next(action);
		};
	};
}