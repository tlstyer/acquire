define(function(require) {
	var scrollbar_width = 0,
		initializeScrollbarWidth = function() {
			// from http://benalman.com/projects/jquery-misc-plugins/#scrollbarwidth
			var parent, child;

			parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body');
			child = parent.children();
			scrollbar_width = child.innerWidth() - child.height(99).innerWidth();
			parent.remove();
		},
		getHyphenatedStringFromEnumName = function(enum_name) {
			return enum_name.replace(/([A-Z])/g, function($1) {
				return '-' + $1.toLowerCase();
			}).substring(1);
		},
		getTileName = function(x, y) {
			return (x + 1) + String.fromCharCode(y + 65);
		},
		setElementPosition = function($element, left, top, width, height, font_size) {
			if (left !== null) {
				$element.css('left', left);
			}
			if (top !== null) {
				$element.css('top', top);
			}
			if (width !== null) {
				$element.css('width', width);
			}
			if (height !== null) {
				$element.css('height', height);
			}
			if (typeof font_size !== 'undefined') {
				$element.css('font-size', font_size + 'px');
			}
		},
		isScrollAtBottom = function($element) {
			return $element.scrollTop() + $element.innerHeight() >= $element[0].scrollHeight;
		},
		scrollToBottom = function($element) {
			$element.scrollTop($element[0].scrollHeight - $element.innerHeight());
		},
		getScrollbarWidth = function() {
			return scrollbar_width;
		};

	initializeScrollbarWidth();

	return {
		getHyphenatedStringFromEnumName: getHyphenatedStringFromEnumName,
		getTileName: getTileName,
		setElementPosition: setElementPosition,
		isScrollAtBottom: isScrollAtBottom,
		scrollToBottom: scrollToBottom,
		getScrollbarWidth: getScrollbarWidth
	};
});
