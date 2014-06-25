define(function(require) {
	var $ = require('jquery'),
		common_data = require('common_data'),
		enums = require('enums'),
		network = require('network'),
		pubsub = require('pubsub'),
		addLobbyClient = function(client_id) {
			var $div = $('<div/>'),
				client_data = common_data.client_id_to_data[client_id];

			$div.attr('class', 'client-' + client_id);
			$div.attr('title', client_data.username + ' (' + client_data.ip_and_port + ')');
			$div.text(client_data.username);
			$div.appendTo('#clients-in-lobby');
		},
		removeLobbyClient = function(client_id) {
			$('#clients-in-lobby .client-' + client_id).remove();
		},
		setGameState = function(game_id) {
			var $lobby_section = $('#lobby-game-' + game_id),
				state_id = common_data.game_id_to_game_state[game_id],
				player_data = null,
				player_id = null,
				client_username = common_data.client_id_to_data[common_data.client_id].username,
				in_this_game = false;

			// create and add lobby section if it doesn't exist
			if ($lobby_section.length === 0) {
				$lobby_section = $('#lobby-game-template').clone();
				$lobby_section.attr('id', 'lobby-game-' + game_id);
				$lobby_section.attr('data-game-id', game_id);
				$lobby_section.find('.header').text('Game #' + game_id);
				$('#lobby-games').append($lobby_section);
			}

			// set game state text
			if (state_id === enums.GameStates.Starting) {
				$lobby_section.find('.state').text('Starting');
			} else if (state_id === enums.GameStates.InProgress) {
				$lobby_section.find('.state').text('In Progress');
			} else if (state_id === enums.GameStates.Completed) {
				$lobby_section.find('.state').text('Completed');
			}

			// is client's username in this game?
			player_data = common_data.game_id_to_player_data[game_id];
			for (player_id in player_data) {
				if (player_data.hasOwnProperty(player_id)) {
					if (player_data[player_id].username === client_username) {
						in_this_game = true;
					}
				}
			}

			// show/hide links as appropriate
			if (state_id === enums.GameStates.Starting && !in_this_game) {
				$lobby_section.find('.link-join').show();
			} else {
				$lobby_section.find('.link-join').hide();
			}

			if (in_this_game) {
				$lobby_section.find('.link-rejoin').show();
			} else {
				$lobby_section.find('.link-rejoin').hide();
			}

			if (!in_this_game) {
				$lobby_section.find('.link-watch').show();
			} else {
				$lobby_section.find('.link-watch').hide();
			}
		},
		setGamePlayerData = function(game_id, player_id, username, client_id) {
			var $player = $('#lobby-game-' + game_id + ' .player:eq(' + player_id + ')'),
				ip_and_port = 'missing';

			if (client_id === null) {
				$player.addClass('missing');
			} else {
				$player.removeClass('missing');
				ip_and_port = common_data.client_id_to_data[client_id].ip_and_port;
			}
			$player.attr('title', username + ' (' + ip_and_port + ')');
			$player.text(username);

			setGameState(game_id);
		},
		addGameWatcher = function(game_id, client_id) {
			var $div = $('<div/>'),
				client_data = common_data.client_id_to_data[client_id];

			$div.attr('class', 'client-' + client_id);
			$div.attr('title', client_data.username + ' (' + client_data.ip_and_port + ')');
			$div.text(client_data.username);
			$div.appendTo('#lobby-game-' + game_id + ' .watchers');
		},
		removeGameWatcher = function(game_id, client_id) {
			$('#lobby-game-' + game_id + ' .watchers .client-' + client_id).remove();
		},
		resetHtml = function() {
			$('#clients-in-lobby').empty();
			$('#lobby-games').empty();
		};

	pubsub.subscribe('client-AddLobbyClient', addLobbyClient);
	pubsub.subscribe('client-RemoveLobbyClient', removeLobbyClient);
	pubsub.subscribe('client-SetGameState', setGameState);
	pubsub.subscribe('client-SetGamePlayerData', setGamePlayerData);
	pubsub.subscribe('client-AddGameWatcher', addGameWatcher);
	pubsub.subscribe('client-RemoveGameWatcher', removeGameWatcher);
	pubsub.subscribe('network-close', resetHtml);

	$('#link-create-game').click(function() {
		network.sendMessage(enums.CommandsToServer.CreateGame);

		return false;
	});

	$('#lobby-games').on('click', 'a', function() {
		var $this = $(this),
			game_id = parseInt($this.closest('.lobby-section').attr('data-game-id'), 10);

		if ($(this).hasClass('link-join')) {
			network.sendMessage(enums.CommandsToServer.JoinGame, game_id);
		} else if ($(this).hasClass('link-rejoin')) {
			network.sendMessage(enums.CommandsToServer.RejoinGame, game_id);
		} else if ($(this).hasClass('link-watch')) {
			network.sendMessage(enums.CommandsToServer.WatchGame, game_id);
		}

		return false;
	});

	return null;
});
