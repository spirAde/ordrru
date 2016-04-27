import { map, sample, includes } from 'lodash';

import inquirer from 'inquirer';

import generator from './generator';
import cleaner from './cleaner';
import API from './API';

const questions = [
	{
		type: 'list',
		name: 'type',
		message: 'What will be generate?',
		choices: [
			'data',
			'API',
		],
	},
	{
		type: 'list',
		name: 'action',
		message: 'What type of operation do you want?',
		choices: [
			'generate',
			'clean',
		],
		when: (answers) => answers.type === 'data',
	},
	{
		type: 'checkbox',
		name: 'models',
		message: 'What type of models do you want generate?',
		choices: [
			{ name: 'city' },
			{ name: 'bathhouse' },
			{ name: 'room' },
			{ name: 'order' },
			{ name: 'schedule' },
			{ name: 'comment' },
			{ name: 'all' },
		],
		when: (answers) => answers.type === 'data',
	}
];

inquirer.prompt(questions).then(answers => {
	const { type, models } = answers;

	if (type === 'data') {
		answers.action === 'generate' ? generator(models) : cleaner(models);
	} else {
		API();
	}
});