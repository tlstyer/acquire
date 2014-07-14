define(function(require) {
	var $ = require('jquery'),
		common_functions = require('common_functions'),
		pubsub = require('pubsub'),
		data = {},
		current_page = null,
		page_to_position = {},
		setPosition = function() {
			var position = page_to_position[current_page];

			common_functions.setElementPosition($('#options'), position.left, position.top, position.width, position.height);
		},
		setPage = function(page) {
			current_page = page;

			if (page === 'lobby') {
				setPosition();
				$('#options').show();
			} else {
				$('#options').hide();
			}
		},
		setPositionForPage = function(page, left, top, width, height) {
			page_to_position[page] = {
				left: left,
				top: top,
				width: width,
				height: height
			};

			if (page === current_page) {
				setPosition();
			}
		},
		details = {
			'enable-page-title-notifications': {
				'type': 'checkbox',
				'default': true
			},
			'enable-sound-notifications': {
				'type': 'checkbox',
				'default': true
			}
		},
		got_local_storage = 'localStorage' in window,
		getStoredOptionValue = function(key) {
			var value = null;

			if (got_local_storage) {
				value = localStorage[key];

				if (typeof value === 'undefined') {
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
		},
		setStoredOptionValue = function(key, value) {
			if (got_local_storage) {
				localStorage[key] = JSON.stringify(value);
			}
		},
		initialize = function() {
			var key, detail, value, $input;

			for (key in details) {
				if (details.hasOwnProperty(key)) {
					detail = details[key];
					value = getStoredOptionValue(key);

					switch (detail.type) {
					case 'checkbox':
						if (value !== true && value !== false) {
							value = detail['default'];
						}
						break;
					}

					setStoredOptionValue(key, value);
					data[key] = value;

					$input = $('#option-' + key);
					switch (detail.type) {
					case 'checkbox':
						$input.prop('checked', value);
						break;
					}
				}
			}

			data.setPositionForPage = setPositionForPage;
		},
		processClick = function() {
			var $input = $(this),
				key = $input.attr('id').substr(7),
				detail = details[key],
				value;

			switch (detail.type) {
			case 'checkbox':
				value = $input.prop('checked');
				break;
			}

			setStoredOptionValue(key, value);
			data[key] = value;
		};

	initialize();

	$('#options').on('click', 'input', processClick);

	pubsub.subscribe('client-SetPage', setPage);

	return data;
});
