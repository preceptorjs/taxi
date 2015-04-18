'use strict';

var logMethods = require('./log');
var type = require('./type');
var when = require('./when');

var Nightwatch = require('./compatibility/nightwatch');

module.exports = Compatibility;

/**
 * Compatibility execution for taxi
 *
 * @constructor
 * @class Compatibility
 * @module WebDriver
 * @submodule Compatibility
 * @param {Driver} driver
 */
function Compatibility (driver) {
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
Compatibility.prototype._logMethodCall = function (event) {
    event.target = 'Compatibility';
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
Compatibility.prototype._requestJSON = function (method, path, body) {
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
Compatibility.prototype.getDriver = function () {
    return this._driver;
};


/**
 * Returns a Nightwatch.js object
 *
 * @method nightwatch
 * @return {Nightwatch}
 */
Compatibility.prototype.nightwatch = function () {
    return new Nightwatch(this.getDriver());
};

logMethods(Compatibility.prototype);
