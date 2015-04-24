var assert = require('assert');
var taxi = require('..');

console.time('test');

// Connect to a local Selenium stand-alone server and connect to firefox in synchronous mode.
var driver = taxi('http://localhost:4444/wd/hub', { browserName:'firefox' }, { mode: taxi.Driver.MODE_SYNC });

// Prepare access to objects
var browser = driver.browser();
var activeWindow = browser.activeWindow();

// Navigate to the example homepage
activeWindow.navigator().setUrl('http://www.example.com');

// Get the text of the title element and assert that the title is correct
assert.equal(activeWindow.getElement('h1').getText(), 'Example Domain');

// Click on the header - only for demo; doesn't make much sense here
activeWindow.getElement('h1').mouse().click();

// Click on a specific coordinate within the window - again just for demo purposes
activeWindow.mouse().clickAt(500, 200);

// Close active window
activeWindow.close();

console.timeEnd('test');

// Close browser
driver.dispose();
