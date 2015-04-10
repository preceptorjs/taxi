'use strict';

module.exports = when;

module.exports.when = when;
module.exports.done = whenDone;
module.exports.try = whenTry;

module.exports.isPromise = isPromise;


//////////////////////
// Public Functions //
//////////////////////

/**
 * When promise is fulfilled, then execute callback
 *
 * @param {*} val
 * @param {Function} cb Completion callback
 * @param {Function} [eb] Error callback
 * @return {*}
 */
function when (val, cb, eb) {
    if (when.isPromise(val)) {
        return val.then(cb, eb);
    } else {
        return cb(val);
    }
}

/**
 * When promise is fulfilled, then execute callback
 *
 * @param {*} val
 * @param {Function} cb Completion callback
 * @param {Function} [eb] Error callback
 * @return {*}
 */
function whenDone (val, cb, eb) {
    if (when.isPromise(val)) {
        return val.done(cb, eb);
    } else {
        return cb(val);
    }
}

/**
 * Try execute function, and when completed, then execute callback
 *
 * @method whenTry
 * @param {Function} fn Function to execute in a try-catch
 * @param {Function} cb Completion callback
 * @param {Function} [eb] Error callback
 * @return {*}
 */
function whenTry (fn, cb, eb) {
    var val;
    try {
        val = fn();
    } catch (ex) {
        return eb(ex);
    }
    return when.when(val, cb, eb);
}


///////////////////////
// Private Functions //
///////////////////////

/**
 * Test whether a value is a promise or not
 *
 * @param {Object} val
 * @return {Boolean}
 */
function isPromise (val) {
    return !!(val && (typeof val === 'object' || typeof val === 'function') && typeof val.then === 'function');
}