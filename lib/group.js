'use strict';

const { Thing } = require('abstract-things');
const Api = require('./api');

module.exports = class Device extends Thing.with(Api) {
	static get type() {
		return 'google-cast:group';
	}

	constructor(service) {
		super(service);
	}

};
