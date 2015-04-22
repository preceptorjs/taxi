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

    //{ url:sauceLabsUrl, capabilities: { browserName:'iphone', version:'8.2', platform: 'OS X 10.10', deviceName:'iPad Simulator', "device-orientation":'portrait' } },
    //{ url:sauceLabsUrl, capabilities: { browserName:'iphone', version:'8.2', platform: 'OS X 10.10', deviceName:'iPad Simulator', "device-orientation":'landscape' } },
    //{ url:sauceLabsUrl, capabilities: { browserName:'iphone', version:'8.2', platform: 'OS X 10.10', deviceName:'iPhone Simulator', "device-orientation":'portrait' } },
    //{ url:sauceLabsUrl, capabilities: { browserName:'iphone', version:'8.2', platform: 'OS X 10.10', deviceName:'iPhone Simulator', "device-orientation":'landscape' } }
];

tests.forEach(function (test) {

    if (test.beforeFn) {
        test.beforeFn();
    }

    try {
        var driver = taxi(test.url, test.capabilities, {mode: taxi.Driver.MODE_SYNC, debug: true, httpDebug: true});

        var browser = driver.browser();
        var activeWindow = browser.activeWindow();

        // Set url and assert a header-text
        activeWindow.navigator().setUrl('http://www.yahoo.com');

        var browserId = (driver.deviceName() != '' ? driver.deviceName() : driver.browserName()) + " " + driver.deviceOrientation() + " " + driver.browserVersion() + " " + driver.platform();
        fs.writeFileSync(__dirname + '/' + browserId.trim() + '.png', activeWindow.getElement('ul.navlist').screenshot({
            eachFn: function () {
                if (arguments[0] >= 1 && document.getElementById('masthead')) {
                    document.getElementById('masthead').style.display = 'none';
                }
            }, completeFn: function () {
                if (document.getElementById('masthead')) {
                    document.getElementById('masthead').style.display = '';
                }
            },
			blockOuts: ['input', {x:60, y: 50, width: 200, height: 200, color:{red:255,green:0,blue:128}}]//, activeWindow.getElement('.footer-section')]
        }));
    } catch (err) {
        console.error(err.stack);

    } finally {

        driver.dispose();

        if (test.afterFn) {
            test.afterFn();
        }
    }
});
