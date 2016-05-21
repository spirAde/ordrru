import { UPDATE_SCHEDULE } from '../../client/scripts/actions/schedule-actions';
import { ADD_ORDER } from '../../client/scripts/actions/order-actions';

import { addOrder } from '../../client/scripts/actions/order-actions';
import { addNotification } from '../../client/scripts/actions/notification-actions';
import { updateScheduleIfNeed } from '../../client/scripts/actions/schedule-actions';

const handlers = {
	[UPDATE_SCHEDULE](dispatch, action) {
		const { roomId, schedule } = action.payload;
		dispatch(updateScheduleIfNeed(roomId, schedule, 'socket'));
	},
	[ADD_ORDER](dispatch, action) {
		const { order } = action.payload;
		const message = order.createdByUser ?
			'ORDER_CREATED_BY_USER_SUCCESSFULLY' : 'ORDER_CREATED_BY_MANAGER_SUCCESSFULLY';

		dispatch(addOrder(order));
		dispatch(addNotification({
			message,
			level: 'success',
		}));
	},
};

export default function createSocketMiddleware(socket, { eventName = 'action' } = {}) {
	const prefix = 'server/';

	return ({ dispatch, getState }) => {
		socket.on(eventName, action => {
			const handler = handlers[action.type];
			
			if (!handler) {
				throw new Error(
					'uncaught socket action - %s, with data %', action.type, JSON.stringify(action.payload)
				);
			}

			handler(dispatch, action);
		});

		return next => action => {
			if (action.meta && action.meta.remote) {
				socket.emit(`${prefix}${action.type}`, action.payload);
			}

			return next(action);
		};
	};
}