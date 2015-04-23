var taxi = require('..');

// Here, we are connecting to a local Selenium standalone server in sync-mode.
// However, the comparison feature will also work exactly the same in asynchronous mode.
var driver = taxi('http://localhost:4444/wd/hub', { browserName:'firefox' }, { mode: taxi.Driver.MODE_SYNC });

try {
	// Prepare objects for use later - some convenience variables, avoiding to repeat ourselves
	var browser = driver.browser();
	var activeWindow = browser.activeWindow();

	// Navigate to Yahoo
	activeWindow.navigator().setUrl('http://www.yahoo.com');

	// Compare the whole document with previous runs
	activeWindow.compareDocument('Yahoo Page');

	// When you look now in the current working directory,
	// you should see a new folder called "firefox" (since we use Firefox).
	// Within the folder, there should be a file called "Yahoo-Page_1_build.png".
	// This is the screenshot we took. Taxi sees that there is no approved image
	// and only saves the current screenshot.
	//
	// Now, you could approve this screenshot by removing the "_build" at the end of the file.
	//
	// If you run the script again, then the test will fail and you will see two additional files:
	// - Yahoo-Page_1_build.png - The most recent screenshot.
	// - Yahoo-Page_1_diff.png - The comparison of the approved and the build image merged into one.
	//
	// Congratulations! You ran your first visual regression test!

} finally {
	// Close browser
	driver.dispose();
}
