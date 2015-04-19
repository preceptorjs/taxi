'use strict';

var logMethods = require('../log');
var type = require('../type');
var when = require('../when');

var devicePixelRatioScripts = require('../scripts/devicePixelRatio');
var stitchingScripts = require('../scripts/stitching');
var screenshotScripts = require('../scripts/screenshot');

var PNGImage = require('pngjs-image');
var fs = require('fs');

module.exports = Screenshot;

/**
 * Screenshot object
 *
 * @constructor
 * @class Screenshot
 * @module WebDriver
 * @submodule Navigation
 * @param {Driver} driver
 */
function Screenshot (driver) {
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
Screenshot.prototype._logMethodCall = function (event) {
    event.target = 'Screenshot';
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
Screenshot.prototype._requestJSON = function (method, path, body) {
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
Screenshot.prototype.getDriver = function () {
    return this._driver;
};


/**
 * Takes a screenshot as-is from the webdriver protocol
 *
 * @method takeRawScreenshot
 * @param {Object} [options]
 * @return {Buffer}
 */
Screenshot.prototype.id = 100;
Screenshot.prototype.takeRawScreenshot = function (options) {

    return when(this._driver._requestJSON('GET', '/screenshot', undefined, options), function (base64Data) {
        var buffer = new Buffer(base64Data, 'base64');
        Screenshot.prototype.id++;
        fs.writeFileSync(__dirname + '/' + this.getDriver().browserName() + " " + this.getDriver().browserVersion() + " " + this.getDriver().platform() + " " + Screenshot.prototype.id + '.png', buffer);
        return buffer;
    }.bind(this));

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
Screenshot.prototype.getDevicePixelRatio = function () {
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
Screenshot.prototype._determineDevicePixelRatio = function () {

    // Reduce size of document to get a small screenshot for ratio determination
    return when(this._execute(devicePixelRatioScripts.init), function (initData) {
        initData = JSON.parse(initData);

        // Take screenshot (hopefully very small, but big enough to get the ratio right)
        return when(this.takeRawScreenshot(), function (screenshotData) {
            var image = PNGImage.loadImageSync(screenshotData);

            // Revert document size
            return when(this._execute(devicePixelRatioScripts.revert, [initData]), function () {

                // Determine best ratio: browser delivered or calculated ratio
                var devicePixelRatio = image.getWidth() / initData.documentWidth;

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
 * Is stitching needed for browser?
 *
 * Some browsers (i.e. Chrome) do only take a screenshot of the view-port instead of the whole document as per standard.
 * This information will then be cached for each driver instance, determining this only once per instance.
 *
 * @method doesNeedStitching
 * @return {number}
 */
Screenshot.prototype.doesNeedStitching = function () {
    var needsStitching = this.getDriver().getValue('needsStitching');

    if (needsStitching === null) {
        return when(this._determineNeedsStitching(), function (value) {
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
 * @method _determineNeedsStitching
 * @return {boolean}
 * @private
 */
Screenshot.prototype._determineNeedsStitching = function () {

    // Determine device-pixel-ratio
    return when(this.getDevicePixelRatio(), function (devicePixelRatio) {

        // Reduce size of document to get a small screenshot for stitching determination
        return when(this._execute(stitchingScripts.init), function (initData) {
            initData = JSON.parse(initData);

            // Take screenshot (hopefully very small, but big enough to get the stitching info)
            return when(this.takeRawScreenshot(), function (screenshotData) {
                var image = PNGImage.loadImageSync(screenshotData);

                // Revert document size
                return when(this._execute(stitchingScripts.revert, [initData]), function () {

                    var needsStitching;

                    // If the screenshot width and the actual view-port width are pretty much the same (here 10px),
                    // even though the document is twice the view-port size, then we need stitching.
                    needsStitching = (Math.abs(image.getWidth() - (initData.viewPortWidth * 2 * devicePixelRatio)) >= 10);

                    if (!needsStitching) {
                        if (this.getDriver().browserName() === 'internet explorer') {
                            if ((image.getColor(((initData.viewPortWidth * 2) - 1) * devicePixelRatio, 0) === 0) &&
                                (image.getColor(((initData.viewPortWidth * 2) - 2) * devicePixelRatio, devicePixelRatio) === 0)) {
                                needsStitching = true;
                            }
                        }
                    }

                    return needsStitching;

                }.bind(this));
            }.bind(this));
        }.bind(this));
    }.bind(this));
};


/**
 * Gets the max. allowed resolution for one screenshot. If the document exceeds this resolution, then
 * the screenshot will be stitched together from multiple smaller screenshots.
 *
 * @method getMaxImageResolution
 * @return {int}
 */
Screenshot.prototype.getMaxImageResolution = function () {
    return this.getDriver().utils().resolve(this.getDriver().getValue('maxImageResolution'));
};


/**
 * Takes a screenshot of the whole document
 *
 * @method documentScreenshot
 * @param {object} [options]
 * @param {function} [options.eachFn] Will execute method on client before each screenshot is taken. First parameter is index of screenshot.
 * @param {function} [options.completeFn] Will execute method on client after all screenshots are taken.
 * @return {Buffer}
 */
Screenshot.prototype.documentScreenshot = function (options) {

    return this._takeScreenshot(function (initData) {
        return {
            x: 0,
            y: 0,
            width: initData.document.width,
            height: initData.document.height
        };
    }, options);
};

/**
 * Takes a screenshot of the current view-port
 *
 * @method viewPortScreenshot
 * @param {object} [options]
 * @param {function} [options.eachFn] Will execute method on client before each screenshot is taken. First parameter is index of screenshot.
 * @param {function} [options.completeFn] Will execute method on client after all screenshots are taken.
 * @return {Buffer}
 */
Screenshot.prototype.viewPortScreenshot = function (options) {

    return this._takeScreenshot(function (initData) {
        return {
            x: initData.viewPort.x,
            y: initData.viewPort.y,
            width: initData.viewPort.width,
            height: initData.viewPort.height
        };
    }, options);
};

/**
 * Takes a screenshot of a specific area
 *
 * @method areaScreenshot
 * @param {int} x X-coordinate for area
 * @param {int} y Y-coordinate for area
 * @param {int} width Width of area to be captured
 * @param {int} height Height of area to be captured
 * @param {object} [options]
 * @param {function} [options.eachFn] Will execute method on client before each screenshot is taken. First parameter is index of screenshot.
 * @param {function} [options.completeFn] Will execute method on client after all screenshots are taken.
 * @return {Buffer}
 */
Screenshot.prototype.areaScreenshot = function (x, y, width, height, options) {

    return this._takeScreenshot(function () {
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    }, options);
};


/**
 * Takes a screenshot of an area that will be specified through the return-value of the callback
 *
 * @method _takeScreenshot
 * @param {function} fn Function to be called to get area to be captured. Supplies the data retrieved from the client as the first parameters.
 * @param {object} [options]
 * @param {function} [options.eachFn] Will execute method on client before each screenshot is taken. First parameter is index of screenshot.
 * @param {function} [options.completeFn] Will execute method on client after all screenshots are taken.
 * @return {Buffer}
 * @private
 */
Screenshot.prototype._takeScreenshot = function (fn, options) {

    return when(this.getDevicePixelRatio(), function (devicePixelRatio) {

        return when(this.doesNeedStitching(), function (needsStitching) {

            return when(this.getMaxImageResolution(), function (maxImageResolution) {

                return when(this._execute(screenshotScripts.init), function (initData) {
                    initData = JSON.parse(initData);

                    var area, documents;

                    // Make sure to account for the device-pixel-ratio
                    maxImageResolution *= (1 / devicePixelRatio);

                    // Make sure the document is not too wide; can fix this by increasing maxImageResolution
                    // We might need to capture only smaller areas, but we need to account also for correct behaving
                    // browsers like firefox which will always return the whole document.
                    if (initData.document.width > maxImageResolution) {
                        throw new Error('The maxImageResolution needs to be greater or equal to one time the document width.');
                    }

                    area = fn(initData);
                    this._validateArea(area, initData);

                    // Determine document sections and view-port sections to capture
                    documents = this._gatherDocumentSections(area, initData, maxImageResolution, needsStitching);

                    return when(this._takeDocumentScreenshots(documents, initData, options), function () {

                        var image;

                        // Decode (load) all images
                        this._decodeImages(documents);

                        // Stitch images together
                        image = this._stitchImages(area, documents, devicePixelRatio);

                        return when(this._execute(screenshotScripts.revert, [initData]), function () {
                            return image;
                        }.bind(this));
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }.bind(this));
};


/**
 * Validates and corrects area that was given to capture
 *
 * @method _validateArea
 * @param {object} area
 * @param {object} initData
 * @private
 */
Screenshot.prototype._validateArea = function (area, initData) {

    if (area.width < 0) {
        throw new Error('Width of area to capture cannot be negative.');
    }
    if (area.height < 0) {
        throw new Error('Height of area to capture cannot be negative.');
    }

    if (area.x < 0) {
        area.x = 0;
    }
    if (area.x >= initData.document.width) {
        area.x = initData.document.width - 1;
    }
    if (area.y < 0) {
        area.y = 0;
    }
    if (area.y >= initData.document.height) {
        area.y = initData.document.height - 1;
    }

    if (area.x + area.width > initData.document.width) {
        area.width = initData.document.width - area.x;
    }
    if (area.y + area.height > initData.document.height) {
        area.height = initData.document.height - area.y;
    }
};


/**
 * Calculates the sections that need to be captured on their own to be able to capture the whole document.
 *
 * This method depends on the value given to "maxImageResolution".
 *
 * @method _gatherDocumentSections
 * @param {object} area Area to capture
 * @param {object} initData Data that was initially gathered from the client
 * @param {int} maxImageResolution Max. number of pixels allowed for a screenshot
 * @param {boolean} needsStitching Does the browser need stitching?
 * @return {object[]} List of document sections
 * @private
 */
Screenshot.prototype._gatherDocumentSections = function (area, initData, maxImageResolution, needsStitching) {

    var documents = [], document,
        sections, sectionHeight,
        i, width, index = 0;

    width = initData.document.width - area.x;

    sectionHeight = Math.floor(maxImageResolution / width);
    if (needsStitching) {
        sectionHeight = Math.floor(sectionHeight / initData.viewPort.height) * initData.viewPort.height;
    }

    sections = Math.ceil(area.height / sectionHeight);

    for (i = 0; i < sections; i++) {

        document = {
            shift: (sections !== 1),
            x: area.x,
            y: area.y + (i * sectionHeight),
            width: area.width,
            height: Math.min(sectionHeight, area.height - (i * sectionHeight)),
            viewPorts: undefined
        };

        if (needsStitching) {
            document.viewPorts = this._gatherViewPortSections(document, initData, index);
            index += document.viewPorts.length;
        } else {
            document.viewPorts = [
                {
                    x: 0,
                    y: 0,
                    width: document.width,
                    height: document.height,
                    image: undefined,
                    index: index
                }
            ];
            index++;
        }

        documents.push(document);
    }

    return documents;
};

/**
 * Calculates the sections that need to be captured when the browser is not able to return pixels outside of the view-port.
 *
 * @method _gatherViewPortSections
 * @param {object} document Document section that should be captured
 * @param {object} initData Data that was initially gathered from the client
 * @param {int} index Index of first view-port
 * @return {object[]}
 * @private
 */
Screenshot.prototype._gatherViewPortSections = function (document, initData, index) {

    var viewPorts = [],

        documentWidth = document.width,
        documentHeight = document.height,

        viewPortWidth = initData.viewPort.width,
        viewPortHeight = initData.viewPort.height,

        columns = Math.ceil(documentWidth / viewPortWidth),
        rows = Math.ceil(documentHeight / viewPortHeight),

        offsetX, offsetY,
        x, y;

    for (y = 0; y < rows; y++) {
        for (x = 0; x < columns; x++) {

            offsetX = x * viewPortWidth;
            offsetY = y * viewPortHeight;

            viewPorts.push({
                x: offsetX,
                y: offsetY,
                width: Math.min(viewPortWidth, documentWidth - offsetX),
                height: Math.min(viewPortHeight, documentHeight - offsetY),
                image: undefined,
                index: index
            });

            index++;
        }
    }

    return viewPorts;
};


/**
 * Takes all the screenshots defined in document sections
 *
 * @method _takeDocumentScreenshots
 * @param {object[]} documents List of document sections to capture
 * @param {object} initData Data that was initially gathered from the client
 * @param {object} [options]
 * @param {function} [options.eachFn] Will execute method on client before each screenshot is taken. First parameter is index of screenshot.
 * @param {function} [options.completeFn] Will execute method on client after all screenshots are taken.
 * @private
 */
Screenshot.prototype._takeDocumentScreenshots = function (documents, initData, options) {

    return when(this.getDriver().utils().map(documents, function (document) {
        return this._takeViewPortScreenshots(document, document.viewPorts, initData, options);

    }.bind(this)), function () {
        return this._execute(options.completeFn);
    }.bind(this));
};

/**
 * Takes all the screenshots defined in the view-ports
 *
 * @method _takeViewPortScreenshots
 * @param {object} document Document sections to capture
 * @param {object[]} viewPorts List of view-ports to capture
 * @param {object} initData Data that was initially gathered from the client
 * @param {object} [options]
 * @param {function} [options.eachFn] Will execute method on client before each screenshot is taken. First parameter is index of screenshot.
 * @param {function} [options.completeFn] Will execute method on client after all screenshots are taken.
 * @private
 */
Screenshot.prototype._takeViewPortScreenshots = function (document, viewPorts, initData, options) {

    return this.getDriver().utils().map(viewPorts, function (viewPort) {
        return this._takeViewPortScreenshot(document, viewPort, initData, options);
    }.bind(this));
};

/**
 * Takes a screenshot of the given view-port in relation to the document-section
 *
 * @method _takeViewPortScreenshot
 * @param {object} document Document sections to capture
 * @param {object} viewPort View-ports to capture
 * @param {object} initData Data that was initially gathered from the client
 * @param {object} [options]
 * @param {function} [options.eachFn] Will execute method on client before each screenshot is taken. First parameter is index of screenshot.
 * @param {function} [options.completeFn] Will execute method on client after all screenshots are taken.
 * @private
 */
Screenshot.prototype._takeViewPortScreenshot = function (document, viewPort, initData, options) {

    var offsetX = document.x + viewPort.x,
        offsetY = document.y + viewPort.y,
        viewPortIndex = viewPort.index,
        documentHeight = document.shift ? document.height : null;

    return when(this._execute(screenshotScripts.documentOffset, [offsetX, offsetY, documentHeight, initData]), function () {

        // Just wait a little bit. Some browsers need time for that.
        return when(this.getDriver().utils().sleep(100), function () {

            return when(this._execute(options.eachFn, [viewPortIndex]), function () {

                // Take screenshot with current document and view-port
                return when(this.takeRawScreenshot(), function (image) {

                    viewPort.image = image;

                }.bind(this));
            }.bind(this));
        }.bind(this));
    }.bind(this));
};


/**
 * Decodes (loads) all the images defined in the document sections
 *
 * @method _decodeImages
 * @param {object[]} documents List of document-sections that were captured
 * @private
 */
Screenshot.prototype._decodeImages = function (documents) {

    // Decode all images
    documents.forEach(function (document) {
        document.viewPorts.forEach(function (viewPort) {
            viewPort.image = PNGImage.loadImageSync(viewPort.image);
        });
    });
};

/**
 * Stitches all the document-sections and view-ports together to one final image
 *
 * @method _stitchImages
 * @param {object} area Area that should have been captured on the page
 * @param {object[]} documents List of document-sections that were captured
 * @param {number} devicePixelRatio Device pixel ratio for browser
 * @return {Buffer}
 * @private
 */
Screenshot.prototype._stitchImages = function (area, documents, devicePixelRatio) {

    var image = PNGImage.createImage(area.width * devicePixelRatio, area.height * devicePixelRatio);

    documents.forEach(function (document) {

        document.viewPorts.forEach(function (viewPort) {

            var offsetX = (document.x + viewPort.x) * devicePixelRatio,
                offsetY = (document.y + viewPort.y) * devicePixelRatio,
                width = viewPort.width * devicePixelRatio,
                height = viewPort.height * devicePixelRatio;

            console.log(viewPort);
            viewPort.image.getImage().bitblt(
                image.getImage(),
                0,
                0,
                Math.min(width, viewPort.image.getWidth()),
                Math.min(height, viewPort.image.getHeight()),
                offsetX,
                offsetY
            );

            // Free-up some memory for GC
            viewPort.image = null;
        });
    });

    // Force garbage-collection if available (can be turned on with option "--expose-gc" when running node)
    if (global.gc) {
        global.gc();
    }

    return image.toBlobSync();
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
Screenshot.prototype._execute = function (script, args) {
    if (script) {
        return this.getDriver().browser().activeWindow().execute(script, args);

    } else { // Ignore script if nothing is there - might happen with screenshot requests
        return this.getDriver().utils().resolve(undefined);
    }
};

logMethods(Screenshot.prototype);
