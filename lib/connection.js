'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var JSON = require('./json');

var when = require('./when');
var errors = require('./errors');
var type = require('./type');

var screenShotCounter = 0;

module.exports = Connection;

/**
 * Connection object
 *
 * @constructor
 * @class Connection
 * @module System
 * @param {String|Object} remote
 * @param {Object} options
 * @param {String} options.mode
 * @param {String} [options.logDir]
 * @param {Boolean} [options.logScreen=false]
 */
function Connection (remote, options) {
  EventEmitter.call(this);

  if (remote[remote.length - 1] === '/') {
    remote = remote.substr(0, remote.length - 1);
  }

  this._remote = remote;
  this._options = options || {};
  this._request_internal = createInternalConnection(options.mode);
}
util.inherits(Connection, EventEmitter);


////////////
// Events //
////////////

/**
 * Fired when a request is made
 *
 * @event request
 * @param {Object} request Request options
 */

/**
 * Fired when a response is received
 *
 * @event response
 * @param {Object} response Response data
 */


////////////////////
// Public Methods //
////////////////////

/**
 * Session request with automatic parsing for errors
 *
 * @method parsedRequest
 * @param {Session} session
 * @param {String} method
 * @param {String} path
 * @param {Object} [options]
 * @return {*}
 */
Connection.prototype.parsedRequest = function (session, method, path, options) {
  return when(this.sessionRequest(session, method, path, options), function (res) {
    return this._parseResponse(res, options);
  }.bind(this));
};

/**
 * Session request returning raw value
 *
 * @method sessionRequest
 * @param {Session} session
 * @param {String} method
 * @param {String} path
 * @param {object} [options]
 * @return {Object}
 */
Connection.prototype.sessionRequest = function (session, method, path, options) {

  var makeRequest = function (localSession) {
    var uri = '/session/' + localSession.id() + path;
    return this.request(method, uri, options);
  }.bind(this);

  return when(session, makeRequest);
};

/**
 * Plain request
 *
 * @method request
 * @param {String} method
 * @param {String} urn Unified Resource Name
 * @param {Object} options
 * @return {Buffer}
 */
Connection.prototype.request = function (method, urn, options) {
  var uri = this._remote + urn;

  if (typeof options.body == 'object') {
    options.body = JSON.stringify(options.body);
  }

  this.emit('request', {
    method: method,
    uri: uri,
    path: urn,
    body: options.body,
    headers: options.headers
  });

  return when(this._request_internal(method, uri, options), function (response) {
    this.emit('response', response);
    return response;
  }.bind(this));
};

/**
 * Parse a response, throwing errors if the status suggests it
 *
 * @param {Object} res
 * @param {Object} [options]
 * @param {Boolean} [options.passThrough=false]
 * @return {*}
 */
Connection.prototype._parseResponse = function (res, options) {

  var body,
      data,
      filePath,
      hasLogFolder,
      hasRequestedScreen,
      hasScreenshot;

  options = options || {};

  if (res.statusCode >= 0 && res.statusCode < 100) {
    throw new Error('Server responded with status code (' + res.statusCode + '):\n' + res.body);

  } else if (res.statusCode >= 400 && res.statusCode < 500) { // 400s
    throw new Error('Invalid request (' + res.statusCode + '):\n' + res.body);

  } else if (res.statusCode >= 500 && res.statusCode < 600) { // 500s
    body = JSON.parse(res.body);

    hasScreenshot = body && body.value && body.value.screen;
    hasLogFolder = this._options && this._options.logDir;
    hasRequestedScreen = this._options && this._options.logScreen;

    // Create screenshot for error when available and requested
    if (hasLogFolder && hasRequestedScreen && hasScreenshot) {

      // Create folder if not exists
      mkdirp.sync(this._options.logDir);

      // Gather data
      data = new Buffer(body.value.screen, 'base64');
      filePath = path.join(this._options.logDir, getNextScreenshotId() + '_err.png');

      // Write to disk
      fs.writeFileSync(filePath, data);
    }

    throw new Error(
        "Failed command (" + res.statusCode + "):\n" +
        body.value.message +
        (body.value.class ? "\nClass: " + body.value.class : "") +
        (body.value.stackTrace ? "\nStack-trace:\n " + stringifyStackTrace(body.value.stackTrace) : "")
    );

  } else if (res.statusCode >= 200 && res.statusCode < 300) {

    if (res.statusCode === 204) { // No Content - meaning: everything is ok
      return null;

    } else {
      body = JSON.parse(res.body);

      if (body.status === 0) {
        return body.value;
      } else {
        throw new Error(errors.fromBody(body));
      }
    }

  } else {
    throw new Error('Unknown status code (' + res.statusCode + '):\n' + res.body);
  }
};



/////////////////////
// Private Methods //
/////////////////////

/**
 * Gets the next available screenshot id
 *
 * @return {string}
 */
function getNextScreenshotId () {
  screenShotCounter++;
  if ((screenShotCounter + '').length > 4) {
    return screenShotCounter + '';
  } else {
    return ("000" + screenShotCounter).substr(-4);
  }
}

/**
 * Turns a selenium stack-trace into a string
 *
 * @param {Array.<Object>} stackTrace
 * @return {String}
 */
function stringifyStackTrace (stackTrace) {

  var i, len, result = [];

  for (i = 0, len = stackTrace.length; i < len; i++) {
    if (stackTrace[i]) {
      result.push(stackTrace[i].methodName + "::" + stackTrace[i].className + " (" + stackTrace[i].fileName + ":" + stackTrace[i].lineNumber + ")");
    }
  }

  return result.join("\n");
}

/**
 * Create connection object according to mode-type
 *
 * @param {String} mode (async|sync)
 * @return {function}
 */
function createInternalConnection (mode) {

  var result;

  switch (mode) {
    case 'async':
      result = require('then-request');
      break;
    case 'sync':
      result = require('sync-request');
      break;
    default:
      throw new Error('Expected options.mode to be "async" or "sync" but got ' + JSON.stringify(mode));
  }

  return result;
}

