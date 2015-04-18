'use strict';

var logMethods = require('./log');
var type = require('./type');
var when = require('./when');

module.exports = Nightwatch;

/**
 * Nightwatch execution for taxi
 *
 * @constructor
 * @class Nightwatch
 * @module WebDriver
 * @submodule Sequence
 * @param {Driver} driver
 */
function Nightwatch (driver) {
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
Nightwatch.prototype._logMethodCall = function (event) {
    event.target = 'Nightwatch';
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
Nightwatch.prototype._requestJSON = function (method, path, body) {
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
Nightwatch.prototype.getDriver = function () {
    return this._driver;
};


Nightwatch.prototype._elementAction = function (selector, fn) {
    return when(this._driver.browser().activeWindow().getElements(selector), function (elements) {
        return when(this._driver.utils().map(elements, function (element) {
            return when(fn(element));
        }), function () {
            return this;
        }.bind(this));
    }.bind(this));
};

Nightwatch.prototype._driverAction = function (value, fn) {
    return when(value, function (result) {
        return when(fn(result), function () {
            return this;
        }.bind(this));
    }.bind(this));
};

Nightwatch.prototype._scopeCallBack = function (cb, args) {
    return cb.apply({
        sequence: this
    }, args);
};
























Nightwatch.prototype.clearValue = function (selector, cb) {
    return this._elementAction(selector, function (element) {
        return when(element.clear(), function () {
            return this._scopeCallBack(cb, [element]);
        }.bind(this));
    }.bind(this));
};

Nightwatch.prototype.click = function (selector, cb) {
    return this._elementAction(selector, function (element) {
        return when(element.mouse().click(), function () {
            return this._scopeCallBack(cb, [element]);
        }.bind(this));
    }.bind(this));
};

Nightwatch.prototype.closeWindow = function (cb) {
    return this._driverAction(this._driver.browser().activeWindow().close(), function () {
        return this._scopeCallBack(cb, []);
    }.bind(this));
};

Nightwatch.prototype.deleteCookie = function (name, cb) {
    return this._driverAction(this._driver.browser().cookieStorage().removeCookie(name), function () {
        return this._scopeCallBack(cb, []);
    }.bind(this));
};

Nightwatch.prototype.deleteCookies = function (cb) {
    return this._driverAction(this._driver.browser().cookieStorage().clear(), function () {
        return this._scopeCallBack(cb, []);
    }.bind(this));
};

Nightwatch.prototype.getAttribute = function (selector, attribute, cb) {
    return this._elementAction(selector, function (element) {
        return when(element.getAttribute(attribute), function (value) {
            return this._scopeCallBack(cb, [value, attribute, element]);
        }.bind(this));
    }.bind(this));
};

Nightwatch.prototype.getCookie = function (name, cb) {
    return when(this._driver.browser().cookieStorage().getCookie(name), function (cookie) {
        return this._scopeCallBack(cb, [cookie, name]);
    }.bind(this));
};

Nightwatch.prototype.getCookies = function (cb) {
    return when(this._driver.browser().cookieStorage().getCookies(), function (cookies) {
        return this._scopeCallBack(cb, [cookies]);
    }.bind(this));
};

Nightwatch.prototype.getCssProperty = function (selector, property, cb) {
    return this._elementAction(selector, function (element) {
        return when(element.getCssValue(property), function (value) {
            return this._scopeCallBack(cb, [value, property, element]);
        }.bind(this));
    }.bind(this));
};

Nightwatch.prototype.getElementSize = function (selector, cb) {
    return this._elementAction(selector, function (element) {
        return when(element.getSize(), function (size) {
            return this._scopeCallBack(cb, [size, element]);
        }.bind(this));
    }.bind(this));
};

Nightwatch.prototype.getPosition = function (selector, cb) {
    return this._elementAction(selector, function (element) {
        return when(element.getPosition(), function (position) {
            return this._scopeCallBack(cb, [position, element]);
        }.bind(this));
    }.bind(this));
};

Nightwatch.prototype.getLog = function (type, cb) {
    return when(this._driver.getLogs(type), function (logs) {
        return this._scopeCallBack(cb, [logs]);
    }.bind(this));
};

Nightwatch.prototype.getLogTypes = function (cb) {
    return when(this._driver.getLogTypes(), function (types) {
        return this._scopeCallBack(cb, [types]);
    }.bind(this));
};

Nightwatch.prototype.getTagName = function (selector, cb) {
    return this._elementAction(selector, function (element) {
        return when(element.getTagName(), function (position) {
            return this._scopeCallBack(cb, [position, element]);
        }.bind(this));
    }.bind(this));
};



logMethods(Nightwatch.prototype);
