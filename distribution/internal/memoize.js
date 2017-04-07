"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
// create a data store for previously calculated results
function memoized(key) {
    this._value = this._value || {};
    return this._value[key] !== undefined ? this._value[key] : this._value[key] = this.apply(this, arguments);
};

// returns a function whos calculated results will be memoized
function memoize(fn) {
    return function () {
        return memoized.apply(fn, arguments);
    };
};

exports.default = memoize;