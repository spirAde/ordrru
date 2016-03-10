
import fetch from 'isomorphic-fetch';
import { isEmpty } from 'lodash';

const baseUrl = 'http://localhost:3000/api';
const headers = {
	Authorization: __CLIENT__ && localStorage && localStorage.accessToken ? localStorage.accessToken : '',
};

function _fetch(url, options) {
	return new Promise((resolve, reject) => {
		if (!url) {
			reject(new Error('There is no URL provided for the request.'));
		}

		options = Object.assign({}, options, headers);

		fetch(url, options).then(response => {
			return response.json();
		}).then(response => {
			if (response.status >= 200 && response.status < 300) {
				return response.errors ? reject(response.errors) : reject(response);
			}

			return resolve(response);
		}).catch(error => {
			reject(error);
		});
	});
}
const API = {};

export const User = {
	
	/**
	 * Create a new instance of the model and persist it into the data source.
	 * @param {object} data - Model instance data
	 * @return {User}
	 */
	create: async (data) => {
		return _fetch(`${baseUrl}/Users/`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Create a new instance of the model and persist it into the data source.
	 * @param {object} data - Model instance data
	 * @return {User}
	 */
	createMany: async (data) => {
		return _fetch(`${baseUrl}/Users/`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Update an existing model instance or insert a new one into the data source.
	 * @param {object} data - Model instance data
	 * @return {User}
	 */
	upsert: async (data) => {
		return _fetch(`${baseUrl}/Users/`, {
			method: 'put',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Check whether a model instance exists in the data source.
	 * @param {any} id - Model id
	 * @return {Boolean}
	 */
	exists: async (id) => {
	},
	
	/**
	 * Find a model instance by id from the data source.
	 * @param {any} id - Model id
	 * @param {object} filter - Filter defining fields and include
	 * @return {User}
	 */
	findById: async (id, filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/Users/${id}${conditions}`);
	},

	
	/**
	 * Find all instances of the model matched by filter from the data source.
	 * @param {object} filter - Filter defining fields, where, include, order, offset, and limit
	 * @return {Array.<User>}
	 */
	find: async (filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/Users/${conditions}`);
	},

	
	/**
	 * Find first instance of the model matched by filter from the data source.
	 * @param {object} filter - Filter defining fields, where, include, order, offset, and limit
	 * @return {User}
	 */
	findOne: async (filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/Users/findOne${conditions}`);
	},

	
	/**
	 * Update instances of the model matched by where from the data source.
	 * @param {object} where - Criteria to match model instances
	 * @param {object} data - An object of model property name/value pairs
	 * @return {Object} - The number of instances updated
	 */
	updateAll: async (where, data) => {
		return _fetch(`${baseUrl}/Users/update`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Delete a model instance by id from the data source.
	 * @param {any} id - Model id
	 * @return {Object}
	 */
	deleteById: async (id) => {
		return _fetch(`${baseUrl}/Users/${id}`, {
			method: 'delete',
		});
	},
	
	/**
	 * Count instances of the model matched by where from the data source.
	 * @param {object} where - Criteria to match model instances
	 * @return {Number}
	 */
	count: async (where) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/Users/count${conditions}`);
	},

	
	/**
	 * Create a change stream.
	 * @param {object} options - undefined
	 * @return {Readablestream}
	 */
	createChangeStream: async (options) => {
	},
	
	/**
	 * Login a user with username/email and password.
	 * @param {object} credentials - undefined
	 * @param {string} include - Related objects to include in the response. See the description of return value for more details.
	 * @return {Object} - The response body contains properties of the AccessToken created on login.
Depending on the value of `include` parameter, the body may contain additional properties:

  - `user` - `{User}` - Data of the currently logged in user. (`include=user`)


	 */
	login: async (credentials, include) => {
		return _fetch(`${baseUrl}/Users/login`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Logout a user with access token.
	 * @param {string} access_token - Do not supply this argument, it is automatically extracted from request headers.
	 * 
	 */
	logout: async (access_token) => {
		return _fetch(`${baseUrl}/Users/logout`, {
			method: 'put',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Confirm a user registration with email verification token.
	 * @param {string} uid - undefined
	 * @param {string} token - undefined
	 * @param {string} redirect - undefined
	 * 
	 */
	confirm: async (uid, token, redirect) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/Users/${id}${conditions}`);
	},

	
	/**
	 * Reset password for a user with email.
	 * @param {object} options - undefined
	 * 
	 */
	resetPassword: async (options) => {
		return _fetch(`${baseUrl}/Users/reset`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
};
		
export const Bathhouse = {
	
	/**
	 * Create a new instance of the model and persist it into the data source.
	 * @param {object} data - Model instance data
	 * @return {Bathhouse}
	 */
	create: async (data) => {
		return _fetch(`${baseUrl}/bathhouses/`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Create a new instance of the model and persist it into the data source.
	 * @param {object} data - Model instance data
	 * @return {Bathhouse}
	 */
	createMany: async (data) => {
		return _fetch(`${baseUrl}/bathhouses/`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Update an existing model instance or insert a new one into the data source.
	 * @param {object} data - Model instance data
	 * @return {Bathhouse}
	 */
	upsert: async (data) => {
		return _fetch(`${baseUrl}/bathhouses/`, {
			method: 'put',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Check whether a model instance exists in the data source.
	 * @param {any} id - Model id
	 * @return {Boolean}
	 */
	exists: async (id) => {
	},
	
	/**
	 * Find a model instance by id from the data source.
	 * @param {any} id - Model id
	 * @param {object} filter - Filter defining fields and include
	 * @return {Bathhouse}
	 */
	findById: async (id, filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/bathhouses/${id}${conditions}`);
	},

	
	/**
	 * Find all instances of the model matched by filter from the data source.
	 * @param {object} filter - Filter defining fields, where, include, order, offset, and limit
	 * @return {Array.<Bathhouse>}
	 */
	find: async (filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/bathhouses/${conditions}`);
	},

	
	/**
	 * Find first instance of the model matched by filter from the data source.
	 * @param {object} filter - Filter defining fields, where, include, order, offset, and limit
	 * @return {Bathhouse}
	 */
	findOne: async (filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/bathhouses/findOne${conditions}`);
	},

	
	/**
	 * Update instances of the model matched by where from the data source.
	 * @param {object} where - Criteria to match model instances
	 * @param {object} data - An object of model property name/value pairs
	 * @return {Object} - The number of instances updated
	 */
	updateAll: async (where, data) => {
		return _fetch(`${baseUrl}/bathhouses/update`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Delete a model instance by id from the data source.
	 * @param {any} id - Model id
	 * @return {Object}
	 */
	deleteById: async (id) => {
		return _fetch(`${baseUrl}/bathhouses/${id}`, {
			method: 'delete',
		});
	},
	
	/**
	 * Count instances of the model matched by where from the data source.
	 * @param {object} where - Criteria to match model instances
	 * @return {Number}
	 */
	count: async (where) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/bathhouses/count${conditions}`);
	},

	
	/**
	 * Create a change stream.
	 * @param {object} options - undefined
	 * @return {Readablestream}
	 */
	createChangeStream: async (options) => {
	},
};
		
export const Room = {
	
	/**
	 * Create a new instance of the model and persist it into the data source.
	 * @param {object} data - Model instance data
	 * @return {Room}
	 */
	create: async (data) => {
		return _fetch(`${baseUrl}/rooms/`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Create a new instance of the model and persist it into the data source.
	 * @param {object} data - Model instance data
	 * @return {Room}
	 */
	createMany: async (data) => {
		return _fetch(`${baseUrl}/rooms/`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Update an existing model instance or insert a new one into the data source.
	 * @param {object} data - Model instance data
	 * @return {Room}
	 */
	upsert: async (data) => {
		return _fetch(`${baseUrl}/rooms/`, {
			method: 'put',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Check whether a model instance exists in the data source.
	 * @param {any} id - Model id
	 * @return {Boolean}
	 */
	exists: async (id) => {
	},
	
	/**
	 * Find a model instance by id from the data source.
	 * @param {any} id - Model id
	 * @param {object} filter - Filter defining fields and include
	 * @return {Room}
	 */
	findById: async (id, filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/rooms/${id}${conditions}`);
	},

	
	/**
	 * Find all instances of the model matched by filter from the data source.
	 * @param {object} filter - Filter defining fields, where, include, order, offset, and limit
	 * @return {Array.<Room>}
	 */
	find: async (filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/rooms/${conditions}`);
	},

	
	/**
	 * Find first instance of the model matched by filter from the data source.
	 * @param {object} filter - Filter defining fields, where, include, order, offset, and limit
	 * @return {Room}
	 */
	findOne: async (filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/rooms/findOne${conditions}`);
	},

	
	/**
	 * Update instances of the model matched by where from the data source.
	 * @param {object} where - Criteria to match model instances
	 * @param {object} data - An object of model property name/value pairs
	 * @return {Object} - The number of instances updated
	 */
	updateAll: async (where, data) => {
		return _fetch(`${baseUrl}/rooms/update`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Delete a model instance by id from the data source.
	 * @param {any} id - Model id
	 * @return {Object}
	 */
	deleteById: async (id) => {
		return _fetch(`${baseUrl}/rooms/${id}`, {
			method: 'delete',
		});
	},
	
	/**
	 * Count instances of the model matched by where from the data source.
	 * @param {object} where - Criteria to match model instances
	 * @return {Number}
	 */
	count: async (where) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/rooms/count${conditions}`);
	},

	
	/**
	 * Create a change stream.
	 * @param {object} options - undefined
	 * @return {Readablestream}
	 */
	createChangeStream: async (options) => {
	},
};
		
export const City = {
	
	/**
	 * Create a new instance of the model and persist it into the data source.
	 * @param {object} data - Model instance data
	 * @return {City}
	 */
	create: async (data) => {
		return _fetch(`${baseUrl}/cities/`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Create a new instance of the model and persist it into the data source.
	 * @param {object} data - Model instance data
	 * @return {City}
	 */
	createMany: async (data) => {
		return _fetch(`${baseUrl}/cities/`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Update an existing model instance or insert a new one into the data source.
	 * @param {object} data - Model instance data
	 * @return {City}
	 */
	upsert: async (data) => {
		return _fetch(`${baseUrl}/cities/`, {
			method: 'put',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Check whether a model instance exists in the data source.
	 * @param {any} id - Model id
	 * @return {Boolean}
	 */
	exists: async (id) => {
	},
	
	/**
	 * Find a model instance by id from the data source.
	 * @param {any} id - Model id
	 * @param {object} filter - Filter defining fields and include
	 * @return {City}
	 */
	findById: async (id, filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/cities/${id}${conditions}`);
	},

	
	/**
	 * Find all instances of the model matched by filter from the data source.
	 * @param {object} filter - Filter defining fields, where, include, order, offset, and limit
	 * @return {Array.<City>}
	 */
	find: async (filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/cities/${conditions}`);
	},

	
	/**
	 * Find first instance of the model matched by filter from the data source.
	 * @param {object} filter - Filter defining fields, where, include, order, offset, and limit
	 * @return {City}
	 */
	findOne: async (filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/cities/findOne${conditions}`);
	},

	
	/**
	 * Update instances of the model matched by where from the data source.
	 * @param {object} where - Criteria to match model instances
	 * @param {object} data - An object of model property name/value pairs
	 * @return {Object} - The number of instances updated
	 */
	updateAll: async (where, data) => {
		return _fetch(`${baseUrl}/cities/update`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Delete a model instance by id from the data source.
	 * @param {any} id - Model id
	 * @return {Object}
	 */
	deleteById: async (id) => {
		return _fetch(`${baseUrl}/cities/${id}`, {
			method: 'delete',
		});
	},
	
	/**
	 * Count instances of the model matched by where from the data source.
	 * @param {object} where - Criteria to match model instances
	 * @return {Number}
	 */
	count: async (where) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/cities/count${conditions}`);
	},

	
	/**
	 * Create a change stream.
	 * @param {object} options - undefined
	 * @return {Readablestream}
	 */
	createChangeStream: async (options) => {
	},
};
		
export const Order = {
	
	/**
	 * Create a new instance of the model and persist it into the data source.
	 * @param {object} data - Model instance data
	 * @return {Order}
	 */
	create: async (data) => {
		return _fetch(`${baseUrl}/orders/`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Create a new instance of the model and persist it into the data source.
	 * @param {object} data - Model instance data
	 * @return {Order}
	 */
	createMany: async (data) => {
		return _fetch(`${baseUrl}/orders/`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Update an existing model instance or insert a new one into the data source.
	 * @param {object} data - Model instance data
	 * @return {Order}
	 */
	upsert: async (data) => {
		return _fetch(`${baseUrl}/orders/`, {
			method: 'put',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Check whether a model instance exists in the data source.
	 * @param {any} id - Model id
	 * @return {Boolean}
	 */
	exists: async (id) => {
	},
	
	/**
	 * Find a model instance by id from the data source.
	 * @param {any} id - Model id
	 * @param {object} filter - Filter defining fields and include
	 * @return {Order}
	 */
	findById: async (id, filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/orders/${id}${conditions}`);
	},

	
	/**
	 * Find all instances of the model matched by filter from the data source.
	 * @param {object} filter - Filter defining fields, where, include, order, offset, and limit
	 * @return {Array.<Order>}
	 */
	find: async (filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/orders/${conditions}`);
	},

	
	/**
	 * Find first instance of the model matched by filter from the data source.
	 * @param {object} filter - Filter defining fields, where, include, order, offset, and limit
	 * @return {Order}
	 */
	findOne: async (filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/orders/findOne${conditions}`);
	},

	
	/**
	 * Update instances of the model matched by where from the data source.
	 * @param {object} where - Criteria to match model instances
	 * @param {object} data - An object of model property name/value pairs
	 * @return {Object} - The number of instances updated
	 */
	updateAll: async (where, data) => {
		return _fetch(`${baseUrl}/orders/update`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Delete a model instance by id from the data source.
	 * @param {any} id - Model id
	 * @return {Object}
	 */
	deleteById: async (id) => {
		return _fetch(`${baseUrl}/orders/${id}`, {
			method: 'delete',
		});
	},
	
	/**
	 * Count instances of the model matched by where from the data source.
	 * @param {object} where - Criteria to match model instances
	 * @return {Number}
	 */
	count: async (where) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/orders/count${conditions}`);
	},

	
	/**
	 * Create a change stream.
	 * @param {object} options - undefined
	 * @return {Readablestream}
	 */
	createChangeStream: async (options) => {
	},
};
		
export const Review = {
	
	/**
	 * Create a new instance of the model and persist it into the data source.
	 * @param {object} data - Model instance data
	 * @return {Review}
	 */
	create: async (data) => {
		return _fetch(`${baseUrl}/reviews/`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Create a new instance of the model and persist it into the data source.
	 * @param {object} data - Model instance data
	 * @return {Review}
	 */
	createMany: async (data) => {
		return _fetch(`${baseUrl}/reviews/`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Update an existing model instance or insert a new one into the data source.
	 * @param {object} data - Model instance data
	 * @return {Review}
	 */
	upsert: async (data) => {
		return _fetch(`${baseUrl}/reviews/`, {
			method: 'put',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Check whether a model instance exists in the data source.
	 * @param {any} id - Model id
	 * @return {Boolean}
	 */
	exists: async (id) => {
	},
	
	/**
	 * Find a model instance by id from the data source.
	 * @param {any} id - Model id
	 * @param {object} filter - Filter defining fields and include
	 * @return {Review}
	 */
	findById: async (id, filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/reviews/${id}${conditions}`);
	},

	
	/**
	 * Find all instances of the model matched by filter from the data source.
	 * @param {object} filter - Filter defining fields, where, include, order, offset, and limit
	 * @return {Array.<Review>}
	 */
	find: async (filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/reviews/${conditions}`);
	},

	
	/**
	 * Find first instance of the model matched by filter from the data source.
	 * @param {object} filter - Filter defining fields, where, include, order, offset, and limit
	 * @return {Review}
	 */
	findOne: async (filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/reviews/findOne${conditions}`);
	},

	
	/**
	 * Update instances of the model matched by where from the data source.
	 * @param {object} where - Criteria to match model instances
	 * @param {object} data - An object of model property name/value pairs
	 * @return {Object} - The number of instances updated
	 */
	updateAll: async (where, data) => {
		return _fetch(`${baseUrl}/reviews/update`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Delete a model instance by id from the data source.
	 * @param {any} id - Model id
	 * @return {Object}
	 */
	deleteById: async (id) => {
		return _fetch(`${baseUrl}/reviews/${id}`, {
			method: 'delete',
		});
	},
	
	/**
	 * Count instances of the model matched by where from the data source.
	 * @param {object} where - Criteria to match model instances
	 * @return {Number}
	 */
	count: async (where) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/reviews/count${conditions}`);
	},

	
	/**
	 * Create a change stream.
	 * @param {object} options - undefined
	 * @return {Readablestream}
	 */
	createChangeStream: async (options) => {
	},
};
		
export const Schedule = {
	
	/**
	 * Create a new instance of the model and persist it into the data source.
	 * @param {object} data - Model instance data
	 * @return {Schedule}
	 */
	create: async (data) => {
		return _fetch(`${baseUrl}/schedules/`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Create a new instance of the model and persist it into the data source.
	 * @param {object} data - Model instance data
	 * @return {Schedule}
	 */
	createMany: async (data) => {
		return _fetch(`${baseUrl}/schedules/`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Update an existing model instance or insert a new one into the data source.
	 * @param {object} data - Model instance data
	 * @return {Schedule}
	 */
	upsert: async (data) => {
		return _fetch(`${baseUrl}/schedules/`, {
			method: 'put',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Check whether a model instance exists in the data source.
	 * @param {any} id - Model id
	 * @return {Boolean}
	 */
	exists: async (id) => {
	},
	
	/**
	 * Find a model instance by id from the data source.
	 * @param {any} id - Model id
	 * @param {object} filter - Filter defining fields and include
	 * @return {Schedule}
	 */
	findById: async (id, filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/schedules/${id}${conditions}`);
	},

	
	/**
	 * Find all instances of the model matched by filter from the data source.
	 * @param {object} filter - Filter defining fields, where, include, order, offset, and limit
	 * @return {Array.<Schedule>}
	 */
	find: async (filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/schedules/${conditions}`);
	},

	
	/**
	 * Find first instance of the model matched by filter from the data source.
	 * @param {object} filter - Filter defining fields, where, include, order, offset, and limit
	 * @return {Schedule}
	 */
	findOne: async (filter) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/schedules/findOne${conditions}`);
	},

	
	/**
	 * Update instances of the model matched by where from the data source.
	 * @param {object} where - Criteria to match model instances
	 * @param {object} data - An object of model property name/value pairs
	 * @return {Object} - The number of instances updated
	 */
	updateAll: async (where, data) => {
		return _fetch(`${baseUrl}/schedules/update`, {
			method: 'post',
			body: JSON.stringify(data),
		});
	},
	
	/**
	 * Delete a model instance by id from the data source.
	 * @param {any} id - Model id
	 * @return {Object}
	 */
	deleteById: async (id) => {
		return _fetch(`${baseUrl}/schedules/${id}`, {
			method: 'delete',
		});
	},
	
	/**
	 * Count instances of the model matched by where from the data source.
	 * @param {object} where - Criteria to match model instances
	 * @return {Number}
	 */
	count: async (where) => {
		const conditions = isEmpty(filter) ? '' : `?filter=${JSON.stringify(filter)}`;
		return _fetch(`${baseUrl}/schedules/count${conditions}`);
	},

	
	/**
	 * Create a change stream.
	 * @param {object} options - undefined
	 * @return {Readablestream}
	 */
	createChangeStream: async (options) => {
	},
};
		