'use strict';

var EventEmitter = require('events').EventEmitter;
var when = require('./when');


var log = {
    indentation: 0,

    logMethods: logMethods, logMethod: logMethod
};

module.exports = log;

//////////////////////
// Public Functions //
//////////////////////

/**
 * Wraps every method in an object with a logger
 *
 * @param {Object} obj
 */
function logMethods (obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (key[0] !== '_' && !(key in EventEmitter.prototype) && typeof obj[key] === 'function' && !obj.logging) {
                obj[key] = log.logMethod(key, obj[key]);
            }
        }
    }
}


///////////////////////
// Private Functions //
///////////////////////

/**
 * Wraps one method with a function that logs input and output
 *
 * @param {String} name
 * @param {Function} method
 * @return {Function}
 */
function logMethod (name, method) {
    var result = function () {
        var args = Array.prototype.slice.call(arguments);
        var event = {
            name: name, args: args
        };
        return when.try(function () {
            log.indentation++;
            event.state = 'Start';
            event.indentation = log.indentation;
            this._logMethodCall(event);
            return method.apply(this, args);
        }.bind(this), function (res) {
            log.indentation--;
            event.state = 'End';
            event.result = res;
            this._logMethodCall(event);
            return res;
        }.bind(this), function (err) {
            log.indentation--;
            event.state = 'Err';
            event.error = err;
            this._logMethodCall(event);
            throw err;
        }.bind(this));
    };

    result.logging = true;

    return result;
}