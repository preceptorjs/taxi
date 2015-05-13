'use strict';

var logMethods = require('./log');
var type = require('./type');
var when = require('./when');

module.exports = Chain;

/**
 * Taxi supports a chainable interface that is quick and easy to use.
 * At any time, you can switch over to the object-oriented interface
 * to do more advanced tasks.
 *
 * See the "[Getting Started](https://github.com/preceptorjs/taxi/wiki/Chaining-Interface---Getting-Started)"
 * documentation for the Chain interface.
 *
 * @main
 * @module Chain
 */

/**
 * Chain Interface for Taxi
 *
 * ##Missing a function?
 * File an [issue](https://github.com/preceptorjs/taxi/issues) with us or
 * create your own function by doing something like this before a
 * Taxi instance is created:
 *
 * ```
 * taxi.Chain.prototype.elementClick = function (selector, button, callBack) {
 *
 *     // Find elements with the selector
 *     return this.elements(selector, function (element) {
 *
 *         // Make sure that evaluation will work for sync and async mode
 *         return this.driver().utils().when(
 *
 *             // Click on the selected element with the object-oriented API
 *             element.mouse().click(button),
 *
 *             // When it is done, execute the callback function in the correct scope,
 *             // additionally giving the element as its first parameter
 *             function () {
 *                 return this._scopeCallBack(callBack, [element]);
 *             }.bind(this)
 *         );
 *     }.bind(this));
 * });
 * ```
 * *Always make sure that you return the values along the way!*
 *
 * This is a complete implementation of the `elementClick` function in this API.
 *
 * @constructor
 * @class Chain
 * @module Chain
 * @param {Driver} driver Taxi driver instance to communicate with the browser
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
 *
 * @method driver
 * @return {Driver}
 * @since 0.2.1
 * @example
 * ```
 * driver === driver.chain().driver() // true
 * ```
 */
Chain.prototype.driver = function () {
	return this._driver;
};

/**
 * Gets the driver object.
 *
 * This is an alias for driver().
 *
 * @method getDriver
 * @return {Driver}
 * @since 0.2.0
 */
Chain.prototype.getDriver = Chain.prototype.driver;


/**
 * Convenience function to execute element actions
 *
 * @method _elementAction
 * @param {string} selector Selector of element that action applies to
 * @param {function} fn Function to execute for every found element
 * @return {Chain} The chain object
 * @chainable
 * @private
 */
Chain.prototype._elementAction = function (selector, fn) {
    return when(this._driver.browser().activeWindow().getElements(selector), function (elements) {
		if (elements.length === 0) {
			throw new Error('No element for selector "' + selector + '" found.');
		}
        return when(this._driver.utils().map(elements, function (element, index) {
            return fn(element, index);
        }), function () {
            return this;
        }.bind(this));
    }.bind(this));
};

/**
 * Convenience function to execute driver actions
 *
 * @method _driverAction
 * @param {*} value Value that needs to be evaluated
 * @param {function} fn Function that needs to be triggered with evaluated value
 * @return {Chain} The chain object
 * @chainable
 * @private
 */
Chain.prototype._driverAction = function (value, fn) {
    return when(value, function (result) {
        return when(fn(result), function () {
            return this;
        }.bind(this));
    }.bind(this));
};

/**
 * Convenience function to handle scope for chains
 *
 * @method _scopeCallBack
 * @param {function} cb Callback function that should be triggered with the correct scope
 * @param {*[]} args List of arguments to supply to the callback function
 * @return {Chain} The chain object
 * @chainable
 * @private
 */
Chain.prototype._scopeCallBack = function (cb, args) {
    return cb.apply(this, args);
};


// #############
// Element
// #############

/**
 * Adjusts the configurations according to the browsers behavior.
 *
 * Note:
 * This is needed especially when screenshots should be taken since
 * browsers behave here very different from each other.
 *
 * Needs to be called only once per taxi instance.
 *
 * @method adjust
 * @param {object} [options] Preparation options for chaining
 * @param {int} [options.url='http://www.example.org'] Default website for adjustment for browser
 * @param {int} [options.horizontalPadding=0] Padding of the document
 * @param {function} [callBack] Callback function that will be triggered with each selected element in turn
 * @throws {Error} When there is no active document available
 * @since 0.2.6
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function ()
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * none
 */
Chain.prototype.adjust = function (options, callBack) {

	// Navigate to adjustment website
	return this._driverAction(this._driver.adjust(options), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, []);
		}
	}.bind(this));
};

/**
 * Selects DOM elements, triggering each selected element on the supplied callback function
 *
 * @method elements
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered with each selected element in turn
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 * @example
 * ```
 * // Determines all element with the "title" class and prints the
 * // text content of these elements to the console, one-by-one
 *
 * driver.elements('.title', function (element) {
 *   console.log(element.getText());
 * });
 * ```
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elements = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		if (callBack) {
			return this._scopeCallBack(callBack, [element, index]);
		}
	}.bind(this));
};

/**
 * Retrieves the attribute value of the selected elements
 *
 * @method elementAttribute
 * @param {string} selector CSS selector of DOM elements
 * @param {string} attribute Name of the attribute to get the value of
 * @param {function} [callBack] Callback function that will be triggered with the attribute value
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 * @example
 * ```
 * // Determines the value of all input tags and prints them out to the console.
 *
 * driver.elementAttribute('input', 'value', function (value) {
 *   console.log(value);
 * });
 * ```
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`value`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`value`** {`string`} - Value of attribute
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementAttribute = function (selector, attribute, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.getAttribute(attribute), function (value) {
			if (callBack) {
				return this._scopeCallBack(callBack, [value, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Checks if the selected elements have a specific class
 *
 * @method elementHasClass
 * @param {string} selector CSS selector of DOM elements
 * @param {string} className Name of class to look for
 * @param {function} [callBack] Callback function that will be triggered with the result of the request
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 * @example
 * ```
 * // Selects all input tags, checking if they have the "name" class,
 * // and printing out the value of the input element when they have the class.
 *
 * driver.elementHasClass('input', 'name', function (hasClass, element) {
 *   if (hasClass) {
 *     console.log(element.getValue());
 *   }
 * });
 * ```
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`hasClass`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`hasClass`** {`boolean`} - Does the selected element have the supplied class-name?
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementHasClass = function (selector, className, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.hasClass(className), function (hasClass) {
			if (callBack) {
				return this._scopeCallBack(callBack, [hasClass, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Determines a list of classes assigned to the selected elements
 *
 * @method elementClasses
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered with the list of classes
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 * @example
 * ```
 * // Prints a comma-separated list of classes that the element with the id "search" has.
 *
 * driver.elementClasses('#search', function (classes) {
 *   console.log(classes.join(', '));
 * });
 * ```
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`classes`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`classes`** {`string[]`} - List of classes of the selected element
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementClasses = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.getClasses(), function (classes) {
			if (callBack) {
				return this._scopeCallBack(callBack, [classes, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Gets the text content of the selected elements
 *
 * @method elementText
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be called with the text content of the selected element
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 * @example
 * ```
 * // Retrieves the contents of an article synopsis
 *
 * driver.elementText('.synopsis', function (text) {
 *   console.log(text);
 * });
 * ```
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`text`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`text`** {`string`} - Text content of selected element
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementText = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.getText(), function (text) {
			if (callBack) {
				return this._scopeCallBack(callBack, [text, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Determines if selected elements have a string or even a sub-string in their text content
 *
 * @method elementHasText
 * @param {string} selector CSS selector of DOM elements
 * @param {string|RegEx} text String, sub-string, or regular expression to look for in the elements
 * @param {function} [callBack] Callback function that will be called with the result of the request
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 * @example
 * ```
 * // Checks if the article synopsis has the word "Lion" in it.
 *
 * driver.elementHasText('.synopsis', 'Lion', function (hasText) {
 *   if (hasText) {
 *     console.log('Found "Lion" in the synopsis!');
 *   }
 * });
 * ```
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`hasText`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`hasText`** {`boolean`} - Does selected element have the supplied text as string or substring?
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 *
 * **Note**
 * The text search is case sensitive. If you want case insensitivity, then please use regular expressions.
 * (i.e. /<string>/i)
 */
Chain.prototype.elementHasText = function (selector, text, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.hasText(text), function (hasText) {
			if (callBack) {
				return this._scopeCallBack(callBack, [hasText, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Determines the contents of the `value` attribute on each selected element
 *
 * **Note**
 * This will only work on elements that have a `value` attribute.
 *
 * @method elementValue
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be called with the value of the selected element
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`value`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`value`** {`string`} - Value of the "value" attribute of the selected element
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementValue = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.getValue(), function (value) {
			if (callBack) {
				return this._scopeCallBack(callBack, [value, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Gets the name of the tag for each selected element
 *
 * @method elementTagName
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered with the name of the tag of the selected element
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`tagName`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`tagName`** {`string`} - Tag-name of the selected element
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementTagName = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.getTagName(), function (tagName) {
			if (callBack) {
				return this._scopeCallBack(callBack, [tagName, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Determines the value of a CSS property for each selected element
 *
 * **Note**
 * Use the original CSS property name according to the CSS standard, **not** the JavaScript naming convention for CSS properties.
 *
 * @method elementCssValue
 * @param {string} selector CSS selector of DOM elements
 * @param {string} property Name of the CSS property to determine the value of
 * @param {function} [callBack] Callback function that will trigger with the value of the CSS property of the selected element
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`value`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`value`** {`string`} - Value of the requested CSS-property of the selected element
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementCssValue = function (selector, property, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.getCssValue(property), function (value) {
			if (callBack) {
				return this._scopeCallBack(callBack, [value, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Checks if the selected elements are displayed somewhere on the page
 *
 * @method elementIsDisplayed
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered with the result of the request
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`isDisplayed`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`isDisplayed`** {`boolean`} - Is the selected element displayed?
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementIsDisplayed = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.isDisplayed(), function (isDisplayed) {
			if (callBack) {
				return this._scopeCallBack(callBack, [isDisplayed, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Checks if the selected elements are checked
 *
 * **Note**
 * This function will only work on elements which have a "checked"-value (i.e. checkbox, radiobox, or options element).
 *
 * @method elementIsSelected
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered with the result of the request
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`isSelected`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`isSelected`** {`boolean`} - Is the selected element checked/selected?
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementIsSelected = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.isSelected(), function (isSelected) {
			if (callBack) {
				return this._scopeCallBack(callBack, [isSelected, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Checks if the selected elements are enabled
 *
 * @method elementIsEnabled
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered with the result of the request
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`isEnabled`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`isEnabled`** {`boolean`} - Is the selected element enabled?
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementIsEnabled = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.isEnabled(), function (isEnabled) {
			if (callBack) {
				return this._scopeCallBack(callBack, [isEnabled, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Types complete strings or key-strokes into the selected element
 *
 * @method elementSendKeys
 * @param {string} selector CSS selector of DOM elements
 * @param {string|string[]} keys or key-strokes to send
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementSendKeys = function (selector, keys, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.sendKeys(keys), function () {
			if (callBack) {
				return this._scopeCallBack(callBack, [element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Clears the contents of the selected elements
 *
 * **Note**
 * This will only work on elements that can be cleared like input boxes and text areas.
 *
 * @method elementClear
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementClear = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.clear(), function () {
			if (callBack) {
				return this._scopeCallBack(callBack, [element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Submits the selected form elements
 *
 *
 * **Note**
 * This should be usually only one form element. It doesn't make sense to apply this to any other element type.
 *
 * @method elementSubmit
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementSubmit = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.submit(), function () {
			if (callBack) {
				return this._scopeCallBack(callBack, [element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Determines the size of the selected elements
 *
 * @method elementSize
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered with the size of the selected element
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`size`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`size`** {`object`} - Size of the selected element
 *     * **`width`** {`int`} - Width of the selected element
 *     * **`height`** {`int`} - Height of the selected element
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementSize = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.getSize(), function (size) {
			if (callBack) {
				return this._scopeCallBack(callBack, [size, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Determines the absolute location of the selected elements
 *
 * @method elementLocation
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered with the location of the selected element
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`location`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`location`** {`object`} - Absolute location of the selected element
 *     * **`x`** {`int`} - Absolute x-coordinate of the selected element
 *     * **`y`** {`int`} - Absolute y-coordinate of the selected element
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementLocation = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.getPosition(), function (location) {
			if (callBack) {
				return this._scopeCallBack(callBack, [location, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Determines the location of the selected elements relative to the current view-ports top-left corner
 *
 * @method elementLocationInView
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered with the location of the selected element
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`location`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`location`** {`object`} - Location of the selected element relative to the view-port
 *     * **`x`** {`int`} - X-coordinate of the selected element relative to the view-port
 *     * **`y`** {`int`} - Y-coordinate of the selected element relative to the view-port
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementLocationInView = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.getLocationInView(), function (location) {
			if (callBack) {
				return this._scopeCallBack(callBack, [location, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Determines the absolute location and size of the selected elements
 *
 * @method elementFrame
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered with the size and location of the selected element
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`frame`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`frame`** {`object`} - Absolute coordinates and size of the selected element
 *     * **`x`** {`int`} - Absolute x-coordinate of the selected element
 *     * **`y`** {`int`} - Absolute y-coordinate of the selected element
 *     * **`width`** {`int`} - Width of the selected element
 *     * **`height`** {`int`} - Height of the selected element
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementFrame = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.getFrame(), function (frame) {
			if (callBack) {
				return this._scopeCallBack(callBack, [frame, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Determines the absolute coordinates of the center of the selected elements
 *
 * @method elementAbsoluteCenter
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered with the absolute center coordinates of the selected element
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`coordinates`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`coordinates`** {`object`} - Absolute coordinates of the center of the selected element
 *     * **`x`** {`int`} - Absolute x-coordinate of the selected elements center
 *     * **`y`** {`int`} - Absolute y-coordinate of the selected elements center
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementAbsoluteCenter = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.getAbsoluteCenter(), function (coordinates) {
			if (callBack) {
				return this._scopeCallBack(callBack, [coordinates, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Determines the coordinates of the center of the selected elements relative to the elements top-left corner
 *
 * @method elementRelativeCenter
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered with the relative center coordinates of the selected element
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`coordinates`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`coordinates`** {`object`} - Coordinates of the center of the selected element relative to the upper-left corner of the element itself
 *     * **`x`** {`int`} - X-coordinate of the selected elements center relative to the upper-left corner of the element itself
 *     * **`y`** {`int`} - Y-coordinate of the selected elements center relative to the upper-left corner of the element itself
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementRelativeCenter = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.getRelativeCenter(), function (coordinates) {
			if (callBack) {
				return this._scopeCallBack(callBack, [coordinates, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Captures an element in a PNG buffer, discarding or ignoring the rest of the document from the image
 *
 * @method elementCapture
 * @param {string} selector CSS selector of DOM elements
 * @param {object} [options] Options for taking the screenshot
 * @param {function} [options.eachFn] Will execute the function on client before each screenshot is taken
 * @param {function} [options.completeFn] Will execute the function on client after all screenshots are taken
 * @param {object[]|Element[]|string[]} [options.blockOuts] List of areas/elements that should be blocked-out
 * @param {object} [options.blockOutColor=black] Color to be used for blocking-out areas {red, green, blue, alpha}
 * @param {int} [options.wait=100] Wait in ms before each screenshot
 * @param {int} [options.allPadding] Padding for all sides
 * @param {int} [options.hPadding] Padding on left and right side of the element
 * @param {int} [options.vPadding] Padding on the top and on the bottom of the element
 * @param {int} [options.leftPadding] Padding on the left of the element
 * @param {int} [options.rightPadding] Padding on the right of the element
 * @param {int} [options.topPadding] Padding on the top of the element
 * @param {int} [options.bottomPadding] Padding on the bottom of the element
 * @param {function} [callBack] Callback function that will be triggered with the image-buffer of the screenshot from the selected element
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @throws {Error} When there is no active document available
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`imageBuffer`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`imageBuffer`** {`Buffer`} - Binary buffer of the PNG image
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 *
 * ---------------------------------------
 *
 * ##options.eachFn (`index`)
 * This function is executed on the client-side just before a new screenshot is taken.
 * How often this function is executed depends on the browser and should only be used
 * to prepare for screenshots (i.e. removing a floating header on the second image).
 *
 * ###Scope
 * > {`document.window`} - within the browser
 *
 * ###Parameters
 * * **`index`** {`int`} - Zero-based index of screenshot that will be taken
 *
 * **Note**
 * Since this function is executed on the client, it will not be able to capture
 * variables in the lexical scope. The function will be serialized, sent to the client,
 * de-serialized, and executed without knowing the context of its initial definition.
 *
 * ---------------------------------------
 *
 * ##options.completeFn ()
 * This function is executed on the client-side just after all screenshots were taken.
 * This function will only be called once and it can be used to revert changes applied
 * to the document during eachFn calls (i.e. re-attaching a floating header).
 *
 * ###Scope
 * > {`document.window`} - within the browser
 *
 * ###Parameters
 * > none
 *
 * **Note**
 * Since this function is executed on the client, it will not be able to capture
 * variables in the lexical scope. The function will be serialized, sent to the client,
 * de-serialized, and executed without knowing the context of its initial definition.
 *
 * ---------------------------------------
 *
 * ##options.blockOuts
 * Sometimes, you want to block-out areas on a screenshot, be it for censoring purposes or
 * for comparison during multiple test-runs with every changing data (i.e. date/time label).
 * In this list, you can supply CSS selectors, a list of already selected elements, or even
 * a list of pre-defined fixed areas. All of these different "selectors" can be combined
 * in the same list.
 *
 * ###CSS Selector
 * The supplied CSS selector will be used to find single or multiple DOM element in the
 * document. Taxi will flatten the list whenever multiple items are found.
 *
 * ###Element Selector
 * These are objects that were already selected previously and re-used for this purpose.
 *
 * ###Static object
 * This object holds static information about the location and the size of the area to
 * block-out.
 *
 * The object has following properties:
 * * **`x`** {`int`} - X-coordinate of the area
 * * **`y`** {`int`} - Y-coordinate of the area
 * * **`width`** {`int`} - Width of the area
 * * **`height`** {`int`} - Height of the area
 * * **`[color]`** {`object`} - Custom block-out color for this area only. See options.blockOutColor for more information.
 *
 * ---------------------------------------
 *
 * ##options.blockOutColor
 * This is the default color for all block-out areas that do not have custom colors.
 *
 * ###Properties
 * * **`[red]`** {`int`} -   Red component of the color for blocking-out the area. Accepted values
 * are from 0-255. 0 means that there is no intensity of this component within the resulting color;
 * 255 is the full intensity.
 * * **`[green]`** {`int`} - Green component of the color for blocking-out the area. Accepted values
 * are from 0-255. 0 means that there is no intensity of this component within the resulting color;
 * 255 is the full intensity.
 * * **`[blue]`** {`int`} -  Blue component of the color for blocking-out the area. Accepted values
 * are from 0-255. 0 means that there is no intensity of this component within the resulting color;
 * 255 is the full intensity.
 * * **`[alpha]`** {`int`} - Alpha channel of the color for blocking-out the area. Accepted values
 * are from 0.0-1.0. 0 means that there is no intensity of this component within the resulting color;
 * 1.0 is the full intensity.
 *
 * ---------------------------------------
 *
 * ##options.wait
 * Sometimes, it is required to slow-down the screen-capturing process. By default,
 * Taxi will wait 100 milliseconds before each screenshot to make sure that changes
 * caused by the scrolling behavior were applied in the browser view-port.
 * Extend this time if the screenshot needs special behavior.
 *
 *
 * ##options.*padding
 * Padding that reaches outside of the document itself will be reduced to the extend of the document.
 */
Chain.prototype.elementCapture = function (selector, options, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.capture(options), function (imageBuffer) {
			if (callBack) {
				return this._scopeCallBack(callBack, [imageBuffer, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Compares the image of selected elements from previous captures/comparisons
 *
 * @method elementCompare
 * @param {string} selector CSS selector of DOM elements
 * @param {string} title Title of the comparison
 * @param {object} [options] Options for the screenshots and compare the data. See elementCapture for more information on the screenshot options.
 * @param {function} [options.eachFn] Will execute the function on client before each screenshot is taken
 * @param {function} [options.completeFn] Will execute the function on client after all screenshots are taken
 * @param {object[]|Element[]|string[]} [options.blockOuts] List of areas/elements that should be blocked-out
 * @param {object} [options.blockOutColor=black] Color to be used for blocking-out areas {red, green, blue, alpha}
 * @param {int} [options.wait=100] Wait in ms before each screenshot
 * @param {object} [options.compare] Options for the comparison. See the [Blink-Diff documentation](https://github.com/yahoo/blink-diff#object-usage)
 * @param {object} [options.compare.id=1] Additional identifier to differentiate comparison
 * @param {int} [options.allPadding] Padding for all sides
 * @param {int} [options.hPadding] Padding on left and right side of the element
 * @param {int} [options.vPadding] Padding on the top and on the bottom of the element
 * @param {int} [options.leftPadding] Padding on the left of the element
 * @param {int} [options.rightPadding] Padding on the right of the element
 * @param {int} [options.topPadding] Padding on the top of the element
 * @param {int} [options.bottomPadding] Padding on the bottom of the element
 * @param {function} [callBack] Callback function that will be triggered with the result of the request
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @throws {Error} When there is no active document available
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > `function` (`isSimilar`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`isSimilar`** {`boolean`|`null`} - Is comparison similar to previous one?
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 *
 * **Notes**
 * * **`isSimilar`** will be NULL when the value cannot be determined at the time of comparison
 * due to the comparison process, or simply because there was no previous image to compare to.
 * * **`isSimilar`** will be true when all of the comparison APIs determined a similarity to previously
 * captured data, depending on the configuration setting for each of those comparison APIs.
 * * **`isSimilar`** will be false when at least one comparison API determines a difference in the
 * current and previous state.
 *
 * ---------------------------------------
 *
 * ##Notes
 * * **`title`** The title needs to be unique to identify each of these comparisons across all test-runs.
 * Additionally, the id parameter can be used to make this identifier unique.
 * * **`options.compare.id`** The id will be added to the title to get a unique identifier.
 *
 * ##Comparison configuration
 * General comparison options can be set globally in the driver through the `setValue`/`getValue` methods.
 * The options for the comparison, however, need to be supplied for every comparison itself.
 *
 * ###Changing configuration options
 * ```
 * driver.setValue('blinkDiff.outputOnSuccess', true);
 * ```
 *
 * ###Options
 * * **`blinkDiff.outputOnSuccess`** {`boolean`} [default=true] - Should an output be created when comparison is successful?
 * There will always be an output if the comparison fails.
 * * **`blinkDiff.failOnDifference`** {`boolean`} [default=true] - Should Taxi trigger an error when a difference is recognized?
 * * **`blinkDiff.autoApprove`** {`boolean`} [default=false] - Should Taxi auto-approve screenshots when no previous comparison
 * exist? Otherwise, the test will ignore this comparison, saving the current build screenshot.
 * * **`blinkDiff.approvedPath`** {`string`} [default=cwd] - Path to the approved folder. Defaults to the current working directory.
 * * **`blinkDiff.buildPath`** {`string`} [default=approvedPath] - Path to the build folder, holding all the screenshots taken in the recent build.
 * Defaults to the approved folder.
 * * **`blinkDiff.diffPath`** {`string`} [default=buildPath] - Path to the difference folder, keeping the highlighted differences between
 * the approved image and the build image. Default to the build folder.
 * * **`blinkDiff.options`** {`object`} - Default values for Blink-Diff options. See the [Blink-Diff documentation](https://github.com/yahoo/blink-diff#object-usage)
 * * **`blinkDiff.batchFailures`** {`boolean`} [default=false] - Failures are batched to the end of the tests when this flag is set.
 * * **`blinkDiff.failOnAdditions`** {`boolean`} [default=false] - Fail when no approved screenshot is found.
 */
Chain.prototype.elementCompare = function (selector, title, options, callBack) {

	options = options || {};
	options.compare = options.compare || {};

	var initialCompareId = options.compare.id || '';

	return this._elementAction(selector, function (element, index) {
		options.compare.id = initialCompareId + index;
		return when(element.compare(title, options), function (isSimilar) {
			if (callBack) {
				return this._scopeCallBack(callBack, [isSimilar, element, index]);
			}
		}.bind(this));
	}.bind(this));
};

// #############
// Element-Mouse
// #############

/**
 * Clicks on the selected elements
 *
 * @method elementClick
 * @param {string} selector CSS selector of DOM elements
 * @param {int} [button=Mouse.BUTTON_LEFT] Button that should be pressed when click action is executed.
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 *
 *
 * **Note**
 *
 * You can use the constants available in the mouse-object or submit the following values:
 * * 0 - Left Button
 * * 1 - Middle Button
 * * 2 - Right Button
 */
Chain.prototype.elementClick = function (selector, button, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.mouse().click(), function () {
			if (callBack) {
				return this._scopeCallBack(callBack, [element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Clicks on a specific coordinate relative to the upper-left corner of the selected elements
 *
 * @method elementClickAt
 * @param {string} selector CSS selector of DOM elements
 * @param {int} xOffset X-offset relative to the left corner of the selected element
 * @param {int} yOffset Y-offset relative to the top corner of the selected element
 * @param {int} [button=Mouse.BUTTON_LEFT] Button that should be pressed when click action is executed.
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 *
 *
 * **Note**
 *
 * You can use the constants available in the mouse-object or submit the following values:
 * * 0 - Left Button
 * * 1 - Middle Button
 * * 2 - Right Button
 */
Chain.prototype.elementClickAt = function (selector, xOffset, yOffset, button, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.mouse().clickAt(xOffset, yOffset), function () {
			if (callBack) {
				return this._scopeCallBack(callBack, [element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Double-clicks on the selected elements
 *
 * @method elementDblClick
 * @param {string} selector CSS selector of DOM elements
 * @param {int} [button=Mouse.BUTTON_LEFT] Button that should be pressed when click action is executed.
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 *
 *
 * **Note**
 *
 * You can use the constants available in the mouse-object or submit the following values:
 * * 0 - Left Button
 * * 1 - Middle Button
 * * 2 - Right Button
 */
Chain.prototype.elementDblClick = function (selector, button, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.mouse().doubleClick(), function () {
			if (callBack) {
				return this._scopeCallBack(callBack, [element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Double-clicks on a specific coordinate relative to the upper-left corner of the selected elements
 *
 * @method elementDblClickAt
 * @param {string} selector CSS selector of DOM elements
 * @param {int} xOffset X-offset relative to the left corner of the selected element
 * @param {int} yOffset Y-offset relative to the top corner of the selected element
 * @param {int} [button=Mouse.BUTTON_LEFT] Button that should be pressed when click action is executed.
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 *
 *
 * **Note**
 *
 * You can use the constants available in the mouse-object or submit the following values:
 * * 0 - Left Button
 * * 1 - Middle Button
 * * 2 - Right Button
 */
Chain.prototype.elementDblClickAt = function (selector, xOffset, yOffset, button, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.mouse().doubleClickAt(xOffset, yOffset), function () {
			if (callBack) {
				return this._scopeCallBack(callBack, [element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Hovers the mouse over the selected elements
 *
 * @method elementHover
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementHover = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.mouse().moveToCenter(), function () {
			if (callBack) {
				return this._scopeCallBack(callBack, [element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Hovers the mouse over a specific coordinate relative to the upper-left corner of the selected elements
 *
 * @method elementHoverAt
 * @param {string} selector CSS selector of DOM elements
 * @param {int} xOffset X-offset relative to the left corner of the selected element
 * @param {int} yOffset Y-offset relative to the top corner of the selected element
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementHoverAt = function (selector, xOffset, yOffset, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.mouse().moveTo(xOffset, yOffset), function () {
			if (callBack) {
				return this._scopeCallBack(callBack, [element, index]);
			}
		}.bind(this));
	}.bind(this));
};

// #############
// Element-Touch
// #############

/**
 * Triggers a touch-event on the selected elements
 *
 * @method elementTouch
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementTouch = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.touch().moveToCenter(), function () {
			if (callBack) {
				return this._scopeCallBack(callBack, [element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Triggers a touch-event on the selected element relative to the upper-left corner of the elements
 *
 * @method elementTouchAt
 * @param {string} selector CSS selector of DOM elements
 * @param {int} xOffset X-offset relative to the left corner of the selected element
 * @param {int} yOffset Y-offset relative to the top corner of the selected element
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementTouchAt = function (selector, xOffset, yOffset, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.touch().moveTo(xOffset, yOffset), function () {
			if (callBack) {
				return this._scopeCallBack(callBack, [element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Taps on the selected elements
 *
 * @method elementTap
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementTap = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.touch().tap(), function () {
			if (callBack) {
				return this._scopeCallBack(callBack, [element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Double-taps on the selected elements
 *
 * @method elementDblTap
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementDblTap = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.touch().moveToCenter(), function () {
			if (callBack) {
				return this._scopeCallBack(callBack, [element, index]);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * Triggers a long-tap on the selected elements
 *
 * @method elementLongTap
 * @param {string} selector CSS selector of DOM elements
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When no element could be found with the given CSS selector.
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.elementLongTap = function (selector, callBack) {
	return this._elementAction(selector, function (element, index) {
		return when(element.touch().longTap(), function () {
			if (callBack) {
				return this._scopeCallBack(callBack, [element, index]);
			}
		}.bind(this));
	}.bind(this));
};

// ##################
// ActiveWindow
// ##################

/**
 * Executes a script or function within the active browser window, returning the results
 *
 * @methods execute
 * @param {string|function} script Script or serializable function that should be executed on the client
 * @param {*[]} [args] List of arguments supplied to the script when executed on the client-side
 * @param {function} [callBack] Callback function that will be triggered with the result of the script
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`result`, `activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`result`** {`*`} - Result of the evaluated script
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 *
 * **Note**
 * Please be aware that a function supplied to the `script` parameter will be serialized, sent to the browser,
 * de-serialized, and executed on the client. The lexical scope of the function will be lost and therefore won't
 * be able to capture variables outside of the function scope.
 */
Chain.prototype.execute = function (script, args, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.execute(script, args), function (result) {
		if (callBack) {
			return this._scopeCallBack(callBack, [result, activeWindow]);
		}
	}.bind(this));
};

/**
 * Types complete strings or key-strokes into the active window, effectively sending key-strokes to the focused element
 *
 * @method sendKeys
 * @param {string|string[]} keys or key-strokes to send
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.sendKeys = function (keys, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.sendKeys(keys), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

/**
 * Captures the complete document in a PNG buffer
 *
 * @method captureDocument
 * @param {object} [options] Options for taking the screenshots. See elementCapture for more information on the screenshot options.
 * @param {function} [options.eachFn] Will execute the function on client before each screenshot is taken
 * @param {function} [options.completeFn] Will execute the function on client after all screenshots are taken
 * @param {object[]|Element[]|string[]} [options.blockOuts] List of areas/elements that should be blocked-out
 * @param {object} [options.blockOutColor=black] Color to be used for blocking-out areas {red, green, blue, alpha}
 * @param {int} [options.wait=100] Wait in ms before each screenshot
 * @param {function} [callBack] Callback function that will be triggered with the image-buffer of the document screenshot
 * @throws {Error} When there is no active document available
 * @see Chain.elementCapture
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`imageBuffer`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`imageBuffer`** {`Buffer`} - Binary buffer of the PNG image
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.captureDocument = function (options, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.captureDocument(options), function (imageBuffer) {
		if (callBack) {
			return this._scopeCallBack(callBack, [imageBuffer, activeWindow]);
		}
	}.bind(this));
};

/**
 * Captures the current view-port in a PNG buffer
 *
 * @method captureViewPort
 * @param {object} [options] Options for taking the screenshots. See elementCapture for more information on the screenshot options.
 * @param {function} [options.eachFn] Will execute the function on client before each screenshot is taken
 * @param {function} [options.completeFn] Will execute the function on client after all screenshots are taken
 * @param {object[]|Element[]|string[]} [options.blockOuts] List of areas/elements that should be blocked-out
 * @param {object} [options.blockOutColor=black] Color to be used for blocking-out areas {red, green, blue, alpha}
 * @param {int} [options.wait=100] Wait in ms before each screenshot
 * @param {function} [callBack] Callback function that will be triggered with the image-buffer of the view-port screenshot
 * @throws {Error} When there is no active document available
 * @see Chain.elementCapture
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`imageBuffer`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`imageBuffer`** {`Buffer`} - Binary buffer of the PNG image
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.captureViewPort = function (options, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.captureViewPort(options), function (imageBuffer) {
		if (callBack) {
			return this._scopeCallBack(callBack, [imageBuffer, activeWindow]);
		}
	}.bind(this));
};

/**
 * Captures a selected area in a PNG buffer
 *
 * @method captureArea
 * @param {int} [x=0] X-coordinate for area. Uses the left corner of the document as default.
 * @param {int} [y=0] Y-coordinate for area. Uses the top corner of the document as default.
 * @param {int} [width=document.width-x] Width of area to be captured. Uses the rest width of the document as the default.
 * @param {int} [height=document.height-y] Height of area to be captured. Uses the rest height of the document as the default.
 * @param {object} [options] Options for taking the screenshots. See elementCapture for more information on the screenshot options.
 * @param {function} [options.eachFn] Will execute the function on client before each screenshot is taken
 * @param {function} [options.completeFn] Will execute the function on client after all screenshots are taken
 * @param {object[]|Element[]|string[]} [options.blockOuts] List of areas/elements that should be blocked-out
 * @param {object} [options.blockOutColor=black] Color to be used for blocking-out areas {red, green, blue, alpha}
 * @param {int} [options.wait=100] Wait in ms before each screenshot
 * @param {function} [callBack] Callback function that will be triggered with the image-buffer of the area screenshot
 * @throws {Error} When there is no active document available
 * @see Chain.elementCapture
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`imageBuffer`, `element`, `index`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`imageBuffer`** {`Buffer`} - Binary buffer of the PNG image
 * * **`element`** {`Element`} - Selected element
 * * **`index`** {`int`} - Zero-based index of the selected element
 */
Chain.prototype.captureArea = function (x, y, width, height, options, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.captureArea(x, y, width, height, options), function (imageBuffer) {
		if (callBack) {
			return this._scopeCallBack(callBack, [imageBuffer, activeWindow]);
		}
	}.bind(this));
};

/**
 * Compares the whole document with images that were captured previously
 *
 * @method compareDocument
 * @param {string} title Title of the comparison
 * @param {object} [options] Options for the screenshots and compare the data. See elementCapture for more information on the screenshot options.
 * @param {function} [options.eachFn] Will execute the function on client before each screenshot is taken
 * @param {function} [options.completeFn] Will execute the function on client after all screenshots are taken
 * @param {object[]|Element[]|string[]} [options.blockOuts] List of areas/elements that should be blocked-out
 * @param {object} [options.blockOutColor=black] Color to be used for blocking-out areas {red, green, blue, alpha}
 * @param {int} [options.wait=100] Wait in ms before each screenshot
 * @param {object} [options.compare] Options for the comparison. See the [Blink-Diff documentation](https://github.com/yahoo/blink-diff)
 * @param {object} [options.compare.id=1] Additional identifier to differentiate comparison
 * @param {function} [callBack] Callback function that will be triggered with the reuslt of the request
 * @throws {Error} When there is no active document available
 * @see Chain.elementCapture
 * @see Chain.elementCompare
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`isSimilar`, `activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`isSimilar`** {`boolean|null`} - Is comparison similar to previous one?
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 *
 * ---------------------------------------
 *
 * ##Notes
 * See elementCompare for more information on the comparison options.
 */
Chain.prototype.compareDocument = function (title, options, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.compareDocument(title, options), function (isSimilar) {
		if (callBack) {
			return this._scopeCallBack(callBack, [isSimilar, activeWindow]);
		}
	}.bind(this));
};

/**
 * Compares the view-port with images previously taken
 *
 * @method compareViewPort
 * @param {string} title Title of the comparison
 * @param {object} [options] Options for the screenshots and compare the data. See elementCapture for more information on the screenshot options.
 * @param {function} [options.eachFn] Will execute the function on client before each screenshot is taken
 * @param {function} [options.completeFn] Will execute the function on client after all screenshots are taken
 * @param {object[]|Element[]|string[]} [options.blockOuts] List of areas/elements that should be blocked-out
 * @param {object} [options.blockOutColor=black] Color to be used for blocking-out areas {red, green, blue, alpha}
 * @param {int} [options.wait=100] Wait in ms before each screenshot
 * @param {object} [options.compare] Options for the comparison. See the [Blink-Diff documentation](https://github.com/yahoo/blink-diff)
 * @param {object} [options.compare.id=1] Additional identifier to differentiate comparison
 * @param {function} [callBack] Callback function that will be triggered with the result of the request
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @see Chain.elementCapture
 * @see Chain.elementCompare
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`isSimilar`, `activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`isSimilar`** {`boolean|null`} - Is comparison similar to previous one?
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 *
 * ---------------------------------------
 *
 * ##Notes
 * See elementCompare for more information on the comparison options.
 */
Chain.prototype.compareViewPort = function (title, options, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.compareViewPort(title, options), function (isSimilar) {
		if (callBack) {
			return this._scopeCallBack(callBack, [isSimilar, activeWindow]);
		}
	}.bind(this));
};

/**
 * Compares a specific and fixed area of the document with previously captured images
 *
 * @method compareArea
 * @param {string} title Title of the comparison
 * @param {int} [x=0] X-coordinate for area. Uses the left corner of the document as default.
 * @param {int} [y=0] Y-coordinate for area. Uses the top corner of the document as default.
 * @param {int} [width=document.width-x] Width of area to be captured. Uses the rest width of the document as the default.
 * @param {int} [height=document.height-y] Height of area to be captured. Uses the rest height of the document as the default.
 * @param {object} [options] Options for the screenshots and compare the data. See elementCapture for more information on the screenshot options.
 * @param {function} [options.eachFn] Will execute the function on client before each screenshot is taken
 * @param {function} [options.completeFn] Will execute the function on client after all screenshots are taken
 * @param {object[]|Element[]|string[]} [options.blockOuts] List of areas/elements that should be blocked-out
 * @param {object} [options.blockOutColor=black] Color to be used for blocking-out areas {red, green, blue, alpha}
 * @param {int} [options.wait=100] Wait in ms before each screenshot
 * @param {object} [options.compare] Options for the comparison. See the [Blink-Diff documentation](https://github.com/yahoo/blink-diff)
 * @param {object} [options.compare.id=1] Additional identifier to differentiate comparison
 * @param {function} [callBack] Callback function that will be triggered with the result fo the request
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @see Chain.elementCapture
 * @see Chain.elementCompare
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`isSimilar`, `activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`isSimilar`** {`boolean|null`} - Is comparison similar to previous one?
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 *
 * ---------------------------------------
 *
 * ##Notes
 * See elementCompare for more information on the comparison options.
 */
Chain.prototype.compareArea = function (title, x, y, width, height, options, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.compareArea(title, x, y, width, height, options), function (isSimilar) {
		if (callBack) {
			return this._scopeCallBack(callBack, [isSimilar, activeWindow]);
		}
	}.bind(this));
};

/**
 * Activates a selected element
 *
 * @method activeElement
 * @param {function} [callBack] Callback function that will be triggered with the currently active element
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`element`, `active`Window)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`element`** {`Element`} - Currently active element in the active browser document
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.activeElement = function (callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.getActiveElement(), function (element) {
		if (callBack) {
			return this._scopeCallBack(callBack, [element, activeWindow]);
		}
	}.bind(this));
};

/**
 * Closes the currently active window, switching the focus to the next available window
 *
 * @method closeWindow
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.closeWindow = function (callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.close(), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

/**
 * Determines the title of the currently active document
 *
 * @method title
 * @param {function} [callBack] Callback function that will be triggered with the title of the document
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`title`, `activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`title`** {`string`} - Title of the active browser document
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.title = function (callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.getTitle(), function (title) {
		if (callBack) {
			return this._scopeCallBack(callBack, [title, activeWindow]);
		}
	}.bind(this));
};

/**
 * Determines the source-code of the currently active document
 *
 * @method source
 * @param {function} [callBack] Callback function that will be triggered with the source-code of the document
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`source`, `activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`source`** {`string`} - Source-code of the active browser document
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.source = function (callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.getSource(), function (source) {
		if (callBack) {
			return this._scopeCallBack(callBack, [source, activeWindow]);
		}
	}.bind(this));
};

/**
 * Determines the scroll location coordinates within the currently active document
 *
 * @method scrollLocation
 * @param {function} [callBack] Callback function that will be triggered with the scroll-location of the active window
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`coordinates`, `activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`coordinates`** {`object`} - Absolute coordinates of the view-port scroll location
 *     * **`x`** {`int`} - Absolute x-coordinate of the view-port scroll location
 *     * **`y`** {`int`} - Absolute y-coordinate of the view-port scroll location
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.scrollLocation = function (callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.getScrollPosition(), function (coordinates) {
		if (callBack) {
			return this._scopeCallBack(callBack, [coordinates, activeWindow]);
		}
	}.bind(this));
};

/**
 * Scrolls to an absolute scroll location within the currently active document
 *
 * @method scrollTo
 * @param {int} x Absolute x-coordinate to scroll to
 * @param {int} y Absolute y-coordinate to scroll to
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.scrollTo = function (x, y, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.scrollTo(x, y), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

/**
 * Scrolls the currently active document to a specific offset relative to the current scroll location
 *
 * @method scrollBy
 * @param {int} xOffset X-offset to scroll to relative to the current scroll position
 * @param {int} yOffset Y-offset to scroll to relative to the current scroll position
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.scrollBy = function (xOffset, yOffset, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.scrollBy(xOffset, yOffset), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

// ##################
// ActiveWindow-Mouse
// ##################

/**
 * Clicks on the active document at the specified absolute coordinates
 *
 * @method click
 * @param {int} x Absolute x-coordinate to click on
 * @param {int} y Absolute y-coordinate to click on
 * @param {int} [button=Mouse.BUTTON_LEFT] Button that should be pressed when click action is executed.
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 *
 *
 * **Note**
 *
 * You can use the constants available in the mouse-object or submit the following values:
 * * 0 - Left Button
 * * 1 - Middle Button
 * * 2 - Right Button
 */
Chain.prototype.click = function (x, y, button, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.mouse().clickAt(x, y), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

/**
 * Double-clicks on the active document at the specified absolute coordinates
 *
 * @method dblClick
 * @param {int} x Absolute x-coordinate to double-click on
 * @param {int} y Absolute y-coordinate to double-click on
 * @param {int} [button=Mouse.BUTTON_LEFT] Button that should be pressed when click action is executed.
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 *
 *
 * **Note**
 *
 * You can use the constants available in the mouse-object or submit the following values:
 * * 0 - Left Button
 * * 1 - Middle Button
 * * 2 - Right Button
 */
Chain.prototype.dblClick = function (x, y, button, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.mouse().doubleClickAt(x, y), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

/**
 * Hovers the mouse over the active document at the specified absolute coordinates
 *
 * @method hover
 * @param {int} x Absolute x-coordinate to hover above
 * @param {int} y Absolute y-coordinate to hover above
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.hover = function (x, y, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.mouse().moveTo(x, y), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

// ######################
// ActiveWindow-Navigator
// ######################

/**
 * Navigates the current document to the supplied URL
 *
 * @method navigateTo
 * @param {string} url URL that should be navigated to
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.navigateTo = function (url, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.navigator().navigateTo(url), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

/**
 * Determines the current URL of the active document
 *
 * @method url
 * @param {function} [callBack] Callback function that will be called with the URL of the document
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`url`** {`string`} - URL of the active document
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.url = function (callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.navigator().getUrl(), function (url) {
		if (callBack) {
			return this._scopeCallBack(callBack, [url, activeWindow]);
		}
	}.bind(this));
};

/**
 * Goes forward in the document history, equivalent to a user pressing the forward button within the browser
 *
 * @method forward
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.forward = function (callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.navigator().forward(), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

/**
 * Goes backward in the document history, equivalent to a user pressing the back button within the browser
 *
 * @method backward
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.backward = function (callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.navigator().backward(), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

/**
 * Refreshes the current document as if the user pressed the refresh button within the browser
 *
 * @method refresh
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.refresh = function (callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.navigator().refresh(), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

// ##################
// ActiveWindow-Alert
// ##################

/**
 * Determines the text content of the currently displayed dialog
 *
 * @method dialogText
 * @param {function} [callBack] Callback function that will be triggered with the text-content of the dialog
 * @throws {Error} When there is no dialog available
 * @since 0.2.1
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`text`, `activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`text`** {`string`} - Text content of the currently displayed dialog
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 *
 * **Note**
 * This dialog could be an alert, a prompt, or any other browser dialog that the browser supports.
 */
Chain.prototype.dialogText = function (callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.alert().getText(), function (text) {
		if (callBack) {
			return this._scopeCallBack(callBack, [text, activeWindow]);
		}
	}.bind(this));
};

/**
 * Sends a string or a list of key-strokes to the currently displayed dialog.
 *
 * This is useful when there is a `prompt()` currently open, requesting user input.
 *
 * @method dialogSendKeys
 * @param {string|string[]} keys or key-strokes to send
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no dialog available
 * @since 0.2.1
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 *
 * **Note**
 * This dialog could be an alert, a prompt, or any other browser dialog that the browser supports.
 */
Chain.prototype.dialogSendKeys = function (keys, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.alert().setText(keys), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

/**
 * Accepts the currently displayed dialog
 *
 * In most cases, this will be the "OK" button.
 *
 * @method dialogAccept
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no dialog available
 * @since 0.2.1
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 *
 * **Note**
 * This dialog could be an alert, a prompt, or any other browser dialog that the browser supports.
 */
Chain.prototype.dialogAccept = function (callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.alert().accept(), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

/**
 * Dismisses the currently displayed dialog
 *
 * In most cases, this will be the "Cancel" button.
 *
 * @method dialogDismiss
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no dialog available
 * @since 0.2.1
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 *
 * **Note**
 * This dialog could be an alert, a prompt, or any other browser dialog that the browser supports.
 */
Chain.prototype.dialogDismiss = function (callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.alert().dismiss(), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

// ##################
// ActiveWindow-Frame
// ##################

/**
 * Activates one of the available frames within the currently active document
 *
 * @method activateFrame
 * @param {string} id Identifier of the frame to activate
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @since 0.2.0
 * @chainable
 * @throws {Error} When there is no active document available
 * @throws {Error} When the frame identified by the id doesn't exist
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.activateFrame = function (id, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.frame().activate(id), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

/**
 * Activates the parent frame (i.e. the document) when a frame was previously activated.
 *
 * @method activateParentFrame
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.activateParentFrame = function (callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.frame().activateParent(), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

// ##################
// Browser
// ##################

/**
 * Activates a window, switching the currently active document
 *
 * If you have multiple documents, you need to switch to each in turn to interact with them.
 * You can only interact with the currently active document.
 * That is where this function call comes in handy.
 *
 * @method activateWindow
 * @param {string} id Identifier of a window. This might have been given by some executing JavaScript within the browser.
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @since 0.2.0
 * @chainable
 * @throws {Error} When there is no active document available
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`browser`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`browser`** {`Browser`} - The browser session
 */
Chain.prototype.activateWindow = function (id, callBack) {
	var browser = this._driver.browser();

	return when(browser.activateWindow(id), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [browser]);
		}
	}.bind(this));
};

/**
 * Determines a list of available windows/documents within the same browser session
 *
 * @method windows
 * @param {function} [callBack] Callback function that will be triggered with a list of available windows
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`windows`, `browser`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`windows`** {`WindowHandler[]`} - A list of window objects that are open in the browser
 * * **`browser`** {`Browser`} - The browser session
 */
Chain.prototype.windows = function (callBack) {
	var browser = this._driver.browser();

	return when(browser.getWindows(), function (windows) {
		if (callBack) {
			return this._scopeCallBack(callBack, [windows, browser]);
		}
	}.bind(this));
};

// ##################
// Driver
// ##################

/**
 * Puts Taxi to sleep for a specific amount of time
 *
 * @method sleep
 * @param {int} ms Time in milliseconds to wait
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.sleep = function (ms, callBack) {
	return when(this._driver.utils().sleep(ms), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [this._driver.browser().activeWindow()]);
		}
	}.bind(this));
};

/**
 * Completes the session by finishing up comparison tasks and closing the browser window
 *
 * **Note**
 * You cannot chain after this function call anymore, and the driver will be closed so that
 * there is no way anymore to access the browser through the same session.
 * To get access again to the browser, you need to create a whole new Taxi instance.
 *
 * @method end
 * @since 0.2.0
 * @return {Driver}
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > none
 */
Chain.prototype.end = function () {
	this._driver.dispose();
	return this.driver();
};

// ##################
// Wait
// ##################

/**
 * Waits for a specific amount of time that an element disappears from the DOM
 *
 * @method waitForElementNotPresent
 * @param {string} selector CSS selector of DOM elements
 * @param {int} [timeOut=10000] Max. time-out in waiting on the element
 * @param {boolean} [abortOnFailure=true] Should an exception be thrown when time-out is reached?
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.waitForElementNotPresent = function (selector, timeOut, abortOnFailure, callBack) {
	var activeWindow = this._driver.browser().activeWindow(),
		msg = "Element " + selector + " was in the page for " + timeOut + " ms";

	return when(this._driver.utils().waitUntil(function () {
		return when(activeWindow.getElements(selector), function (elements) {
			return (elements.length == 0);
		});
	}.bind(this), timeOut || 10000, 500, msg, function () {
		return (abortOnFailure === undefined) || abortOnFailure;
	}), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

/**
 * Waits for a specific amount of time that an element will be hidden
 *
 * @method waitForElementNotDisplayed
 * @param {string} selector CSS selector of DOM elements
 * @param {int} [timeOut=10000] Max. time-out in waiting on the element
 * @param {boolean} [abortOnFailure=true] Should an exception be thrown when time-out is reached?
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.waitForElementNotDisplayed = function (selector, timeOut, abortOnFailure, callBack) {
	var activeWindow = this._driver.browser().activeWindow(),
		msg = "Element " + selector + " was displayed in the page for " + timeOut + " ms";

	return when(this._driver.utils().waitUntil(function () {
		return when(activeWindow.getElements(selector), function (elements) {
			if (elements.length > 0) {
				return when(elements[0].isDisabled(), function () {});
			}
		});
	}.bind(this), timeOut, 500, msg, function () {
		return (abortOnFailure === undefined) || abortOnFailure;
	}), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

/**
 * Waits for a specific amount of time that an element appears in the DOM
 *
 * @method waitForElementPresent
 * @param {string} selector CSS selector of DOM elements
 * @param {int} [timeOut=10000] Max. time-out in waiting on the element
 * @param {boolean} [abortOnFailure=true] Should an exception be thrown when time-out is reached?
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.waitForElementPresent = function (selector, timeOut, abortOnFailure, callBack) {
	var activeWindow = this._driver.browser().activeWindow(),
		msg = "Element " + selector + " was not in the page for " + timeOut + " ms";

	return when(this._driver.utils().waitUntil(function () {
		return when(activeWindow.getElements(selector), function (elements) {
			return (elements.length != 0);
		});
	}.bind(this), timeOut, 500, msg, function () {
		return (abortOnFailure === undefined) || abortOnFailure;
	}), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

/**
 * Waits for a specific amount of time that an element will be shown
 *
 * @method waitForElementDisplay
 * @param {string} selector CSS selector of DOM elements
 * @param {int} [timeOut=10000] Max. time-out in waiting on the element
 * @param {boolean} [abortOnFailure=true] Should an exception be thrown when time-out is reached?
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @throws {Error} When there is no active document available
 * @since 0.2.0
 * @chainable
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.waitForElementDisplay = function (selector, timeOut, abortOnFailure, callBack) {
	var activeWindow = this._driver.browser().activeWindow(),
		msg = "Element " + selector + " was not displayed in the page for " + timeOut + " ms";

	return when(this._driver.utils().waitUntil(function () {
		return when(activeWindow.getElements(selector), function (elements) {
			if (elements.length > 0) {
				return when(elements[0].isDisabled(), function () {});
			}
		});
	}.bind(this), timeOut, 500, msg, function () {
		return (abortOnFailure === undefined) || abortOnFailure;
	}), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};


/**
 * Determines the size of the active window
 *
 * @method size
 * @param {function} [callBack] Callback function that will be triggered with the size of the window
 * @since 0.2.2
 * @chainable
 * @throws {Error} When there is no active document available
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`size`, `activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`size`** {`object`} - Size of the selected element
 *     * **`width`** {`int`} - Width of the selected element
 *     * **`height`** {`int`} - Height of the selected element
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.size = function (callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.getSize(), function (size) {
		if (callBack) {
			return this._scopeCallBack(callBack, [size, activeWindow]);
		}
	}.bind(this));
};

/**
 * Re-sizes the active window
 *
 * @method resize
 * @param {int} width Width of the window
 * @param {int} height Height of the window
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @since 0.2.2
 * @chainable
 * @throws {Error} When there is no active document available
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.resize = function (width, height, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.resize(width, height), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

/**
 * Determines the absolute location of the active window
 *
 * @method location
 * @param {function} [callBack] Callback function that will be triggered with the location of the window
 * @since 0.2.2
 * @chainable
 * @throws {Error} When there is no active document available
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`location`, `activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`location`** {`object`} - Absolute location of the selected element
 *     * **`x`** {`int`} - Absolute x-coordinate of the selected element
 *     * **`y`** {`int`} - Absolute y-coordinate of the selected element
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.location = function (callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.getPosition(), function (location) {
		if (callBack) {
			return this._scopeCallBack(callBack, [location, activeWindow]);
		}
	}.bind(this));
};

/**
 * Determines the absolute location of the active window
 *
 * @method relocate
 * @param {int} x Absolute x-coordinate of the next window location
 * @param {int} y Absolute y-coordinate of the next window location
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @since 0.2.2
 * @chainable
 * @throws {Error} When there is no active document available
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.relocate = function (x, y, callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.position(x, y), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};

/**
 * Expands the active window to its maximum size
 *
 * @method maximize
 * @param {function} [callBack] Callback function that will be triggered when the action completes
 * @since 0.2.2
 * @chainable
 * @throws {Error} When there is no active document available
 * @return {Chain} The chain object
 *
 * ---------------------------------------
 *
 * ##Callback function
 * > function (`activeWindow`)
 *
 * ###Scope
 * > {`Chain`}
 *
 * ###Parameters
 * * **`activeWindow`** {`ActiveWindow`} - Active browser document/window
 */
Chain.prototype.maximize = function (callBack) {
	var activeWindow = this._driver.browser().activeWindow();

	return this._driverAction(activeWindow.maximize(), function () {
		if (callBack) {
			return this._scopeCallBack(callBack, [activeWindow]);
		}
	}.bind(this));
};


logMethods(Chain.prototype);
