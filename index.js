'use strict';

var Alert = require('./lib/alert');
var ActiveWindow = require('./lib/activeWindow');
var Browser = require('./lib/browser');
var Chain = require('./lib/chain');
var Cookie = require('./lib/cookie');
var CookieStorage = require('./lib/cookieStorage');
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

var Driver = require('./lib/driver');

module.exports = taxi;

/**
 * Create a new browser session
 *
 * <img src="../../objectReference.png" />
 *
 * Note: Remember to call `.dispose()` at the end to terminate the session.
 *
 * @constructor
 * @class taxi
 * @module taxi
 * @param {String|Object} remote Request object or URL to selenium-server
 * @param {Object} capabilities See capabilities in {{#crossLink "Session"}}{{/crossLink}}
 * @param {Object} options
 * @param {String} options.mode Mode of web-driver requests (Browser.MODE_SYNC|Browser.MODE_ASYNC)
 * @param {String} [options.base] Base-url
 * @param {String} [options.sessionID]
 * @param {Boolean} [options.debug=false]
 * @param {Boolean} [options.httpDebug=false]
 * @return {Driver}
 */
function taxi(remote, capabilities, options) {
  return new Driver(remote, capabilities, options);
}


/**
 * @property ActiveWindow
 * @type {ActiveWindow}
 */
taxi.ActiveWindow = ActiveWindow;

/**
 * @property Alert
 * @type {Alert}
 */
taxi.Alert = Alert;

/**
 * @property Browser
 * @type Browser
 */
taxi.Browser = Browser;

/**
 * @property Chain
 * @type Chain
 */
taxi.Chain = Chain;

/**
 * @property Cookie
 * @type Cookie
 */
taxi.Cookie = Cookie;

/**
 * @property CookieStorage
 * @type CookieStorage
 */
taxi.CookieStorage = CookieStorage;

/**
 * @property Driver
 * @type Driver
 */
taxi.Driver = Driver;

/**
 * @property Element
 * @type Element
 */
taxi.Element = Element;

/**
 * @property Frame
 * @type Frame
 */
taxi.Frame = Frame;

/**
 * @property GlobalMouse
 * @type GlobalMouse
 */
taxi.GlobalMouse = GlobalMouse;

/**
 * @property GlobalTouch
 * @type GlobalTouch
 */
taxi.GlobalTouch = GlobalTouch;

/**
 * @property IME
 * @type IME
 */
taxi.IME = IME;

/**
 * @property Keys
 * @type Keys
 */
taxi.Keys = Keys;

/**
 * @property LocalStorage
 * @type LocalStorage
 */
taxi.LocalStorage = LocalStorage;

/**
 * @property LogEntry
 * @type LogEntry
 */
taxi.LogEntry = LogEntry;

/**
 * @property Mouse
 * @type Mouse
 */
taxi.Mouse = Mouse;

/**
 * @property Navigator
 * @type Navigator
 */
taxi.Navigator = Navigator;

/**
 * @property Session
 * @type Session
 */
taxi.Session = Session;

/**
 * @property SessionStorage
 * @type SessionStorage
 */
taxi.SessionStorage = SessionStorage;

/**
 * @property Status
 * @type Status
 */
taxi.Status = Status;

/**
 * @property TimeOut
 * @type TimeOut
 */
taxi.TimeOut = TimeOut;

/**
 * @property Touch
 * @type Touch
 */
taxi.Touch = Touch;

/**
 * @property WindowHandler
 * @type WindowHandler
 */
taxi.WindowHandler = WindowHandler;
