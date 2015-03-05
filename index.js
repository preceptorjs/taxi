'use strict';

var Alert = require('./lib/alert');
var ActiveWindow = require('./lib/activeWindow');
var Browser = require('./lib/browser');
var Cookie = require('./lib/cookie');
var CookieStorage = require('./lib/cookieStorage');
var Driver = require('./lib/driver');
var Element = require('./lib/element');
var Frame = require('./lib/frame');
var GlobalMouse = require('./lib/globalMouse');
var GlobalTouch = require('./lib/globalTouch');
var IME = require('./lib/ime');
var Keys = require('./lib/keys');
var LocalStorage = require('./lib/localStorage');
var LogEntry = require('./lib/logEntry');
var Mouse = require('./lib/mouse');
var Navigator = require('./lib/navigator');
var Session = require('./lib/session');
var SessionStorage = require('./lib/sessionStorage');
var Status = require('./lib/status');
var TimeOut = require('./lib/timeOut');
var Touch = require('./lib/touch');
var WindowHandler = require('./lib/window');

module.exports = Taxi;

/**
 * Create a new browser session
 *
 * <img src="../../objectReference.png" />
 *
 * Note: Remember to call `.dispose()` at the end to terminate the session.
 *
 * @constructor
 * @class Taxi
 * @module Taxi
 * @param {String|Object} remote Request object or URL to selenium-server
 * @param {Object} capabilities See capabilities in {{#crossLink "Session"}}{{/crossLink}}
 * @param {Object} options
 * @param {String} options.mode Mode of web-driver requests (Browser.MODE_SYNC|Browser.MODE_ASYNC)
 * @param {String} [options.base] Base-url
 * @param {String} [options.sessionID]
 * @param {Boolean} [options.debug=false]
 * @param {Boolean} [options.httpDebug=false]
 */
function Taxi(remote, capabilities, options) {
  return new Driver(remote, capabilities, options);
}


/**
 * @property ActiveWindow
 * @type {ActiveWindow}
 */
Taxi.ActiveWindow = ActiveWindow;

/**
 * @property Alert
 * @type {Alert}
 */
Taxi.Alert = Alert;

/**
 * @property Browser
 * @type Browser
 */
Taxi.Browser = Browser;

/**
 * @property Cookie
 * @type Cookie
 */
Taxi.Cookie = Cookie;

/**
 * @property CookieStorage
 * @type CookieStorage
 */
Taxi.CookieStorage = CookieStorage;

/**
 * @property Driver
 * @type Driver
 */
Taxi.Driver = Driver;

/**
 * @property Element
 * @type Element
 */
Taxi.Element = Element;

/**
 * @property Frame
 * @type Frame
 */
Taxi.Frame = Frame;

/**
 * @property GlobalMouse
 * @type GlobalMouse
 */
Taxi.GlobalMouse = GlobalMouse;

/**
 * @property GlobalTouch
 * @type GlobalTouch
 */
Taxi.GlobalTouch = GlobalTouch;

/**
 * @property IME
 * @type IME
 */
Taxi.IME = IME;

/**
 * @property Keys
 * @type Keys
 */
Taxi.Keys = Keys;

/**
 * @property LocalStorage
 * @type LocalStorage
 */
Taxi.LocalStorage = LocalStorage;

/**
 * @property LogEntry
 * @type LogEntry
 */
Taxi.LogEntry = LogEntry;

/**
 * @property Mouse
 * @type Mouse
 */
Taxi.Mouse = Mouse;

/**
 * @property Navigator
 * @type Navigator
 */
Taxi.Navigator = Navigator;

/**
 * @property Session
 * @type Session
 */
Taxi.Session = Session;

/**
 * @property SessionStorage
 * @type SessionStorage
 */
Taxi.SessionStorage = SessionStorage;

/**
 * @property Status
 * @type Status
 */
Taxi.Status = Status;

/**
 * @property TimeOut
 * @type TimeOut
 */
Taxi.TimeOut = TimeOut;

/**
 * @property Touch
 * @type Touch
 */
Taxi.Touch = Touch;

/**
 * @property WindowHandler
 * @type WindowHandler
 */
Taxi.WindowHandler = WindowHandler;
