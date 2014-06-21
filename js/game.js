define(function(require) {
	var $ = require('jquery'),
		common_data = require('common_data'),
		enums = require('enums'),
		network = require('network'),
		pubsub = require('pubsub');

	var resize = function() {
			var half_window_width = Math.floor($(window).width() / 2),
				half_window_width_ceil = Math.ceil($(window).width() / 2),
				$board = $('.board'),
				$score = $('.score'),
				cell_width = 0,
				num_rows = 4,
				row_height = 0,
				selectors_and_heights = null,
				$div = null,
				y = $(window).height();

			cell_width = Math.floor((half_window_width - 2) / 12);
			$board.css('left', 0);
			$board.css('top', 0);
			$board.css('width', cell_width * 12 + 2);
			$board.css('height', cell_width * 9 + 2);
			$board.css('font-size', Math.floor(cell_width * 2 / 5) + 'px');

			cell_width = Math.floor((half_window_width - 2) / 18);
			$score.css('left', half_window_width);
			$score.css('top', 0);
			$score.css('width', cell_width * 18 + 2);
			$score.find('tr').css('height', cell_width + 'px');
			$score.css('font-size', Math.floor(cell_width * 2 / 3) + 'px');

			$('.score-player').each(function() {
				if ($(this).css('display') !== 'none') {
					num_rows++;
				}
			});

			row_height = Math.floor(cell_width * 2 / 3);
			selectors_and_heights = [
				['.links', row_height],
				['.action', row_height * 3],
				['.status', row_height * 2],
				['.history', $(window).height() - (num_rows * cell_width + 2) - row_height * 6]
			];
			$.each(selectors_and_heights, function(index, value) {
				$div = $(value[0]);
				$div.css('left', half_window_width);
				$div.css('top', y - value[1]);
				$div.css('width', half_window_width_ceil - 6);
				$div.css('height', value[1]);
				$div.css('font-size', Math.floor(cell_width / 2) + 'px');
				y -= value[1];
			});
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
					}

					if ($score_player.css('display') === 'none') {
						$score_player.show();
						resize();
					}
				}
			}
		},
		setGamePlayerUsername = function(game_id, player_id, username) {
			var $score_player, $score_player_name;

			if (game_id === common_data.game_id) {
				$score_player = $('.score .score-player:eq(' + player_id + ')');
				$score_player_name = $score_player.children('.name');

				$score_player_name.text(username);
				$score_player_name.addClass('missing');

				if ($score_player.css('display') === 'none') {
					$score_player.show();
					resize();
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
					$score_player_name.text(common_data.client_id_to_data[client_id].username);
					$score_player_name.removeClass('missing');
				}

				if ($score_player.css('display') === 'none') {
					$score_player.show();
					resize();
				}
			}
		},
		setGameBoardCell = function(x, y, game_board_type_id) {
			var $cell = $('.board .y' + y + ' .x' + x),
				cell_class = enums.GameBoardTypes[game_board_type_id].replace(/([A-Z])/g, function($1) {
					return '-' + $1.toLowerCase();
				}).substring(1);

			$cell.attr('class', 'x' + x + ' ' + cell_class);
		},
		setGameBoard = function(x_to_y_to_board_type) {
			var num_x, x, y_to_board_type, num_y, y, board_type;

			num_x = x_to_y_to_board_type.length;
			for (x = 0; x < num_x; x++) {
				y_to_board_type = x_to_y_to_board_type[x];
				num_y = y_to_board_type.length;
				for (y = 0; y < num_y; y++) {
					board_type = y_to_board_type[y];
					setGameBoardCell(x, y, board_type);
				}
			}
		},
		setScoreSheetCell = function(row, index, data) {
			var $row, index_class, mark_chain_as_safe = false;

			if (row <= enums.ScoreSheetRows.Player5) {
				if (index <= enums.ScoreSheetIndexes.Imperial) {
					if (data === 0) {
						data = '';
					}
				} else {
					data *= 100;
				}

				$row = $('.score .score-player:eq(' + row + ')');
			} else if (row === enums.ScoreSheetRows.Available) {
				$row = $('.score .score-available');
			} else if (row === enums.ScoreSheetRows.ChainSize) {
				if (data >= 11) {
					mark_chain_as_safe = true;
				}

				if (data === 0) {
					data = '-';
				}

				$row = $('.score .score-chain-size');
			} else if (row === enums.ScoreSheetRows.Price) {
				if (data === 0) {
					data = '-';
				}

				$row = $('.score .score-price');
			}

			index_class = enums.ScoreSheetIndexes[index].toLowerCase();

			$row.children('.' + index_class).text(data);

			if (mark_chain_as_safe) {
				$('.score .' + index_class).addClass('safe');
			}
		},
		setScoreSheet = function(score_sheet_data) {
			var num_rows, row, row_data, num_indexes, index;

			// player data
			num_rows = score_sheet_data[0].length;
			for (row = 0; row < num_rows; row++) {
				row_data = score_sheet_data[0][row];
				num_indexes = row_data.length;
				for (index = 0; index < num_indexes; index++) {
					setScoreSheetCell(row, index, row_data[index]);
				}
			}

			// available, chain size, price
			for (row = enums.ScoreSheetRows.Available; row <= enums.ScoreSheetRows.Price; row++) {
				row_data = score_sheet_data[row - enums.ScoreSheetRows.Available + 1];
				num_indexes = row_data.length;
				for (index = 0; index < num_indexes; index++) {
					setScoreSheetCell(row, index, row_data[index]);
				}
			}
		},
		resetHtml = function() {
			var x, y;
			for (x = 0; x < 12; x++) {
				for (y = 0; y < 9; y++) {
					setGameBoardCell(x, y, enums.GameBoardTypes.Nothing);
				}
			}

			setScoreSheet([
				[
					[0, 0, 0, 0, 0, 0, 0, 60, 60],
					[0, 0, 0, 0, 0, 0, 0, 60, 60],
					[0, 0, 0, 0, 0, 0, 0, 60, 60],
					[0, 0, 0, 0, 0, 0, 0, 60, 60],
					[0, 0, 0, 0, 0, 0, 0, 60, 60],
					[0, 0, 0, 0, 0, 0, 0, 60, 60]
				],
				[25, 25, 25, 25, 25, 25, 25],
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0]
			]);
			$('.score td').removeClass('safe');
			$('.score-player .name').text('');
			$('.score .score-player').hide();
		};

	resize();
	$(window).resize(resize);

	pubsub.subscribe('client-JoinGame', joinGame);
	pubsub.subscribe('server-SetGamePlayerUsername', setGamePlayerUsername);
	pubsub.subscribe('server-SetGamePlayerClientId', setGamePlayerClientId);
	pubsub.subscribe('server-SetGameBoardCell', setGameBoardCell);
	pubsub.subscribe('server-SetGameBoard', setGameBoard);
	pubsub.subscribe('server-SetScoreSheet', setScoreSheet);
	pubsub.subscribe('client-LeaveGame', resetHtml);
	pubsub.subscribe('network-close', resetHtml);

	$('#leave-game').click(function() {
		network.sendMessage(enums.CommandsToServer.LeaveGame);

		return false;
	});

	return null;
});
