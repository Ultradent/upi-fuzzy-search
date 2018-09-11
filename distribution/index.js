'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createSearchContext = undefined;

var _lodash = require('lodash.sortby');

var _lodash2 = _interopRequireDefault(_lodash);

var _buildFuzzySearchPattern = require('./internal/buildFuzzySearchPattern');

var _buildFuzzySearchPattern2 = _interopRequireDefault(_buildFuzzySearchPattern);

var _filterResultSet = require('./internal/filterResultSet');

var _filterResultSet2 = _interopRequireDefault(_filterResultSet);

var _sortResultSet = require('./internal/sortResultSet');

var _sortResultSet2 = _interopRequireDefault(_sortResultSet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log('LOAD UPI_FUZZY_SEARCH V2');

/**
 * HOF the return search context for a given collection
 * @param {Array} model - eg collection of sku models
 * @param {Array} props - props to query from, first prop determines sort criteria eg 'sku' or 'metadata'
 * @param {Number} limit = limits the number of results returned @default all
 * @returns {Function} -
 */
function createSearchContext(model) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var limit = arguments[2];


    var _$cache = {};

    model = (0, _lodash2.default)(model, function sortByName(item) {
        return item[props[0]];
    });

    var ctxFilters = [];

    return {
        setFilters: function setFilters(filters) {
            if (!filters) {
                return null;
            }

            var _filters = Array.isArray(filters) ? filters : [filters];

            // ensure only predicates are accepted
            ctxFilters = _filters.filter(function (item) {
                return item instanceof Function;
            });
        },


        query: function search(q) {
            var query = q.toLowerCase(),
                queryPattern = (0, _buildFuzzySearchPattern2.default)(query),
                prevQuery = query.substr(0, query.length - 1);

            // Filter Logic
            /* Each result set should be calculated based on previous result set to improve performance
             eg. query for "foob" should filter from results returned by "foo"
             Each result set gets cached in a lookup object as "this._filtered[ query ]" in order to be used as the
             current filter context to return next query input from
             If for some reason the prev results aren't cached the entire catalog will be passed as filter context
             */
            var resultSets = _$cache[query] !== undefined ? _$cache[query] : _$cache[query] = (0, _filterResultSet2.default)(_$cache[prevQuery] || model, queryPattern, props, ctxFilters);

            // console.log( '"' + query + '"', queryPattern );
            return (0, _sortResultSet2.default)(resultSets, props[0], query, limit);
        }
    };
}

exports.createSearchContext = createSearchContext;