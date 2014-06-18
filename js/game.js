define(function(require) {
	var $ = require('jquery'),
		common_data = require('common_data'),
		pubsub = require('pubsub');

	var resize = function() {
			var half_window_width = Math.floor($(window).width() / 2),
				$board = $('.board'),
				$score = $('.score'),
				cell_width = 0;

			cell_width = Math.floor((half_window_width - 2) / 12);
			$board.css('left', 0);
			$board.css('top', 0);
			$board.css('width', cell_width * 12 + 2);
			$board.css('height', cell_width * 9 + 2);

			cell_width = Math.floor((half_window_width - 2) / 18);
			$score.css('left', half_window_width);
			$score.css('top', 0);
			$score.css('width', cell_width * 18 + 2);
			$score.find('tr').css('height', cell_width + 'px');
		},
		joinGame = function() {
			var player_data, player_id, player_datum, $score_player, $score_player_name;

			player_data = common_data.game_id_to_player_data[common_data.game_id];
			for (player_id in player_data) {
				if (player_data.hasOwnProperty(player_id)) {
					player_datum = player_data[player_id];
					$score_player = $('.score .score-player:eq(' + player_id + ')');
					$score_player_name = $score_player.children('.name');

					$score_player_name.text(player_datum.username);

					if (player_datum.client_id === null) {
						$score_player_name.addClass('missing');
					} else {
						$score_player_name.removeClass('missing');
					}

					$score_player.show();
				}
			}
		},
		setGamePlayerClientId = function(game_id, player_id, client_id) {
			var $score_player, $score_player_name;

			if (game_id === common_data.game_id) {
				$score_player = $('.score .score-player:eq(' + player_id + ')');
				$score_player_name = $score_player.children('.name');

				if (client_id === null) {
					$score_player_name.addClass('missing');
				} else {
					$score_player_name.text(common_data.client_id_to_username[client_id]);
					$score_player_name.removeClass('missing');
				}
			}
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

	pubsub.subscribe('client-JoinGame', joinGame);
	pubsub.subscribe('server-SetGamePlayerClientId', setGamePlayerClientId);
	pubsub.subscribe('set-board-cell', commandSetBoardCell);
	pubsub.subscribe('set-board', commandSetBoard);

	return null;
});
