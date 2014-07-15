define(function(require) {
	var $ = require('jquery'),
		chat = require('chat'),
		common_data = require('common_data'),
		common_functions = require('common_functions'),
		enums = require('enums'),
		network = require('network'),
		notification = require('notification'),
		options = require('options'),
		pubsub = require('pubsub'),
		resize = function(window_width, window_height) {
			var half_window_width = Math.floor(window_width / 2),
				half_window_width_ceil = Math.ceil(window_width / 2),
				$score_sheet = $('#score-sheet'),
				cell_width_gb = Math.floor((half_window_width - 2) / 12),
				cell_width_ss = Math.floor((half_window_width - 2) / 18),
				num_rows, left, top, width, height, font_size;

			top = 0;
			height = cell_width_gb * 9 + 2;
			font_size = Math.floor(cell_width_gb * 2 / 5);
			common_functions.setElementPosition($('#game-board'), 0, top, cell_width_gb * 12 + 2, height, font_size);

			common_functions.setElementPosition($('.button-hotel'), null, null, cell_width_gb, cell_width_gb, font_size);
			$('#gps-cart .button-hotel').css('width', Math.floor(cell_width_gb * 4 / 3));

			top += height + 2;
			height = cell_width_gb;
			common_functions.setElementPosition($('#game-tile-rack'), 0, top, half_window_width, height, font_size);

			top += height + 2;
			height = window_height - top;
			common_functions.setElementPosition($('#game-action'), 0, top, half_window_width, height, font_size);

			common_functions.setElementPosition($score_sheet, half_window_width, 0, cell_width_ss * 18 + 2, null, Math.floor(cell_width_ss * 2 / 3));
			$score_sheet.find('tr').css('height', cell_width_ss + 'px');

			num_rows = 4;
			$score_sheet.find('.score-sheet-player').each(function() {
				if ($(this).css('display') !== 'none') {
					num_rows++;
				}
			});

			left = half_window_width + 2;
			top = num_rows * cell_width_ss + 4;
			width = half_window_width_ceil - 2;
			font_size = Math.floor(cell_width_ss / 2);

			height = Math.floor((window_height - top - 51) / 2) - 2;
			common_functions.setElementPosition($('#game-history'), left, top, width, height);

			top += height + 2;
			height = 22;
			common_functions.setElementPosition($('#game-status'), left, top, width, height);

			top += height + 2;
			height = 25;
			common_functions.setElementPosition($('#game-buttons'), left, top, width, height);

			top += height + 2;
			height = window_height - top;
			chat.setPositionForPage('game', left, top, width, height);
		},
		setGamePlayerData = function(game_id, player_id, username, client_id) {
			var $score_player, $score_player_name, ip_address;

			if (game_id === common_data.game_id) {
				$score_player = $('#score-sheet .score-sheet-player:eq(' + player_id + ')');
				$score_player_name = $score_player.children('.name');

				if (client_id === null) {
					$score_player_name.addClass('missing');
					ip_address = 'missing';
				} else {
					$score_player_name.removeClass('missing');
					ip_address = common_data.client_id_to_data[client_id].ip_address;
				}
				$score_player_name.attr('title', username + ' (' + ip_address + ')');
				$score_player_name.text(username);

				if ($score_player.css('display') === 'none') {
					$score_player.show();
					resize($(window).width(), $(window).height());
				}
			}
		},
		joinGame = function() {
			var player_id, player_data = common_data.game_id_to_player_data[common_data.game_id],
				player_datum;

			for (player_id in player_data) {
				if (player_data.hasOwnProperty(player_id) && player_id !== common_data.player_id) {
					player_datum = player_data[player_id];
					setGamePlayerData(common_data.game_id, player_id, player_datum.username, player_datum.client_id);
				}
			}
		},
		game_board_cell_types = [],
		initializeGameBoardCellTypes = function() {
			var initial_type = enums.GameBoardTypes.Nothing,
				x, y, column;

			for (x = 0; x < 12; x++) {
				column = [];
				for (y = 0; y < 9; y++) {
					column.push(initial_type);
				}
				game_board_cell_types.push(column);
			}
		},
		game_board_type_counts = [],
		initializeGameBoardTypeCounts = function() {
			var type_id, num_types = enums.GameBoardTypes.Max;

			for (type_id = 0; type_id < num_types; type_id++) {
				game_board_type_counts.push(0);
			}
			game_board_type_counts[enums.GameBoardTypes.Nothing] = 12 * 9;
		},
		setGameBoardCell = function(x, y, game_board_type_id) {
			var $cell = $('#gb-' + x + '-' + y),
				game_board_label_mode = options['game-board-label-mode'],
				text;

			game_board_type_counts[game_board_cell_types[x][y]]--;
			game_board_type_counts[game_board_type_id]++;

			game_board_cell_types[x][y] = game_board_type_id;

			$cell.attr('class', common_functions.getHyphenatedStringFromEnumName(enums.GameBoardTypes[game_board_type_id]));

			switch (game_board_label_mode) {
			case 'coordinates':
				text = common_functions.getTileName(x, y);
				break;
			case 'hotel initials':
				if (game_board_type_id === enums.GameBoardTypes.Nothing || game_board_type_id === enums.GameBoardTypes.IHaveThis) {
					text = common_functions.getTileName(x, y);
				} else if (game_board_type_id <= enums.GameBoardTypes.Imperial) {
					text = enums.GameBoardTypes[game_board_type_id][0];
				} else {
					text = '';
				}
				break;
			case 'nothing':
				if (game_board_type_id === enums.GameBoardTypes.Nothing || game_board_type_id === enums.GameBoardTypes.IHaveThis) {
					text = common_functions.getTileName(x, y);
				} else {
					text = '';
				}
				break;
			}

			$cell.text(text);
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
		removeTile = function(tile_index) {
			var $button = $('#game-tile-' + tile_index);

			$button.css('visibility', 'hidden');
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
		score_sheet_changed = false,
		setScoreSheetCell = function(row, index, data) {
			var $row, available, player_id, price, index_class, mark_chain_as_safe = false;

			if (data === score_sheet_data[row][index]) {
				return;
			}

			score_sheet_data[row][index] = data;
			score_sheet_changed = true;

			if (row <= enums.ScoreSheetRows.Player5) {
				// update this chain's availability
				available = 25;
				for (player_id = 0; player_id < 6; player_id++) {
					available -= score_sheet_data[player_id][index];
				}
				setScoreSheetCell(enums.ScoreSheetRows.Available, index, available);

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
				// update this chain's price
				if (data > 0) {
					if (data < 11) {
						price = Math.min(data, 6);
					} else {
						price = Math.min(Math.floor((data - 1) / 10) + 6, 10);
					}
					if (index >= enums.GameBoardTypes.American) {
						price++;
					}
					if (index >= enums.GameBoardTypes.Continental) {
						price++;
					}
				} else {
					price = 0;
				}
				setScoreSheetCell(enums.ScoreSheetRows.Price, index, price);

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

			// chain size
			row = enums.ScoreSheetRows.ChainSize;
			row_data = score_sheet_data[1];
			num_indexes = row_data.length;
			for (index = 0; index < num_indexes; index++) {
				setScoreSheetCell(row, index, row_data[index]);
			}
		},
		turn_player_id = null,
		sub_turn_player_id = null,
		setTurn = function(player_id) {
			turn_player_id = player_id;
			$('#score-sheet .score-sheet-player').removeClass('my-turn');
			if (player_id !== null) {
				$('#score-sheet .score-sheet-player:eq(' + player_id + ')').addClass('my-turn');
			}
		},
		unw_getPlayerColumn = function(num_players, index) {
			var column = [],
				player_id;

			for (player_id = 0; player_id < num_players; player_id++) {
				column.push(score_sheet_data[player_id][index]);
			}

			return column;
		},
		unw_getBonuses = function(holdings, price) {
			var player_id_and_amount_array = [],
				holdings_length, player_id, bonuses = [],
				bonus_price = price * 10,
				num_tying, bonus;

			holdings_length = holdings.length;
			for (player_id = 0; player_id < holdings_length; player_id++) {
				player_id_and_amount_array.push({
					player_id: player_id,
					amount: holdings[player_id]
				});
			}
			player_id_and_amount_array.sort(function(a, b) {
				return b.amount - a.amount;
			});

			for (player_id = 0; player_id < holdings_length; player_id++) {
				bonuses.push(0);
			}

			// if bonuses do not divide equally into even $100 amounts, tying players receive the next greater amount
			if (player_id_and_amount_array[0].amount === 0) { // if first place player has no stock in this chain
				// don't pay anybody
				return bonuses;
			}

			if (player_id_and_amount_array[1].amount === 0) { // if second place player has no stock in this chain
				// if only one player holds stock in defunct chain, he receives both bonuses
				bonuses[player_id_and_amount_array[0].player_id] = bonus_price + bonus_price / 2;
				return bonuses;
			}

			if (player_id_and_amount_array[0].amount === player_id_and_amount_array[1].amount) {
				// in case of tie for largest shareholder, first and second bonuses are combined and divided equally between tying shareholders
				num_tying = 2;
				while (num_tying < player_id_and_amount_array.length) {
					if (player_id_and_amount_array[num_tying].amount === player_id_and_amount_array[0].amount) {
						num_tying++;
						continue;
					}
					break;
				}
				bonus = Math.ceil(((bonus_price + bonus_price / 2)) / num_tying);
				for (player_id = 0; player_id < num_tying; player_id++) {
					bonuses[player_id_and_amount_array[player_id].player_id] = bonus;
				}
				return bonuses;
			}

			// pay largest shareholder
			bonuses[player_id_and_amount_array[0].player_id] = bonus_price;

			// see if there's a tie for 2nd place
			num_tying = 1;
			while (num_tying < player_id_and_amount_array.length - 1) {
				if (player_id_and_amount_array[num_tying + 1].amount === player_id_and_amount_array[1].amount) {
					num_tying++;
					continue;
				}
				break;
			}

			if (num_tying === 1) {
				// stock market pays compensatory bonuses to two largest shareholders in defunct chain
				bonuses[player_id_and_amount_array[1].player_id] = bonus_price / 2;
			} else {
				// in case of tie for second largest shareholder, second bonus is divided equally between tying players
				bonus = Math.ceil(((bonus_price / 2)) / num_tying);
				for (player_id = 1; player_id <= num_tying; player_id++) {
					bonuses[player_id_and_amount_array[player_id].player_id] = bonus;
				}
			}

			return bonuses;
		},
		unw_addMoney = function(money1, money2) {
			var length = money1.length,
				index, result = [];

			for (index = 0; index < length; index++) {
				result.push(money1[index] + money2[index]);
			}

			return result;
		},
		unw_calculateSellingPrices = function(holdings, price) {
			var length = holdings.length,
				player_id, selling_prices = [];

			for (player_id = 0; player_id < length; player_id++) {
				selling_prices[player_id] = holdings[player_id] * price;
			}

			return selling_prices;
		},
		updateNetWorths = function() {
			var num_players, money, type_id, holdings, price, more_money, player_id;

			if (!score_sheet_changed) {
				return;
			}

			num_players = common_data.game_id_to_number_of_players[common_data.game_id];
			if (num_players < 1) {
				return;
			}

			money = unw_getPlayerColumn(num_players, enums.ScoreSheetIndexes.Cash);

			for (type_id = 0; type_id < 7; type_id++) {
				holdings = unw_getPlayerColumn(Math.max(num_players, 2), type_id);
				price = score_sheet_data[enums.ScoreSheetRows.Price][type_id];

				if (game_board_type_counts[type_id] > 0) {
					more_money = unw_getBonuses(holdings, price);
					money = unw_addMoney(money, more_money);
				}

				more_money = unw_calculateSellingPrices(holdings, price);
				money = unw_addMoney(money, more_money);
			}

			for (player_id = 0; player_id < money.length; player_id++) {
				setScoreSheetCell(player_id, enums.ScoreSheetIndexes.Net, money[player_id]);
			}

			if (common_data.game_id_to_mode[common_data.game_id] === enums.GameModes.Teams && num_players === 4) {
				$('#team1-net').text((money[0] + money[2]) * 100);
				$('#team2-net').text((money[1] + money[3]) * 100);
			}

			score_sheet_changed = false;
		},
		addGameHistoryMessage = function(game_history_message_id, player_id) {
			var $message = $('#game-history-' + common_functions.getHyphenatedStringFromEnumName(enums.GameHistoryMessages[game_history_message_id])).clone().removeAttr('id'),
				$game_history = $('#game-history'),
				scroll_is_at_bottom = common_functions.isScrollAtBottom($game_history),
				$element, parts, length, index, entry, name;

			if (player_id !== null) {
				$message.find('.username').text(common_data.game_id_to_player_data[common_data.game_id][player_id].username);
			}

			switch (game_history_message_id) {
			case enums.GameHistoryMessages.DrewPositionTile:
			case enums.GameHistoryMessages.DrewTile:
			case enums.GameHistoryMessages.PlayedTile:
			case enums.GameHistoryMessages.ReplacedDeadTile:
				$message.find('.tile').text(common_functions.getTileName(arguments[2], arguments[3]));
				break;
			case enums.GameHistoryMessages.FormedChain:
			case enums.GameHistoryMessages.SelectedMergerSurvivor:
			case enums.GameHistoryMessages.SelectedChainToDisposeOfNext:
			case enums.GameHistoryMessages.ReceivedBonus:
			case enums.GameHistoryMessages.DisposedOfShares:
				$element = $message.find('.chain');
				$element.addClass(enums.GameBoardTypes[arguments[2]].toLowerCase());
				$element.text(enums.GameBoardTypes[arguments[2]]);
				if (game_history_message_id === enums.GameHistoryMessages.ReceivedBonus) {
					$element = $message.find('.amount');
					$element.text(arguments[3] * 100);
				}
				if (game_history_message_id === enums.GameHistoryMessages.DisposedOfShares) {
					$element = $message.find('.trade-amount');
					$element.text(arguments[3]);
					$element = $message.find('.sell-amount');
					$element.text(arguments[4]);
				}
				break;
			case enums.GameHistoryMessages.MergedChains:
				$element = $message.find('.chains');
				parts = [];
				length = arguments[2].length;
				for (index = 0; index < length; index++) {
					name = enums.GameBoardTypes[arguments[2][index]];
					parts.push('<span class="' + name.toLowerCase() + '">' + name + '</span>');
				}

				if (parts.length === 2) {
					$element.html(parts[0] + ' and ' + parts[1]);
				} else if (parts.length === 3) {
					$element.html(parts[0] + ', ' + parts[1] + ', and ' + parts[2]);
				} else if (parts.length === 4) {
					$element.html(parts[0] + ', ' + parts[1] + ', ' + parts[2] + ', and ' + parts[3]);
				}
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

			if (scroll_is_at_bottom) {
				common_functions.scrollToBottom($game_history);
			}
		},
		play_tile_action_enabled = false,
		gameActionConstructorPlayTile = function() {
			play_tile_action_enabled = true;
		},
		gameTileRackButtonClicked = function() {
			var $button = $(this);

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
		gameActionConstructorSelectChain = function(game_board_type_ids) {
			var game_board_type_id, $button;

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
			network.sendMessage(enums.CommandsToServer.DoGameAction, current_game_action_id, parseInt($button.attr('data-index'), 10));
			$('#game-action-select-chain').hide();
		},
		dispose_of_shares_defunct_type_count = 0,
		dispose_of_shares_controlling_type_available = 0,
		dispose_of_shares_keep = 0,
		dispose_of_shares_trade = 0,
		dispose_of_shares_trade_max = 0,
		dispose_of_shares_sell = 0,
		dispose_of_shares_sell_max = 0,
		updateDisposeOfSharesElements = function() {
			dispose_of_shares_keep = dispose_of_shares_defunct_type_count - dispose_of_shares_trade - dispose_of_shares_sell;

			dispose_of_shares_trade_max = dispose_of_shares_trade + Math.floor(dispose_of_shares_keep / 2) * 2;
			if (dispose_of_shares_trade_max > dispose_of_shares_controlling_type_available * 2) {
				dispose_of_shares_trade_max = dispose_of_shares_controlling_type_available * 2;
			}

			dispose_of_shares_sell_max = dispose_of_shares_sell + dispose_of_shares_keep;

			$('#dos-keep').text(dispose_of_shares_keep);
			$('#dos-keep-all').prop('disabled', dispose_of_shares_keep === dispose_of_shares_defunct_type_count);

			$('#dos-trade').text(dispose_of_shares_trade);
			$('#dos-trade-increment').prop('disabled', dispose_of_shares_trade === dispose_of_shares_trade_max);
			$('#dos-trade-decrement').prop('disabled', dispose_of_shares_trade === 0);
			$('#dos-trade-maximum').prop('disabled', dispose_of_shares_trade === dispose_of_shares_trade_max);

			$('#dos-sell').text(dispose_of_shares_sell);
			$('#dos-sell-increment').prop('disabled', dispose_of_shares_sell === dispose_of_shares_sell_max);
			$('#dos-sell-decrement').prop('disabled', dispose_of_shares_sell === 0);
			$('#dos-sell-maximum').prop('disabled', dispose_of_shares_sell === dispose_of_shares_sell_max);
		},
		gameActionConstructorDisposeOfShares = function(defunct_type_id, controlling_type_id) {
			dispose_of_shares_defunct_type_count = score_sheet_data[common_data.player_id][defunct_type_id];
			dispose_of_shares_controlling_type_available = score_sheet_data[enums.ScoreSheetRows.Available][controlling_type_id];

			dispose_of_shares_trade = 0;
			dispose_of_shares_sell = 0;

			$('#dos-keep-fieldset').attr('class', enums.GameBoardTypes[defunct_type_id].toLowerCase());
			$('#dos-trade-fieldset').attr('class', enums.GameBoardTypes[controlling_type_id].toLowerCase());

			updateDisposeOfSharesElements();

			$('#game-action-dispose-of-shares').show();
		},
		gameActionButtonClickedDisposeOfShares = function($button) {
			var button_id = $button.attr('id'),
				parent_id = $button.parent().attr('id');

			if (button_id === 'dos-keep-all') {
				dispose_of_shares_trade = 0;
				dispose_of_shares_sell = 0;
			} else if (parent_id === 'dos-trade-fieldset') {
				if (button_id === 'dos-trade-increment') {
					dispose_of_shares_trade += 2;
				} else if (button_id === 'dos-trade-decrement') {
					dispose_of_shares_trade -= 2;
				} else if (button_id === 'dos-trade-maximum') {
					dispose_of_shares_trade = dispose_of_shares_trade_max;
				}
			} else if (parent_id === 'dos-sell-fieldset') {
				if (button_id === 'dos-sell-increment') {
					dispose_of_shares_sell++;
				} else if (button_id === 'dos-sell-decrement') {
					dispose_of_shares_sell--;
				} else if (button_id === 'dos-sell-maximum') {
					dispose_of_shares_sell = dispose_of_shares_sell_max;
				}
			} else if (button_id === 'dos-ok') {
				network.sendMessage(enums.CommandsToServer.DoGameAction, enums.GameActions.DisposeOfShares, dispose_of_shares_trade, dispose_of_shares_sell);
				$('#game-action-dispose-of-shares').hide();
				return;
			}

			updateDisposeOfSharesElements();
		},
		purchase_shares_available = null,
		purchase_shares_cart = null,
		updatePurchaseSharesElements = function() {
			var score_sheet_price = score_sheet_data[enums.ScoreSheetRows.Price],
				score_sheet_available = score_sheet_data[enums.ScoreSheetRows.Available],
				how_much_money = score_sheet_data[common_data.player_id][enums.ScoreSheetIndexes.Cash],
				money_spent, index, money_left, selected_chain_counts, num_selected_chains, has_enough_money, still_available, $button, chain_index;

			// money_spent and money_left
			money_spent = 0;
			for (index = 0; index < 3; index++) {
				if (purchase_shares_cart[index] !== null) {
					money_spent += score_sheet_price[purchase_shares_cart[index]];
				}
			}
			money_left = how_much_money - money_spent;

			// selected_chain_counts and num_selected_chains
			selected_chain_counts = [0, 0, 0, 0, 0, 0, 0];
			num_selected_chains = 0;
			for (index = 0; index < 3; index++) {
				if (purchase_shares_cart[index] !== null) {
					selected_chain_counts[purchase_shares_cart[index]]++;
					num_selected_chains++;
				}
			}

			// enable/disable chains that player can afford and that are still available
			for (index = 0; index < 7; index++) {
				if (purchase_shares_available[index]) {
					has_enough_money = money_left >= score_sheet_price[index];
					still_available = score_sheet_available[index] > selected_chain_counts[index];
					$('#gps-available-' + index).prop('disabled', !(has_enough_money && still_available && num_selected_chains < 3));
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
			} else if (button_id === 'gps-ok') {
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
			game_action_constructors_lookup[enums.GameActions.SelectNewChain] = gameActionConstructorSelectChain;
			game_action_constructors_lookup[enums.GameActions.SelectMergerSurvivor] = gameActionConstructorSelectChain;
			game_action_constructors_lookup[enums.GameActions.SelectChainToDisposeOfNext] = gameActionConstructorSelectChain;
			game_action_constructors_lookup[enums.GameActions.DisposeOfShares] = gameActionConstructorDisposeOfShares;
			game_action_constructors_lookup[enums.GameActions.PurchaseShares] = gameActionConstructorPurchaseShares;
		},
		game_action_button_click_handlers = {
			'game-action-start-game': gameActionButtonClickedStartGame,
			'game-action-select-chain': gameActionButtonClickedSelectChain,
			'game-action-dispose-of-shares': gameActionButtonClickedDisposeOfShares,
			'game-action-purchase-shares': gameActionButtonClickedPurchaseShares
		},
		gameActionButtonClicked = function() {
			var $this = $(this);

			game_action_button_click_handlers[$this.closest('.game-action').attr('id')]($this);
		},
		current_game_action_id = null,
		current_player_id = null,
		setGameAction = function(game_action_id, player_id) {
			var hyphenated_enum_name = common_functions.getHyphenatedStringFromEnumName(enums.GameActions[game_action_id]),
				$action = $('#game-status-' + hyphenated_enum_name).clone().removeAttr('id'),
				$element, length, index, name, parts = [];

			current_game_action_id = game_action_id;
			current_player_id = player_id;

			sub_turn_player_id = player_id;
			$('#score-sheet .score-sheet-player').removeClass('my-sub-turn');
			if (player_id !== null && player_id !== turn_player_id && game_action_id !== enums.GameActions.StartGame) {
				$('#score-sheet .score-sheet-player:eq(' + player_id + ')').addClass('my-sub-turn');
			}

			if (game_action_id !== enums.GameActions.StartGame) {
				if (player_id !== null && player_id === common_data.player_id) {
					notification.turnOn();
				} else {
					notification.turnOff();
				}
			}

			maybeNotifyStartingPlayerBecauseGameIsFull();
			maybeShowTeamNetWorths();

			if (player_id !== null) {
				$action.find('.username').text(common_data.game_id_to_player_data[common_data.game_id][player_id].username);
			}

			switch (game_action_id) {
			case enums.GameActions.SelectNewChain:
			case enums.GameActions.SelectMergerSurvivor:
			case enums.GameActions.SelectChainToDisposeOfNext:
				$element = $action.find('.chains');
				length = arguments[2].length;
				for (index = 0; index < length; index++) {
					name = enums.GameBoardTypes[arguments[2][index]];
					parts.push('<span class="' + name.toLowerCase() + '">' + name[0] + '</span>');
				}

				if (parts.length === 2) {
					$element.html(parts[0] + ' or ' + parts[1]);
				} else {
					$element.html(parts.slice(0, parts.length - 1).join(', ') + ', or ' + parts[parts.length - 1]);
				}
				break;
			case enums.GameActions.DisposeOfShares:
				$element = $action.find('.chain');
				$element.addClass(enums.GameBoardTypes[arguments[2]].toLowerCase());
				$element.text(enums.GameBoardTypes[arguments[2]]);
				break;
			}

			$('#game-status').empty().append($action);

			if (player_id !== null && player_id === common_data.player_id) {
				if (game_action_constructors_lookup.hasOwnProperty(game_action_id)) {
					game_action_constructors_lookup[game_action_id].apply(null, Array.prototype.slice.call(arguments, 2));
				}
			}
		},
		setGameState = function(game_id) {
			if (game_id === common_data.game_id) {
				maybeNotifyStartingPlayerBecauseGameIsFull();
				maybeShowTeamNetWorths();
			}
		},
		maybeNotifyStartingPlayerBecauseGameIsFull = function() {
			if (common_data.game_id_to_game_state[common_data.game_id] === enums.GameStates.StartingFull && current_player_id === common_data.player_id) {
				notification.turnOn();
			}
		},
		maybeShowTeamNetWorths = function() {
			if (common_data.game_id_to_mode[common_data.game_id] === enums.GameModes.Teams && common_data.game_id_to_number_of_players[common_data.game_id] === 4) {
				$('#score-sheet .teams').show();
			}
		},
		leaveGameButtonClicked = function() {
			network.sendMessage(enums.CommandsToServer.LeaveGame);
		},
		reset = function() {
			var x, y;

			notification.turnOff();

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
				[0, 0, 0, 0, 0, 0, 0]
			]);
			$('#score-sheet td').removeClass('safe');
			$('#score-sheet .score-sheet-player .name').empty();
			$('#score-sheet .score-sheet-player').hide().removeClass('my-turn my-sub-turn');
			turn_player_id = null;
			sub_turn_player_id = null;
			$('#score-sheet .teams').hide();
			$('#team1-net').text(12000);
			$('#team2-net').text(12000);

			$('#game-history').empty();

			$('#game-status').empty();

			play_tile_action_enabled = false;
		};

	initializeGameBoardCellTypes();
	initializeGameBoardTypeCounts();
	initializeGameActionConstructorsLookup();

	$('#game-tile-rack .button-hotel').click(gameTileRackButtonClicked);
	$('#game-action input').click(gameActionButtonClicked);
	$('#button-leave-game').click(leaveGameButtonClicked);

	pubsub.subscribe('client-Resize', resize);
	pubsub.subscribe('client-SetGamePlayerData', setGamePlayerData);
	pubsub.subscribe('client-JoinGame', joinGame);
	pubsub.subscribe('server-SetGameBoardCell', setGameBoardCell);
	pubsub.subscribe('server-SetGameBoard', setGameBoard);
	pubsub.subscribe('server-SetTile', setTile);
	pubsub.subscribe('server-SetTileGameBoardType', setTileGameBoardType);
	pubsub.subscribe('server-RemoveTile', removeTile);
	pubsub.subscribe('server-SetScoreSheetCell', setScoreSheetCell);
	pubsub.subscribe('server-SetScoreSheet', setScoreSheet);
	pubsub.subscribe('server-SetTurn', setTurn);
	pubsub.subscribe('network-MessageProcessingComplete', updateNetWorths);
	pubsub.subscribe('server-AddGameHistoryMessage', addGameHistoryMessage);
	pubsub.subscribe('server-SetGameAction', setGameAction);
	pubsub.subscribe('client-SetGameState', setGameState);
	pubsub.subscribe('client-LeaveGame', reset);
	pubsub.subscribe('network-Close', reset);
	pubsub.subscribe('network-Error', reset);
});
