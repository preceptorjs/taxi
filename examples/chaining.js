var taxi = require('..');

// Connect in synchronous mode to a locally started Selenium stand-alone server,
// starting-up a session with a locally installed Firefox browser.
// The client is set in "SYNC"-mode which means that calls are synchronous;
// whenever Taxi makes a request to the browser, it will wait until it finishes it.
var driver = taxi('http://localhost:4444/wd/hub', { browserName:'firefox' }, { mode: taxi.Driver.MODE_SYNC });

// Don't fail the comparison when a difference is found.
// This will only create a difference image.
driver.setValue('blinkDiff.failOnDifference', false);

try {

	// Start chaining
	driver.chain()

		// Navigate to an url - to Yahoo in this case
		.navigateTo('http://www.yahoo.com')

		// Enter a search term - here it is "apple"
		.elementSendKeys('.searchwrapper .input-wrapper input', 'apple')
		.elementClick('button.searchsubmit')

		// Get the title of the page...
		.title(function (title) {

			// ...and print it to the console
			console.log(title);

			// Here, we are comparing the Apple inset on the top-right corner
			// It doesn't have to be called in this context, it is just here
			// as an example
			this.elementCompare('.searchRightTop', 'Apple Inset');
		})

		// With this we can refresh the page
		.refresh()

		// Get all elements with this selector
		.elements('.searchCenterMiddle .compTitle', function (element) {

			// Switching to OOP interface to do some context dependent selection
			// The context is now the one of the found elements and
			// the selector ".title" is applied to the children of that element.
			// This is only possible with the OOP interface.
			// This is the title of a search result entry.
			console.log(element.getElement('.title').getText());

			// Here another example using the OOP interface with the chain-interface:
			// We check if the DOM-element below the found element exist, and then
			// we will print it content.
			// This is the url of a search-result entry.
			if (element.hasElement('div span')) {
				console.log(element.getElement('div span').getText());
			}
		})

		// Make sure to complete the chaining,
		// otherwise the browser stays open.
		.end();

} catch (err) {

	// Print out the stack-trace of the error that occurred.
	console.error(err.stack);

	// Should an error occur, then close the browser here too
	// since the "end()" call is skipped.
	// You could also call "driver.chain().end()".
	// This is just another way of writing the same thing.
	// It is part of the OOP interface.
	driver.dispose();
}
