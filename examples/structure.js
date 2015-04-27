var taxi = require('..');
var fs = require('fs');
var PNGImage = require('pngjs-image');

var loadStructure = require('../lib/scripts/structure').load;

var user = process.env.SAUCE_USERNAME;
var accessKey = process.env.SAUCE_ACCESS_KEY;

var sauceLabsUrl = "http://" + user + ":" + accessKey + "@ondemand.saucelabs.com/wd/hub";

var tests = [
	//{ url:'http://localhost:9515/', capabilities: { browserName:'chrome' }, beforeFn: function () { chromedriver.start(); }, afterFn: function () { chromedriver.stop() } },
    //
	//{ url:'http://localhost:9517/', capabilities: { browserName:'phantomjs', browserVersion:'1.9.8' } },
	{ url:'http://localhost:4444/wd/hub', capabilities: { browserName:'firefox' } },
    //
	//{ url:'http://makingshaking.corp.ne1.yahoo.com:4444', capabilities: { browserName:'phantomjs', browserVersion: '2.0.0 dev' } },
    //
	//{ url:sauceLabsUrl, capabilities: { browserName:'chrome', version:'41.0', platform:'Windows 8.1' } },
    //
	//{ url:sauceLabsUrl, capabilities: { browserName:'firefox', version:'37.0', platform:'Windows 8.1' } },
    //
	//{ url:sauceLabsUrl, capabilities: { browserName:'internet explorer', version:'11.0', platform:'Windows 8.1' } },
	//{ url:sauceLabsUrl, capabilities: { browserName:'internet explorer', version:'10.0', platform:'Windows 8' } },
	//{ url:sauceLabsUrl, capabilities: { browserName:'internet explorer', version:'9.0', platform:'Windows 7' } },
    //
	//{ url:sauceLabsUrl, capabilities: { browserName:'safari', version:'5.1', platform:'Windows 7' } },
	//{ url:sauceLabsUrl, capabilities: { browserName:'safari', version:'8.0', platform:'OS X 10.10' } },
    //
	//{ url:sauceLabsUrl, capabilities: { browserName:'iphone', version:'8.2', platform: 'OS X 10.10', deviceName:'iPad Simulator', "device-orientation":'portrait' } },
	//{ url:sauceLabsUrl, capabilities: { browserName:'iphone', version:'8.2', platform: 'OS X 10.10', deviceName:'iPad Simulator', "device-orientation":'landscape' } },
	//{ url:sauceLabsUrl, capabilities: { browserName:'iphone', version:'8.2', platform: 'OS X 10.10', deviceName:'iPhone Simulator', "device-orientation":'portrait' } },
	//{ url:sauceLabsUrl, capabilities: { browserName:'iphone', version:'8.2', platform: 'OS X 10.10', deviceName:'iPhone Simulator', "device-orientation":'landscape' } }
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

		var buffer = activeWindow.captureDocument();
		var image = PNGImage.loadImageSync(buffer);

		var structure = JSON.parse(activeWindow.execute(loadStructure));

		function drawNode (node, image) {
			if (node.width) {
				drawRect(image, node.x, node.y, node.width, node.height, {red: 255, green: 0, blue: 0});
			}
			for(var i = 0; i < node.nodes.length; i++) {
				drawNode(node.nodes[i], image);
			}
		}
		function drawRect (image, x, y, width, height, color) {

			var i,
				index;

			for (i = x; i < x + width; i++) {
				index = image.getIndex(i, y);
				image.setAtIndex(index, color);

				index = image.getIndex(i, y + height);
				image.setAtIndex(index, color);
			}

			for (i = y; i < y + height; i++) {
				index = image.getIndex(x, i);
				image.setAtIndex(index, color);

				index = image.getIndex(x + width, i);
				image.setAtIndex(index, color);
			}
		}
		drawNode(structure.dom, image);
		structure.dom = null;
		console.log(JSON.stringify(structure, null, 4));

		// Write screenshot to a file
		fs.writeFileSync(__dirname + '/structure.png', image.toBlobSync());
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
