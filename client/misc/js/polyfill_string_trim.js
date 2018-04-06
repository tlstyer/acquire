// from https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
if (!String.prototype.trim) {
    (function() {
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function() {
            return this.replace(rtrim, '');
        };
    })();
}
