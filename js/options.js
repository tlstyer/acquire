define(function(require) {
	'use strict';

	var common_functions = require('common_functions'),
		enums = require('enums'),
		pubsub = require('pubsub'),
		current_page = null,
		page_to_position = {},
		details = {
			'enable-page-title-notifications': {
				'type': 'checkbox',
				'default': true,
				'valid': [true, false]
			},
			'enable-sound-notifications': {
				'type': 'checkbox',
				'default': true,
				'valid': [true, false],
				'disable': function() {
					return document.getElementById('beep').pause === undefined;
				}
			},
			'enable-high-contrast-colors': {
				'type': 'checkbox',
				'default': false,
				'valid': [true, false]
			},
			'game-board-label-mode': {
				'type': 'select',
				'default': 'coordinates',
				'valid': ['coordinates', 'hotel initials', 'nothing']
			}
		},
		got_local_storage = window.hasOwnProperty('localStorage');

	function setPosition() {
		var position = page_to_position[current_page];

		common_functions.setElementPosition($('#options'), position.left, position.top, position.width, position.height);
	}

	function setPage(page) {
		current_page = page;

		if (page === 'lobby') {
			setPosition();
			$('#options').show();
		} else {
			$('#options').hide();
		}
	}

	function setPositionForPage(page, left, top, width, height) {
		page_to_position[page] = {
			left: left,
			top: top,
			width: width,
			height: height
		};

		if (page === current_page) {
			setPosition();
		}
	}

	function getStoredOptionValue(key) {
		var value = null;

		if (got_local_storage) {
			value = localStorage[key];

			if (value === undefined) {
				value = null;
			} else {
				try {
					value = JSON.parse(value);
				} catch (e) {
					value = null;
				}
			}
		}

		return value;
	}

	function setStoredOptionValue(key, value) {
		if (got_local_storage) {
			localStorage[key] = JSON.stringify(value);
		}
	}

	function initialize() {
		var key, detail, value, disable, $input;

		for (key in details) {
			if (details.hasOwnProperty(key)) {
				detail = details[key];

				value = getStoredOptionValue(key);
				if ($.inArray(value, detail.valid) === -1) {
					value = detail['default'];
				}

				disable = detail.hasOwnProperty('disable') && detail.disable();

				$input = $('#option-' + key);
				switch (detail.type) {
				case 'checkbox':
					if (disable) {
						value = false;
						$input.prop('disabled', true);
						$input.next().addClass('disabled');
					}
					$input.prop('checked', value);
					break;
				case 'select':
					$input.val(value);
					break;
				}

				setStoredOptionValue(key, value);
				pubsub.publish(enums.PubSub.Client_SetOption, key, value);
			}
		}
	}

	function processChange() {
		/* jshint validthis:true */
		var $input = $(this),
			key = $input.attr('id').substr(7),
			detail = details[key],
			value;

		switch (detail.type) {
		case 'checkbox':
			value = $input.prop('checked');
			break;
		case 'select':
			value = $input.val();
			break;
		}

		setStoredOptionValue(key, value);
		pubsub.publish(enums.PubSub.Client_SetOption, key, value);
	}

	function onInitializationComplete() {
		initialize();

		$('#options input, #options select').change(processChange);
	}

	pubsub.subscribe(enums.PubSub.Client_SetPage, setPage);
	pubsub.subscribe(enums.PubSub.Client_InitializationComplete, onInitializationComplete);

	return {
		setPositionForPage: setPositionForPage
	};
});
