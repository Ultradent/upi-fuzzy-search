
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
            criteria += ' ' + prop;
        }
    }
    return criteria.trim().match( pattern );
};

function filterResultSet ( results, pattern, props = [] ) {
    const isMatch = matchInQuery( props, pattern );

    return results.filter( isMatch );
}

export default filterResultSet;
