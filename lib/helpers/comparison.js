'use strict';

var logMethods = require('../log');
var type = require('../type');
var when = require('../when');

module.exports = Comparison;

/**
 * Comparison object
 *
 * @constructor
 * @class Comparison
 * @module WebDriver
 * @submodule Helpers
 * @param {Driver} driver
 * @param {string[]} comparisonList List of tools to use for comparison
 */
function Comparison (driver, comparisonList) {
	this._driver = driver;

	this._comparisons = {};
	comparisonList.forEach(function (comparison) {
		this._loadComparison(comparison);
	}.bind(this));
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


/**
 * Loads a specific comparison plugin
 *
 * @method _loadComparison
 * @param {string} name
 * @private
 */
Comparison.prototype._loadComparison = function (name) {

	var lowerCasedName = name.toLowerCase(),
		Class,
		instance;

	Class = require('../comparison/' + lowerCasedName);
	instance = new Class(this.getDriver());
	instance.setup();

	this._comparisons[lowerCasedName] = instance;
};


/**
 * Gets a specific comparison tool by name
 *
 * @method getComparison
 * @param {string} name
 * @returns {BlinkDiffComparison}
 */
Comparison.prototype.getComparison = function (name) {
	return this._comparisons[name.toLowerCase()];
};

/**
 * Compares a specific screenshot with all comparison plugins
 *
 * @method compare
 * @param {string} title Unique title of image
 * @param {Buffer} imageBlob Image buffer of current screenshot
 * @param {object} [options] Comparison options
 */
Comparison.prototype.compare = function (title, imageBlob, options) {

	var compare;

	options = options || {};

	compare = options.compare || this._getCompareList();
	delete options.compare;

	if (typeof compare === 'string') {
		compare = [compare];
	}

	return this._compare(compare, title, imageBlob, options);
};

/**
 * Uses a list comparison plugins to compare a screenshot
 *
 * @method _compare
 * @param {string[]} plugins
 * @param {string} title
 * @param {Buffer} imageBlob
 * @param {object} options
 * @private
 */
Comparison.prototype._compare = function (plugins, title, imageBlob, options) {

	if (plugins.length !== 0) {

		return when(this.getComparison(plugins[0]).compare(title, imageBlob, options), function () {

			plugins.shift();
			this._compare(plugins, title, imageBlob, options);

		}.bind(this));

	} else {
		this.getDriver().utils().resolve(null);
	}
};

/**
 * Gets a list of comparison plugins
 *
 * @method _getCompareList
 * @return {string[]}
 * @private
 */
Comparison.prototype._getCompareList = function () {

	var comparison = [];

	for (var k in this._comparisons) {
		if (this._comparisons.hasOwnProperty(k)) {
			comparison.push(k);
		}
	}

	return comparison;
};

/**
 * Tear-down of comparison plugins
 *
 * @method tearDown
 */
Comparison.prototype.tearDown = function () {
	for (var k in this._comparisons) {
		if (this._comparisons.hasOwnProperty(k)) {
			this._comparisons[k].tearDown();
		}
	}
};

logMethods(Comparison.prototype);
