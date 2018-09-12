import sortBy from 'lodash.sortby';
import allPass from 'ramda/src/allPass';
import buildFuzzySearchPattern from './internal/buildFuzzySearchPattern';
import filterResultSet from './internal/filterResultSet';
import sortResultSet from './internal/sortResultSet';

function updateModel ( model, filters ) {
    if ( filters ) {
        model = model.filter( allPass( filters ) )
    }
    return sortBy( model, function sortByName ( item ) {
        return item[props[0]];
    } );
}

/**
 * HOF the return search context for a given collection
 * @param {Array} initialModel - eg collection of sku models
 * @param {Array} props - props to query from, first prop determines sort criteria eg 'sku' or 'metadata'
 * @param {Number} limit = limits the number of results returned @default all
 * @returns {Function} -
 */
function createSearchContext ( initialModel, props = [], limit ) {

    let _$cache = {};
    let _ctxFilters = [];
    let _model = updateModel( initialModel );

    return {
        setFilters ( filters ) {
            if ( !filters ) {
                return null;
            }

            const _filters = Array.isArray( filters ) ? filters : [filters];
            // ensure only predicates are accepted
            const validatedFilters = _filters.filter( item => item instanceof Function );

            // update model
            _model = updateModel( initialModel, validatedFilters );
            // reset cache
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
}

export {createSearchContext}
