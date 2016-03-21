import fs from 'fs';
import { execSync } from 'child_process';
import { isEmpty, isArray, forEach, includes, filter } from 'lodash';

import City from '../dump/City.json';
import Bathhouse from '../dump/Bathhouse.json';
import Room from '../dump/Room.json';
import Order from '../dump/Order.json';
import Schedule from '../dump/Schedule.json';
import Review from '../dump/Review.json';

const DUMP_PATH = 'test/dump';
const DB_NAME = process.env.DB_NAME;

const models = { City, Bathhouse, Room, Order, Schedule, Review };

export function importDB(models) {
	if (isEmpty(models)) throw new Error('models is empty, nothing to import');
	if (!isArray(models)) throw new Error('incorrect format for models, use array');

	const files = fs.readdirSync(DUMP_PATH);

	forEach(models, model => {
		if (!includes(files, `${model}.json`)) throw new Error(`dump file doesn\'t exist for model ${model}`);

		execSync(`rethinkdb import -f ${DUMP_PATH}/${model}.json --table ${DB_NAME}.${model} --force`);
	});
}

export function clearDB() {
	
}

export function getModelDataFor(model, where) {
	return filter(models[model], where);
}