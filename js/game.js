define(function(require) {
	var $ = require('jquery'),
		common_data = require('common_data'),
		common_functions = require('common_functions'),
		enums = require('enums'),
		network = require('network'),
		pubsub = require('pubsub'),
		resize = function() {
			var half_window_width = Math.floor($(window).width() / 2),
				half_window_width_ceil = Math.ceil($(window).width() / 2),
				$score_sheet = $('#score-sheet'),
				cell_width_gb = 0,
				cell_width_ss = 0,
				num_rows = 4,
				left = null,
				top = null,
				width = null,
				height = null,
				font_size = null,
				setCss = function($div, left, top, width, height, font_size) {
					if (left !== null) {
						$div.css('left', left);
					}
					if (top !== null) {
						$div.css('top', top);
					}
					if (width !== null) {
						$div.css('width', width);
					}
					if (height !== null) {
						$div.css('height', height);
					}
					if (font_size !== null) {
						$div.css('font-size', font_size + 'px');
					}
				};

			cell_width_gb = Math.floor((half_window_width - 2) / 12);
			top = 0;
			height = cell_width_gb * 9 + 2;
			font_size = Math.floor(cell_width_gb * 2 / 5);
			setCss($('#game-board'), 0, top, cell_width_gb * 12 + 2, height, font_size);

			setCss($('.button-hotel'), null, null, cell_width_gb, cell_width_gb, font_size);
			$('#gps-cart .button-hotel').css('width', Math.floor(cell_width_gb * 4 / 3));

			top += height + 2;
			height = cell_width_gb;
			setCss($('#game-tile-rack'), 0, top, half_window_width, height, font_size);

			top += height + 2;
			height = $(window).height() - top;
			setCss($('#game-action'), 0, top, half_window_width, height, font_size);

			cell_width_ss = Math.floor((half_window_width - 2) / 18);
			setCss($score_sheet, half_window_width, 0, cell_width_ss * 18 + 2, null, Math.floor(cell_width_ss * 2 / 3));
			$score_sheet.find('tr').css('height', cell_width_ss + 'px');

			$score_sheet.find('.score-sheet-player').each(function() {
				if ($(this).css('display') !== 'none') {
					num_rows++;
				}
			});

			left = half_window_width + 2;
			top = $(window).height() + 2;
			width = half_window_width_ceil - 2;
			font_size = Math.floor(cell_width_ss / 2);

			height = 22;
			top -= height + 2;
			setCss($('#game-links'), left, top, width, height, null);

			height = 22;
			top -= height + 2;
			setCss($('#game-status'), left, top, width, height, null);

			height = top - num_rows * cell_width_ss - 6;
			top -= height + 2;
			setCss($('#game-history'), left, top, width, height, null);
		},
		periodic_resize_check_width = null,
		periodic_resize_check_height = null,
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
			var $cell = $('#gb-' + x + '-' + y),
				cell_class = common_functions.getHyphenatedStringFromEnumName(enums.GameBoardTypes[game_board_type_id]);

			$cell.attr('class', cell_class);
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
		setTile = function(tile_index, x, y, game_board_type_id) {
			var $button = $('#game-tile-' + tile_index);
			$button.attr('class', 'button-hotel ' + common_functions.getHyphenatedStringFromEnumName(enums.GameBoardTypes[game_board_type_id]));
			$button.val(common_functions.getTileName(x, y));
			$button.css('visibility', 'visible');

			setGameBoardCell(x, y, enums.GameBoardTypes.IHaveThis);
		},
		setTileGameBoardType = function(tile_index, game_board_type_id) {
			var $button = $('#game-tile-' + tile_index);
			$button.attr('class', 'button-hotel ' + common_functions.getHyphenatedStringFromEnumName(enums.GameBoardTypes[game_board_type_id]));
		},
		score_sheet_data = [
			[0, 0, 0, 0, 0, 0, 0, 60, 60],
			[0, 0, 0, 0, 0, 0, 0, 60, 60],
			[0, 0, 0, 0, 0, 0, 0, 60, 60],
			[0, 0, 0, 0, 0, 0, 0, 60, 60],
			[0, 0, 0, 0, 0, 0, 0, 60, 60],
			[0, 0, 0, 0, 0, 0, 0, 60, 60],
			[25, 25, 25, 25, 25, 25, 25],
			[0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0]
		],
		setScoreSheetCell = function(row, index, data) {
			var $row, index_class, mark_chain_as_safe = false;

			score_sheet_data[row][index] = data;

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
			var $message = $('#game-history-' + common_functions.getHyphenatedStringFromEnumName(enums.GameHistoryMessages[game_history_message_id])).clone().removeAttr('id'),
				$game_history = $('#game-history'),
				at_bottom = $game_history.scrollTop() + $game_history.innerHeight() >= $game_history[0].scrollHeight,
				$element, parts, length, index, entry, name;

			$message.find('.username').text(common_data.game_id_to_player_data[common_data.game_id][player_id].username);

			switch (game_history_message_id) {
			case enums.GameHistoryMessages.DrewPositionTile:
			case enums.GameHistoryMessages.DrewTile:
			case enums.GameHistoryMessages.PlayedTile:
				$message.find('.tile').text(common_functions.getTileName(arguments[2], arguments[3]));
				break;
			case enums.GameHistoryMessages.FormedChain:
				$element = $message.find('.chain');
				$element.addClass(enums.GameBoardTypes[arguments[2]].toLowerCase());
				$element.text(enums.GameBoardTypes[arguments[2]]);
				break;
			case enums.GameHistoryMessages.PurchasedShares:
				$element = $message.find('.chains');
				parts = [];
				length = arguments[2].length;
				for (index = 0; index < length; index++) {
					entry = arguments[2][index];
					name = enums.GameBoardTypes[entry[0]];
					parts.push(entry[1] + ' <span class="' + name.toLowerCase() + '">' + name + '</span>');
				}

				if (parts.length === 0) {
					$element.text('nothing');
				} else if (parts.length === 1) {
					$element.html(parts[0]);
				} else if (parts.length === 2) {
					$element.html(parts[0] + ' and ' + parts[1]);
				} else if (parts.length === 3) {
					$element.html(parts[0] + ', ' + parts[1] + ', and ' + parts[2]);
				}
				break;
			}

			$game_history.append($message);

			if (at_bottom) {
				$game_history.scrollTop($game_history[0].scrollHeight - $game_history.innerHeight());
			}
		},
		play_tile_action_enabled = false,
		gameActionConstructorPlayTile = function() {
			play_tile_action_enabled = true;
		},
		gameTileRackButtonClicked = function($button) {
			if (play_tile_action_enabled && !$button.hasClass('cant-play-ever') && !$button.hasClass('cant-play-now')) {
				network.sendMessage(enums.CommandsToServer.DoGameAction, enums.GameActions.PlayTile, parseInt($button.attr('data-index'), 10));
				$button.css('visibility', 'hidden');

				play_tile_action_enabled = false;
			}
		},
		gameActionConstructorStartGame = function() {
			$('#game-action-start-game').show();
		},
		gameActionButtonClickedStartGame = function() {
			network.sendMessage(enums.CommandsToServer.DoGameAction, enums.GameActions.StartGame);
			$('#game-action-start-game').hide();
		},
		select_chain_game_action_id = null,
		gameActionConstructorSelectChain = function(game_action_id, game_board_type_ids) {
			var game_board_type_id = 0,
				$button = null;

			select_chain_game_action_id = game_action_id;

			for (game_board_type_id = 0; game_board_type_id < 7; game_board_type_id++) {
				$button = $('#game-select-chain-' + game_board_type_id);

				if ($.inArray(game_board_type_id, game_board_type_ids) !== -1) {
					$button.css('visibility', 'visible');
				} else {
					$button.css('visibility', 'hidden');
				}
			}

			$('#game-action-select-chain').show();
		},
		gameActionButtonClickedSelectChain = function($button) {
			network.sendMessage(enums.CommandsToServer.DoGameAction, select_chain_game_action_id, parseInt($button.attr('data-index'), 10));
			$('#game-action-select-chain').hide();
		},
		purchase_shares_available = null,
		purchase_shares_cart = null,
		updatePurchaseSharesElements = function() {
			var score_sheet_price = score_sheet_data[enums.ScoreSheetRows.Price],
				score_sheet_available = score_sheet_data[enums.ScoreSheetRows.Available],
				how_much_money = score_sheet_data[common_data.player_id][enums.ScoreSheetIndexes.Cash],
				money_spent, index, money_left, selected_chain_counts, has_enough_money, still_available, $button, chain_index;

			// money_spent and money_left
			money_spent = 0;
			for (index = 0; index < 3; ++index) {
				if (purchase_shares_cart[index] !== null) {
					money_spent += score_sheet_price[purchase_shares_cart[index]];
				}
			}
			money_left = how_much_money - money_spent;

			// selected_chain_counts
			selected_chain_counts = [0, 0, 0, 0, 0, 0, 0];
			for (index = 0; index < 3; ++index) {
				if (purchase_shares_cart[index] !== null) {
					selected_chain_counts[purchase_shares_cart[index]]++;
				}
			}

			// enable/disable chains that player can afford and that are still available
			for (index = 0; index < 7; index++) {
				if (purchase_shares_available[index]) {
					has_enough_money = money_left >= score_sheet_price[index];
					still_available = score_sheet_available[index] > selected_chain_counts[index];
					$('#gps-available-' + index).prop('disabled', !(has_enough_money && still_available));
				}
			}

			// update cart buttons to reflect purchase_shares_cart
			for (index = 0; index < 3; index++) {
				$button = $('#gps-cart-' + index);
				if (purchase_shares_cart[index] !== null) {
					chain_index = purchase_shares_cart[index];
					$button.attr('class', 'button-hotel ' + enums.ScoreSheetIndexes[chain_index].toLowerCase());
					$button.val(score_sheet_price[chain_index] * 100);
					$button.css('visibility', 'visible');
				} else {
					$button.css('visibility', 'hidden');
				}
			}

			// update "Cost" fields
			$('#gps-total').text(money_spent * 100);
			$('#gps-left').text(money_left * 100);
		},
		gameActionConstructorPurchaseShares = function() {
			var index, $button, available;

			purchase_shares_available = [];
			purchase_shares_cart = [null, null, null];

			for (index = 0; index < 7; index++) {
				$button = $('#gps-available-' + index);

				available = score_sheet_data[enums.ScoreSheetRows.Available][index] > 0 && score_sheet_data[enums.ScoreSheetRows.Price][index] > 0;
				purchase_shares_available.push(available);
				if (available) {
					$button.css('visibility', 'visible');
				} else {
					$button.css('visibility', 'hidden');
				}
			}

			$('#gps-cart .button-hotel').css('visibility', 'hidden');

			$('#gps-end-game').prop('checked', false);

			updatePurchaseSharesElements();

			$('#game-action-purchase-shares').show();
		},
		gameActionButtonClickedPurchaseShares = function($button) {
			var parent_id = $button.parent().attr('id'),
				button_id = $button.attr('id'),
				index, cart;

			if (parent_id === 'gps-available') {
				for (index = 0; index < 3; index++) {
					if (purchase_shares_cart[index] === null) {
						purchase_shares_cart[index] = parseInt($button.attr('data-index'), 10);
						break;
					}
				}
			} else if (parent_id === 'gps-cart') {
				purchase_shares_cart[parseInt($button.attr('data-index'), 10)] = null;
			} else if (button_id === 'gps-end-game') {
				// do nothing for now
			} else if (button_id === 'gps-purchase') {
				cart = [];
				for (index = 0; index < 3; index++) {
					if (purchase_shares_cart[index] !== null) {
						cart.push(purchase_shares_cart[index]);
					}
				}
				network.sendMessage(enums.CommandsToServer.DoGameAction, enums.GameActions.PurchaseShares, cart, $('#gps-end-game').prop('checked') ? 1 : 0);
				$('#game-action-purchase-shares').hide();
				return;
			}

			updatePurchaseSharesElements();
		},
		game_action_constructors_lookup = {},
		initializeGameActionConstructorsLookup = function() {
			game_action_constructors_lookup[enums.GameActions.StartGame] = gameActionConstructorStartGame;
			game_action_constructors_lookup[enums.GameActions.PlayTile] = gameActionConstructorPlayTile;
			game_action_constructors_lookup[enums.GameActions.SelectNewChain] = function(game_board_type_ids) {
				gameActionConstructorSelectChain(enums.GameActions.SelectNewChain, game_board_type_ids);
			};
			game_action_constructors_lookup[enums.GameActions.SelectMergerSurvivor] = function(game_board_type_ids) {
				gameActionConstructorSelectChain(enums.GameActions.SelectMergerSurvivor, game_board_type_ids);
			};
			game_action_constructors_lookup[enums.GameActions.SelectChainToMerge] = function(game_board_type_ids) {
				gameActionConstructorSelectChain(enums.GameActions.SelectChainToMerge, game_board_type_ids);
			};
			game_action_constructors_lookup[enums.GameActions.PurchaseShares] = gameActionConstructorPurchaseShares;
		},
		game_action_button_click_handlers = {
			'game-action-start-game': gameActionButtonClickedStartGame,
			'game-action-select-chain': gameActionButtonClickedSelectChain,
			'game-action-purchase-shares': gameActionButtonClickedPurchaseShares
		},
		setGameAction = function(game_action_id, player_id) {
			var hyphenated_enum_name = common_functions.getHyphenatedStringFromEnumName(enums.GameActions[game_action_id]),
				$action = $('#game-status-' + hyphenated_enum_name).clone().removeAttr('id');

			$action.find('.username').text(common_data.game_id_to_player_data[common_data.game_id][player_id].username);
			$('#game-status').empty().append($action);

			if (player_id === common_data.player_id) {
				if (game_action_constructors_lookup.hasOwnProperty(game_action_id)) {
					game_action_constructors_lookup[game_action_id].apply(null, Array.prototype.slice.call(arguments, 2));
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

			$('#game-tile-rack .button-hotel').css('visibility', 'hidden');

			$('#game-action > div').hide();

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
			$('#score-sheet .score-sheet-player .name').empty();
			$('#score-sheet .score-sheet-player').hide();

			$('#game-history').empty();

			$('#game-status').empty();

			play_tile_action_enabled = false;
		};

	periodicResizeCheck();
	initializeGameActionConstructorsLookup();

	pubsub.subscribe('client-SetGamePlayerData', setGamePlayerData);
	pubsub.subscribe('client-JoinGame', joinGame);
	pubsub.subscribe('server-SetGameBoardCell', setGameBoardCell);
	pubsub.subscribe('server-SetGameBoard', setGameBoard);
	pubsub.subscribe('server-SetTile', setTile);
	pubsub.subscribe('server-SetTileGameBoardType', setTileGameBoardType);
	pubsub.subscribe('server-SetScoreSheetCell', setScoreSheetCell);
	pubsub.subscribe('server-SetScoreSheet', setScoreSheet);
	pubsub.subscribe('server-AddGameHistoryMessage', addGameHistoryMessage);
	pubsub.subscribe('server-SetGameAction', setGameAction);
	pubsub.subscribe('client-LeaveGame', resetHtml);
	pubsub.subscribe('network-close', resetHtml);

	$('#link-leave-game').click(function() {
		network.sendMessage(enums.CommandsToServer.LeaveGame);

		return false;
	});

	$('#game-action').on('click', 'input', function() {
		var $this = $(this);

		game_action_button_click_handlers[$this.closest('.game-action').attr('id')]($this);
	});

	$('#game-tile-rack').on('click', '.button-hotel', function() {
		gameTileRackButtonClicked($(this));
	});

	return null;
});
