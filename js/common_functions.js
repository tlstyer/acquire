define(function(require) {
	var $ = require('jquery');

	return {
		getHyphenatedStringFromEnumName: function(enum_name) {
			return enum_name.replace(/([A-Z])/g, function($1) {
				return '-' + $1.toLowerCase();
			}).substring(1);
		}
	};
});
