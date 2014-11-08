define(function(require) {
	'use strict';

	var common_data = require('common_data'),
		enums = require('enums'),
		pubsub = require('pubsub'),
		enable_sound_notifications = null,
		enable_page_title_notifications = null,
		sound = null,
		title = '',
		interval = null,
		showing_title_prefix = false;

	function setOption(key, value) {
		if (key === 'enable-sound-notifications') {
			enable_sound_notifications = value;
		} else if (key === 'enable-page-title-notifications') {
			enable_page_title_notifications = value;
			if (!value) {
				turnOff();
			}
		} else if (key === 'sound') {
			sound = value;
		}
	}

	function intervalCallback() {
		showing_title_prefix = !showing_title_prefix;
		document.title = (showing_title_prefix ? '!!! YOUR TURN !!! ' : '') + title;
	}

	function turnOn() {
		var beep;

		if (enable_sound_notifications) {
			beep = document.getElementById(sound);
			if (typeof beep.readyState === 'number' && beep.readyState > 0) {
				beep.pause();
				beep.currentTime = 0;
				beep.play();
			}
		}

		if (enable_page_title_notifications) {
			if (interval === null) {
				interval = setInterval(intervalCallback, 500);
				intervalCallback();
			}
		}
	}

	function turnOff() {
		if (interval !== null) {
			clearInterval(interval);
			interval = null;
			showing_title_prefix = false;
			document.title = title;
		}
	}

	function onClientSetClientData() {
		title = 'Acquire - ' + common_data.client_id_to_data[common_data.client_id].username;
		showing_title_prefix = !showing_title_prefix;
		intervalCallback();
	}

	function resetTitle() {
		title = 'Acquire';
		showing_title_prefix = !showing_title_prefix;
		intervalCallback();
	}

	pubsub.subscribe(enums.PubSub.Client_SetOption, setOption);
	pubsub.subscribe(enums.PubSub.Client_SetClientData, onClientSetClientData);
	pubsub.subscribe(enums.PubSub.Network_Disconnect, resetTitle);

	return {
		turnOn: turnOn,
		turnOff: turnOff
	};
});
