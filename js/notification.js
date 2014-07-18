define(function(require) {
	var common_data = require('common_data'),
		enums = require('enums'),
		options = require('options'),
		pubsub = require('pubsub'),
		title = '',
		interval = null,
		showing_title_prefix = false,
		intervalCallback = function() {
			showing_title_prefix = !showing_title_prefix;
			document.title = (showing_title_prefix ? '!!! YOUR TURN !!! ' : '') + title;
		},
		turnOn = function() {
			var beep;

			if (options['enable-sound-notifications']) {
				beep = document.getElementById('beep');
				beep.pause();
				beep.currentTime = 0;
				beep.play();
			}

			if (options['enable-page-title-notifications']) {
				if (interval === null) {
					interval = setInterval(intervalCallback, 500);
					intervalCallback();
				}
			}
		},
		turnOff = function() {
			if (interval !== null) {
				clearInterval(interval);
				interval = null;
				showing_title_prefix = false;
				document.title = title;
			}
		},
		onClientSetClientData = function() {
			title = 'Acquire - ' + common_data.client_id_to_data[common_data.client_id].username;
			showing_title_prefix = !showing_title_prefix;
			intervalCallback();
		},
		resetTitle = function() {
			title = 'Acquire';
			showing_title_prefix = !showing_title_prefix;
			intervalCallback();
		};

	pubsub.subscribe(enums.PubSub.Client_SetClientData, onClientSetClientData);
	pubsub.subscribe(enums.PubSub.Network_Close, resetTitle);
	pubsub.subscribe(enums.PubSub.Network_Error, resetTitle);

	return {
		turnOn: turnOn,
		turnOff: turnOff
	};
});
