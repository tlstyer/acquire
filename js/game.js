define(function(require) {
	var $ = require('jquery'),
		pubsub = require('pubsub');

	var moveElement = function($elements, left, top, width, height) {
			$elements.css('left', left);
			$elements.css('top', top);
			$elements.css('width', width);
			$elements.css('height', height);
		},
		resize = function() {
			var half_window_width = Math.floor($(window).width() / 2),
				$board = $('.board'),
				$score = $('.score'),
				cell_width = 0;

			cell_width = Math.floor((half_window_width - 2) / 12);
			moveElement($board, 0, 0, cell_width * 12 + 2, cell_width * 9 + 2);

			cell_width = Math.floor((half_window_width - 2) / 18);
			moveElement($score, half_window_width, 0, cell_width * 18 + 2, cell_width * 10 + 2);
			$score.find('tr').css('height', cell_width + 'px');
		},
		commandSetBoardCell = function(x, y, board_type) {
			var $cell = $('.board .y' + y + ' .x' + x);

			$cell.attr('class', 'x' + x + ' ' + board_type);
		},
		commandSetBoard = function(x_to_y_to_board_type) {
			var num_x, x, y_to_board_type, num_y, y, board_type;

			num_x = x_to_y_to_board_type.length;
			for (x = 0; x < num_x; x++) {
				y_to_board_type = x_to_y_to_board_type[x];
				num_y = y_to_board_type.length;
				for (y = 0; y < num_y; y++) {
					board_type = y_to_board_type[y];
					commandSetBoardCell(x, y, board_type);
				}
			}
		};

	resize();
	$(window).resize(resize);

	pubsub.subscribe('set-board-cell', commandSetBoardCell);
	pubsub.subscribe('set-board', commandSetBoard);

	return null;
});
