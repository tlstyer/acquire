define(function(require) {
	var $ = require('jquery'),
		client_id_to_username = require('client_id_to_username');

	return {
		getUsernameElement: function(client_id) {
			return $('<span class="username"/>').text(client_id_to_username.get(client_id));
		}
	};
});
