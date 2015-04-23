'use strict';

var logMethods = require('../log');
var type = require('../type');
var when = require('../when');

var PNGImage = require('pngjs-image');
var fs = require('fs');
var utils = require('preceptor-core').utils;
var path = require('path');
var mkdirp = require('mkdirp');

module.exports = BlinkDiffComparison;

/**
 * Device-Pixel-Ratio object
 *
 * @constructor
 * @class BlinkDiffComparison
 * @module WebDriver
 * @submodule Helpers
 * @param {Driver} driver
 */
function BlinkDiffComparison (driver) {
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
BlinkDiffComparison.prototype._logMethodCall = function (event) {
	event.target = 'BlinkDiffComparison';
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
BlinkDiffComparison.prototype._requestJSON = function (method, path, body) {
	return this._driver._requestJSON(method, path, body);
};


////////////////////
// Public Methods //
////////////////////

/**
 * Gets the driver object.
 * Direct-access. No need to wait.
 *
 * @method getDriver
 * @return {Driver}
 */
BlinkDiffComparison.prototype.getDriver = function () {
	return this._driver;
};


/**
 * Should an output be created when comparison is successful?
 *
 * @method shouldOutputOnSuccess
 * @return {boolean}
 */
BlinkDiffComparison.prototype.shouldOutputOnSuccess = function () {

	var option = this.getDriver().getValue('blinkDiff.outputOnSuccess');

	if (option === undefined) {
		option = true;
	}

	return option;
};

/**
 * Should an exception be thrown when there are differences?
 *
 * @method shouldFailOnDifference
 * @return {boolean}
 */
BlinkDiffComparison.prototype.shouldFailOnDifference = function () {

	var option = this.getDriver().getValue('blinkDiff.failOnDifference');

	if (option === undefined) {
		option = true;
	}

	return option;
};

/**
 * Should screenshot be auto-approved?
 *
 * @method shouldAutoApprove
 * @return {boolean}
 */
BlinkDiffComparison.prototype.shouldAutoApprove = function () {
	return !!this.getDriver().getValue('blinkDiff.autoApprove');
};


/**
 * Gets the path where approved screenshots are found
 *
 * @method getApprovedPath
 * @return {string}
 */
BlinkDiffComparison.prototype.getApprovedPath = function () {
	return this.getDriver().getValue('blinkDiff.approvedPath') || process.cwd();
};

/**
 * Gets the path where current screenshots will be written to
 *
 * @method getBuildPath
 * @return {string}
 */
BlinkDiffComparison.prototype.getBuildPath = function () {
	return this.getDriver().getValue('blinkDiff.buildPath') || this.getApprovedPath();
};

/**
 * Gets the path where differences will be written to
 *
 * @method getDiffPath
 * @return {string}
 */
BlinkDiffComparison.prototype.getDiffPath = function () {
	return this.getDriver().getValue('blinkDiff.diffPath') || this.getBuildPath();
};


/**
 * Loads the Blink-Diff library, creating output instructing user to install the module
 *
 * @method _loadBlinkDiff
 * @return {BlinkDiff}
 * @private
 */
BlinkDiffComparison.prototype._loadBlinkDiff = function () {

	var BlinkDiff;

	try {
		BlinkDiff = require('blink-diff');
	} catch (err) {
		console.error('Cannot find package "blink-diff". Please install it with "npm install --save blink-diff" to use image comparison.');
	}

	return BlinkDiff;
};


/**
 * Gets the name of the browser folder, categorizing screenshots from the same browser + platform
 *
 * @method _getFolderName
 * @return {string}
 * @private
 */
BlinkDiffComparison.prototype._getFolderName = function () {
	var browserId;

	browserId = this.getDriver().browserId();
	browserId = utils.fileNameSafe(browserId);

	return browserId;
};

/**
 * Gets the name of the file-base, converting unique identifiers to filename safe strings
 *
 * @method _getBaseName
 * @param {string} title Unique title of image
 * @param {string} id Unique identifier for multiple images with the same title
 * @return {string}
 * @private
 */
BlinkDiffComparison.prototype._getBaseName = function (title, id) {
	return utils.fileNameSafe(title) + '_' + id;
};


/**
 * Gets the approved path for the current image
 *
 * @method _getApprovedImagePath
 * @param {string} title Unique title of image
 * @param {string} [id=1] Unique identifier for multiple images with the same title
 * @return {string}
 * @private
 */
BlinkDiffComparison.prototype._getApprovedImagePath = function (title, id) {
	var baseName = this._getBaseName(title, id || 1),
		folderName = this._getFolderName();

	return path.join(this.getApprovedPath(), folderName, baseName + '.png');
};

/**
 * Gets the build path for the current image
 *
 * @method _getBuildImagePath
 * @param {string} title Unique title of image
 * @param {string} [id=1] Unique identifier for multiple images with the same title
 * @return {string}
 * @private
 */
BlinkDiffComparison.prototype._getBuildImagePath = function (title, id) {
	var baseName = this._getBaseName(title, id || 1),
		folderName = this._getFolderName();

	return path.join(this.getDiffPath(), folderName, baseName + '_build.png');
};

/**
 * Gets the difference path for the current image
 *
 * @method _getDiffImagePath
 * @param {string} title Unique title of image
 * @param {string} [id=1] Unique identifier for multiple images with the same title
 * @return {string}
 * @private
 */
BlinkDiffComparison.prototype._getDiffImagePath = function (title, id) {
	var baseName = this._getBaseName(title, id || 1),
		folderName = this._getFolderName();

	return path.join(this.getDiffPath(), folderName, baseName + '_diff.png');
};


/**
 * Saves a blob to the filesystem
 *
 * @method _saveBlob
 * @param {string} filePath
 * @param {Buffer} blob
 * @private
 */
BlinkDiffComparison.prototype._saveBlob = function (filePath, blob) {

	var dirPath = path.dirname(filePath);

	mkdirp.sync(dirPath);
	fs.writeFileSync(filePath, blob);
};


/**
 * Compares a specific screenshot
 *
 * @method compare
 * @param {string} title Unique title of image
 * @param {Buffer} imageBlob Image buffer of current screenshot
 * @param {object} [options] Comparison options
 */
BlinkDiffComparison.prototype.compare = function (title, imageBlob, options) {

	var BlinkDiff,
		diffPath, buildPath, approvedPath,
		instance,
		result, passed;

	approvedPath = this._getApprovedImagePath(title, options.id);
	buildPath = this._getBuildImagePath(title, options.id);
	diffPath = this._getDiffImagePath(title, options.id);

	// Make sure that the "id" is removed so that it doesn't clash with BlinkDiff
	delete options.id;

	this._saveBlob(buildPath, imageBlob);

	if (!fs.existsSync(approvedPath)) {

		if (this.shouldAutoApprove()) {
			this._saveBlob(approvedPath, imageBlob);
		}

		return this.getDriver().utils().resolve(null);

	} else {

		options.imageA = PNGImage.readImageSync(approvedPath);
		options.imageB = PNGImage.loadImageSync(imageBlob);

		BlinkDiff = this._loadBlinkDiff();
		instance = new BlinkDiff(options);
		result = instance.runSync();

		passed = instance.hasPassed(result.code);
		if (!passed || (passed && this.shouldOutputOnSuccess())) {
			this._saveBlob(diffPath, instance._imageOutput.toBlobSync());
		}
		if (!passed && this.shouldFailOnDifference()) {
			throw new Error("Screenshots are different for " + title);
		}

		return this.getDriver().utils().resolve(passed);
	}
};


/**
 * Setup of comparison
 *
 * @method setup
 */
BlinkDiffComparison.prototype.setup = function () {
	// Do nothing
};

/**
 * Tear-down of comparison
 *
 * @method tearDown
 */
BlinkDiffComparison.prototype.tearDown = function () {
	// Do nothing
};

logMethods(BlinkDiffComparison.prototype);
