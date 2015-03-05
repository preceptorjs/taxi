'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var url = require('url');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');

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
 * @method taxiRequest
 * @param {Session} session
 * @param {String} method
 * @param {String} path
 * @param {*} [body]
 * @param {Object} [options]
 * @return {*}
 */
Connection.prototype.taxiRequest = function (session, method, path, body, options) {
  return when(this.sessionRequest(session, method, path, body), function (res) {
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
 * @param {*} [body]
 * @return {Object}
 */
Connection.prototype.sessionRequest = function (session, method, path, body) {
  var self = this;

  function makeRequest (localSession) {

    var raw = typeof body === 'string' || Buffer.isBuffer(body),
        rawBody = (raw || body === undefined ? body : JSON.stringify(body));

    return self.request(
        method,
        ((path[0] === '/') || (path === '')) ? undefined : path,
        ((path[0] === '/') || (path === '')) ? '/session/' + localSession.id() + path : undefined,
        rawBody,
        {
            'Content-Type': 'application/json;charset=UTF-8'
        }
    );
  }

  return when(session, makeRequest);
};

/**
 * Plain request
 *
 * @method request
 * @param {String} method
 * @param {String|undefined} [uri]
 * @param {String} path
 * @param {String} [body]
 * @param {Object} [headers]
 * @return {Buffer}
 */
Connection.prototype.request = function (method, uri, path, body, headers) {
  var requestOptions = withRemote(this._remote, {
    method: method,
    uri: uri || undefined,
    path: path,
    body: body,
    headers: headers || {}
  });

  this.emit('request', requestOptions);

  return when(this._request_internal(requestOptions), function (response) {
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
      filePath;

  options = options || {};

  if (res.statusCode >= 0 && res.statusCode < 100) {
    throw new Error('Server responded with status code (' + res.statusCode + '):\n' + res.body);

  } else if (res.statusCode >= 400 && res.statusCode < 500) { // 400s
    throw new Error('Invalid request (' + res.statusCode + '):\n' + res.body);

  } else if (res.statusCode >= 500 && res.statusCode < 600) { // 500s
    body = JSON.parse(res.body);

    // Create screenshot for error when available and requested
    if (this._options && this._options.logDir && this._options.logScreen && body && body.value && body.value.screen) {

      // Create folder if not exists
      mkdirp.sync(this._options.logDir);

      // Gather data
      data = new Buffer(body.value.screen, 'base64');
      filePath = path.join(this._options.logDir, getNextScreenshotId() + '_err.png');

      // Write to disk
      fs.writeFileSync(filePath, data);
    }

    throw new Error("Failed command (" + res.statusCode + "):\n" + body.value.message + (body.value.class ? "\nClass: " + body.value.class : "") + (body.value.stackTrace ? "\nStack-trace:\n " + stringifyStackTrace(body.value.stackTrace) : ""));

  } else if (res.statusCode >= 200 && res.statusCode < 300) {

    if (res.statusCode === 204) {
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
 * Processes connection redirects over HTTP
 *
 * @param {Function} fn
 * @return {*}
 */
function withRedirects (fn) {

  return function recurse (options) {

    type('options', options, 'Object');
    type('options.uri', options.uri, 'String');

    return when(fn.call(this, options), function (res) {

      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303) && res.headers.location) {
        return recurse({ uri: url.resolve(options.uri, res.headers.location) });
      }

      return res;
    });
  }
}

/**
 * Structures remote options for request
 *
 * @param {String|Object} remote
 * @param {Object} options
 * @return {Object}
 */
function withRemote (remote, options) {

  var key, request = {};

  if (typeof remote === 'string') {
    remote = { base: remote };
  }

  for (key in options) {
    if (options.hasOwnProperty(key) && (key !== 'path')) {
      request[key] = options[key];
    }
  }

  for (key in remote) {
    if (remote.hasOwnProperty(key) && (key !== 'base' && request[key] === undefined)) {
      request[key] = remote[key];
    }
  }

  if (request.uri === undefined && request.url === undefined) {
    request.uri = remote.base.replace(/\/$/, '') + options.path;
  }

  return request;
}


/**
 * Create connection object according to mode-type
 *
 * @param {String} mode
 * @return {*}
 */
function createInternalConnection (mode) {

  var result;

  switch (mode) {
    case 'async':
      result = withRedirects(require('promise').denodeify(require('request')));
      break;
    case 'sync':
      result = withRedirects(require('request-sync'));
      break;
    default:
      throw new Error('Expected options.mode to be "async" or "sync" but got ' + JSON.stringify(mode));
  }

  return result;
}

