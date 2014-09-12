define(function(require) {
	'use strict';

	var common_data = require('common_data'),
		enums = require('enums'),
		pubsub = require('pubsub'),
		scrollbar_width = 0;

	function initializeScrollbarWidth() {
		// from http://benalman.com/projects/jquery-misc-plugins/#scrollbarwidth
		var parent, child;

		parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body');
		child = parent.children();
		scrollbar_width = child.innerWidth() - child.height(99).innerWidth();
		parent.remove();
	}

	function getHyphenatedStringFromEnumName(enum_name) {
		return enum_name.replace(/([A-Z])/g, function($1) {
			return '-' + $1.toLowerCase();
		}).substring(1);
	}

	function getTileName(x, y) {
		return (x + 1) + String.fromCharCode(y + 65);
	}

	function setElementPosition($element, left, top, width, height, font_size) {
		if (left !== null) {
			$element.css('left', left);
		}
		if (top !== null) {
			$element.css('top', top);
		}
		if (width !== null) {
			$element.css('width', width);
		}
		if (height !== null) {
			$element.css('height', height);
		}
		if (font_size !== undefined) {
			$element.css('font-size', font_size + 'px');
		}
	}

	function isScrollAtBottom($element) {
		return $element.scrollTop() + $element.innerHeight() >= $element[0].scrollHeight;
	}

	function scrollToBottom($element) {
		$element.scrollTop($element[0].scrollHeight - $element.innerHeight());
	}

	function getScrollbarWidth() {
		return scrollbar_width;
	}

	function getGameStateText(game_id) {
		var state_text, state_id = common_data.game_id_to_state_id[game_id];

		state_text = enums.GameModes[common_data.game_id_to_mode_id[game_id]] + ', ';
		if (state_id === enums.GameStates.Starting) {
			state_text += 'Starting (Max of ' + common_data.game_id_to_max_players[game_id] + ' Players)';
		} else if (state_id === enums.GameStates.StartingFull) {
			state_text += 'Starting (Full)';
		} else if (state_id === enums.GameStates.InProgress) {
			state_text += 'In Progress';
		} else if (state_id === enums.GameStates.Completed) {
			state_text += 'Completed';
		}

		return state_text;
	}

	function arrayUnique(array) {
		// from http://stackoverflow.com/questions/10191941/jquery-unique-on-an-array-of-strings
		return $.grep(array, function(el, index) {
			return index === $.inArray(el, array);
		});
	}

	function onInitializationComplete() {
		initializeScrollbarWidth();
	}

	pubsub.subscribe(enums.PubSub.Client_InitializationComplete, onInitializationComplete);

	return {
		getHyphenatedStringFromEnumName: getHyphenatedStringFromEnumName,
		getTileName: getTileName,
		setElementPosition: setElementPosition,
		isScrollAtBottom: isScrollAtBottom,
		scrollToBottom: scrollToBottom,
		getScrollbarWidth: getScrollbarWidth,
		getGameStateText: getGameStateText,
		arrayUnique: arrayUnique
	};
});
