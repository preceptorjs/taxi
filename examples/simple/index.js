var assert = require('assert');
var taxi = require('../..');

var driver = taxi('http://localhost:4444/wd/hub', { browserName:'firefox' }, { mode: taxi.Driver.MODE_SYNC });
var browser = driver.browser();
var activeWindow = browser.activeWindow();

// Set url and assert a header-text
activeWindow.navigator().setUrl('http://www.example.com');
assert.equal(activeWindow.getElement('h1').getText(), 'Example Domain');

// Click on element
activeWindow.getElement('h1').mouse().click();

// Click on a specific coordinate
activeWindow.mouse().clickAt(500, 200);

// Close active window
activeWindow.close();

driver.dispose();
