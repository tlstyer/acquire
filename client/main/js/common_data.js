var enums = require('./enums'),
    pubsub = require('./pubsub'),
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
            ip_address: ip_address,
        };

        pubsub.publish(enums.PubSub.Client_AddLobbyClient, client_id);
        pubsub.publish(enums.PubSub.Client_AddClient, client_id);
        if (client_id === data.client_id) {
            pubsub.publish(enums.PubSub.Client_SetClientData);
        }
    }
}

function setGameState(game_id, state_id, mode_id, max_players, score) {
    data.game_id_to_state_id[game_id] = state_id;
    if (mode_id !== undefined) {
        data.game_id_to_mode_id[game_id] = mode_id;
    }
    if (max_players !== undefined) {
        data.game_id_to_max_players[game_id] = max_players;
    }
    if (score !== undefined) {
        data.game_id_to_score[game_id] = score;
    } else if (!data.game_id_to_score.hasOwnProperty(game_id)) {
        data.game_id_to_score[game_id] = null;
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

function setGamePlayerJoin(game_id, player_id, client_id) {
    var player_id2,
        number_of_players = data.game_id_to_number_of_players[game_id],
        player_data = data.game_id_to_player_data[game_id],
        player_datum,
        client_data = data.client_id_to_data[client_id];

    // move later players' data back one spot
    for (player_id2 = number_of_players - 1; player_id2 >= player_id; player_id2--) {
        player_datum = player_data[player_id2];
        player_data[player_id2 + 1] = player_datum;

        // update user's player_id if applicable
        if (player_datum.client_id === data.client_id) {
            data.player_id = player_id2 + 1;
        }
    }

    // insert new players' data
    player_data[player_id] = {
        username: client_data.username,
        client_id: client_id,
    };

    // increment number of players
    number_of_players++;
    data.game_id_to_number_of_players[game_id]++;

    // set user's game_id and player_id if applicable
    if (client_id === data.client_id) {
        data.game_id = game_id;
        data.player_id = player_id;
    }

    // publish
    for (player_id2 = player_id; player_id2 < number_of_players; player_id2++) {
        player_datum = player_data[player_id2];
        pubsub.publish(enums.PubSub.Client_SetGamePlayerData, game_id, player_id2, player_datum.username, player_datum.client_id);
    }
    pubsub.publish(enums.PubSub.Client_RemoveLobbyClient, client_id);
    pubsub.publish(enums.PubSub.Client_SetGamePlayerJoin, game_id, player_id, client_id);
    if (client_id === data.client_id) {
        pubsub.publish(enums.PubSub.Client_JoinGame);
    }
}

function setGamePlayerRejoin(game_id, player_id, client_id) {
    // update players' data
    data.game_id_to_player_data[game_id][player_id].client_id = client_id;

    // set user's game_id and player_id if applicable
    if (client_id === data.client_id) {
        data.game_id = game_id;
        data.player_id = player_id;
    }

    // publish
    pubsub.publish(enums.PubSub.Client_SetGamePlayerData, game_id, player_id, data.game_id_to_player_data[game_id][player_id].username, client_id);
    pubsub.publish(enums.PubSub.Client_RemoveLobbyClient, client_id);
    pubsub.publish(enums.PubSub.Client_SetGamePlayerRejoin, game_id, player_id, client_id);
    if (client_id === data.client_id) {
        pubsub.publish(enums.PubSub.Client_JoinGame);
    }
}

function setGamePlayerLeave(game_id, player_id, client_id) {
    // update players' data
    data.game_id_to_player_data[game_id][player_id].client_id = null;

    // set user's game_id and player_id if applicable
    if (client_id === data.client_id) {
        data.game_id = null;
        data.player_id = null;
    }

    // publish
    pubsub.publish(enums.PubSub.Client_SetGamePlayerData, game_id, player_id, data.game_id_to_player_data[game_id][player_id].username, null);
    pubsub.publish(enums.PubSub.Client_SetGamePlayerLeave, game_id, player_id, client_id);
    pubsub.publish(enums.PubSub.Client_AddLobbyClient, client_id);
    if (client_id === data.client_id) {
        pubsub.publish(enums.PubSub.Client_LeaveGame);
    }
}

function setGamePlayerJoinMissing(game_id, player_id, client_id_or_username) {
    var username = typeof client_id_or_username === 'number' ? data.client_id_to_data[client_id_or_username].username : client_id_or_username;

    // insert new players' data
    data.game_id_to_player_data[game_id][player_id] = {
        username: username,
        client_id: null,
    };

    // increment number of players
    data.game_id_to_number_of_players[game_id]++;

    // publish
    pubsub.publish(enums.PubSub.Client_SetGamePlayerData, game_id, player_id, username, null);
    pubsub.publish(enums.PubSub.Client_SetGamePlayerJoinMissing, game_id, player_id, username);
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
    delete data.game_id_to_score[game_id];
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
    data.game_id_to_score = {};
    data.game_id_to_number_of_players = {};
    data.game_id_to_player_data = {};
    data.game_id_to_watcher_client_ids = {};
}

reset();

pubsub.subscribe(enums.PubSub.Server_SetClientId, setClientId);
pubsub.subscribe(enums.PubSub.Server_SetClientIdToData, setClientIdToData);
pubsub.subscribe(enums.PubSub.Server_SetGameState, setGameState);
pubsub.subscribe(enums.PubSub.Server_SetGamePlayerJoin, setGamePlayerJoin);
pubsub.subscribe(enums.PubSub.Server_SetGamePlayerRejoin, setGamePlayerRejoin);
pubsub.subscribe(enums.PubSub.Server_SetGamePlayerLeave, setGamePlayerLeave);
pubsub.subscribe(enums.PubSub.Server_SetGamePlayerJoinMissing, setGamePlayerJoinMissing);
pubsub.subscribe(enums.PubSub.Server_SetGameWatcherClientId, setGameWatcherClientId);
pubsub.subscribe(enums.PubSub.Server_ReturnWatcherToLobby, returnWatcherToLobby);
pubsub.subscribe(enums.PubSub.Server_DestroyGame, destroyGame);
pubsub.subscribe(enums.PubSub.Network_Disconnect, reset);

module.exports = data;
