'use strict';

const { Thing } = require('abstract-things');
const Api = require('./api');

module.exports = class Device extends Thing.with(Api) {

	constructor(service) {
		super(service);

		const type = service.txt.md.toLowerCase().replace(/\s+/g, '-');
		this.metadata.addTypes('google-cast:' + type);
	}

};
