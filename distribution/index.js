'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createSearchContext = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _compose = require('ramda/src/compose');

var _compose2 = _interopRequireDefault(_compose);

var _prop = require('ramda/src/prop');

var _prop2 = _interopRequireDefault(_prop);

var _sortWith = require('ramda/src/sortWith');

var _sortWith2 = _interopRequireDefault(_sortWith);

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

/**
 * HOF the return search context for a given collection
 * @param {Array} initialModel - eg collection of sku models
 * @param {Array} props - props to query from, first prop determines sort criteria eg 'sku' or 'metadata'
 * @returns {Function} -
 */
function createSearchContext(initialModel) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var sortByFirstProp = (0, _sortBy2.default)((0, _prop2.default)(props[0]));
    var composeFilters = (0, _compose2.default)(_filter2.default, _allPass2.default);
    var composeSortInstructions = function composeSortInstructions(sortProps) {
        var sortInstructions = sortProps.map(function (_ref) {
            var property = _ref.property,
                direction = _ref.direction;

            var sortDirection = direction === 'asc' ? ascend : descend;
            return sortDirection((0, _prop2.default)(property));
        });

        return (0, _sortWith2.default)(sortInstructions);
    };

    var _$cache = {};
    var _modelSorted = sortByFirstProp(initialModel);
    var _model = _modelSorted;

    return {
        /**
         * Expects an array of strings or a single string to specify property and direction to sort by  eg. ['age:desc', 'name:asc']
         * @param sorts
         * @returns {null}
         */
        setSorting: function setSorting(sorts) {
            if (!sorts) {
                console.warn('[Upi.FuzzySearch] Attempted to set sorting with no sorts provided');
                return null;
            }
            var _sorts = Array.isArray(sorts) ? sorts : [sorts];
            var sortProps = _sorts.map(function (sort) {
                var _sort$split = sort.split(':'),
                    _sort$split2 = _slicedToArray(_sort$split, 2),
                    prop = _sort$split2[0],
                    dir = _sort$split2[1];

                return { property: prop, direction: dir || 'asc' };
            });

            var applySorting = composeSortInstructions(sortProps);

            // update model / clear cache
            _model = applySorting(_modelSorted);
            _$cache = {};
        },
        setFilters: function setFilters(filters) {
            if (!filters) {
                console.warn('[Upi.FuzzySearch] Attempted to set filters with no filters provided');
                return null;
            }

            var _filters = Array.isArray(filters) ? filters : [filters];
            // ensure only predicates are accepted
            var validatedFilters = _filters.filter(function (item) {
                return item instanceof Function;
            });
            var applyFilters = composeFilters(validatedFilters);

            // update model / clear cache
            _model = applyFilters(_modelSorted);
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
            var results = (0, _sortResultSet2.default)(resultSets, props[0], query);

            return {
                results: results,
                resultCount: results.length || 0,
                queryPattern: queryPattern
            };
        }
    };
};

exports.createSearchContext = createSearchContext;