define(function(require) {
	var $ = require('jquery'),
		common_data = require('common_data');

	return {
		getUsernameElement: function(client_id) {
			return $('<span class="username"/>').text(common_data.client_id_to_data[client_id].username);
		},
		getHyphenatedStringFromEnumName: function(enum_name) {
			return enum_name.replace(/([A-Z])/g, function($1) {
				return '-' + $1.toLowerCase();
			}).substring(1);
		}
	};
});
