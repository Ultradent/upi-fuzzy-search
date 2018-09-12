import compose from 'ramda/src/compose';
import prop from 'ramda/src/prop';
import sortBy from 'ramda/src/sortBy';
import filter from 'ramda/src/filter';
import allPass from 'ramda/src/allPass';
import buildFuzzySearchPattern from './internal/buildFuzzySearchPattern';
import filterResultSet from './internal/filterResultSet';
import sortResultSet from './internal/sortResultSet';

/**
 * HOF the return search context for a given collection
 * @param {Array} initialModel - eg collection of sku models
 * @param {Array} props - props to query from, first prop determines sort criteria eg 'sku' or 'metadata'
 * @param {Number} limit = limits the number of results returned @default all
 * @returns {Function} -
 */
function createSearchContext ( initialModel, props = [], limit ) {
    const sortByFirstProp = sortBy( prop( props[0] ) );
    const composeFilters = compose( filter, allPass );

    let _$cache = {};
    let _modelSorted = sortByFirstProp( initialModel );
    let _model = _modelSorted;

    return {
        setFilters ( filters ) {
            if ( !filters ) {
                return null;
            }

            const _filters = Array.isArray( filters ) ? filters : [filters];
            // ensure only predicates are accepted
            const validatedFilters = _filters.filter( item => item instanceof Function );
            const applyFilters = composeFilters( validatedFilters );

            // update model / clear cache
            _model = applyFilters( _modelSorted );
            _$cache = {};
        },

        query: function search ( q ) {
            const
                query = q.toLowerCase(),
                queryPattern = buildFuzzySearchPattern( query ),
                prevQuery = query.substr( 0, query.length - 1 );

            // Filter Logic
            /* Each result set should be calculated based on previous result set to improve performance
             eg. query for "foob" should filter from results returned by "foo"
             Each result set gets cached in a lookup object as "this._filtered[ query ]" in order to be used as the
             current filter context to return next query input from
             If for some reason the prev results aren't cached the entire catalog will be passed as filter context
             */
            const resultSets = (_$cache[query] !== undefined)
                ? _$cache[query]
                : _$cache[query] = filterResultSet( _$cache[prevQuery] || _model, queryPattern, props );

            // console.log( '"' + query + '"', queryPattern );
            return sortResultSet( resultSets, props[0], query, limit );
        }
    }
};

export {createSearchContext}
