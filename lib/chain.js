'use strict';

var logMethods = require('./log');
var type = require('./type');
var when = require('./when');

module.exports = Sequence;

/**
 * Sequence execution for taxi
 *
 * @constructor
 * @class Sequence
 * @module WebDriver
 * @submodule Sequence
 * @param {Driver} driver
 */
function Sequence (driver) {
    this._driver = driver;
}

/////////////////////
// Private Methods //
/////////////////////

/**
 * Logs a method call by an event
 *
 * @param {object} event
 * @method _logMethodCall
 * @private
 */
Sequence.prototype._logMethodCall = function (event) {
    event.target = 'Sequence';
    this._driver._logMethodCall(event);
};


/**
 * Performs a context dependent JSON request for the current session.
 * The result is parsed for errors.
 *
 * @method _requestJSON
 * @private
 * @param {String} method
 * @param {String} path
 * @param {*} [body]
 * @return {*}
 */
Sequence.prototype._requestJSON = function (method, path, body) {
    return this._driver._requestJSON(method, path, body);
};


////////////////////
// Public Methods //
////////////////////

/**
 * Gets the driver object.
 * Direct-access. No need to wait.
 *
 * @return {Driver}
 */
Sequence.prototype.getDriver = function () {
    return this._driver;
};


Sequence.prototype._elementAction = function (selector, fn) {
    return when(this._driver.browser().activeWindow().getElements(selector), function (elements) {
        return when(this._driver.utils().map(elements, function (element) {
            return when(fn(element));
        }), function () {
            return this;
        }.bind(this));
    }.bind(this));
};

Sequence.prototype._driverAction = function (value, fn) {
    return when(value, function (result) {
        return when(fn(result), function () {
            return this;
        }.bind(this));
    }.bind(this));
};

Sequence.prototype._scopeCallBack = function (cb, args) {
    return cb.apply({
        sequence: this
    }, args);
};



Sequence.prototype.compatibility = function () {

};

logMethods(Sequence.prototype);
