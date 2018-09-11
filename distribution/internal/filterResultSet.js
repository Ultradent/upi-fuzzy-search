'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _allPass = require('ramda/src/allPass');

var _allPass2 = _interopRequireDefault(_allPass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    var filters = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

    var isMatch = matchInQuery(props, pattern);

    return results.filter((0, _allPass2.default)([isMatch].concat(filters)));
}

exports.default = filterResultSet;