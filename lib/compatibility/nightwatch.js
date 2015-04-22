'use strict';

var logMethods = require('../log');
var type = require('../type');
var when = require('../when');

var Cookie = require('../cookie');

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
    return cb.apply(this, args);
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

Nightwatch.prototype.getLocation = function (selector, cb) {
    return this._elementAction(selector, function (element) {
        return when(element.getPosition(), function (position) {
            return this._scopeCallBack(cb, [position, element]);
        }.bind(this));
    }.bind(this));
};

Nightwatch.prototype.getLocationInView = function (selector, cb) {
    return this._elementAction(selector, function (element) {
        return when(element.getPositionInView(), function (position) {
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
        return when(element.getTagName(), function (name) {
            return this._scopeCallBack(cb, [name, element]);
        }.bind(this));
    }.bind(this));
};

Nightwatch.prototype.getText = function (selector, cb) {
    return this._elementAction(selector, function (element) {
        return when(element.getText(), function (text) {
            return this._scopeCallBack(cb, [text, element]);
        }.bind(this));
    }.bind(this));
};

Nightwatch.prototype.getTitle = function (cb) {
    return when(this._driver.browser().activeWindow().getTitle(), function (title) {
        return this._scopeCallBack(cb, [title]);
    }.bind(this));
};

Nightwatch.prototype.getValue = function (selector, cb) {
    return this._elementAction(selector, function (element) {
        return when(element.getValue(), function (value) {
            return this._scopeCallBack(cb, [value, element]);
        }.bind(this));
    }.bind(this));
};

Nightwatch.prototype.init = function (url) {
    return this._driver.browser().activeWindow().navigator().setUrl(url);
};

Nightwatch.prototype.injectScript = function (scriptUrl, id, cb) {
    //TODO: Need to be implemented
    return this._scopeCallBack(cb, []);
};

Nightwatch.prototype.isLogAvailable = function (type, cb) {
    //TODO: Need to be implemented
    return this._scopeCallBack(cb, [false]);
};

Nightwatch.prototype.maximizeWindow = function (cb) {
    return when(this._driver.browser().activeWindow().maximize(), function () {
        return this._scopeCallBack(cb, []);
    }.bind(this));
};

Nightwatch.prototype.moveToElement = function (selector, xoffset, yoffset, cb) {
    return this._elementAction(selector, function (element) {
        return when(element.mouse().moveTo(xoffset, yoffset), function () {
            return this._scopeCallBack(cb, [element]);
        }.bind(this));
    }.bind(this));
};

Nightwatch.prototype.pause = function (ms, cb) {
    return when(this._driver.utils().sleep(ms), function () {
        return this._scopeCallBack(cb, []);
    }.bind(this));
    //TODO: Wait indefinitely?
};

Nightwatch.prototype.resizeWindow = function (width, height, cb) {
    return when(this._driver.browser().activeWindow().resize(width, height), function () {
        return this._scopeCallBack(cb, []);
    }.bind(this));
};

Nightwatch.prototype.saveScreenshot = function (path, cb) {
    return when(this._driver.browser().activeWindow().saveScreenshot(path), function () {
        return this._scopeCallBack(cb, []);
    }.bind(this));
};

Nightwatch.prototype.setCookie = function (cookie, cb) {
    return when(this._driver.browser().cookieStorage().setCookie(new Cookie(cookie)), function () {
        return this._scopeCallBack(cb, []);
    }.bind(this));
};

Nightwatch.prototype.setValue = function (selector, value, cb) {
    return this._elementAction(selector, function (element) {
        return when(element.sendKeys(value), function () {
            return this._scopeCallBack(cb, [element]);
        }.bind(this));
    }.bind(this));
};

Nightwatch.prototype.submitForm = function (selector, cb) {
    return this._elementAction(selector, function (element) {
        return when(element.submit(), function () {
            return this._scopeCallBack(cb, [element]);
        }.bind(this));
    }.bind(this));
};

Nightwatch.prototype.switchWindow = function (handleOrName, cb) {
    return when(this._driver.browser().activateWindow(handleOrName), function () {
        return this._scopeCallBack(cb, []);
    }.bind(this));
};

Nightwatch.prototype.urlHash = function (hash) {
    return when(this._driver.browser().activeWindow().navigator().setUrl(hash));
    //TODO: Not really what suppose to happen, but will fix it later
};

Nightwatch.prototype.waitForElementNotPresent = function (selector, time, abortOnFailure, cb, message) {
    var msg = (message || "Element " + selector + " was in the page for " + time + " ms").replace('%s', selector).replace('%d', time);
    return when(this._driver.utils().waitUntil(function () {
        return when(this._driver.browser().activeWindow().getElements(selector), function (elements) {
            return (elements.length == 0);
        });
    }.bind(this), time, 500, msg, function () {
        return (abortOnFailure === undefined) || abortOnFailure;
    }), function () {
        return this._scopeCallBack(cb, []);
    }.bind(this));
};

Nightwatch.prototype.waitForElementNotVisible = function (selector, time, abortOnFailure, cb, message) {
    var msg = (message || "Element " + selector + " was visible in the page for " + time + " ms").replace('%s', selector).replace('%d', time);
    return when(this._driver.utils().waitUntil(function () {
        return when(this._driver.browser().activeWindow().getElements(selector), function (elements) {
            if (elements.length > 0) {
                return when(elements[0].isDisabled(), function () {});
            }
        });
    }.bind(this), time, 500, msg, function () {
        return (abortOnFailure === undefined) || abortOnFailure;
    }), function () {
        return this._scopeCallBack(cb, []);
    }.bind(this));
};

Nightwatch.prototype.waitForElementPresent = function (selector, time, abortOnFailure, cb, message) {
    var msg = (message || "Element " + selector + " was not in the page for " + time + " ms").replace('%s', selector).replace('%d', time);
    return when(this._driver.utils().waitUntil(function () {
        return when(this._driver.browser().activeWindow().getElements(selector), function (elements) {
            return (elements.length != 0);
        });
    }.bind(this), time, 500, msg, function () {
        return (abortOnFailure === undefined) || abortOnFailure;
    }), function () {
        return this._scopeCallBack(cb, []);
    }.bind(this));
};

Nightwatch.prototype.waitForElementVisible = function (selector, time, abortOnFailure, cb, message) {
    var msg = (message || "Element " + selector + " was not visible in the page for " + time + " ms").replace('%s', selector).replace('%d', time);
    return when(this._driver.utils().waitUntil(function () {
        return when(this._driver.browser().activeWindow().getElements(selector), function (elements) {
            if (elements.length > 0) {
                return when(elements[0].isDisabled(), function () {});
            }
        });
    }.bind(this), time, 500, msg, function () {
        return (abortOnFailure === undefined) || abortOnFailure;
    }), function () {
        return this._scopeCallBack(cb, []);
    }.bind(this));
};



logMethods(Nightwatch.prototype);
