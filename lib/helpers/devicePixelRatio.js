'use strict';

var logMethods = require('../log');
var type = require('../type');
var when = require('../when');

var devicePixelRatioScripts = require('../scripts/devicePixelRatio');

var PNGImage = require('pngjs-image');

module.exports = DevicePixelRatio;

/**
 * Device-Pixel-Ratio object
 *
 * @constructor
 * @class DevicePixelRatio
 * @module WebDriver
 * @submodule Helpers
 * @param {Driver} driver
 */
function DevicePixelRatio (driver) {
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
DevicePixelRatio.prototype._logMethodCall = function (event) {
	event.target = 'DevicePixelRatio';
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
DevicePixelRatio.prototype._requestJSON = function (method, path, body) {
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
DevicePixelRatio.prototype.getDriver = function () {
	return this._driver;
};


/**
 * Gets the device-pixel-ratio of the browser.
 * If this info is not available yet, then it will determine it.
 * It will then be cached for each driver instance, determining this
 * only once per instance.
 *
 * @method getDevicePixelRatio
 * @return {number}
 */
DevicePixelRatio.prototype.getDevicePixelRatio = function () {
	var devicePixelRatio = this.getDriver().getValue('devicePixelRatio');

	if (devicePixelRatio === null) {
		return when(this._determineDevicePixelRatio(), function (value) {
			this.getDriver().setValue('devicePixelRatio', value); // Cache value
			return value;
		}.bind(this));
	} else {
		return this.getDriver().utils().resolve(devicePixelRatio);
	}
};

/**
 * Determines the device-pixel-ratio of the browser.
 *
 * @method _determineDevicePixelRatio
 * @return {number}
 * @private
 */
DevicePixelRatio.prototype._determineDevicePixelRatio = function () {

	var Screenshot = require('./screenshot'),
		screenshot = new Screenshot(this.getDriver());

	// Reduce size of document to get a small screenshot for ratio determination
	return when(this._execute(devicePixelRatioScripts.init), function (initData) {
		initData = JSON.parse(initData);

		// Take screenshot (hopefully very small, but big enough to get the ratio right)
		return when(screenshot.takeProcessedScreenshot(), function (image) {

			// Revert document size
			return when(this._execute(devicePixelRatioScripts.revert, [initData]), function () {

				// Determine best ratio: browser delivered or calculated ratio
				var devicePixelRatio = image.getWidth() / initData.documentWidth;

				// Rounding
				if (Math.abs(devicePixelRatio - (Math.round(devicePixelRatio * 10) / 10)) < 0.1) {
					devicePixelRatio = Math.round(devicePixelRatio * 10) / 10;
				}

				if (Math.abs(devicePixelRatio - initData.devicePixelRatio) <= 0.1) {
					return initData.devicePixelRatio;
				} else {
					return devicePixelRatio;
				}

			}.bind(this));
		}.bind(this));
	}.bind(this));
};

/**
 * Executes a script in the browser and returns the result.
 *
 * This is a convenience method for accessing the execute method.
 *
 * @method _execute
 * @param {String|Function} script
 * @param {Array} [args]
 * @return {*}
 * @private
 */
DevicePixelRatio.prototype._execute = function (script, args) {
	if (script) {
		return this.getDriver().browser().activeWindow().execute(script, args);

	} else { // Ignore script if there is nothing
		return this.getDriver().utils().resolve(undefined);
	}
};

logMethods(DevicePixelRatio.prototype);
