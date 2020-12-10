'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Convert received value to a searchable string stripping unnecessary format chars and html. Accepts String, Object, Array, Number.
 * @param str [Any]
 * @returns {string}
 */
function propToString(str) {
    var s = str;

    if (typeof s === 'number') {
        s = String(s);
    }

    // recursively flatten object values to string
    if ((typeof s === 'undefined' ? 'undefined' : _typeof(s)) === 'object') {
        s = Object.values(s).map(propToString);
        s = s.join(' ');
    }

    return s.trim().replace(/(<([^>]+)>)/gi, '') // strip html tags from string
    .replace(/[\r\n\t]/m, ' '); // remove whitespace and string format chars
}

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
                criteria += ' ' + propToString(prop);
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