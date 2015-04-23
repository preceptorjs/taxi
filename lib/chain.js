'use strict';

var logMethods = require('./log');
var type = require('./type');
var when = require('./when');

module.exports = Chain;

/**
 * Chain execution for taxi
 *
 * @constructor
 * @class Chain
 * @module WebDriver
 * @submodule Chain
 * @param {Driver} driver
 */
function Chain (driver) {
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
Chain.prototype._logMethodCall = function (event) {
    event.target = 'Chain';
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
Chain.prototype._requestJSON = function (method, path, body) {
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
Chain.prototype.getDriver = function () {
    return this._driver;
};


Chain.prototype._elementAction = function (selector, fn) {
    return when(this._driver.browser().activeWindow().getElements(selector), function (elements) {
		if (elements.length === 0) {
			throw new Error('No element for selector "' + selector + '" found.');
		}
        return when(this._driver.utils().map(elements, function (element) {
            return fn(element);
        }), function () {
            return this;
        }.bind(this));
    }.bind(this));
};

Chain.prototype._driverAction = function (value, fn) {
    return when(value, function (result) {
        return when(fn(result), function () {
            return this;
        }.bind(this));
    }.bind(this));
};

Chain.prototype._scopeCallBack = function (cb, args) {
    return cb.apply(this, args);
};


// #############
// Element
// #############

Chain.prototype.elements = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		if (cb) {
			return this._scopeCallBack(cb, [element]);
		}
	}.bind(this));
};

Chain.prototype.elementAttribute = function (selector, attribute, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.getAttribute(attribute), function (value) {
			if (cb) {
				return this._scopeCallBack(cb, [value, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementHasClass = function (selector, classname, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.hasClass(classname), function (value) {
			if (cb) {
				return this._scopeCallBack(cb, [value, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementClasses = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.getClasses(), function (classes) {
			if (cb) {
				return this._scopeCallBack(cb, [classes, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementText = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.getText(), function (text) {
			if (cb) {
				return this._scopeCallBack(cb, [text, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementHasText = function (selector, text, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.hasText(text), function (value) {
			if (cb) {
				return this._scopeCallBack(cb, [value, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementValue = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.getValue(), function (value) {
			if (cb) {
				return this._scopeCallBack(cb, [value, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementTagName = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.getTagName(), function (tagName) {
			if (cb) {
				return this._scopeCallBack(cb, [tagName, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementCss = function (selector, property, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.getCssValue(property), function (value) {
			if (cb) {
				return this._scopeCallBack(cb, [value, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementDisplayed = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.isDisplayed(), function (value) {
			if (cb) {
				return this._scopeCallBack(cb, [value, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementSelected = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.isSelected(), function (value) {
			if (cb) {
				return this._scopeCallBack(cb, [value, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementEqual = function (selector, element, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.isEqual(element), function (value) {
			if (cb) {
				return this._scopeCallBack(cb, [value, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementEnabled = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.isEnabled(), function (value) {
			if (cb) {
				return this._scopeCallBack(cb, [value, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementDisabled = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.isDisabled(), function (value) {
			if (cb) {
				return this._scopeCallBack(cb, [value, element]);
			}
		}.bind(this));
	}.bind(this));
};


Chain.prototype.elementType = function (selector, keys, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.sendKeys(keys), function () {
			if (cb) {
				return this._scopeCallBack(cb, [element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementClear = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.clear(), function () {
			if (cb) {
				return this._scopeCallBack(cb, [element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementSubmit = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.submit(), function () {
			if (cb) {
				return this._scopeCallBack(cb, [element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementSize = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.getSize(), function (value) {
			if (cb) {
				return this._scopeCallBack(cb, [value, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementLocation = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.getPosition(), function (value) {
			if (cb) {
				return this._scopeCallBack(cb, [value, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementLocationInView = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.getLocationInView(), function (value) {
			if (cb) {
				return this._scopeCallBack(cb, [value, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementRect = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.getFrame(), function (value) {
			if (cb) {
				return this._scopeCallBack(cb, [value, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementAbsoluteCenter = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.getAbsoluteCenter(), function (value) {
			if (cb) {
				return this._scopeCallBack(cb, [value, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementRelativeCenter = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.getRelativeCenter(), function (value) {
			if (cb) {
				return this._scopeCallBack(cb, [value, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementScreenshot = function (selector, options, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.screenshot(options), function (buffer) {
			if (cb) {
				return this._scopeCallBack(cb, [buffer, element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementCompare = function (selector, title, options, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.compare(title, options), function (result) {
			if (cb) {
				return this._scopeCallBack(cb, [result, element]);
			}
		}.bind(this));
	}.bind(this));
};

// #############
// Element-Mouse
// #############

Chain.prototype.elementClick = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.mouse().click(), function () {
			if (cb) {
				return this._scopeCallBack(cb, [element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementClickAt = function (selector, xOffset, yOffset, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.mouse().clickAt(xOffset, yOffset), function () {
			if (cb) {
				return this._scopeCallBack(cb, [element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementDblClick = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.mouse().doubleClick(), function () {
			if (cb) {
				return this._scopeCallBack(cb, [element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementDblClickAt = function (selector, xOffset, yOffset, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.mouse().doubleClickAt(xOffset, yOffset), function () {
			if (cb) {
				return this._scopeCallBack(cb, [element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementHover = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.mouse().moveToCenter(), function () {
			if (cb) {
				return this._scopeCallBack(cb, [element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementHoverAt = function (selector, xOffset, yOffset, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.mouse().moveTo(xOffset, yOffset), function () {
			if (cb) {
				return this._scopeCallBack(cb, [element]);
			}
		}.bind(this));
	}.bind(this));
};

// #############
// Element-Touch
// #############

Chain.prototype.elementTouch = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.touch().moveToCenter(), function () {
			if (cb) {
				return this._scopeCallBack(cb, [element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementTouchAt = function (selector, xOffset, yOffset, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.touch().moveTo(xOffset, yOffset), function () {
			if (cb) {
				return this._scopeCallBack(cb, [element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementTap = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.touch().tap(), function () {
			if (cb) {
				return this._scopeCallBack(cb, [element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementDblTap = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.touch().moveToCenter(), function () {
			if (cb) {
				return this._scopeCallBack(cb, [element]);
			}
		}.bind(this));
	}.bind(this));
};

Chain.prototype.elementLongTap = function (selector, cb) {
	return this._elementAction(selector, function (element) {
		return when(element.touch().moveToCenter(), function () {
			if (cb) {
				return this._scopeCallBack(cb, [element]);
			}
		}.bind(this));
	}.bind(this));
};

// ##################
// ActiveWindow
// ##################

Chain.prototype.execute = function (script, args, cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.execute(script, args), function (result) {
		if (cb) {
			return this._scopeCallBack(cb, [result, activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.type = function (keys, cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.sendKeys(keys), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.documentScreenshot = function (options, cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.documentScreenshot(options), function (buffer) {
		if (cb) {
			return this._scopeCallBack(cb, [buffer, activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.viewPortScreenshot = function (options, cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.viewPortScreenshot(options), function (buffer) {
		if (cb) {
			return this._scopeCallBack(cb, [buffer, activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.areaScreenshot = function (x, y, width, height, options, cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.areaScreenshot(x, y, width, height, options), function (buffer) {
		if (cb) {
			return this._scopeCallBack(cb, [buffer, activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.compareDocument = function (title, options, cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.documentScreenshot(title, options), function (buffer) {
		if (cb) {
			return this._scopeCallBack(cb, [buffer, activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.compareViewPort = function (title, options, cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.compareViewPort(title, options), function (buffer) {
		if (cb) {
			return this._scopeCallBack(cb, [buffer, activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.compareArea = function (title, x, y, width, height, options, cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.compareArea(title, x, y, width, height, options), function (buffer) {
		if (cb) {
			return this._scopeCallBack(cb, [buffer, activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.activeElement = function (cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.getActiveElement(), function (element) {
		if (cb) {
			return this._scopeCallBack(cb, [element, activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.closeWindow = function (cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.close(), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.title = function (cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.getTitle(), function (title) {
		if (cb) {
			return this._scopeCallBack(cb, [title, activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.source = function (cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.getSource(), function (source) {
		if (cb) {
			return this._scopeCallBack(cb, [source, activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.scrollLocation = function (cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.getScrollPosition(), function (location) {
		if (cb) {
			return this._scopeCallBack(cb, [location, activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.scrollTo = function (x, y, cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.scrollTo(x, y), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.scrollBy = function (xOffset, yOffset, cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.scrollBy(xOffset, yOffset), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

// ##################
// ActiveWindow-Mouse
// ##################

Chain.prototype.click = function (x, y, cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.mouse().clickAt(x, y), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.dblClick = function (x, y, cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.mouse().doubleClickAt(x, y), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.hover = function (x, y, cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.mouse().moveTo(x, y), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

// ######################
// ActiveWindow-Navigator
// ######################

Chain.prototype.navigateTo = function (url, cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.navigator().navigateTo(url), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.url = function (cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.navigator().getUrl(), function (url) {
		if (cb) {
			return this._scopeCallBack(cb, [url, activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.forward = function (cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.navigator().forward(), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.backward = function (cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.navigator().backward(), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.refresh = function (cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.navigator().refresh(), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

// ##################
// ActiveWindow-Alert
// ##################

Chain.prototype.alertText = function (cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.alert().getText(), function (text) {
		if (cb) {
			return this._scopeCallBack(cb, [text, activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.alertType = function (keys, cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.alert().setText(keys), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.alertAccept = function (cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.alert().accept(), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.alertDismiss = function (cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.alert().dismiss(), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

// ##################
// ActiveWindow-Frame
// ##################

Chain.prototype.activateFrame = function (id, cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.frame().activate(id), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.activateParentFrame = function (cb) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.frame().activateParent(), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

// ##################
// Browser
// ##################

Chain.prototype.activateWindow = function (id, cb) {
	var browser = this._driver.browser();

	return when(browser.activateWindow(id), function () {
		if (cb) {
			return this._scopeCallBack(cb, [browser]);
		}
	}.bind(this));
};

Chain.prototype.windows = function (cb) {
	var browser = this._driver.browser();

	return when(browser.getWindows(), function (windows) {
		if (cb) {
			return this._scopeCallBack(cb, [windows, browser]);
		}
	}.bind(this));
};

// ##################
// Driver
// ##################

Chain.prototype.pause = function (ms, cb) {
	return when(this._driver.utils().sleep(ms), function () {
		if (cb) {
			return this._scopeCallBack(cb, [this._driver.browser().activeWindow()]);
		}
	}.bind(this));
};

Chain.prototype.end = function () {
	return this._driver.dispose();
};

// ##################
// Wait
// ##################

Chain.prototype.waitForElementNotPresent = function (selector, time, abortOnFailure, cb, message) {
	var activeWindow = this._driver.browser().activeWindow(),
		msg = (message || "Element " + selector + " was in the page for " + time + " ms").replace('%s', selector).replace('%d', time);

	return when(this._driver.utils().waitUntil(function () {
		return when(activeWindow.getElements(selector), function (elements) {
			return (elements.length == 0);
		});
	}.bind(this), time, 500, msg, function () {
		return (abortOnFailure === undefined) || abortOnFailure;
	}), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.waitForElementNotVisible = function (selector, time, abortOnFailure, cb, message) {
	var activeWindow = this._driver.browser().activeWindow(),
		msg = (message || "Element " + selector + " was visible in the page for " + time + " ms").replace('%s', selector).replace('%d', time);

	return when(this._driver.utils().waitUntil(function () {
		return when(activeWindow.getElements(selector), function (elements) {
			if (elements.length > 0) {
				return when(elements[0].isDisabled(), function () {});
			}
		});
	}.bind(this), time, 500, msg, function () {
		return (abortOnFailure === undefined) || abortOnFailure;
	}), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.waitForElementPresent = function (selector, time, abortOnFailure, cb, message) {
	var activeWindow = this._driver.browser().activeWindow(),
		msg = (message || "Element " + selector + " was not in the page for " + time + " ms").replace('%s', selector).replace('%d', time);

	return when(this._driver.utils().waitUntil(function () {
		return when(activeWindow.getElements(selector), function (elements) {
			return (elements.length != 0);
		});
	}.bind(this), time, 500, msg, function () {
		return (abortOnFailure === undefined) || abortOnFailure;
	}), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

Chain.prototype.waitForElementVisible = function (selector, time, abortOnFailure, cb, message) {
	var activeWindow = this._driver.browser().activeWindow(),
		msg = (message || "Element " + selector + " was not visible in the page for " + time + " ms").replace('%s', selector).replace('%d', time);

	return when(this._driver.utils().waitUntil(function () {
		return when(activeWindow.getElements(selector), function (elements) {
			if (elements.length > 0) {
				return when(elements[0].isDisabled(), function () {});
			}
		});
	}.bind(this), time, 500, msg, function () {
		return (abortOnFailure === undefined) || abortOnFailure;
	}), function () {
		if (cb) {
			return this._scopeCallBack(cb, [activeWindow]);
		}
	}.bind(this));
};

logMethods(Chain.prototype);
