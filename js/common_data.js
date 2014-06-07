define(function(require) {
	var pubsub = require('pubsub'),
		client_id_to_username = {};

	var setClientIdToUsername = function(client_id, username) {
			if (username === null) {
				delete client_id_to_username[client_id];
			} else {
				client_id_to_username[client_id] = username;
			}
		};

	pubsub.subscribe('server-SetClientIdToUsername', setClientIdToUsername);

	return {
		client_id_to_username: client_id_to_username
	};
});
