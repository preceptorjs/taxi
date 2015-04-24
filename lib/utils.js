'use strict';

var logMethods = require('./log');
var type = require('./type');
var when = require('./when');
var sleep = require('sleep.js');
var Promise = require('promise');
var fs = require('fs');

module.exports = Utils;

/**
 * Utils for WebDriver tools
 *
 * @constructor
 * @class Utils
 * @module WebDriver
 * @submodule Utils
 * @param {Driver} driver
 */
function Utils (driver) {
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
Utils.prototype._logMethodCall = function (event) {
    event.target = 'Utils';
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
Utils.prototype._requestJSON = function (method, path, body) {
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
Utils.prototype.getDriver = function () {
    return this._driver;
};


/**
 * Waits until an event occurs or the time runs out
 *
 * @param {function} fn Function that validates condition.
 * @param {int} timeOut Time in ms for the max. time to wait until an error occurs.
 * @param {int} wait Time in ms of wait between each check.
 * @param {function} timeOutFn Called when timeout reached
 * @param {string} message Error message
 */
Utils.prototype.waitUntil = function (fn, timeOut, wait, message, timeOutFn) {

    var internalWaitUntil = function (timeOut) {

        timeOut -= wait;
        if (timeOut < 0) {
            if (!timeOutFn()) {
                throw Error(message || 'Timeout waiting for an event.');
            }
        }

        when(fn(), function (result) {
            if (!result) {
                return internalWaitUntil(timeOut);
            }
        });
    };

    return internalWaitUntil(timeOut);
};



/**
 * Maps values to some other values synchronously and asynchronously
 *
 * @method map
 * @param {array} list List of data
 * @param {function} fn Function to be called on each entry
 */
Utils.prototype.map = function (list, fn) {

    var result = [],
        internalCollect;

    internalCollect = function (list, index) {
        if (list.length === 0) {
            return result;
        } else {
            return when(fn(list[0], index), function (entry) {
                return when(entry, function (resolvedEntry) {
                    result.push(resolvedEntry);
                    return internalCollect(list.slice(1), index + 1);
                });
            });
        }
    };

    return when(list, function (evaluatedList) {
        return internalCollect(evaluatedList, 0);
    });
};

/**
 * Evaluates the value according to the execution mode the driver is in
 *
 * @method when
 * @param {*} value Value that needs to be evaluated. This could possibly be the value itself or a promise.
 * @param {function} fn Function to be called with the evaluated value
 */
Utils.prototype.when = function (value, fn) {
	return when(value, fn);
};

/**
 * Sleep for a set time
 *
 * @method sleep
 * @param {int} delay Number of ms to wait
 */
Utils.prototype.sleep = function (delay) {
    if (this._driver.isSync()) {
        sleep(delay);
    } else {
        return new Promise(function (resolved, rejected) {
            setTimeout(function () {
                resolved();
            }, delay);
        });
    }
};

/**
 * Resolves a value according to run-mode
 *
 * @method resolve
 * @param {*} value Value to resolve
 */
Utils.prototype.resolve = function (value) {
    if (this._driver.isSync()) {
        return value;
    } else {
        return Promise.resolve(value);
    }
};

/**
 * Loads contents of a file
 *
 * @method loadFileContent
 * @param {string} path Path to file to load
 * @private
 */
Utils.prototype._loadFileContent = function (path) {
    if (this._driver.isSync()) {
        return fs.readFileSync(path, 'utf8');
    } else {
        return new Promise(function (resolved, rejected) {
            fs.readFile(path, 'utf8', function (content) {
                resolved(content);
            });
        });
    }
};

/**
 * Executes a pre-defined script from the scripts folder
 *
 * @param {string} name Name of the script (without .js)
 * @param {array} [args] Arguments for script
 * @return {*}
 */
Utils.prototype.executeDefinedScript = function (name, args) {
    var scriptPath = path.join(__dirname, 'scripts', name + '.js');

    return when(this._loadFileContent(scriptPath), function (content) {
        return this._driver.browser().activeWindow().execute(content, args);
    }.bind(this));
};

logMethods(Utils.prototype);
