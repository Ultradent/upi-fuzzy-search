'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _memoize = require('./memoize');

var _memoize2 = _interopRequireDefault(_memoize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Build a dynamic regular expression based on current query by exploding each character and allowing
 * a 0-1 wildcard character leeway for each character in query to accomodate mis-spellling
 * ex query: opal mint
 * pattern: [^o]?o[^p]?p[^a]?a[^l]?l[^.]*[^m]?m[^i]?i[^n]?n[^t]?t.*
 *
 * @param {String} q - query for search criteria
 * @returns {RegExp}
 */
var buildFuzzySearchPattern = (0, _memoize2.default)(function fuzzySearchPattern(q) {
    // resource - fuzzy search: http://stackoverflow.com/questions/2891514/algorithms-for-fuzzy-matching-strings
    var words = q.split(' '),
        pattern = [],
        charMap = {
        '.': 1,
        '\\': 1,
        '+': 1,
        '*': 1,
        '?': 1,
        '[': 1,
        '^': 1,
        ']': 1,
        '$': 1,
        '(': 1,
        ')': 1,
        '{': 1,
        '}': 1,
        '=': 1,
        '!': 1,
        '<': 1,
        '>': 1,
        '|': 1,
        ':': 1,
        '-': 1
    };

    // build pattern for "opal kit go" that will math following strings (where order of occurrence does not matter)
    // "Opalescence Go Patient Kit" or "Go get a kit of Opalescence"
    // ^(?=.*[^o]?o[^p]?p[^a]?a[^l]?l)(?=.*[^k]?k[^i]?i[^t]?t)(?=.*[^g]?g[^o]?o).*;
    // lead with string start anchor

    pattern.push('^');

    for (var i = 0; i < words.length; i++) {
        // start a lookahead group
        pattern.push('(?=.*');
        var word = words[i];
        for (var j = 0, l = word.length; j < l; j++) {
            // escape special characters for regexp
            var c = charMap[word[j]] ? '\\' + word[j] : word[j];
            // allow a 0-1 wildcard character leeway for each character in query to accommodate misspelling
            // pattern.push( '[^', c, ']?', c  ); // stricter match - off by one
            pattern.push('[^', c, ']{0,2}', c); // loose match
        }
        // group
        pattern.push(')');
    }

    // end with universal selector to ensure end of string is reached
    pattern.push('.*');

    // console.log( 'Fuzzy pattern for query:', q, pattern.join( '' ) );
    return new RegExp(pattern.join(''), 'mi');
});

exports.default = buildFuzzySearchPattern;