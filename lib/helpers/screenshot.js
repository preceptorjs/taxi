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
 * the screenshot will be stitched together from multiple smaller screenshots called sections.
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
 * @param {int} [x=0] X-coordinate for area
 * @param {int} [y=0] Y-coordinate for area
 * @param {int} [width=document.width-x] Width of area to be captured
 * @param {int} [height=document.height-y] Height of area to be captured
 * @param {object} [options]
 * @param {function} [options.eachFn] Will execute method on client before each screenshot is taken. First parameter is index of screenshot.
 * @param {function} [options.completeFn] Will execute method on client after all screenshots are taken.
 * @return {Buffer}
 */
Screenshot.prototype.areaScreenshot = function (x, y, width, height, options) {

    return this._takeScreenshot(function (initData) {

        var localX = x || 0,
            localY = y || 0,
            localWidth = width || initData.document.width - localX,
            localHeight = height || initData.document.height - localY;

        return {
            x: localX,
            y: localY,
            width: localWidth,
            height: localHeight
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
 * @param {object} [options.padding] Padding for screenshots
 * @param {object} [options.padding.viewPort] Padding for view-port screenshots, ignoring areas of the view-port screenshot
 * @param {int} [options.padding.viewPort.top=0] Padding of view-port screenshot from the top
 * @param {int} [options.padding.viewPort.bottom=0] Padding of view-port screenshot from the bottom
 * @param {int} [options.padding.viewPort.left=0] Padding of view-port screenshot from the left
 * @param {int} [options.padding.viewPort.right=0] Padding of view-port screenshot from the right
 * @return {Buffer}
 * @private
 */
Screenshot.prototype._takeScreenshot = function (fn, options) {

    return when(this.getDevicePixelRatio(), function (devicePixelRatio) {

        return when(this.doesNeedStitching(), function (needsStitching) {

            return when(this.getMaxImageResolution(), function (maxImageResolution) {

                return when(this._execute(screenshotScripts.init), function (initData) {
                    initData = JSON.parse(initData);

                    var area, sections,
                        padding = {};

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

                    // Set defaults for padding (if none given) and validate
                    padding = this._browserPadding((options && options.padding) || {});
                    this._validatePadding(padding, initData);

                    // Determine sections and view-ports to capture
                    sections = this._gatherSections(area, padding, initData, maxImageResolution, needsStitching);

                    return when(this._takeSectionScreenshots(sections, initData, options), function () {

                        var image;

                        // Decode (load) all images
                        this._decodeImages(sections);

                        // Stitch images together
                        image = this._stitchImages(area, sections, devicePixelRatio);

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
 * Determines if the screenshots need additional padding
 *
 * @method _browserPadding
 * @param {object} padding
 * @private
 */
Screenshot.prototype._browserPadding = function (padding) {

    var paddingTop = 0, paddingBottom = 0,
        paddingLeft = 0, paddingRight = 0;

    switch (this.getDriver().browserName().toLowerCase()) {
        case 'iphone':
            paddingTop = 65; // Browser address bar needs to be trimmed
            break;
    }

    padding.viewPort = padding.viewPort || {};
    padding.viewPort.top = padding.viewPort.top || paddingTop;
    padding.viewPort.bottom = padding.viewPort.bottom || paddingBottom;
    padding.viewPort.left = padding.viewPort.left || paddingLeft;
    padding.viewPort.right = padding.viewPort.right || paddingRight;

    return padding;
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
 * Validates and corrects area that was given to capture
 *
 * @method _validatePadding
 * @param {object} padding Padding for screenshots
 * @param {object} padding.viewPort Padding for view-port screenshots, ignoring areas of the view-port screenshot
 * @param {int} padding.viewPort.top Padding of view-port screenshot from the top
 * @param {int} padding.viewPort.bottom Padding of view-port screenshot from the bottom
 * @param {int} padding.viewPort.left Padding of view-port screenshot from the left
 * @param {int} padding.viewPort.right Padding of view-port screenshot from the right
 * @param {object} initData
 * @private
 */
Screenshot.prototype._validatePadding = function (padding, initData) {

    //if (area.width < 0) {
    //    throw new Error('Width of area to capture cannot be negative.');
    //}
    //if (area.height < 0) {
    //    throw new Error('Height of area to capture cannot be negative.');
    //}
    //
    //if (area.x < 0) {
    //    area.x = 0;
    //}
    //if (area.x >= initData.document.width) {
    //    area.x = initData.document.width - 1;
    //}
    //if (area.y < 0) {
    //    area.y = 0;
    //}
    //if (area.y >= initData.document.height) {
    //    area.y = initData.document.height - 1;
    //}
    //
    //if (area.x + area.width > initData.document.width) {
    //    area.width = initData.document.width - area.x;
    //}
    //if (area.y + area.height > initData.document.height) {
    //    area.height = initData.document.height - area.y;
    //}
};


/**
 * Calculates the sections that need to be captured on their own to be able to capture the whole document.
 *
 * This method depends on the value given to "maxImageResolution".
 *
 * @method _gatherSections
 * @param {object} area Area to capture
 * @param {object} padding Padding for screenshots
 * @param {object} padding.viewPort Padding for view-port screenshots, ignoring areas of the view-port screenshot
 * @param {int} padding.viewPort.top Padding of view-port screenshot from the top
 * @param {int} padding.viewPort.bottom Padding of view-port screenshot from the bottom
 * @param {int} padding.viewPort.left Padding of view-port screenshot from the left
 * @param {int} padding.viewPort.right Padding of view-port screenshot from the right
 * @param {object} initData Data that was initially gathered from the client
 * @param {int} maxImageResolution Max. number of pixels allowed for a screenshot
 * @param {boolean} needsStitching Does the browser need stitching?
 * @return {object[]} List of sections
 * @private
 */
Screenshot.prototype._gatherSections = function (area, padding, initData, maxImageResolution, needsStitching) {

    var sections = [], section,
        sectionCount, sectionHeight,
        i, index = 0,
        yOffset,
        documentWidth,
        viewPortHeight = initData.viewPort.height - padding.viewPort.top - padding.viewPort.bottom;

    documentWidth = initData.document.width - area.x;

    // Calculate max. section height considering the max resolution to capture
    sectionHeight = Math.floor(maxImageResolution / documentWidth);

    if (needsStitching) {
        // When the screenshots are stitched together,
        // we try here to reduce the amount of screenshots per section.
        // We don't want to be wasteful so we make sure that the section border is on
        // even viewPort height; we want to avoid taking a viewPort screenshot and only use
        // the upper part of it, discarding it and requesting it for the next section.
        sectionHeight = Math.floor(sectionHeight / viewPortHeight) * viewPortHeight;
    }

    sectionCount = Math.ceil(area.height / sectionHeight);

    for (i = 0; i < sectionCount; i++) {

        yOffset = (i * sectionHeight);
        section = {
            shift: (sectionCount !== 1),
            x: area.x,
            y: area.y + yOffset, // Vertical offset for sections
            width: area.width,
            height: Math.min(sectionHeight, area.height - yOffset),
            viewPorts: undefined
        };

        if (needsStitching) {
            section.viewPorts = this._gatherViewPortSections(section, padding, initData, index);
            index += section.viewPorts.length;
        } else {
            section.viewPorts = [
                {
                    srxX: padding.viewPort.left,
                    srcY: padding.viewPort.top,
                    x: 0,
                    y: 0,
                    width: section.width,
                    height: section.height,
                    image: undefined,
                    index: index
                }
            ];
            index++;
        }

        sections.push(section);
    }

    return sections;
};

/**
 * Calculates the sections that need to be captured when the browser is not able to return pixels outside of the view-port.
 *
 * @method _gatherViewPortSections
 * @param {object} section Section that should be captured
 * @param {object} padding Padding for screenshots
 * @param {object} padding.viewPort Padding for view-port screenshots, ignoring areas of the view-port screenshot
 * @param {int} padding.viewPort.top Padding of view-port screenshot from the top
 * @param {int} padding.viewPort.bottom Padding of view-port screenshot from the bottom
 * @param {int} padding.viewPort.left Padding of view-port screenshot from the left
 * @param {int} padding.viewPort.right Padding of view-port screenshot from the right
 * @param {object} initData Data that was initially gathered from the client
 * @param {int} index Index of first view-port
 * @return {object[]}
 * @private
 */
Screenshot.prototype._gatherViewPortSections = function (section, padding, initData, index) {

    var viewPorts = [],

        sectionWidth = section.width,
        sectionHeight = section.height,

        viewPortWidth = initData.viewPort.width - padding.viewPort.left - padding.viewPort.right,
        viewPortHeight = initData.viewPort.height - padding.viewPort.top - padding.viewPort.bottom,

        columns = Math.ceil(sectionWidth / viewPortWidth),
        rows = Math.ceil(sectionHeight / viewPortHeight),

        offsetX, offsetY,
        x, y;

    for (y = 0; y < rows; y++) {
        for (x = 0; x < columns; x++) {

            offsetX = x * viewPortWidth;
            offsetY = y * viewPortHeight;

            viewPorts.push({
                srcX: padding.viewPort.left,
                srxY: padding.viewPort.top,
                x: offsetX,
                y: offsetY,
                width: Math.min(viewPortWidth, sectionWidth - offsetX),
                height: Math.min(viewPortHeight, sectionHeight - offsetY),
                image: undefined,
                index: index
            });

            index++;
        }
    }

    return viewPorts;
};


/**
 * Takes all the screenshots defined in section
 *
 * @method _takeSectionScreenshots
 * @param {object[]} sections List of sections to capture
 * @param {object} initData Data that was initially gathered from the client
 * @param {object} [options]
 * @param {function} [options.eachFn] Will execute method on client before each screenshot is taken. First parameter is index of screenshot.
 * @param {function} [options.completeFn] Will execute method on client after all screenshots are taken.
 * @private
 */
Screenshot.prototype._takeSectionScreenshots = function (sections, initData, options) {

    return when(this.getDriver().utils().map(sections, function (section) {
        return this._takeViewPortScreenshots(section, section.viewPorts, initData, options);

    }.bind(this)), function () {
        return this._execute(options.completeFn);
    }.bind(this));
};

/**
 * Takes all the screenshots defined in the view-ports
 *
 * @method _takeViewPortScreenshots
 * @param {object} section Section to capture
 * @param {object[]} viewPorts List of view-ports to capture
 * @param {object} initData Data that was initially gathered from the client
 * @param {object} [options]
 * @param {function} [options.eachFn] Will execute method on client before each screenshot is taken. First parameter is index of screenshot.
 * @param {function} [options.completeFn] Will execute method on client after all screenshots are taken.
 * @private
 */
Screenshot.prototype._takeViewPortScreenshots = function (section, viewPorts, initData, options) {

    return this.getDriver().utils().map(viewPorts, function (viewPort) {
        return this._takeViewPortScreenshot(section, viewPort, initData, options);
    }.bind(this));
};

/**
 * Takes a screenshot of the given view-port in relation to the section
 *
 * @method _takeViewPortScreenshot
 * @param {object} section Section to capture
 * @param {object} viewPort View-ports to capture
 * @param {object} initData Data that was initially gathered from the client
 * @param {object} [options]
 * @param {function} [options.eachFn] Will execute method on client before each screenshot is taken. First parameter is index of screenshot.
 * @param {function} [options.completeFn] Will execute method on client after all screenshots are taken.
 * @private
 */
Screenshot.prototype._takeViewPortScreenshot = function (section, viewPort, initData, options) {

    var offsetX = section.x + viewPort.x,
        offsetY = section.y + viewPort.y,
        viewPortIndex = viewPort.index,
        sectionHeight = section.shift ? section.height : null;

    return when(this._execute(screenshotScripts.documentOffset, [offsetX, offsetY, sectionHeight, initData]), function () {

        // Just wait a little bit. Some browsers need time for that.
        return when(this.getDriver().utils().sleep(100), function () {

            return when(this._execute(options.eachFn, [viewPortIndex]), function () {

                // Take screenshot with current section and view-port
                return when(this.takeRawScreenshot(), function (image) {

                    viewPort.image = image;

                }.bind(this));
            }.bind(this));
        }.bind(this));
    }.bind(this));
};


/**
 * Decodes (loads) all the images defined in the sections
 *
 * @method _decodeImages
 * @param {object[]} sections List of sections that were captured
 * @private
 */
Screenshot.prototype._decodeImages = function (sections) {

    // Decode all images
    sections.forEach(function (section) {
        section.viewPorts.forEach(function (viewPort) {
            viewPort.image = PNGImage.loadImageSync(viewPort.image);
        });
    });
};

/**
 * Stitches all the sections and view-ports together to one final image
 *
 * @method _stitchImages
 * @param {object} area Area that should have been captured on the page
 * @param {object[]} sections List of sections that were captured
 * @param {number} devicePixelRatio Device pixel ratio for browser
 * @return {Buffer}
 * @private
 */
Screenshot.prototype._stitchImages = function (area, sections, devicePixelRatio) {

    var image = PNGImage.createImage(area.width * devicePixelRatio, area.height * devicePixelRatio);

    sections.forEach(function (section) {

        section.viewPorts.forEach(function (viewPort) {

            var offsetX = (section.x + viewPort.x) * devicePixelRatio,
                offsetY = (section.y + viewPort.y) * devicePixelRatio,
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
