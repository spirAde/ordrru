require('dotenv').config({path: 'envs/.env.development'});

import util from 'util';
import fs from 'fs';
import path from 'path';
import { map, forEach, find, trim, isArray, capitalize, filter } from 'lodash';

import { dedent } from './utils';

const METHOD_REGEX = /^prototype/;
const SCOPE_METHOD_REGEX = /^prototype.__([^_]+)__(.+)$/;

export default () => {

	const run = require('./server');

	run((error, app) => {
		/*if (error) throw error;

		const results = [];

		const classes = app.handler('rest').adapter.getClasses();

		//debug(classes);

		const classModels = map(classes, classModel => {
			classModel.description = classModel.sharedClass.ctor.settings.description;

			if (!classModel.ctor) {
				console.error(`Skipping ${name} as it is not a LoopBack model`);
				return;
			}

			classModel.methods = filter(classModel.methods, method => !method.name.match(METHOD_REGEX));

			forEach(classModel.methods, (method, key) => {
				if (method.name === 'create') {
					const createMany = Object.create(method);
					createMany.name = 'createMany';
					createMany.isReturningArray = function() { return true; };
					classModel.methods.splice(key + 1, 0, createMany);
				}

				const ctor = method.restClass.ctor;

				if (!ctor || method.sharedMethod.isStatic) return;

				method.accepts = ctor.accepts.concat(method.accepts);

				if (!method.accepts) return;

				forEach(method.accepts, arg => {
					if (!arg.http) return;

					if (arg.http.source === 'path' && arg.arg !== 'id') {

						if (!method.resourceParams) {
							method.resourceParams = [];
							method.hasResourceParams = true;
						}

						method.resourceParams.push(arg);
					}
				});
			});*/

		const results = [];

		app.handler('rest').adapter.getClasses().forEach(classModel => {
			const name = classModel.name;

			if (!classModel.ctor) {
				console.error(`Skipping ${name} as it is not a LoopBack model`);
				return;
			}

			classModel.methods = classModel.methods.filter(method => !method.name.match(METHOD_REGEX));
			classModel.methods.forEach(function fixArgsOfPrototypeMethods(method, key) {
				if (method.name === 'create') {
					var createMany = Object.create(method);
					createMany.name = 'createMany';
					createMany.isReturningArray = function() { return true; };
					classModel.methods.splice(key + 1, 0, createMany);
				}
				const ctor = method.restClass.ctor;
				if (!ctor || method.sharedMethod.isStatic) return;
				method.accepts = ctor.accepts.concat(method.accepts);

				if (!method.accepts) return;

				method.accepts.forEach(function findResourceParams(arg) {
					if (!arg.http) return;

					if (arg.http.source === 'path' && arg.arg !== 'id') {
						if (!method.resourceParams) {
							method.resourceParams = [];
							method.hasResourceParams = true;
						}
						method.resourceParams.push(arg);
					}
				});
			});

			classModel.isUser = classModel.sharedClass.ctor.prototype instanceof app.loopback.User ||
				classModel.sharedClass.ctor.prototype === app.loopback.User.prototype;
			results[name] = classModel;
		});

		//buildScopes(results);

		renderAPI(results, () => {
			process.exit();
		});
	});
}

function renderAPI(models, callback) {

	let API = '';

	API += `
require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import Cookies from 'js-cookie';
import { isEmpty, assign, has } from 'lodash';

const baseUrl = '${process.env.API_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}/api';
const headers = {
	Authorization: __CLIENT__ && localStorage && localStorage.accessToken ? localStorage.accessToken : '',
	Accept: 'application/json',
	'Content-Type': 'application/json',
};

function setAuthorization(headers) {
	const rawToken = Cookies.get('token');

	if (!rawToken || !__CLIENT__) return headers;

	const token = JSON.parse(rawToken);

	if (isEmpty(token) || !token.id) return headers;

	return assign({}, headers, { Authorization: token.id });
}
function checkStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response;
	} else {
		var error = new Error(response.statusText);
		error.response = response;
		throw error;
	}
}

function parseText(response) {
	return response.text();
}

function _fetch(url, options) {
	if (!url) {
		throw new Error('There is no URL provided for the request.');
	}

	const headers = {
		Accept: 'application/json',
		'Content-Type': 'application/json; charset=utf-8',
	};

	const newOptions = assign({}, options, { headers: setAuthorization(headers) });

	const fetch_ = fetch.bind(undefined);

	return fetch_(url, newOptions)
		.then(checkStatus)
		.then(parseText)
		.then(response => {
			// catch if status === 204
			if (!response) return false;

			const data = JSON.parse(response);

			if (has(data, 'error')) {
				throw data.error;
			}

			return data;
		}).catch(error => { throw error; });
}\n`;

	API += `const API = {};\n`;

	Object.keys(models).forEach(modelName => {
		API += `
export const ${modelName} = {`;

		const model = models[modelName];
		const methods = model.methods;

		const modelRoute = model.routes[0].path;

		methods.forEach(methodData => {
			const doc = renderDoc(methodData);
			const method = renderMethod(methodData, modelRoute);

			API += `
	${doc}
	${method}`;
		});

		API += `
};
		`;
	});

	fs.writeFile(path.join(__dirname, '../../client/scripts/API.js'), API, function(error) {
		if (error) console.log(error);
		callback();
	});
}

function renderMethod(method, modelRoute) {
	const args = map(method.accepts, 'arg').join(', ');

	let renderedMethod = `${method.name}: async (${args}) => {`;

	if (method.routes.length === 1) {
		const route = method.routes[0].path;
		const methodType = method.routes[0].verb;

		if (method.name === 'login') {
			renderedMethod += '\n\t\tconst conditions = include ? `?include=${include}` : \'\';';
			renderedMethod += '\n\t\treturn _fetch(`${baseUrl}' + `${modelRoute}${route}` + '${conditions}`, {';
			renderedMethod += `\n\t\t\tmethod: 'post',`;
			renderedMethod += '\n\t\t\tbody: JSON.stringify(credentials),';
			renderedMethod += '\n\t\t});';
			renderedMethod += '\n\t},';
		} else if (method.name === 'logout') {
			renderedMethod += '\n\t\treturn _fetch(`${baseUrl}' + `${modelRoute}${route}` + '`, {';
			renderedMethod += `\n\t\t\tmethod: 'post',`;
			renderedMethod += '\n\t\t});';
			renderedMethod += '\n\t},';
		} else if (methodType === 'get') {
			renderedMethod += '\n\t\tconst conditions = isEmpty(filter) ? \'\' : `?filter=${JSON.stringify(filter)}`;\n';

			if (args.indexOf('id') === -1) {
				renderedMethod += '\t\treturn _fetch(`${baseUrl}' + `${modelRoute}${route}` + '${conditions}`);\n';
			} else {
				renderedMethod += '\t\treturn _fetch(`${baseUrl}' + `${modelRoute}` + '/${id}${conditions}`);\n';
			}

			renderedMethod += `\t},\n`;
		} else if (methodType === 'post') {
			renderedMethod += '\n\t\treturn _fetch(`${baseUrl}' + `${modelRoute}${route}` + '`, {';
			renderedMethod += `\n\t\t\tmethod: 'post',`;
			renderedMethod += '\n\t\t\tbody: JSON.stringify(data),';
			renderedMethod += '\n\t\t});';
			renderedMethod += '\n\t},';
		} else if (methodType === 'del') {
			if (args.indexOf('id') === -1) {
				renderedMethod += '\n\t\treturn _fetch(`${baseUrl}' + `${modelRoute}${route}` + '`, {';
				renderedMethod += `\n\t\t\tmethod: 'delete',`;
				renderedMethod += '\n\t\t\tbody: JSON.stringify(data),';
				renderedMethod += '\n\t\t});';
				renderedMethod += '\n\t},';
			} else {
				renderedMethod += '\n\t\treturn _fetch(`${baseUrl}' + `${modelRoute}` + '/${id}`, {';
				renderedMethod += `\n\t\t\tmethod: 'delete',`;
				renderedMethod += '\n\t\t});';
				renderedMethod += '\n\t},';
			}
		} else {
			renderedMethod += '\n\t\treturn _fetch(`${baseUrl}' + `${modelRoute}${route}` + '`, {';
			renderedMethod += `\n\t\t\tmethod: 'put',`;
			renderedMethod += '\n\t\t\tbody: JSON.stringify(data),';
			renderedMethod += '\n\t\t});';
			renderedMethod += '\n\t},';
		}
	} else {
		renderedMethod += '\n\t},';
	}

	return renderedMethod;
}

function renderDoc(method) {
	let doc = '';

	const params = map(method.accepts, accept =>
		`@param {${accept.type}} ${accept.arg} - ${accept.description}`).join('\n\t * ');

	let returns = '';

	if (method.returns[0] && method.returns[0].type) {

		const type = capitalize(method.returns[0].type);

		if (isArray(method.returns[0].type)) {
			returns += `@return {Array.<${type}>}`;
		} else {
			returns += `@return {${type}}`;
		}

		if (method.returns[0].description) {
			returns += ' - ' + method.returns[0].description;
		}
	}

	doc += `
	/**
	 * ${method.description}
	 * ${params}
	 * ${returns}
	 */`;

	return doc;
}

function buildScopes(models) {
	for (var modelName in models) {
		buildScopesOfModel(models, modelName);
	}
}

function buildScopesOfModel(models, modelName) {
	var modelClass = models[modelName];

	modelClass.scopes = {};
	modelClass.methods.forEach(function(method) {
		buildScopeMethod(models, modelName, method);
	});

	return modelClass;
}

// reverse-engineer scope method
// defined by loopback-datasource-juggler/lib/scope.js
function buildScopeMethod(models, modelName, method) {
	var modelClass = models[modelName];
	var match = method.name.match(SCOPE_METHOD_REGEX);
	if (!match) {
		//console.log(method.name);
		return;
	};

	var op = match[1];
	var scopeName = match[2];
	var modelPrototype = modelClass.sharedClass.ctor.prototype;
	var targetClass = modelPrototype[scopeName] &&
		modelPrototype[scopeName]._targetClass;

	if (modelClass.scopes[scopeName] === undefined) {
		if (!targetClass) {
			console.error(
				'Warning: scope %s.%s is missing _targetClass property.' +
				'\nThe Angular code for this scope won\'t be generated.' +
				'\nPlease upgrade to the latest version of' +
				'\nloopback-datasource-juggler to fix the problem.',
				modelName, scopeName);
			modelClass.scopes[scopeName] = null;
			return;
		}

		if (!findModelByName(models, targetClass)) {
			console.error(
				'Warning: scope %s.%s targets class %j, which is not exposed ' +
				'\nvia remoting. The Angular code for this scope won\'t be generated.',
				modelName, scopeName, targetClass);
			modelClass.scopes[scopeName] = null;
			return;
		}

		modelClass.scopes[scopeName] = {
			methods: {},
			targetClass: targetClass
		};
	} else if (modelClass.scopes[scopeName] === null) {
		// Skip the scope, the warning was already reported
		return;
	}

	var apiName = scopeName;
	if (op === 'get') {
		// no-op, create the scope accessor
	} else if (op === 'delete') {
		apiName += '.destroyAll';
	} else {
		apiName += '.' + op;
	}

	// Names of resources/models in Angular start with a capital letter
	var ngModelName = modelName[0].toUpperCase() + modelName.slice(1);
	method.internal = 'Use ' + ngModelName + '.' + apiName + '() instead.';

	// build a reverse record to be used in ngResource
	// Product.__find__categories -> Category.::find::product::categories
	var reverseName = '::' + op + '::' + modelName + '::' + scopeName;

	var reverseMethod = Object.create(method);
	reverseMethod.name = reverseName;
	reverseMethod.internal = 'Use ' + ngModelName + '.' + apiName + '() instead.';
	// override possibly inherited values
	reverseMethod.deprecated = false;

	var reverseModel = findModelByName(models, targetClass);
	reverseModel.methods.push(reverseMethod);
	if (reverseMethod.name.match(/create/)){
		var createMany = Object.create(reverseMethod);
		createMany.name = createMany.name.replace(
			/create/,
			'createMany'
		);
		createMany.internal = createMany.internal.replace(
			/create/,
			'createMany'
		);
		createMany.isReturningArray = function() { return true; };
		reverseModel.methods.push(createMany);
	}

	var scopeMethod = Object.create(method);
	scopeMethod.name = reverseName;
	// override possibly inherited values
	scopeMethod.deprecated = false;
	scopeMethod.internal = false;
	modelClass.scopes[scopeName].methods[apiName] = scopeMethod;
	if (scopeMethod.name.match(/create/)){
		var scopeCreateMany = Object.create(scopeMethod);
		scopeCreateMany.name = scopeCreateMany.name.replace(
			/create/,
			'createMany'
		);
		scopeCreateMany.isReturningArray = function() { return true; };
		apiName = apiName.replace(/create/, 'createMany');
		modelClass.scopes[scopeName].methods[apiName] = scopeCreateMany;
	}
}

function findModelByName(models, name) {
	for (var n in models) {
		if (n.toLowerCase() === name.toLowerCase())
			return models[n];
	}
}

function debug(data) {
	fs.writeFile(path.join(__dirname, './smth.js'), util.inspect(data, false, null), function(error) {
		if (error) console.log(error);
	});
}

function indent(length, string) {
	return
}