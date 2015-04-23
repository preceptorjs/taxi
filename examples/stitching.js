var taxi = require('..');
var chromedriver = require('chromedriver');
var fs = require('fs');

var user = process.env.SAUCE_USERNAME;
var accessKey = process.env.SAUCE_ACCESS_KEY;

var sauceLabsUrl = "http://" + user + ":" + accessKey + "@ondemand.saucelabs.com/wd/hub";

var tests = [
	{ url:'http://localhost:9515/', capabilities: { browserName:'chrome' }, beforeFn: function () { chromedriver.start(); }, afterFn: function () { chromedriver.stop() } },

	{ url:'http://localhost:9517/', capabilities: { browserName:'phantomjs', browserVersion:'1.9.8' } },
	{ url:'http://localhost:4444/wd/hub', capabilities: { browserName:'firefox' } },

	{ url:'http://makingshaking.corp.ne1.yahoo.com:4444', capabilities: { browserName:'phantomjs', browserVersion: '2.0.0 dev' } },

	{ url:sauceLabsUrl, capabilities: { browserName:'chrome', version:'41.0', platform:'Windows 8.1' } },

	{ url:sauceLabsUrl, capabilities: { browserName:'firefox', version:'37.0', platform:'Windows 8.1' } },

	{ url:sauceLabsUrl, capabilities: { browserName:'internet explorer', version:'11.0', platform:'Windows 8.1' } },
	{ url:sauceLabsUrl, capabilities: { browserName:'internet explorer', version:'10.0', platform:'Windows 8' } },
	{ url:sauceLabsUrl, capabilities: { browserName:'internet explorer', version:'9.0', platform:'Windows 7' } },

	{ url:sauceLabsUrl, capabilities: { browserName:'safari', version:'5.1', platform:'Windows 7' } },
	{ url:sauceLabsUrl, capabilities: { browserName:'safari', version:'8.0', platform:'OS X 10.10' } },

	{ url:sauceLabsUrl, capabilities: { browserName:'iphone', version:'8.2', platform: 'OS X 10.10', deviceName:'iPad Simulator', "device-orientation":'portrait' } },
	{ url:sauceLabsUrl, capabilities: { browserName:'iphone', version:'8.2', platform: 'OS X 10.10', deviceName:'iPad Simulator', "device-orientation":'landscape' } },
	{ url:sauceLabsUrl, capabilities: { browserName:'iphone', version:'8.2', platform: 'OS X 10.10', deviceName:'iPhone Simulator', "device-orientation":'portrait' } },
	{ url:sauceLabsUrl, capabilities: { browserName:'iphone', version:'8.2', platform: 'OS X 10.10', deviceName:'iPhone Simulator', "device-orientation":'landscape' } }
];

tests.forEach(function (test) {

	// Do we need to run something before the test-run?
	if (test.beforeFn) {
		test.beforeFn();
	}

	try {
		var driver = taxi(test.url, test.capabilities, {mode: taxi.Driver.MODE_SYNC, debug: true, httpDebug: true});

		var browser = driver.browser();
		var activeWindow = browser.activeWindow();

		// Navigate to Yahoo
		activeWindow.navigator().setUrl('http://www.yahoo.com');

		var browserId = (driver.deviceName() != '' ? driver.deviceName() : driver.browserName()) + " " + driver.deviceOrientation() + " " + driver.browserVersion() + " " + driver.platform();

		// Write screenshot to a file
		fs.writeFileSync(__dirname + '/' + browserId.trim() + '.png', activeWindow.documentScreenshot({

			eachFn: function (index) {

				// Remove the header when the second screenshot is reached.
				// The header keeps following the scrolling position.
				// So, we want to turn it off here.
				if (index >= 1 && document.getElementById('masthead')) {
					document.getElementById('masthead').style.display = 'none';
				}
			},

			completeFn: function () {

				// When it has a "masthead", then display it again
				if (document.getElementById('masthead')) {
					document.getElementById('masthead').style.display = '';
				}
			},

			// Here is a list of areas that should be blocked-out
			blockOuts: [

				// Block-out all text-boxes
				'input',

				// Custom block-out at static location with custom color
				{x:60, y: 50, width: 200, height: 200, color:{red:255,green:0,blue:128}}
			]
			// The element cannot be found in mobile browsers since they have a different layout
			//, activeWindow.getElement('.footer-section')]
		}));
	} catch (err) {
		console.error(err.stack);

	} finally {

		driver.dispose();

		// Do we need to run something after the test-run?
		if (test.afterFn) {
			test.afterFn();
		}
	}
});
