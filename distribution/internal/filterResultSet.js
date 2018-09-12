'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

/**
 * Filter results set by given criteria (prop)
 * @param results
 * @param pattern
 * @param prop
 * @param filters
 */
var matchInQuery = function matchInQuery(props, pattern) {
    return function (item) {
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
    };
};

function filterResultSet(results, pattern) {
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    var isMatch = matchInQuery(props, pattern);

    return results.filter(isMatch);
}

exports.default = filterResultSet;