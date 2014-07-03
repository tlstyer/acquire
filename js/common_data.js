define(function(require) {
	var pubsub = require('pubsub'),
		data = {},
		setClientId = function(client_id) {
			data.client_id = client_id;
		},
		setClientIdToData = function(client_id, username, ip_and_port) {
			if (username === null) {
				delete data.client_id_to_data[client_id];

				pubsub.publish('client-RemoveLobbyClient', client_id);
			} else {
				data.client_id_to_data[client_id] = {
					username: username,
					ip_and_port: ip_and_port
				};

				pubsub.publish('client-AddLobbyClient', client_id);
			}
		},
		setGameState = function(game_id, state_id) {
			data.game_id_to_game_state[game_id] = state_id;
			if (!data.game_id_to_player_data.hasOwnProperty(game_id)) {
				data.game_id_to_player_data[game_id] = {};
			}

			pubsub.publish('client-SetGameState', game_id);
		},
		setGamePlayerUsername = function(game_id, player_id, username) {
			data.game_id_to_player_data[game_id][player_id] = {
				username: username,
				client_id: null
			};

			pubsub.publish('client-SetGamePlayerData', game_id, player_id, username, null);
		},
		setGamePlayerClientId = function(game_id, player_id, client_id) {
			var player_data, old_client_id, client_data, old_game_id;

			if (client_id === null) {
				player_data = data.game_id_to_player_data[game_id][player_id];
				old_client_id = player_data.client_id;

				if (old_client_id === data.client_id) {
					data.game_id = null;
					data.player_id = null;
				}

				player_data.client_id = null;

				pubsub.publish('client-SetGamePlayerData', game_id, player_id, player_data.username, null);
				pubsub.publish('client-AddLobbyClient', old_client_id);
				if (old_client_id === data.client_id) {
					pubsub.publish('client-LeaveGame');
				}
			} else {
				client_data = data.client_id_to_data[client_id];
				old_game_id = data.game_id;

				if (client_id === data.client_id) {
					data.game_id = game_id;
					data.player_id = player_id;
				}

				data.game_id_to_player_data[game_id][player_id] = {
					username: client_data.username,
					client_id: client_id
				};

				pubsub.publish('client-RemoveLobbyClient', client_id);
				pubsub.publish('client-SetGamePlayerData', game_id, player_id, client_data.username, client_id);
				if (game_id !== old_game_id && client_id === data.client_id) {
					pubsub.publish('client-JoinGame');
				}
			}
		},
		setGameWatcherClientId = function(game_id, client_id) {
			if (!data.game_id_to_watcher_client_ids.hasOwnProperty(game_id)) {
				data.game_id_to_watcher_client_ids[game_id] = [];
			}
			data.game_id_to_watcher_client_ids[game_id].push(client_id);

			if (client_id === data.client_id) {
				data.game_id = game_id;
			}

			pubsub.publish('client-RemoveLobbyClient', client_id);
			pubsub.publish('client-AddGameWatcher', game_id, client_id);
			if (client_id === data.client_id) {
				pubsub.publish('client-JoinGame');
			}
		},
		returnWatcherToLobby = function(game_id, client_id) {
			var client_ids = data.game_id_to_watcher_client_ids[game_id];
			data.game_id_to_watcher_client_ids[game_id] = client_ids.splice(client_ids.indexOf(client_id), 1);

			if (client_id === data.client_id) {
				data.game_id = null;
			}

			pubsub.publish('client-RemoveGameWatcher', game_id, client_id);
			pubsub.publish('client-AddLobbyClient', client_id);
			if (client_id === data.client_id) {
				pubsub.publish('client-LeaveGame');
			}
		},
		resetData = function() {
			data.client_id = null;
			data.game_id = null;
			data.player_id = null;
			data.client_id_to_data = {};
			data.game_id_to_game_state = {};
			data.game_id_to_player_data = {};
			data.game_id_to_watcher_client_ids = {};
		};

	pubsub.subscribe('server-SetClientId', setClientId);
	pubsub.subscribe('server-SetClientIdToData', setClientIdToData);
	pubsub.subscribe('server-SetGameState', setGameState);
	pubsub.subscribe('server-SetGamePlayerUsername', setGamePlayerUsername);
	pubsub.subscribe('server-SetGamePlayerClientId', setGamePlayerClientId);
	pubsub.subscribe('server-SetGameWatcherClientId', setGameWatcherClientId);
	pubsub.subscribe('server-ReturnWatcherToLobby', returnWatcherToLobby);
	pubsub.subscribe('network-Close', resetData);
	pubsub.subscribe('network-Error', resetData);

	resetData();

	return data;
});
