'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createSearchContext = undefined;

var _compose = require('ramda/src/compose');

var _compose2 = _interopRequireDefault(_compose);

var _prop = require('ramda/src/prop');

var _prop2 = _interopRequireDefault(_prop);

var _sortBy = require('ramda/src/sortBy');

var _sortBy2 = _interopRequireDefault(_sortBy);

var _filter = require('ramda/src/filter');

var _filter2 = _interopRequireDefault(_filter);

var _allPass = require('ramda/src/allPass');

var _allPass2 = _interopRequireDefault(_allPass);

var _buildFuzzySearchPattern = require('./internal/buildFuzzySearchPattern');

var _buildFuzzySearchPattern2 = _interopRequireDefault(_buildFuzzySearchPattern);

var _filterResultSet = require('./internal/filterResultSet');

var _filterResultSet2 = _interopRequireDefault(_filterResultSet);

var _sortResultSet = require('./internal/sortResultSet');

var _sortResultSet2 = _interopRequireDefault(_sortResultSet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.warn('@local upi-fuzzy-search@1.4.0-11');

/**
 * HOF the return search context for a given collection
 * @param {Array} initialModel - eg collection of sku models
 * @param {Array} props - props to query from, first prop determines sort criteria eg 'sku' or 'metadata'
 * @param {Number} limit = limits the number of results returned @default all
 * @returns {Function} -
 */
function createSearchContext(initialModel) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var limit = arguments[2];

    var sortByFirstProp = (0, _sortBy2.default)((0, _prop2.default)(props[0]));
    var composeFilters = (0, _compose2.default)(_filter2.default, _allPass2.default);

    var _$cache = {};
    var _modelSorted = sortByFirstProp(initialModel);
    var _model = _modelSorted;

    return {
        setFilters: function setFilters(filters) {
            if (!filters) {
                return null;
            }

            var _filters = Array.isArray(filters) ? filters : [filters];
            // ensure only predicates are accepted
            var validatedFilters = _filters.filter(function (item) {
                return item instanceof Function;
            });
            var applyFilters = composeFilters(validatedFilters);

            _model = applyFilters(_modelSorted);
            // update model
            // _model = compose(
            //     applyFilters( validatedFilters ),
            //     sortByFirstProp
            // )( initialModel );
            // reset cache
            _$cache = {};
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
            var resultSets = _$cache[query] !== undefined ? _$cache[query] : _$cache[query] = (0, _filterResultSet2.default)(_$cache[prevQuery] || _model, queryPattern, props);

            // console.log( '"' + query + '"', queryPattern );
            return (0, _sortResultSet2.default)(resultSets, props[0], query, limit);
        }
    };
};

exports.createSearchContext = createSearchContext;