define(function(require) {
	var chat = require('chat'),
		common_data = require('common_data'),
		common_functions = require('common_functions'),
		enums = require('enums'),
		network = require('network'),
		notification = require('notification'),
		options = require('options'),
		pubsub = require('pubsub'),
		game_board_cell_types = [],
		game_board_type_counts = [],
		tile_rack = [null, null, null, null, null, null],
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
		turn_player_id = null,
		sub_turn_player_id = null,
		game_history_new_messages_count = 0,
		play_tile_action_enabled = false,
		dispose_of_shares_defunct_type_count = 0,
		dispose_of_shares_controlling_type_available = 0,
		dispose_of_shares_keep = 0,
		dispose_of_shares_trade = 0,
		dispose_of_shares_trade_max = 0,
		dispose_of_shares_sell = 0,
		dispose_of_shares_sell_max = 0,
		purchase_shares_available = null,
		purchase_shares_cart = null,
		game_action_constructors_lookup = {},
		game_action_button_click_handlers = {
			'game-action-start-game': gameActionButtonClickedStartGame,
			'game-action-select-chain': gameActionButtonClickedSelectChain,
			'game-action-dispose-of-shares': gameActionButtonClickedDisposeOfShares,
			'game-action-purchase-shares': gameActionButtonClickedPurchaseShares
		},
		current_game_action_id = null,
		current_player_id = null;

	function initializeHtml() {
		var $game_board_tbody = $('#game-board tbody'),
			y, $tr, x, $td, $score_sheet_player = $('.score-sheet-player');

		for (y = 0; y < 9; y++) {
			$tr = $('<tr>');
			for (x = 0; x < 12; x++) {
				$td = $('<td>');
				$td.attr('class', 'color-nothing');
				$td.attr('id', 'gb-' + x + '-' + y);
				$td.attr('data-x', x);
				$td.attr('data-y', y);
				$td.text(common_functions.getTileName(x, y));
				$tr.append($td);
			}
			$game_board_tbody.append($tr);
		}

		for (y = 0; y < 5; y++) {
			$score_sheet_player.after($score_sheet_player.clone());
		}
	}

	function resize(window_width, window_height) {
		var $score_sheet = $('#score-sheet'),
			cell_width_gb_based_on_width, cell_width_gb_based_on_height, cell_width_gb, left_side_width, cell_width_ss, score_sheet_width, left, top, width, height, font_size;

		// algebra and estimation were used in the determination of these 2 formulas
		cell_width_gb_based_on_width = (window_width - 6) / 24;
		cell_width_gb_based_on_height = (window_height - 30) / 13;
		cell_width_gb = Math.floor(Math.min(cell_width_gb_based_on_width, cell_width_gb_based_on_height));
		// due to rounding, see if cell_width_gb + 1 is good, else use cell_width_gb
		cell_width_gb += 2;
		do {
			cell_width_gb--;
			left_side_width = cell_width_gb * 12 + 2;
			cell_width_ss = Math.floor((left_side_width - 2) / 18);
			score_sheet_width = cell_width_ss * 18 + 2;
		} while (left_side_width + 2 + score_sheet_width > window_width);

		top = 0;
		height = cell_width_gb * 9 + 2;
		font_size = Math.floor(cell_width_gb * 2 / 5);
		common_functions.setElementPosition($('#game-board'), 0, top, cell_width_gb * 12 + 2, height, font_size);

		common_functions.setElementPosition($('.button-hotel'), null, null, cell_width_gb, cell_width_gb, font_size);
		$('#ps-cart .button-hotel').css('width', Math.floor(cell_width_gb * 4 / 3));

		top += height + 2;
		height = cell_width_gb;
		common_functions.setElementPosition($('#game-tile-rack'), 0, top, left_side_width, height, font_size);

		top += height + 2;
		height = window_height - top;
		common_functions.setElementPosition($('#game-action'), 0, top, left_side_width, height, font_size);

		left = left_side_width + 2;
		common_functions.setElementPosition($score_sheet, left, 0, score_sheet_width, null, Math.floor(cell_width_ss * 2 / 3));
		$score_sheet.find('tr').css('height', cell_width_ss + 'px');

		top = (common_data.game_id_to_number_of_players[common_data.game_id] + 4) * cell_width_ss + 4;
		width = window_width - left;
		font_size = Math.floor(cell_width_ss / 2);

		height = Math.floor((window_height - top - 78) / 2);
		common_functions.setElementPosition($('#game-history'), left, top, width, height);
		common_functions.scrollToBottom($('#game-history'));

		common_functions.setElementPosition($('#game-history-new-messages'), left, top + height - 22, width - common_functions.getScrollbarWidth(), 22);

		top += height + 2;
		height = 22;
		common_functions.setElementPosition($('#game-status'), left, top, width, height);

		top += height + 2;
		height = 25;
		common_functions.setElementPosition($('#game-buttons'), left, top, width, height);

		top += height + 2;
		height = window_height - top;
		chat.setPositionForPage('game', left, top, width, height);
	}

	function setGamePlayerData(game_id, player_id, username, client_id) {
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
	}

	function joinGame() {
		var player_id, player_data = common_data.game_id_to_player_data[common_data.game_id],
			player_datum;

		for (player_id in player_data) {
			if (player_data.hasOwnProperty(player_id) && player_id !== common_data.player_id) {
				player_datum = player_data[player_id];
				setGamePlayerData(common_data.game_id, player_id, player_datum.username, player_datum.client_id);
			}
		}
	}

	function initializeGameBoardCellTypes() {
		var initial_type = enums.GameBoardTypes.Nothing,
			x, y, column;

		for (x = 0; x < 12; x++) {
			column = [];
			for (y = 0; y < 9; y++) {
				column.push(initial_type);
			}
			game_board_cell_types.push(column);
		}
	}

	function initializeGameBoardTypeCounts() {
		var type_id, num_types = enums.GameBoardTypes.Max;

		for (type_id = 0; type_id < num_types; type_id++) {
			game_board_type_counts.push(0);
		}
		game_board_type_counts[enums.GameBoardTypes.Nothing] = 12 * 9;
	}

	function setGameBoardCell(x, y, game_board_type_id) {
		var $cell = $('#gb-' + x + '-' + y),
			game_board_label_mode = options['game-board-label-mode'],
			text;

		game_board_type_counts[game_board_cell_types[x][y]]--;
		game_board_type_counts[game_board_type_id]++;

		game_board_cell_types[x][y] = game_board_type_id;

		$cell.attr('class', 'color-' + common_functions.getHyphenatedStringFromEnumName(enums.GameBoardTypes[game_board_type_id]));

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
	}

	function setGameBoard(x_to_y_to_board_type) {
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
	}

	function setTile(tile_index, x, y, game_board_type_id) {
		var $button = $('#game-tile-' + tile_index);

		tile_rack[tile_index] = [x, y, game_board_type_id];

		$button.attr('class', 'button-hotel color-' + common_functions.getHyphenatedStringFromEnumName(enums.GameBoardTypes[game_board_type_id]));
		$button.val(common_functions.getTileName(x, y));
		$button.css('visibility', 'visible');

		setGameBoardCell(x, y, enums.GameBoardTypes.IHaveThis);
	}

	function setTileGameBoardType(tile_index, game_board_type_id) {
		var $button = $('#game-tile-' + tile_index);

		tile_rack[tile_index][2] = game_board_type_id;

		$button.attr('class', 'button-hotel color-' + common_functions.getHyphenatedStringFromEnumName(enums.GameBoardTypes[game_board_type_id]));
	}

	function removeTile(tile_index) {
		var $button = $('#game-tile-' + tile_index);

		tile_rack[tile_index] = null;

		$button.css('visibility', 'hidden');
	}

	function setScoreSheetCell(row, index, data) {
		var $row, available, player_id, price, index_class = enums.ScoreSheetIndexes[index].toLowerCase();

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
				$('#score-sheet .' + index_class).addClass('safe');
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

		$row.children('.' + index_class).text(data);
	}

	function setScoreSheet(score_sheet_data) {
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
		row_data = score_sheet_data[1];
		num_indexes = row_data.length;
		for (index = 0; index < num_indexes; index++) {
			setScoreSheetCell(enums.ScoreSheetRows.ChainSize, index, row_data[index]);
		}
	}

	function setTurn(player_id) {
		turn_player_id = player_id;
		$('#score-sheet .score-sheet-player').removeClass('my-turn');
		if (player_id !== null) {
			$('#score-sheet .score-sheet-player:eq(' + player_id + ')').addClass('my-turn');
		}
	}

	function unw_getPlayerColumn(num_players, index) {
		var column = [],
			player_id;

		for (player_id = 0; player_id < num_players; player_id++) {
			column.push(score_sheet_data[player_id][index]);
		}

		return column;
	}

	function unw_getBonuses(holdings, price) {
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
			while (num_tying < player_id_and_amount_array.length && player_id_and_amount_array[num_tying].amount === player_id_and_amount_array[0].amount) {
				num_tying++;
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
		while (num_tying < player_id_and_amount_array.length - 1 && player_id_and_amount_array[num_tying + 1].amount === player_id_and_amount_array[1].amount) {
			num_tying++;
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
	}

	function unw_addMoney(money1, money2) {
		var length = money1.length,
			index, result = [];

		for (index = 0; index < length; index++) {
			result.push(money1[index] + money2[index]);
		}

		return result;
	}

	function unw_calculateSellingPrices(holdings, price) {
		var length = holdings.length,
			player_id, selling_prices = [];

		for (player_id = 0; player_id < length; player_id++) {
			selling_prices[player_id] = holdings[player_id] * price;
		}

		return selling_prices;
	}

	function updateNetWorths() {
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
	}

	function getGameHistoryMessageElement(game_history_message_id, player_id, argument2, argument3, argument4) {
		var $message = $('#game-history-' + common_functions.getHyphenatedStringFromEnumName(enums.GameHistoryMessages[game_history_message_id])).clone().removeAttr('id'),
			$element, parts, length, index, entry, name;

		if (player_id !== null) {
			$message.find('.username').text((typeof player_id === 'number') ? common_data.game_id_to_player_data[common_data.game_id][player_id].username : player_id);
		}

		switch (game_history_message_id) {
		case enums.GameHistoryMessages.DrewPositionTile:
		case enums.GameHistoryMessages.DrewTile:
		case enums.GameHistoryMessages.PlayedTile:
		case enums.GameHistoryMessages.ReplacedDeadTile:
			$message.find('.tile').text(common_functions.getTileName(argument2, argument3));
			break;
		case enums.GameHistoryMessages.FormedChain:
		case enums.GameHistoryMessages.SelectedMergerSurvivor:
		case enums.GameHistoryMessages.SelectedChainToDisposeOfNext:
		case enums.GameHistoryMessages.ReceivedBonus:
		case enums.GameHistoryMessages.DisposedOfShares:
			$element = $message.find('.chain');
			$element.addClass('color-' + enums.GameBoardTypes[argument2].toLowerCase());
			$element.text(enums.GameBoardTypes[argument2]);
			if (game_history_message_id === enums.GameHistoryMessages.ReceivedBonus) {
				$element = $message.find('.amount');
				$element.text(argument3 * 100);
			}
			if (game_history_message_id === enums.GameHistoryMessages.DisposedOfShares) {
				$element = $message.find('.trade-amount');
				$element.text(argument3);
				$element = $message.find('.sell-amount');
				$element.text(argument4);
			}
			break;
		case enums.GameHistoryMessages.MergedChains:
			$element = $message.find('.chains');
			parts = [];
			length = argument2.length;
			for (index = 0; index < length; index++) {
				name = enums.GameBoardTypes[argument2[index]];
				parts.push('<span class="color-' + name.toLowerCase() + '">' + name + '</span>');
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
			length = argument2.length;
			for (index = 0; index < length; index++) {
				entry = argument2[index];
				name = enums.GameBoardTypes[entry[0]];
				parts.push(entry[1] + ' <span class="color-' + name.toLowerCase() + '">' + name + '</span>');
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

		return $message;
	}

	function appendGameHistoryMessageElements(elements) {
		var i, length = elements.length,
			$game_history = $('#game-history'),
			scroll_is_at_bottom = common_functions.isScrollAtBottom($game_history),
			$element;

		for (i = 0; i < length; i++) {
			$game_history.append(elements[i]);
		}

		if (scroll_is_at_bottom) {
			common_functions.scrollToBottom($game_history);
		} else {
			game_history_new_messages_count += length;
			$element = $('#game-history-new-messages');
			if (game_history_new_messages_count === 1) {
				$element.find('.singular').show();
				$element.find('.plural').hide();
			} else {
				$element.find('.message-count').text(game_history_new_messages_count);
				$element.find('.singular').hide();
				$element.find('.plural').show();
			}
			$element.show();
		}
	}

	function addGameHistoryMessage() {
		appendGameHistoryMessageElements([getGameHistoryMessageElement.apply(null, arguments)]);
	}

	function addGameHistoryMessages(messages) {
		var i, length = messages.length,
			elements = [];

		for (i = 0; i < length; i++) {
			elements.push(getGameHistoryMessageElement.apply(null, messages[i]));
		}

		appendGameHistoryMessageElements(elements);
	}

	function gameHistoryScrolled() {
		var $game_history = $('#game-history');

		if (common_functions.isScrollAtBottom($game_history)) {
			game_history_new_messages_count = 0;
			$('#game-history-new-messages').hide();
		}
	}

	function gameActionConstructorPlayTile() {
		play_tile_action_enabled = true;
	}

	function gameBoardCellClicked() {
		var $cell = $(this),
			x = parseInt($cell.attr('data-x'), 10),
			y = parseInt($cell.attr('data-y'), 10),
			tile_index, tile_datum;

		for (tile_index = 0; tile_index < 6; tile_index++) {
			tile_datum = tile_rack[tile_index];
			if (tile_datum !== null && tile_datum[0] === x && tile_datum[1] === y) {
				processTileRackButtonClick(tile_index);
				break;
			}
		}
	}

	function gameTileRackButtonClicked() {
		var tile_index = parseInt($(this).attr('data-index'), 10);

		processTileRackButtonClick(tile_index);
	}

	function processTileRackButtonClick(tile_index) {
		var tile_datum = tile_rack[tile_index];

		if (play_tile_action_enabled && tile_datum !== null && tile_datum[2] !== enums.GameBoardTypes.CantPlayEver && tile_datum[2] !== enums.GameBoardTypes.CantPlayNow) {
			network.sendMessage(enums.CommandsToServer.DoGameAction, enums.GameActions.PlayTile, tile_index);
			removeTile(tile_index);

			play_tile_action_enabled = false;
		}
	}

	function gameActionConstructorStartGame() {
		$('#game-action-start-game').show();
	}

	function gameActionButtonClickedStartGame() {
		network.sendMessage(enums.CommandsToServer.DoGameAction, enums.GameActions.StartGame);
		$('#game-action-start-game').hide();
	}

	function gameActionConstructorSelectChain(game_board_type_ids) {
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
	}

	function gameActionButtonClickedSelectChain($button) {
		network.sendMessage(enums.CommandsToServer.DoGameAction, current_game_action_id, parseInt($button.attr('data-index'), 10));
		$('#game-action-select-chain').hide();
	}

	function updateDisposeOfSharesElements() {
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
	}

	function gameActionConstructorDisposeOfShares(defunct_type_id, controlling_type_id) {
		dispose_of_shares_defunct_type_count = score_sheet_data[common_data.player_id][defunct_type_id];
		dispose_of_shares_controlling_type_available = score_sheet_data[enums.ScoreSheetRows.Available][controlling_type_id];

		dispose_of_shares_trade = 0;
		dispose_of_shares_sell = 0;

		$('#dos-keep-fieldset, #dos-keep-fieldset legend').attr('class', 'color-' + enums.GameBoardTypes[defunct_type_id].toLowerCase());
		$('#dos-trade-fieldset, #dos-trade-fieldset legend').attr('class', 'color-' + enums.GameBoardTypes[controlling_type_id].toLowerCase());

		updateDisposeOfSharesElements();

		$('#game-action-dispose-of-shares').show();
	}

	function gameActionButtonClickedDisposeOfShares($button) {
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
	}

	function updatePurchaseSharesElements() {
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
				$('#ps-available-' + index).prop('disabled', !(has_enough_money && still_available && num_selected_chains < 3));
			}
		}

		// update cart buttons to reflect purchase_shares_cart
		for (index = 0; index < 3; index++) {
			$button = $('#ps-cart-' + index);
			if (purchase_shares_cart[index] !== null) {
				chain_index = purchase_shares_cart[index];
				$button.attr('class', 'button-hotel color-' + enums.ScoreSheetIndexes[chain_index].toLowerCase());
				$button.val(score_sheet_price[chain_index] * 100);
				$button.css('visibility', 'visible');
			} else {
				$button.css('visibility', 'hidden');
			}
		}

		// update "Cost" fields
		$('#ps-total').text(money_spent * 100);
		$('#ps-left').text(money_left * 100);
	}

	function gameActionConstructorPurchaseShares() {
		var index, $button, available;

		purchase_shares_available = [];
		purchase_shares_cart = [null, null, null];

		for (index = 0; index < 7; index++) {
			$button = $('#ps-available-' + index);

			available = score_sheet_data[enums.ScoreSheetRows.Available][index] > 0 && score_sheet_data[enums.ScoreSheetRows.Price][index] > 0;
			purchase_shares_available.push(available);
			if (available) {
				$button.css('visibility', 'visible');
			} else {
				$button.css('visibility', 'hidden');
			}
		}

		$('#ps-cart .button-hotel').css('visibility', 'hidden');

		$('#ps-end-game').prop('checked', false);

		updatePurchaseSharesElements();

		$('#game-action-purchase-shares').show();
	}

	function gameActionButtonClickedPurchaseShares($button) {
		var parent_id = $button.parent().attr('id'),
			button_id = $button.attr('id'),
			index, cart;

		if (parent_id === 'ps-available') {
			for (index = 0; index < 3; index++) {
				if (purchase_shares_cart[index] === null) {
					purchase_shares_cart[index] = parseInt($button.attr('data-index'), 10);
					break;
				}
			}
		} else if (parent_id === 'ps-cart') {
			purchase_shares_cart[parseInt($button.attr('data-index'), 10)] = null;
		} else if (button_id === 'ps-end-game') {
			// do nothing for now
		} else if (button_id === 'ps-ok') {
			cart = [];
			for (index = 0; index < 3; index++) {
				if (purchase_shares_cart[index] !== null) {
					cart.push(purchase_shares_cart[index]);
				}
			}
			network.sendMessage(enums.CommandsToServer.DoGameAction, enums.GameActions.PurchaseShares, cart, $('#ps-end-game').prop('checked') ? 1 : 0);
			$('#game-action-purchase-shares').hide();
			return;
		}

		updatePurchaseSharesElements();
	}

	function initializeGameActionConstructorsLookup() {
		game_action_constructors_lookup[enums.GameActions.StartGame] = gameActionConstructorStartGame;
		game_action_constructors_lookup[enums.GameActions.PlayTile] = gameActionConstructorPlayTile;
		game_action_constructors_lookup[enums.GameActions.SelectNewChain] = gameActionConstructorSelectChain;
		game_action_constructors_lookup[enums.GameActions.SelectMergerSurvivor] = gameActionConstructorSelectChain;
		game_action_constructors_lookup[enums.GameActions.SelectChainToDisposeOfNext] = gameActionConstructorSelectChain;
		game_action_constructors_lookup[enums.GameActions.DisposeOfShares] = gameActionConstructorDisposeOfShares;
		game_action_constructors_lookup[enums.GameActions.PurchaseShares] = gameActionConstructorPurchaseShares;
	}

	function gameActionButtonClicked() {
		var $this = $(this);

		game_action_button_click_handlers[$this.closest('.game-action').attr('id')]($this);
	}

	function setGameAction(game_action_id, player_id, argument2) {
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
			length = argument2.length;
			for (index = 0; index < length; index++) {
				name = enums.GameBoardTypes[argument2[index]];
				parts.push('<span class="color-' + name.toLowerCase() + '">' + name[0] + '</span>');
			}

			if (parts.length === 2) {
				$element.html(parts.join(' or '));
			} else {
				$element.html(parts.slice(0, parts.length - 1).join(', ') + ', or ' + parts[parts.length - 1]);
			}
			break;
		case enums.GameActions.DisposeOfShares:
			$element = $action.find('.chain');
			$element.addClass('color-' + enums.GameBoardTypes[argument2].toLowerCase());
			$element.text(enums.GameBoardTypes[argument2]);
			break;
		}

		$('#game-status').empty().append($action);

		if (player_id !== null && player_id === common_data.player_id) {
			if (game_action_constructors_lookup.hasOwnProperty(game_action_id)) {
				game_action_constructors_lookup[game_action_id].apply(null, Array.prototype.slice.call(arguments, 2));
			}
		}
	}

	function setGameState(game_id) {
		if (game_id === common_data.game_id) {
			maybeNotifyStartingPlayerBecauseGameIsFull();
			maybeShowTeamNetWorths();
		}
	}

	function maybeNotifyStartingPlayerBecauseGameIsFull() {
		if (common_data.game_id_to_game_state[common_data.game_id] === enums.GameStates.StartingFull && current_player_id === common_data.player_id) {
			notification.turnOn();
		}
	}

	function maybeShowTeamNetWorths() {
		if (common_data.game_id_to_mode[common_data.game_id] === enums.GameModes.Teams && common_data.game_id_to_number_of_players[common_data.game_id] === 4) {
			$('#score-sheet .teams').show();
		}
	}

	function leaveGameButtonClicked() {
		network.sendMessage(enums.CommandsToServer.LeaveGame);
	}

	function reset() {
		var x, y;

		notification.turnOff();

		for (x = 0; x < 12; x++) {
			for (y = 0; y < 9; y++) {
				setGameBoardCell(x, y, enums.GameBoardTypes.Nothing);
			}
		}

		for (x = 0; x < 6; x++) {
			tile_rack[x] = null;
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
		$('#game-history-new-messages').hide();

		$('#game-status').empty();

		play_tile_action_enabled = false;
	}

	initializeHtml();
	initializeGameBoardCellTypes();
	initializeGameBoardTypeCounts();
	initializeGameActionConstructorsLookup();

	$('#game-board td').click(gameBoardCellClicked);
	$('#game-tile-rack .button-hotel').click(gameTileRackButtonClicked);
	$('#game-action input').click(gameActionButtonClicked);
	$('#game-history').scroll(gameHistoryScrolled);
	$('#button-leave-game').click(leaveGameButtonClicked);

	pubsub.subscribe(enums.PubSub.Client_Resize, resize);
	pubsub.subscribe(enums.PubSub.Client_SetGamePlayerData, setGamePlayerData);
	pubsub.subscribe(enums.PubSub.Client_JoinGame, joinGame);
	pubsub.subscribe(enums.PubSub.Server_SetGameBoardCell, setGameBoardCell);
	pubsub.subscribe(enums.PubSub.Server_SetGameBoard, setGameBoard);
	pubsub.subscribe(enums.PubSub.Server_SetTile, setTile);
	pubsub.subscribe(enums.PubSub.Server_SetTileGameBoardType, setTileGameBoardType);
	pubsub.subscribe(enums.PubSub.Server_RemoveTile, removeTile);
	pubsub.subscribe(enums.PubSub.Server_SetScoreSheetCell, setScoreSheetCell);
	pubsub.subscribe(enums.PubSub.Server_SetScoreSheet, setScoreSheet);
	pubsub.subscribe(enums.PubSub.Server_SetTurn, setTurn);
	pubsub.subscribe(enums.PubSub.Network_MessageProcessingComplete, updateNetWorths);
	pubsub.subscribe(enums.PubSub.Server_AddGameHistoryMessage, addGameHistoryMessage);
	pubsub.subscribe(enums.PubSub.Server_AddGameHistoryMessages, addGameHistoryMessages);
	pubsub.subscribe(enums.PubSub.Server_SetGameAction, setGameAction);
	pubsub.subscribe(enums.PubSub.Client_SetGameState, setGameState);
	pubsub.subscribe(enums.PubSub.Client_LeaveGame, reset);
	pubsub.subscribe(enums.PubSub.Network_Disconnect, reset);
});
