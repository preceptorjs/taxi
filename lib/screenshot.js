'use strict';

var logMethods = require('./log');
var type = require('./type');
var when = require('./when');

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
 * Determines if stitching is required
 *
 * @method determineStitching
 * @param {object} [options]
 */
Screenshot.prototype.determineStitching = function (options) {
    var needsStitching = this._driver.getFlag('needsStitching');

    return when((needsStitching === null), function (needsTest) {
        if (needsTest) {
            return when(this.gatherWindowInfo(), function (windowInfo) {
                return when(this.takeRawScreenshot(options), function (imageBuffer) {
                    var width = imageBuffer.readUInt32BE(16), height = imageBuffer.readUInt32BE(20);

                    return when(this.getDevicePixelRatio(width), function () {

                        if ((windowInfo.document.width != width) || (windowInfo.document.height != height)) {
                            this._driver.setFlag('needsStitching', true);
                            return true;
                        } else {
                            this._driver.setFlag('needsStitching', false);
                            return false;
                        }
                    }.bind(this));

                }.bind(this));
            }.bind(this));
        } else {
            return needsStitching;
        }
    }.bind(this));
};

/**
 * Internal method to get screenshot
 *
 * @method takeScreenshot
 * @param {Object} [options]
 * @return {Buffer}
 */
Screenshot.prototype.takeScreenshot = function (options) {
    return when(this.determineStitching(options), function (needsStitching) {
        return when(this.scrollTo(0, 0), function () {
            if (needsStitching) {
                return this.takeStitchedScreenshot(options);
            } else {
                return this.takeRawScreenshot(options);
            }
        }.bind(this));
    }.bind(this));
};

/**
 * Internal method to get raw webdriver screenshot
 *
 * @method takeRawScreenshot
 * @param {Object} [options]
 * @return {Buffer}
 */
Screenshot.prototype.takeRawScreenshot = function (options) {
    return when(this._driver._requestJSON('GET', '/screenshot', undefined, options), function (base64Data) {
        return new Buffer(base64Data, 'base64');
    });
};

/**
 * Gets the device-pixel ratio
 *
 * @method getDevicePixelRatio
 * @param {int} [pixelWidth]
 * @return {number}
 */
Screenshot.prototype.getDevicePixelRatio = function (pixelWidth) {

    var devicePixelRatio = this._driver.getFlag('devicePixelRatio');

    if (devicePixelRatio === null) {
        return when(this.Screenshot.execute(function () {
            var width, ratio, scrollWidth;

            scrollWidth = Math.max(
                document.body.scrollWidth,
                document.documentElement.scrollWidth
            );
            width = Math.max(
                scrollWidth,
                document.body.offsetWidth,
                document.documentElement.clientWidth,
                document.documentElement.offsetWidth
            );
            ratio = window.devicePixelRatio || 1;

            return {
                width: width,
                ratio: ratio
            };

        }), function (result) {

            // This is done to fix some issues with Chrome:
            // http://www.quirksmode.org/blog/archives/2012/06/devicepixelrati.html
            //
            // Here, we calculate the ratio ourselves instead of trusting the browser.
            // For this, however, we need the width of a screenshot.
            //
            // This code will be removed as soon as all browser support full-page screenshot,
            // and they are able to report this value correctly. Do not depend on this method!
            if (pixelWidth) {
                devicePixelRatio = pixelWidth / result.width;
            } else {
                devicePixelRatio = result.ratio;
            }

            this._driver.setFlag('devicePixelRatio', devicePixelRatio);

            return devicePixelRatio;

        }.bind(this));

    } else {
        return this._driver.utils().resolve(devicePixelRatio);
    }
};

/**
 * Internal method to stitch screenshots together from the whole page
 *
 * @method takeStitchedScreenshot
 * @param {object} [options]
 * @return {Buffer}
 */
Screenshot.prototype.takeStitchedScreenshot = function (x, y, width, height, options) {

    return when(this.getDevicePixelRatio(), function () {

        return when(this.gatherWindowInfo(), function (windowInfo) {

            var documentSize, viewPortSize,
                x, y,
                width, height,
                areas = [];

            documentSize = windowInfo.document;
            viewPortSize = windowInfo.viewPort;

            // Determine areas to capture
            for (y = 0; y < documentSize.height; y += viewPortSize.height) {

                height = viewPortSize.height;
                if (y + viewPortSize.height > documentSize.height) {
                    height = documentSize.height - y;
                }

                for (x = 0; x < documentSize.width; x += viewPortSize.width) {

                    width = viewPortSize.width;
                    if (x + viewPortSize.width > documentSize.width) {
                        width = documentSize.width - x;
                    }

                    areas.push({
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                        imageOffsetX: viewPortSize.width - width,
                        imageOffsetY: viewPortSize.height - height
                    });
                }
            }

            // Scroll to position and take screenshot
            return when(this._driver.utils().map(areas, function (area) {
                return when(this.bodyTransformTo(area.x, area.y), function () {
                    return when(this.takeRawScreenshot(options), function (image) {
                        area.image = PNGImage.loadImageSync(image);
                        return area;
                    });
                }.bind(this));
            }.bind(this)), function (areas) {

                var documentImage = PNGImage.createImage(documentSize.width, documentSize.height);

                areas.forEach(function (area) {
                    area.image.getImage().bitblt(documentImage.getImage(), 0, 0, area.width, area.height, area.x, area.y);
                });

                return documentImage.toBlobSync();
            });

        }.bind(this));
    }.bind(this));
};

Screenshot.prototype.prepareForScreenshots = function (prepare, width) {

    return this.execute(function () {

        var prepare = arguments[0],
            width = arguments[1],
            result = {
                viewPort: {},
                document: {},
                bodyTransform: {}
            },

            de = document.documentElement,
            el = document.createElement('div'),
            body = document.body;

        // Get state of scrollbar styles
        result.documentOverflow = document.body.style.overflow;

        // Get current scroll-position
        result.viewPort.x = window.pageXOffset;
        result.viewPort.y = window.pageYOffset;

        // Get current view-port size
        el.style.position = "fixed";
        el.style.top = 0;
        el.style.left = 0;
        el.style.bottom = 0;
        el.style.right = 0;
        de.insertBefore(el, de.firstChild);
        result.viewPort.width = el.offsetWidth;
        result.viewPort.height = el.offsetHeight;
        de.removeChild(el);

        // Get document size
        result.document.width = Math.max(body.scrollWidth, body.offsetWidth, de.clientWidth, de.scrollWidth, de.offsetWidth);
        result.document.height = Math.max(body.scrollHeight, body.offsetHeight, de.clientHeight, de.scrollHeight, de.offsetHeight);

        // See which transformation property to use and what value it has
        // Needed for scroll-translation without the page actually knowing about it
        if (document.body.style.webkitTransform !== undefined) {
            result.bodyTransform.property = 'webkitTransform';
        } else if (document.body.style.mozTransform !== undefined) {
            result.bodyTransform.property = 'mozTransform';
        } else if (document.body.style.msTransform !== undefined) {
            result.bodyTransform.property = 'msTransform';
        } else if (document.body.style.oTransform !== undefined) {
            result.bodyTransform.property = 'oTransform';
        } else {
            result.bodyTransform.property = 'transform';
        }
        result.bodyTransform.value = document.body.style[result.bodyTransform.property];

        // This is done to fix some issues with Chrome:
        // http://www.quirksmode.org/blog/archives/2012/06/devicepixelrati.html
        // Here, we calculate the ratio ourselves instead of trusting the browser.
        // For this, however, we need the width of a screenshot.
        if (width) { // If a width is given, calculate it
            result.devicePixelRatio = width / result.document.width;
        } else { // Otherwise request and use default if not available
            result.devicePixelRatio = window.devicePixelRatio || 1;
        }

        // Should actively prepare? Otherwise only data collection
        if (prepare) {

            // Reset scrolling through translate
            document.body.style[result.bodyTransform.property] = 'translate(' + result.viewPort.x + 'px, ' + result.viewPort.y + 'px)';

            // Remove scrollbars
            document.body.style.overflow = 'hidden';
        }

        return result;
    }, [prepare, width || null]);
};

Screenshot.prototype.bodyTransformTo = function (x, y, setupData) {
    return this.execute(function () {
        var x = arguments[0],
            y = arguments[1],
            setupData = arguments[2];

        document.body.style[setupData.bodyTransform.property] = 'translate(' + ((x * -1) + setupData.viewPort.x) + 'px, ' + ((y * -1) + setupData.viewPort.y) + 'px)';
    }, [x, y, setupData]);
};

Screenshot.prototype.resetFromScreenshot = function (setupData) {
    return this.execute(function () {
        var setupData = arguments[0];

        // Reset translation
        document.body.style[setupData.bodyTransform.property] = setupData.bodyTransform.value;

        // Reset scrollbars
        document.body.style.overflow = setupData.documentOverflow;

    }, [setupData]);
};

logMethods(Screenshot.prototype);
