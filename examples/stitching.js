var taxi = require('..');
var chromedriver = require('chromedriver');


//chromedriver.start();

//var driver = taxi('http://localhost:9515/', { browserName:'chrome' }, { mode: taxi.Driver.MODE_SYNC, debug: true, httpDebug: true });
//var driver = taxi('http://localhost:4444/wd/hub', { browserName:'firefox' }, { mode: taxi.Driver.MODE_SYNC, debug: true, httpDebug: true });
//var driver = taxi("http://" + user + ":" + accessKey + "@ondemand.saucelabs.com/wd/hub", { browserName:'chrome', version:'41.0', platform: 'Windows 8.1' }, { mode: taxi.Driver.MODE_SYNC, debug: true, httpDebug: true });
//var driver = taxi("http://" + user + ":" + accessKey + "@ondemand.saucelabs.com/wd/hub", { browserName:'firefox', version:'37.0', platform: 'Windows 8.1' }, { mode: taxi.Driver.MODE_SYNC, debug: true, httpDebug: true });
//var driver = taxi("http://" + user + ":" + accessKey + "@ondemand.saucelabs.com/wd/hub", { browserName:'internet explorer', version:'11.0', platform: 'Windows 8.1' }, { mode: taxi.Driver.MODE_SYNC, debug: true, httpDebug: true });
//var driver = taxi("http://" + user + ":" + accessKey + "@ondemand.saucelabs.com/wd/hub", { browserName:'internet explorer', version:'10.0', platform: 'Windows 8' }, { mode: taxi.Driver.MODE_SYNC, debug: true, httpDebug: true });
//var driver = taxi("http://" + user + ":" + accessKey + "@ondemand.saucelabs.com/wd/hub", { browserName:'internet explorer', version:'9.0', platform: 'Windows 7' }, { mode: taxi.Driver.MODE_SYNC, debug: true, httpDebug: true });
//var driver = taxi("http://" + user + ":" + accessKey + "@ondemand.saucelabs.com/wd/hub", { browserName:'safari', version:'5.1', platform: 'Windows 7' }, { mode: taxi.Driver.MODE_SYNC, debug: true, httpDebug: true });
//var driver = taxi("http://" + user + ":" + accessKey + "@ondemand.saucelabs.com/wd/hub", { browserName:'opera', version:'12.12', platform: 'Windows 7' }, { mode: taxi.Driver.MODE_SYNC, debug: true, httpDebug: true });
var driver = taxi("http://" + user + ":" + accessKey + "@ondemand.saucelabs.com/wd/hub", { browserName:'safari', version:'8.0', platform: 'OS X 10.10' }, { mode: taxi.Driver.MODE_SYNC, debug: true, httpDebug: true });

var browser = driver.browser();
var activeWindow = browser.activeWindow();

// Set url and assert a header-text
activeWindow.navigator().setUrl('http://www.yahoo.com');

activeWindow.saveScreenshot(__dirname + '/' + driver.browserName() + " " + driver.browserVersion() + " " + driver.platform() + '.png', {
    eachFn: function () {
        if (arguments[0] >= 1) {
            document.getElementById('masthead').style.display = 'none';
        }
    },
    completeFn: function () {
        document.getElementById('masthead').style.display = '';
    }
});

driver.dispose();

//chromedriver.stop();
