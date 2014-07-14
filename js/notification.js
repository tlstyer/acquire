define(function(require) {
	var common_data = require('common_data'),
		pubsub = require('pubsub'),
		title = '',
		interval = null,
		showing_title_prefix = false,
		intervalCallback = function() {
			showing_title_prefix = !showing_title_prefix;
			document.title = (showing_title_prefix ? '!!! YOUR TURN !!! ' : '') + title;
		},
		turnOn = function() {
			var beep = document.getElementById('beep');

			beep.pause();
			beep.currentTime = 0;
			beep.play();

			if (interval === null) {
				interval = setInterval(intervalCallback, 500);
				intervalCallback();
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

	pubsub.subscribe('client-SetClientData', onClientSetClientData);
	pubsub.subscribe('network-Close', resetTitle);
	pubsub.subscribe('network-Error', resetTitle);

	return {
		turnOn: turnOn,
		turnOff: turnOff
	};
});
