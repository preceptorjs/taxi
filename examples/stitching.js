var taxi = require('..');
var chromedriver = require('chromedriver');

chromedriver.start();

var driver = taxi('http://localhost:9515/', { browserName:'chrome' }, { mode: taxi.Driver.MODE_SYNC, debug: true, httpDebug: true });
var browser = driver.browser();
var activeWindow = browser.activeWindow();

// Set url and assert a header-text
activeWindow.navigator().setUrl('http://www.yahoo.com');

activeWindow.saveScreenshot(__dirname + '/stitch.png');

driver.dispose();

chromedriver.stop();
