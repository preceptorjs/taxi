var taxi = require('..');

var driver = taxi('http://localhost:4444/wd/hub', { browserName:'firefox' }, { mode: taxi.Driver.MODE_SYNC });

try {
	var browser = driver.browser();
	var activeWindow = browser.activeWindow();

	activeWindow.navigator().setUrl('http://www.yahoo.com');

	activeWindow.compareDocument('Example Page');

} finally {
	driver.dispose();
}
