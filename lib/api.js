'use strict';

const { Thing } = require('abstract-things');
const { AdjustableVolume, Muteable } = require('abstract-things/media');

const { Client } = require('castv2-client');

module.exports = Thing.mixin(Parent => class extends Parent.with(AdjustableVolume, Muteable) {
	static get type() {
		return 'google-cast';
	}

	constructor(service) {
		super();

		this.service = service;

		this.id = 'uuid:' + service.txt.id;
		this.metadata.name = service.txt.fn;
	}

	async initCallback() {
		await super.initCallback();

		this._client = new Client();

		// Listen for status updates
		this._client.on('status', status => this.updateStatus(status));

		// Error handling
		this._client.on('error', err => {
			this.debug('Error occurred:', err);

			if(this._reject) {
				// The error has occurred during the initalization
				this._reject();
				delete this._reject;
			} else {
				// Destroy this thing on any error
				this.destroy();
			}
		});

		return new Promise((resolve, reject) => {
			// Store the reject callback for error handling
			this._reject = reject;

			this._client.connect({
				host: this.service.addresses[0],
				port: this.service.port
			}, () => {
				this.debug('Connected to', this.service.addresses[0] + ':' + this.service.port);

				this._client.getStatus((err, data) => {
					if(err) {
						delete this._reject;
						reject('Could not get initial status');
						return;
					}

					this.updateStatus(data);
					delete this._reject;
					resolve();
				});
			});
		});
	}

	async destroyCallback() {
		await super.destroyCallback();

		this._client.close();
	}

	updateStatus(status) {
		this.debug('Updating status', status);
		this.updateVolume(status.volume.level * 100);
		this.updateMuted(status.volume.muted);
	}

	changeVolume(volume) {
		return new Promise((resolve, reject) => {
			this._client.setVolume({ level: volume / 100 }, (err) => {
				if(err) {
					this.debug('Unable to change volume:', err);
					reject(new Error('Unable to change volume: ' + err.message));
					return;
				}

				this.updateVolume(volume);
				resolve();
			});
		});
	}

	changeMuted(muted) {
		return new Promise((resolve, reject) => {
			this._client.setVolume({ muted: muted }, (err) => {
				if(err) {
					this.debug('Unable to change muted state:', err);
					reject(new Error('Unable to change mute state: ' + err.message));
					return;
				}

				this.updateMuted(muted);
				resolve();
			});
		});
	}
});
