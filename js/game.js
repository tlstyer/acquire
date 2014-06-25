define(function(require) {
	var $ = require('jquery'),
		common_data = require('common_data'),
		common_functions = require('common_functions'),
		enums = require('enums'),
		network = require('network'),
		pubsub = require('pubsub'),
		periodic_resize_check_width = null,
		periodic_resize_check_height = null,
		resize = function() {
			var half_window_width = Math.floor($(window).width() / 2),
				half_window_width_ceil = Math.ceil($(window).width() / 2),
				$game_board = $('#game-board'),
				$score_sheet = $('#score-sheet'),
				cell_width = 0,
				num_rows = 4,
				row_height = 0,
				selectors_and_heights = null,
				$div = null,
				y = $(window).height();

			cell_width = Math.floor((half_window_width - 2) / 12);
			$game_board.css('left', 0);
			$game_board.css('top', 0);
			$game_board.css('width', cell_width * 12 + 2);
			$game_board.css('height', cell_width * 9 + 2);
			$game_board.css('font-size', Math.floor(cell_width * 2 / 5) + 'px');

			cell_width = Math.floor((half_window_width - 2) / 18);
			$score_sheet.css('left', half_window_width);
			$score_sheet.css('top', 0);
			$score_sheet.css('width', cell_width * 18 + 2);
			$score_sheet.find('tr').css('height', cell_width + 'px');
			$score_sheet.css('font-size', Math.floor(cell_width * 2 / 3) + 'px');

			$score_sheet.find('.score-sheet-player').each(function() {
				if ($(this).css('display') !== 'none') {
					num_rows++;
				}
			});

			row_height = Math.floor(cell_width * 2 / 3);
			selectors_and_heights = [
				['#game-links', row_height],
				['#game-action', row_height * 3],
				['#game-status', row_height * 2],
				['#game-history', $(window).height() - (num_rows * cell_width + 2) - row_height * 6]
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
		periodicResizeCheck = function() {
			var width = $(window).width(),
				height = $(window).height();

			if (width !== periodic_resize_check_width || height !== periodic_resize_check_height) {
				periodic_resize_check_width = width;
				periodic_resize_check_height = height;
				resize();
			}

			setTimeout(periodicResizeCheck, 500);
		},
		setGamePlayerData = function(game_id, player_id, username, client_id) {
			var $score_player = null,
				$score_player_name = null,
				ip_and_port = 'missing';

			if (game_id === common_data.game_id) {
				$score_player = $('#score-sheet .score-sheet-player:eq(' + player_id + ')');
				$score_player_name = $score_player.children('.name');

				if (client_id === null) {
					$score_player_name.addClass('missing');
				} else {
					$score_player_name.removeClass('missing');
					ip_and_port = common_data.client_id_to_data[client_id].ip_and_port;
				}
				$score_player_name.attr('title', username + ' (' + ip_and_port + ')');
				$score_player_name.text(username);

				if ($score_player.css('display') === 'none') {
					$score_player.show();
					resize();
				}
			}
		},
		joinGame = function() {
			var player_id = 0,
				player_data = common_data.game_id_to_player_data[common_data.game_id],
				player_datum = null;

			for (player_id in player_data) {
				if (player_data.hasOwnProperty(player_id) && player_id !== common_data.player_id) {
					player_datum = player_data[player_id];
					setGamePlayerData(common_data.game_id, player_id, player_datum.username, player_datum.client_id);
				}
			}
		},
		setGameBoardCell = function(x, y, game_board_type_id) {
			var $cell = $('#game-board .y' + y + ' .x' + x),
				cell_class = common_functions.getHyphenatedStringFromEnumName(enums.GameBoardTypes[game_board_type_id]);

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

				$row = $('#score-sheet .score-sheet-player:eq(' + row + ')');
			} else if (row === enums.ScoreSheetRows.Available) {
				$row = $('#score-sheet-available');
			} else if (row === enums.ScoreSheetRows.ChainSize) {
				if (data >= 11) {
					mark_chain_as_safe = true;
				}

				if (data === 0) {
					data = '-';
				}

				$row = $('#score-sheet-chain-size');
			} else if (row === enums.ScoreSheetRows.Price) {
				if (data === 0) {
					data = '-';
				}

				$row = $('#score-sheet-price');
			}

			index_class = enums.ScoreSheetIndexes[index].toLowerCase();

			$row.children('.' + index_class).text(data);

			if (mark_chain_as_safe) {
				$('#score-sheet .' + index_class).addClass('safe');
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
		addGameHistoryMessage = function(game_history_message_id, player_id) {
			var $message = $('#game-history-' + common_functions.getHyphenatedStringFromEnumName(enums.GameHistoryMessages[game_history_message_id])).clone().removeAttr('id');

			$message.find('.username').text(common_data.game_id_to_player_data[common_data.game_id][player_id].username);

			switch (game_history_message_id) {
			case enums.GameHistoryMessages.DrewStartingTile:
			case enums.GameHistoryMessages.DrewTile:
				$message.find('.tile').text((arguments[2] + 1) + String.fromCharCode(arguments[3] + 65));
				break;
			}

			$('#game-history').append($message);
		},
		setGameAction = function(game_action_id, player_id) {
			var hyphenated_enum_name = common_functions.getHyphenatedStringFromEnumName(enums.GameActions[game_action_id]),
				$action = $('#game-status-' + hyphenated_enum_name).clone().removeAttr('id'),
				$game_action = $('#game-action');

			$action.find('.username').text(common_data.game_id_to_player_data[common_data.game_id][player_id].username);
			$('#game-status').empty().append($action);

			$game_action.empty();
			if (player_id === common_data.player_id) {
				$action = $('#game-action-' + hyphenated_enum_name).clone().removeAttr('id');
				$game_action.append($action);
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
			$('#score-sheet td').removeClass('safe');
			$('#score-sheet .score-sheet-player .name').text('');
			$('#score-sheet .score-sheet-player').hide();

			$('#game-history').empty();
			$('#game-status').empty();
			$('#game-action').empty();
		};

	periodicResizeCheck();

	pubsub.subscribe('client-SetGamePlayerData', setGamePlayerData);
	pubsub.subscribe('client-JoinGame', joinGame);
	pubsub.subscribe('server-SetGameBoardCell', setGameBoardCell);
	pubsub.subscribe('server-SetGameBoard', setGameBoard);
	pubsub.subscribe('server-SetScoreSheet', setScoreSheet);
	pubsub.subscribe('server-AddGameHistoryMessage', addGameHistoryMessage);
	pubsub.subscribe('server-SetGameAction', setGameAction);
	pubsub.subscribe('client-LeaveGame', resetHtml);
	pubsub.subscribe('network-close', resetHtml);

	$('#link-leave-game').click(function() {
		network.sendMessage(enums.CommandsToServer.LeaveGame);

		return false;
	});

	$('#game-action').on('click', 'a', function() {
		var $this = $(this),
			$game_action = $('#game-action');

		if ($this.hasClass('link-start-game')) {
			network.sendMessage(enums.CommandsToServer.DoGameAction, enums.GameActions.StartGame);
			$game_action.empty();
		}

		return false;
	});

	return null;
});
