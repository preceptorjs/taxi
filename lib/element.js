'use strict';

var logMethods = require('./log');
var type = require('./type');
var when = require('./when');

var Mouse = require('./mouse');
var Touch = require('./touch');

var Screenshot = require('./helpers/screenshot');

module.exports = Element;

/**
 * Object representing a DOM-Element
 *
 * @constructor
 * @class Element
 * @module WebDriver
 * @submodule Core
 * @param {Driver} driver
 * @param {Browser|Element} parent
 * @param {String} selector
 * @param {String} id
 */
function Element (driver, parent, selector, id) {
  this._driver = driver;
  this._parent = parent;
  this._selector = selector;
  this._id = id;
}


//////////////////
// Enumerations //
//////////////////

/**
 * Class-name selector type
 *
 * @static
 * @property SELECTOR_CLASS
 * @type {string}
 */
Element.SELECTOR_CLASS = 'class name';

/**
 * Css selector type, using the native css selector support
 *
 * @static
 * @property SELECTOR_CSS
 * @type {string}
 */
Element.SELECTOR_CSS = 'css selector';

/**
 * Id selector type
 *
 * @static
 * @property SELECTOR_ID
 * @type {string}
 */
Element.SELECTOR_ID = 'id';

/**
 * Name selector type
 *
 * @static
 * @property SELECTOR_NAME
 * @type {string}
 */
Element.SELECTOR_NAME = 'name';

/**
 * Link text selector type, finding a link that fits the selector.
 * The full link-text needs to match.
 *
 * @static
 * @property SELECTOR_LINK_TEXT
 * @type {string}
 */
Element.SELECTOR_LINK_TEXT = 'link text';

/**
 * Partial-link text selector type, finding a link that partially fits the selector.
 * Only a part of the link-text needs to match.
 *
 * @static
 * @property SELECTOR_PARTIAL
 * @type {string}
 */
Element.SELECTOR_PARTIAL_LINK_TEXT = 'partial link text';

/**
 * Tag-name selector type
 *
 * @static
 * @property SELECTOR_TAG
 * @type {string}
 */
Element.SELECTOR_TAG = 'tag name';

/**
 * XPath selector type
 *
 * @static
 * @property SELECTOR_XPATH
 * @type {string}
 */
Element.SELECTOR_XPATH = 'xpath';


/////////////////////
// Private Methods //
/////////////////////

/**
 * Logs a method call by an event
 *
 * @param {object} event
 * @method _logMethodCall
 * @protected
 */
Element.prototype._logMethodCall = function (event) {
  event.target = 'Element';
  event.selector = this._selector;
  this._parent._logMethodCall(event);
};


/**
 * Performs a context dependent JSON request for the current session.
 * The result is parsed for errors.
 *
 * @method _requestJSON
 * @protected
 * @param {String} method
 * @param {String} path
 * @param {*} [body]
 * @return {*}
 */
Element.prototype._requestJSON = function (method, path, body) {
  return this._driver._requestJSON(method, '/element/' + this._id.ELEMENT + path, body);
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
Element.prototype.getDriver = function () {
  return this._driver;
};


/**
 * Gets the mouse object.
 * Direct-access. No need to wait.
 *
 * @method mouse
 * @return {Mouse}
 */
Element.prototype.mouse = function () {
  return new Mouse(this._driver, this);
};

/**
 * Gets the touch object.
 * Direct-access. No need to wait.
 *
 * @method touch
 * @return {Touch}
 */
Element.prototype.touch = function () {
  return new Touch(this._driver, this);
};


/**
 * Gets the value of the element id
 * Direct-access. No need to wait.
 *
 * @method elementId
 * @return {String}
 */
Element.prototype.elementId = function () {
  return this._id.ELEMENT;
};

/**
 * Gets the internal selenium handler object
 * Direct-access. No need to wait.
 *
 * @method elementHandler
 * @return {Object}
 */
Element.prototype.elementHandler = function () {
  return this._id;
};


/**
 * Gets the value of an attribute.
 *
 * @method getAttribute
 * @param {String} attribute
 * @return {String}
 */
Element.prototype.getAttribute = function (attribute) {
  type('attribute', attribute, 'String');
  return this._requestJSON('GET', '/attribute/' + attribute);
};

/**
 * Does the element have a specific class?
 *
 * @method hasClass
 * @param {String} classStr
 * @return {boolean}
 */
Element.prototype.hasClass = function (classStr) {
  type('classStr', classStr, 'String');
  return when(this.getClasses(), function (classes) {
    return (classes.indexOf(classStr) !== -1);
  });
};

/**
 * Gets a list of used classes
 *
 * @method getClasses
 * @return {string[]}
 */
Element.prototype.getClasses = function () {
  return when(this.getAttribute('class'), function (fullClassStr) {
    return fullClassStr.split(/\s*[\s,]\s*/);
  });
};



/**
 * Gets the text body of an element.
 *
 * @method getText
 * @return {String}
 */
Element.prototype.getText = function () {
  return this._requestJSON('GET', '/text');
};

/**
 * Does the element have a specific text-string?
 *
 * @method hasText
 * @param {String} text
 * @return {boolean}
 */
Element.prototype.hasText = function (text) {
  type('text', text, 'String');
  return when(this.getText(), function (content) {
    return !!content.match(new RegExp(text));
  });
};


/**
 * Gets the value of an element.
 *
 * Note:
 * The element needs to have a 'value' attribute for this to work.
 *
 * @method getValue
 * @return {String}
 */
Element.prototype.getValue = function () {
    return this.getAttribute('value');
};


/**
 * Gets the tag-name of an element.
 *
 * @method getTagName
 * @return {String}
 */
Element.prototype.getTagName = function () {
  return this._requestJSON('GET', '/name');
};

/**
 * Query the value of an element's computed CSS property. The CSS property to query
 * should be specified using the CSS property name, not the JavaScript property name
 * (e.g. background-color instead of backgroundColor).
 *
 * @method getCssValue
 * @return {String}
 */
Element.prototype.getCssValue = function (property) {
  type('property', property, 'String');
  return this._requestJSON('GET', '/css/' + property);
};


/**
 * Return true if the element is currently displayed on the page
 *
 * @method isDisplayed
 * @return {Boolean}
 */
Element.prototype.isDisplayed = function () {
  return this._requestJSON('GET', '/displayed');
};


/**
 * Return true if the form element is selected
 *
 * @method isSelected
 * @return {Boolean}
 */
Element.prototype.isSelected = function () {
  return this._requestJSON('GET', '/selected');
};

/**
 * Return true if the current element is equal to the supplied element
 *
 * @method isEqual
 * @param {Element} element
 * @return {Boolean}
 */
Element.prototype.isEqual = function (element) {
  type('element', element, 'Object');
  return this._requestJSON('GET', '/equals/' + element.elementId());
};

/**
 * Return true if the form element is enabled
 *
 * @method isEnabled
 * @return {Boolean}
 */
Element.prototype.isEnabled = function () {
  return this._requestJSON('GET', '/enabled');
};

/**
 * Return true if the form element is disabled
 *
 * @method isDisabled
 * @return {Boolean}
 */
Element.prototype.isDisabled = function () {
  return when(this.isEnabled(), function (enabled) {
    return !enabled;
  });
};


// todo: uploading files ala wd.Element.sendKeys

/**
 * Type a string of characters into an input
 *
 * @method sendKeys
 * @param {String|Array.<String>} str
 */
Element.prototype.sendKeys = function (str) {
  type('str', str, 'String|Array.<String>');
  return this._requestJSON('POST', '/value', { value: Array.isArray(str) ? str : [str] });
};


/**
 * Clear the value of an input
 *
 * @method clear
 */
Element.prototype.clear = function () {
  return this._requestJSON('POST', '/clear');
};


/**
 * Submit a form element
 *
 * @method submit
 */
Element.prototype.submit = function () {
  return this._requestJSON('POST', '/submit');
};


/**
 * Gets the size of an element
 *
 * @method getSize
 * @return {Object} `{width: number, height: number}`
 */
Element.prototype.getSize = function () {
  return this._requestJSON('GET', '/size');
};

/**
 * Gets the position of an element
 *
 * @method getPosition
 * @return {Object} `{x: number, y: number}`
 */
Element.prototype.getPosition = function () {
  return this._requestJSON('GET', '/location');
};

/**
 * Gets the position of an element in the current view
 *
 * @method getPosition
 * @return {Object} `{x: number, y: number}`
 */
Element.prototype.getPositionInView = function () {
  return this._requestJSON('GET', '/location_in_view');
};

/**
 * Get the frame of an element
 *
 * @method getFrame
 * @return {Object} `{x: number, y: number, width: number, height: number}`
 */
Element.prototype.getFrame = function () {
  return when(this.getPosition(), function (location) {
    return when(this.getSize(), function (size) {
      return {
        x: location.x,
        y: location.y,
        width: size.width,
        height: size.height
      };
    }.bind(this));
  }.bind(this));
};

/**
 * Gets the absolute center of an element
 *
 * @method getAbsoluteCenter
 * @return {Object} `{x: number, y: number}`
 */
Element.prototype.getAbsoluteCenter = function () {
  return when(this.getFrame(), function (rect) {
    return {
      x: Math.floor(rect.width / 2) + rect.x,
      y: Math.floor(rect.height / 2) + rect.y
    };
  }.bind(this));
};

/**
 * Gets the relative center of an element
 *
 * @method getRelativeCenter
 * @return {Object} `{x: number, y: number}`
 */
Element.prototype.getRelativeCenter = function () {
  return when(this.getSize(), function (size) {
    return {
      x: Math.floor(size.width / 2),
      y: Math.floor(size.height / 2)
    };
  }.bind(this));
};


/**
 * Gets an element via a selector.
 * Will throw an error if the element does not exist.
 *
 * @method getElement
 * @param {String} selector
 * @param {String} [selectorType='css selector']
 * @return {Element}
 */
Element.prototype.getElement = function (selector, selectorType) {
  type('selector', selector, 'String');
  type('selectorType', selectorType, 'String?');

  return when(this._requestJSON('POST', '/element', {
    using: selectorType || Element.SELECTOR_CSS,
    value: selector
  }), function (element) {
    return new Element(this._driver, this, [this._selector, selector].join(' '), element);
  }.bind(this));
};

/**
 * Gets elements via a selector.
 *
 * @method getElements
 * @param {String} selector
 * @param {String} [selectorType='css selector']
 * @return {Array.<Element>}
 */
Element.prototype.getElements = function (selector, selectorType) {
  type('selector', selector, 'String');
  type('selectorType', selectorType, 'String?');

  return when(this._requestJSON('POST', '/elements', {
    using: selectorType || Element.SELECTOR_CSS,
    value: selector
  }), function (elements) {
    return elements.map(function (element) {
      return new Element(this._driver, this, [this._selector, selector].join(' '), element);
    }.bind(this));
  }.bind(this));
};

/**
 * Does a specific element exist?
 *
 * @method hasElement
 * @param {String} selector
 * @param {String} [selectorType='css selector']
 * @return {boolean}
 */
Element.prototype.hasElement = function (selector, selectorType) {
  return when(this.getElements(selector, selectorType), function (elements) {
    return (elements.length > 0);
  });
};



/**
 * Takes a screenshot of the document
 *
 * @method documentScreenshot
 * @param {Object} [options]
 * @param {function} [options.eachFn] Will execute method on client before each screenshot is taken. First parameter is index of screenshot.
 * @param {function} [options.completeFn] Will execute method on client after all screenshots are taken.
 * @param {object[]|Element[]|string[]} [options.blockOuts] List of areas/elements that should be blocked-out
 * @param {object} [options.blockOutColor=black] Color to be used for blocking-out areas {red, green, blue, alpha}
 * @param {int} [options.wait=100] Wait in ms before each screenshot
 * @return {Buffer} Binary image buffer
 */
Element.prototype.screenshot = function (options) {

	options = options || {};

	return when(this.getFrame(), function (frame) {
		var screenshot = new Screenshot(this.getDriver());
		options.context = this;
		return screenshot.areaScreenshot(frame.x, frame.y, frame.width, frame.height, options);
	}.bind(this));
};

/**
 * Compares the screenshot of the element with a previous screenshot, showing differences between them
 *
 * @method compare
 * @param {string} title Unique title for comparison
 * @param {object} [options]
 * @param {function} [options.eachFn] Will execute method on client before each screenshot is taken. First parameter is index of screenshot.
 * @param {function} [options.completeFn] Will execute method on client after all screenshots are taken.
 * @param {object[]|Element[]|string[]} [options.blockOuts] List of areas/elements that should be blocked-out
 * @param {object} [options.blockOutColor=black] Color to be used for blocking-out areas {red, green, blue, alpha}
 * @param {int} [options.wait=100] Wait in ms before each screenshot
 * @param {object} [options.compare] Options for the comparison. See Blink-Diff documentation.
 * @param {object} [options.compare.id=1] Additional identifier to differentiate comparisons even more.
 * @return {boolean|null} Are the screenshots the same? (NULL if there is nothing to compare to)
 */
Element.prototype.compare = function (title, options) {
	options = options || {};

	return when(this.screenshot(options), function (buffer) {
		return this.getDriver()._comparison.compare(title, buffer, options.compare);
	}.bind(this));
};


logMethods(Element.prototype);
