var assert = require('assert');
var taxi = require('taxi');

// Connect to a local Selenium stand-alone server and connect to firefox in asynchronous mode.
var driver = taxi('http://localhost:4444/wd/hub', { browserName:'firefox' }, { mode: taxi.Driver.MODE_ASYNC });

// Prepare access to objects
var browser = driver.browser();
var activeWindow = browser.activeWindow();

// Navigate to the example homepage
activeWindow.navigator().setUrl('http://www.example.com').then(function () {

	// Get the text of the title element
	return activeWindow.getElement('h1').getText();

}).then(function (text) {

	// Assert that the title is correct
	assert.equal(text, 'Example Domain');

	// Click on the header - only for demo; doesn't make much sense here
	return activeWindow.getElement('h1').mouse().click().then(function () {

		// The "then()" call just continues the chain. We could have also returned here,
		// and added the "then()" after the outer function as we did with all other calls.
		// This is just to show another alternative. This is useful if you want to get some
		// data and want to act on it.

		// Click on a specific coordinate within the window - again just for demo purposes
		return activeWindow.mouse().clickAt(500, 200);
	});

}).then(function () {

	// Close active window
	activeWindow.close();

}).then(null, function (err) {

	// Catch errors that happen during execution
	// since they otherwise will be lost.
	console.error(err.stack);

}).then(function () {

	// Close browser
	driver.dispose();
});
