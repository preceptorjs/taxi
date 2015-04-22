'use strict';

var logMethods = require('../log');
var type = require('../type');
var when = require('../when');

var PNGImage = require('pngjs-image');
var fs = require('fs');
var utils = require('preceptor-core').utils;
var path = require('path');
var mkdirp = require('mkdirp');

module.exports = Comparison;

/**
 * Device-Pixel-Ratio object
 *
 * @constructor
 * @class Comparison
 * @module WebDriver
 * @submodule Helpers
 * @param {Driver} driver
 */
function Comparison (driver) {
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
Comparison.prototype._logMethodCall = function (event) {
	event.target = 'Comparison';
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
Comparison.prototype._requestJSON = function (method, path, body) {
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
Comparison.prototype.getDriver = function () {
	return this._driver;
};

Comparison.prototype.shouldOutputOnSuccess = function () {
	return true; //TODO
};

Comparison.prototype.approvedPath = function () {
	return process.cwd(); //TODO
};

Comparison.prototype.diffPath = function () {
	return process.cwd(); //TODO
};

Comparison.prototype.shouldFailOnDifference = function () {
	return true; //TODO
};

Comparison.prototype.compare = function (title, buffer, options) {

	var BlinkDiff, browserId, filename, diffFilename, diffPath, approvedPath, instance, result, passed;

	options = options || {};

	try {
		BlinkDiff = require('blink-diff');
	} catch (err) {
		console.error('Cannot find package "blink-diff". Please install it with "npm install --save blink-diff" to use image comparison.');
	}

	filename = utils.fileNameSafe(title) + '_' + (options.id || 1);
	diffFilename = filename + '_diff.png';
	filename += '.png';

	browserId = this.getDriver().browserId();
	browserId = utils.fileNameSafe(browserId);

	approvedPath = path.join(this.approvedPath(), browserId);
	diffPath = path.join(this.diffPath(), browserId);

	filename = path.join(approvedPath, filename);
	diffFilename = path.join(diffPath, diffFilename);

	if (!fs.existsSync(filename)) {
		mkdirp.sync(approvedPath);
		fs.writeFileSync(filename, buffer);
		return this.getDriver().utils().resolve(null);

	} else {
		options.imageA = PNGImage.readImageSync(filename);
		options.imageB = PNGImage.loadImageSync(buffer);

		instance = new BlinkDiff(options);
		result = instance.runSync();

		passed = instance.hasPassed(result.code);

		if (!passed || (passed && this.shouldOutputOnSuccess())) {
			mkdirp.sync(diffPath);
			instance._imageOutput.writeImageSync(diffFilename);
		}

		if (!passed && this.shouldFailOnDifference()) {
			throw new Error("Screenshots are different for " + title);
		}

		return this.getDriver().utils().resolve(passed);
	}
};

logMethods(Comparison.prototype);
