import sortBy from 'lodash.sortby';
import memoize from 'memoizee';

import levenshtein from 'talisman/metrics/distance/levenshtein';
import { distance } from 'talisman/metrics/distance/jaro-winkler';


// todo: implement memoized method in sorting handler
export const levenshteinDistance = memoize( function ( str ) {
    // concatenator is used for memoization to be stored as index key for easy lookup
    // search_string + '~:' + query
    const p = str.split( '~:' );
    return levenshtein( p[0], p[1] );
});


/**
 * Filter results set by given criteria (prop)
 * @param results
 * @param pattern
 * @param prop
 */
export function filterResultSet( results, pattern, props=[] ) {
    return results.filter( item => {
        let criteria = '';
        // build a metadata string by concatenating props
        // todo: memoize metadata string
        for( let i=0; i < props.length; i++ ) {
            let prop = item[ props[ i ] ];
            if( prop ) {
                criteria += ' ' + prop;
            }
        }
        return criteria.trim().match( pattern );
    } );
}

/**
 * Build a dynamic regular expression based on current query by exploding each character and allowing
 * a 0-1 wildcard character leeway for each character in query to accomodate mis-spellling
 * ex query: opal mint
 * pattern: [^o]?o[^p]?p[^a]?a[^l]?l[^.]*[^m]?m[^i]?i[^n]?n[^t]?t.*
 *
 * @param {String} q - query for search criteria
 * @returns {RegExp}
 */
export const buildFuzzySearchPattern = memoize( function fuzzySearchPattern( q ) {
    // resource - fuzzy search: http://stackoverflow.com/questions/2891514/algorithms-for-fuzzy-matching-strings
    const
        words = q.split( ' ' ),
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

    pattern.push( '^' );

    for( let i=0; i < words.length; i++ ) {
        // start a lookahead group
        pattern.push( '(?=.*' );
        let word = words[i];
        for ( let j = 0, l = word.length; j < l; j++ ) {
            // escape special characters for regexp
            let c = charMap[ word[j] ] ? '\\' + word[j] : word[j];
            // allow a 0-1 wildcard character leeway for each character in query to accommodate misspelling
            // pattern.push( '[^', c, ']?', c  ); // stricter match - off by one
            pattern.push( '[^', c, ']{0,2}', c ); // loose match
        }
        // group
        pattern.push( ')' );
    }

    // end with universal selector to ensure end of string is reached
    pattern.push( '.*' );

    // console.log( 'Fuzzy pattern for query:', q, pattern.join( '' ) );
    return new RegExp( pattern.join( '' ), 'i' );

} );

/**
 * Logically sort result set in order of
 * 1. character proximity
 * 2. numeric/alphabetic
 * 3. placement left/right within string
 *
 * @param {Object} result - Hash containing collection of current result set to refine
 * @param {String} prop - Key for results hash to determine which result set to refine
 * @param {String} query - search term
 * @returns {Array}
 */
export function sortResultSet( results, prop, query, limit ) {
    // prop would be object prop e.g. "title"
    // jaro distance
    results = sortBy( results, function( item ) {
        // return levenshteinDistance( item[prop] + '~:' + query );
        // eslint-disable-next-line
        if( item[prop] == null ) {
            return 0;
        }
        // console.log( 'DIST:', distance( item[prop], query ) );
        return distance( item[prop].toLowerCase(), query.toLowerCase() );
    } );

    // slice to improve performance for sorting and DOM rendering
    if( limit ) {
        return results.slice( 0, limit );
    }

    return reuslts;
}

/**
 * HOF the return search context for a given collection
 * @param {Array} model - eg collection of sku models
 * @param {Array} props - props to query from, first prop determines sort criteria eg 'sku' or 'metadata'
 * @param {Number} limit = limits the number of results returned @default all
 * @returns {Function} -
 */
export function createSearchContext( model, props = [], limit ) {

    let _$cache = {};

    model = sortBy( model, function sortByName( item ) {
        return item[props[0]];
    } );

    return function search( q ) {
        const query = q.toLowerCase()
            , queryPattern = buildFuzzySearchPattern( query )
            , prevQuery = query.substr( 0, query.length - 1 );

        // Filter Logic
        /* Each result set should be calculated based on previous result set to improve performance
         eg. query for "foob" should filter from results returned by "foo"
         Each result set gets cached in a lookup object as "this._filtered[ query ]" in order to be used as the
         current filter context to return next query input from
         If for some reason the prev results aren't cached the entire catalog will be passed as filter context
         */
        const resultSets = ( _$cache[query] !== undefined )
            ? _$cache[query]
            : _$cache[query] = filterResultSet( _$cache[prevQuery] || model, queryPattern, props );

        // console.log( '"' + query + '"', queryPattern );
        return sortResultSet( resultSets, props[0], query, limit );
    }
}
