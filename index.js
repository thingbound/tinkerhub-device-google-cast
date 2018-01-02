'use strict';

const th = require('tinkerhub');
const mdns = require('tinkerhub-mdns');

const { Discovery } = require('abstract-things');
const Device = require('./lib/device');
const Group = require('./lib/group');

// Create a browser that looks for Google Cast instances
const browser = mdns.browser({
	type: 'googlecast'
});

// Wrap the service browser with a thing discovery
const discovery = new Discovery(browser, service => {
	const type = service.txt.md;

	if(type === 'Google Cast Group') {
		return new Group(service);
	}

	return new Device(service);
});
th.registerDiscovery(discovery);
