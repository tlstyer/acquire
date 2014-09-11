define(function(require) {
	'use strict';

	var enums = require('enums'),
		pubsub = require('pubsub'),
		data = {};

	function setClientId(client_id) {
		data.client_id = client_id;
	}

	function setClientIdToData(client_id, username, ip_address) {
		if (username === null) {
			pubsub.publish(enums.PubSub.Client_RemoveLobbyClient, client_id);
			pubsub.publish(enums.PubSub.Client_RemoveClient, client_id);

			delete data.client_id_to_data[client_id];
		} else {
			data.client_id_to_data[client_id] = {
				username: username,
				ip_address: ip_address
			};

			pubsub.publish(enums.PubSub.Client_AddLobbyClient, client_id);
			pubsub.publish(enums.PubSub.Client_AddClient, client_id);
			if (client_id === data.client_id) {
				pubsub.publish(enums.PubSub.Client_SetClientData);
			}
		}
	}

	function setGameState(game_id, state_id, mode_id, max_players) {
		data.game_id_to_state_id[game_id] = state_id;
		if (mode_id !== undefined) {
			data.game_id_to_mode_id[game_id] = mode_id;
		}
		if (max_players !== undefined) {
			data.game_id_to_max_players[game_id] = max_players;
		}
		if (!data.game_id_to_number_of_players.hasOwnProperty(game_id)) {
			data.game_id_to_number_of_players[game_id] = 0;
		}
		if (!data.game_id_to_player_data.hasOwnProperty(game_id)) {
			data.game_id_to_player_data[game_id] = {};
		}
		if (!data.game_id_to_watcher_client_ids.hasOwnProperty(game_id)) {
			data.game_id_to_watcher_client_ids[game_id] = [];
		}

		pubsub.publish(enums.PubSub.Client_SetGameState, game_id);
	}

	function setGamePlayerUsername(game_id, player_id, username) {
		data.game_id_to_number_of_players[game_id] = Math.max(data.game_id_to_number_of_players[game_id], player_id + 1);

		data.game_id_to_player_data[game_id][player_id] = {
			username: username,
			client_id: null
		};

		pubsub.publish(enums.PubSub.Client_SetGamePlayerData, game_id, player_id, username, null);
	}

	function setGamePlayerClientId(game_id, player_id, client_id) {
		var player_data, old_client_id, client_data, old_game_id, client_already_in_game, player_id2;

		data.game_id_to_number_of_players[game_id] = Math.max(data.game_id_to_number_of_players[game_id], player_id + 1);

		if (client_id === null) {
			player_data = data.game_id_to_player_data[game_id][player_id];
			old_client_id = player_data.client_id;

			if (old_client_id === data.client_id) {
				data.game_id = null;
				data.player_id = null;
			}

			player_data.client_id = null;

			pubsub.publish(enums.PubSub.Client_SetGamePlayerData, game_id, player_id, player_data.username, null);
			pubsub.publish(enums.PubSub.Client_RemoveGamePlayer, game_id, old_client_id);
			pubsub.publish(enums.PubSub.Client_AddLobbyClient, old_client_id);
			if (old_client_id === data.client_id) {
				pubsub.publish(enums.PubSub.Client_LeaveGame);
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

			pubsub.publish(enums.PubSub.Client_RemoveLobbyClient, client_id);
			pubsub.publish(enums.PubSub.Client_SetGamePlayerData, game_id, player_id, client_data.username, client_id);

			client_already_in_game = false;
			player_data = data.game_id_to_player_data[game_id];
			for (player_id2 in player_data) {
				if (player_data.hasOwnProperty(player_id2) && parseInt(player_id2, 10) !== player_id && client_id === player_data[player_id2].client_id) {
					client_already_in_game = true;
				}
			}
			if (!client_already_in_game) {
				pubsub.publish(enums.PubSub.Client_AddGamePlayer, game_id, client_id);
			}

			if (game_id !== old_game_id && client_id === data.client_id) {
				pubsub.publish(enums.PubSub.Client_JoinGame);
			}
		}
	}

	function setGameWatcherClientId(game_id, client_id) {
		data.game_id_to_watcher_client_ids[game_id].push(client_id);

		if (client_id === data.client_id) {
			data.game_id = game_id;
		}

		pubsub.publish(enums.PubSub.Client_RemoveLobbyClient, client_id);
		pubsub.publish(enums.PubSub.Client_AddGameWatcher, game_id, client_id);
		if (client_id === data.client_id) {
			pubsub.publish(enums.PubSub.Client_JoinGame);
		}
	}

	function returnWatcherToLobby(game_id, client_id) {
		var client_ids = data.game_id_to_watcher_client_ids[game_id];

		data.game_id_to_watcher_client_ids[game_id] = client_ids.splice(client_ids.indexOf(client_id), 1);

		if (client_id === data.client_id) {
			data.game_id = null;
		}

		pubsub.publish(enums.PubSub.Client_RemoveGameWatcher, game_id, client_id);
		pubsub.publish(enums.PubSub.Client_AddLobbyClient, client_id);
		if (client_id === data.client_id) {
			pubsub.publish(enums.PubSub.Client_LeaveGame);
		}
	}

	function destroyGame(game_id) {
		delete data.game_id_to_state_id[game_id];
		delete data.game_id_to_mode_id[game_id];
		delete data.game_id_to_max_players[game_id];
		delete data.game_id_to_number_of_players[game_id];
		delete data.game_id_to_player_data[game_id];
		delete data.game_id_to_watcher_client_ids[game_id];
	}

	function reset() {
		data.client_id = null;
		data.game_id = null;
		data.player_id = null;
		data.client_id_to_data = {};
		data.game_id_to_state_id = {};
		data.game_id_to_mode_id = {};
		data.game_id_to_max_players = {};
		data.game_id_to_number_of_players = {};
		data.game_id_to_player_data = {};
		data.game_id_to_watcher_client_ids = {};
	}

	reset();

	pubsub.subscribe(enums.PubSub.Server_SetClientId, setClientId);
	pubsub.subscribe(enums.PubSub.Server_SetClientIdToData, setClientIdToData);
	pubsub.subscribe(enums.PubSub.Server_SetGameState, setGameState);
	pubsub.subscribe(enums.PubSub.Server_SetGamePlayerUsername, setGamePlayerUsername);
	pubsub.subscribe(enums.PubSub.Server_SetGamePlayerClientId, setGamePlayerClientId);
	pubsub.subscribe(enums.PubSub.Server_SetGameWatcherClientId, setGameWatcherClientId);
	pubsub.subscribe(enums.PubSub.Server_ReturnWatcherToLobby, returnWatcherToLobby);
	pubsub.subscribe(enums.PubSub.Server_DestroyGame, destroyGame);
	pubsub.subscribe(enums.PubSub.Network_Disconnect, reset);

	return data;
});
