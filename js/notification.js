define(function(require) {
	var title = 'Acquire',
		title_prefix = '!!! YOUR TURN !!! ',
		interval = null,
		showing_title_prefix = false,
		intervalCallback = function() {
			showing_title_prefix = !showing_title_prefix;
			document.title = (showing_title_prefix ? title_prefix : '') + title;
		},
		turnOn = function() {
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
		};

	return {
		turnOn: turnOn,
		turnOff: turnOff
	};
});
