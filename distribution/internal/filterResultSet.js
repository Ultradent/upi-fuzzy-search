'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Filter results set by given criteria (prop)
 * @param results
 * @param pattern
 * @param prop
 */
function filterResultSet(results, pattern) {
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    return results.filter(function (item) {
        var criteria = '';
        // build a metadata string by concatenating props
        // todo: memoize metadata string
        for (var i = 0; i < props.length; i++) {
            var prop = item[props[i]];
            if (prop) {
                criteria += ' ' + prop;
            }
        }
        return criteria.trim().match(pattern);
    });
}

exports.default = filterResultSet;