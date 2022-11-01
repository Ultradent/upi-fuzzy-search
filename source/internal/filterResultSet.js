/**
 * Convert received value to a searchable string stripping unnecessary format chars and html. Accepts String, Object, Array, Number.
 * @param str [Any]
 * @returns {string}
 */

function propToString ( str ) {
    let s = str;

    if ( typeof s === 'undefined' ) {
        s = '';
    }

    if ( typeof s === 'number' ) {
        s = String( s );
    }

    // recursively flatten object values to string
    if ( typeof s === 'object' ) {
        s = Object.values( s ).map( propToString );
        s = s.join( ' ' );
    }

    return s
        .trim()
        .replace( /(<([^>]+)>)/gi, '' ) // strip html tags from string
        .replace( /[\r\n\t]/m, ' ' ) // remove whitespace and string format chars
}

/**
 * Filter results set by given criteria (prop)
 * @param results
 * @param pattern
 * @param prop
 * @param filters
 */
const matchInQuery = ( props, pattern ) => item => {
    let criteria = '';
    // build a metadata string by concatenating props
    // todo: memoize metadata string
    for ( let i = 0; i < props.length; i++ ) {
        let prop = item[props[i]];
        if ( prop ) {
            criteria += ' ' + propToString( prop );
        }
    }
    return criteria.trim().match( pattern );
};

function filterResultSet ( results, pattern, props = [] ) {
    const isMatch = matchInQuery( props, pattern );

    return results.filter( isMatch );
}

export default filterResultSet;
