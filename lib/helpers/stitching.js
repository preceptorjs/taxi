'use strict';

var logMethods = require('../log');
var type = require('../type');
var when = require('../when');

var stitchingScripts = require('../scripts/stitching');

var PNGImage = require('pngjs-image');

module.exports = Stitching;

/**
 * Stitching object
 *
 * @constructor
 * @class Stitching
 * @module WebDriver
 * @submodule Helpers
 * @param {Driver} driver
 */
function Stitching (driver) {
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
Stitching.prototype._logMethodCall = function (event) {
    event.target = 'Stitching';
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
Stitching.prototype._requestJSON = function (method, path, body) {
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
Stitching.prototype.getDriver = function () {
    return this._driver;
};


/**
 * Is stitching needed for browser?
 *
 * Some browsers (i.e. Chrome) do only take a screenshot of the view-port instead of the whole document as per standard.
 * This information will then be cached for each driver instance, determining this only once per instance.
 *
 * @method doesNeedStitching
 * @param {object} [options]
 * @param {int} [options.horizontalPadding=0] Padding of the document
 * @return {number}
 */
Stitching.prototype.doesNeedStitching = function (options) {
    var needsStitching = this.getDriver().getValue('needsStitching');

    if (needsStitching === null) {
        return when(this._determineNeedsStitching(options), function (value) {
            this.getDriver().setValue('needsStitching', value); // Cache value
            return value;
        }.bind(this));
    } else {
        return this.getDriver().utils().resolve(needsStitching);
    }
};

/**
 * Determines if the browser needs stitching due to the fact of taking only view-port screenshots instead of
 * whole document ones.
 *
 * Note:
 * ```horizontalPadding``` is any element that extents horizontally
 * outside of the document, i.e. negative absolute position.
 *
 * @method _determineNeedsStitching
 * @param {object} [options]
 * @param {int} [options.horizontalPadding=0] Padding of the document
 * @return {boolean}
 * @private
 */
Stitching.prototype._determineNeedsStitching = function (options) {

	var Screenshot = require('./screenshot'),
		screenshot = new Screenshot(this.getDriver()),

		DevicePixelRatio = require('./devicePixelRatio'),
		devicePixelRatio = new DevicePixelRatio(this.getDriver());

	options = options || {};

	// Determine device-pixel-ratio
    return when(devicePixelRatio.getDevicePixelRatio(options), function (devicePixelRatio) {

        // Reduce size of document to get a small screenshot for stitching determination
        return when(this._execute(stitchingScripts.init, [options.horizontalPadding || 0]), function (initData) {
            initData = JSON.parse(initData);

            // Take screenshot (hopefully very small, but big enough to get the stitching info)
            return when(screenshot.takeProcessedScreenshot(), function (image) {

                // Revert document size
                return when(this._execute(stitchingScripts.revert, [initData]), function () {

                    return this._needsStitchingExceptions(image, initData, devicePixelRatio);

                }.bind(this));
            }.bind(this));
        }.bind(this));
    }.bind(this));
};

/**
 * Processes the exception handling of stitching determination
 *
 * Note:
 *   Overwrite this method if you want to change the stitching behavior of browsers.
 *
 * @param {PNGImage} image
 * @param {object} initData
 * @param {number} devicePixelRatio
 * @returns {boolean}
 * @private
 */
Stitching.prototype._needsStitchingExceptions = function (image, initData, devicePixelRatio) {

    // If the screenshot width and the actual view-port width are pretty much the same (here 10px),
    // even though the document is twice the view-port size, then we need stitching.
    var expectedViewPortWidth = initData.viewPortWidth * 2 * devicePixelRatio,
        actualViewPortWidth = image.getWidth(),
        difference = actualViewPortWidth - expectedViewPortWidth,
        delta = Math.abs(difference),
        needsStitching,

        browserName = this.getDriver().browserName().toLowerCase(),
        browserVersion = this.getDriver().browserVersion();

    // When actual is smaller than expected, then needs stitching
    // When actual is bigger than expected and delta is not off for more than 2% (border issues), then no stitching needed
    needsStitching = (difference <= 0) && (delta >= expectedViewPortWidth * 0.2);

    if (!needsStitching) { // Exceptions
        if ((browserName === 'internet explorer') && (browserVersion >= 10)) {
            needsStitching = true;
        }
    }

    return needsStitching
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
Stitching.prototype._execute = function (script, args) {
    if (script) {
        return this.getDriver().browser().activeWindow().execute(script, args);

    } else { // Ignore script if there is nothing - might happen with screenshot requests
        return this.getDriver().utils().resolve(undefined);
    }
};

logMethods(Stitching.prototype);
