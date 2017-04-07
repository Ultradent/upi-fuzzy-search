/**
 * Filter results set by given criteria (prop)
 * @param results
 * @param pattern
 * @param prop
 */
function filterResultSet(results, pattern, props = [ ]) {
    return results.filter(item => {
        let criteria = '';
        // build a metadata string by concatenating props
        // todo: memoize metadata string
        for ( let i = 0; i < props.length; i++ ) {
            let prop = item[props[i]];
            if ( prop ) {
                criteria += ' ' + prop;
            }
        }
        return criteria.trim( ).match( pattern );
    });
}

export default filterResultSet;
