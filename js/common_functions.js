define(function(require) {
	return {
		getHyphenatedStringFromEnumName: function(enum_name) {
			return enum_name.replace(/([A-Z])/g, function($1) {
				return '-' + $1.toLowerCase();
			}).substring(1);
		},
		getTileName: function(x, y) {
			return (x + 1) + String.fromCharCode(y + 65);
		}
	};
});
