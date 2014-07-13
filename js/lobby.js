define(function(require) {
	var $ = require('jquery'),
		chat = require('chat'),
		common_data = require('common_data'),
		common_functions = require('common_functions'),
		enums = require('enums'),
		network = require('network'),
		pubsub = require('pubsub'),
		resize = function(window_width, window_height) {
			var half_window_width = Math.floor(window_width / 2);

			common_functions.setElementPosition($('#page-lobby'), 0, 0, half_window_width, window_height);

			chat.setPositionForPage('lobby', half_window_width + 2, 0, window_width - half_window_width - 2, window_height);
		},
		addLobbyClient = function(client_id) {
			var $div = $('<div/>'),
				client_data = common_data.client_id_to_data[client_id];

			$div.attr('class', 'client-' + client_id);
			$div.attr('title', client_data.username + ' (' + client_data.ip_address + ')');
			$div.text(client_data.username);
			$div.appendTo('#clients-in-lobby');
		},
		removeLobbyClient = function(client_id) {
			$('#clients-in-lobby .client-' + client_id).remove();
		},
		setGameState = function(game_id) {
			var $lobby_section = $('#lobby-game-' + game_id),
				state_id = common_data.game_id_to_game_state[game_id],
				in_this_game, player_id, player_data = common_data.game_id_to_player_data[game_id],
				client_username = common_data.client_id_to_data[common_data.client_id].username;

			// create and add lobby section if it doesn't exist
			if ($lobby_section.length === 0) {
				$lobby_section = $('#lobby-game-template').clone();
				$lobby_section.attr('id', 'lobby-game-' + game_id);
				$lobby_section.attr('data-game-id', game_id);
				$lobby_section.find('.header').text('Game #' + game_id);
				$('#lobby-games').prepend($lobby_section);
			}

			// set game state text
			if (state_id === enums.GameStates.Starting) {
				$lobby_section.find('.state').text('Starting (Max of ' + common_data.game_id_to_max_players[game_id] + ' Players)');
			} else if (state_id === enums.GameStates.StartingFull) {
				$lobby_section.find('.state').text('Starting (Full)');
			} else if (state_id === enums.GameStates.InProgress) {
				$lobby_section.find('.state').text('In Progress');
			} else if (state_id === enums.GameStates.Completed) {
				$lobby_section.find('.state').text('Completed');
			}

			// is client's username in this game?
			in_this_game = false;
			for (player_id in player_data) {
				if (player_data.hasOwnProperty(player_id)) {
					if (player_data[player_id].username === client_username) {
						in_this_game = true;
					}
				}
			}

			// show/hide buttons as appropriate
			if (state_id === enums.GameStates.Starting && !in_this_game) {
				$lobby_section.find('.button-join-game').show();
			} else {
				$lobby_section.find('.button-join-game').hide();
			}

			if (in_this_game) {
				$lobby_section.find('.button-rejoin-game').show();
				$lobby_section.find('.button-watch-game').hide();
			} else {
				$lobby_section.find('.button-rejoin-game').hide();
				$lobby_section.find('.button-watch-game').show();
			}
		},
		setGamePlayerData = function(game_id, player_id, username, client_id) {
			var $player = $('#lobby-game-' + game_id + ' .player:eq(' + player_id + ')'),
				ip_address;

			if (client_id === null) {
				$player.addClass('missing');
				ip_address = 'missing';
			} else {
				$player.removeClass('missing');
				ip_address = common_data.client_id_to_data[client_id].ip_address;
			}
			$player.attr('title', username + ' (' + ip_address + ')');
			$player.text(username);

			setGameState(game_id);
		},
		addGameWatcher = function(game_id, client_id) {
			var $div = $('<div/>'),
				client_data = common_data.client_id_to_data[client_id];

			$div.attr('class', 'client-' + client_id);
			$div.attr('title', client_data.username + ' (' + client_data.ip_address + ')');
			$div.text(client_data.username);
			$div.appendTo('#lobby-game-' + game_id + ' .watchers');
		},
		removeGameWatcher = function(game_id, client_id) {
			$('#lobby-game-' + game_id + ' .watchers .client-' + client_id).remove();
		},
		reset = function() {
			$('#clients-in-lobby').empty();
			$('#lobby-games').empty();
		};

	$('#button-create-game').click(function() {
		network.sendMessage(enums.CommandsToServer.CreateGame, parseInt($('#cg-max-players').val(), 10));
	});

	$('#lobby-games').on('click', 'input', function() {
		var $this = $(this),
			game_id = parseInt($this.closest('.lobby-section').attr('data-game-id'), 10);

		if ($this.hasClass('button-join-game')) {
			network.sendMessage(enums.CommandsToServer.JoinGame, game_id);
		} else if ($this.hasClass('button-rejoin-game')) {
			network.sendMessage(enums.CommandsToServer.RejoinGame, game_id);
		} else if ($this.hasClass('button-watch-game')) {
			network.sendMessage(enums.CommandsToServer.WatchGame, game_id);
		}
	});

	pubsub.subscribe('client-Resize', resize);
	pubsub.subscribe('client-AddLobbyClient', addLobbyClient);
	pubsub.subscribe('client-RemoveLobbyClient', removeLobbyClient);
	pubsub.subscribe('client-SetGameState', setGameState);
	pubsub.subscribe('client-SetGamePlayerData', setGamePlayerData);
	pubsub.subscribe('client-AddGameWatcher', addGameWatcher);
	pubsub.subscribe('client-RemoveGameWatcher', removeGameWatcher);
	pubsub.subscribe('network-Close', reset);
	pubsub.subscribe('network-Error', reset);
});
