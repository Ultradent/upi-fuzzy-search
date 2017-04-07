'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash.sortby');

var _lodash2 = _interopRequireDefault(_lodash);

var _jaroWinkler = require('talisman/metrics/distance/jaro-winkler');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Logically sort result set using jaro winkler distance score of 0 - 1 e.g.(exact - no match)
 * https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance
 * Jaro distance between two words is the minimum number of single-character
 * transpositions required to change one word into the other.
 *
 * @param {Object} result - Hash containing collection of current result set to refine
 * @param {String} prop - Key for results hash to determine which result set to refine
 * @param {String} query - search term
 * @returns {Array}
 */
function sortResultSet(results, prop, query, limit) {
    // prop would be object prop e.g. "title"
    // jaro distance
    results = (0, _lodash2.default)(results, function (item) {
        if (item[prop] == null) {
            return 0;
        }
        // console.log( 'DISTANCE:', distance(item[prop].toLowerCase( ), query.toLowerCase( )) );
        return (0, _jaroWinkler.distance)(item[prop].toLowerCase(), query.toLowerCase());
    });

    // slice to improve performance for sorting and DOM rendering
    if (limit) {
        return results.slice(0, limit);
    }

    return results;
}

exports.default = sortResultSet;