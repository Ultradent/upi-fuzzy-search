import sortBy from 'lodash.sortby';
import { distance } from 'talisman/metrics/distance/jaro-winkler';

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
function sortResultSet( results, prop, query, limit ) {
    // prop would be object prop e.g. "title"
    // jaro distance
    results = sortBy( results, function( item ) {
        // return levenshteinDistance( item[prop] + '~:' + query );
        // eslint-disable-next-line
        if ( item[prop] == null ) {
            return 0;
        }
        // console.log( 'DIST:', distance( item[prop], query ) );
        return distance(item[prop].toLowerCase( ), query.toLowerCase( ));
    });

    // slice to improve performance for sorting and DOM rendering
    if ( limit ) {
        return results.slice( 0, limit );
    }

    return results;
}

export default sortResultSet;
