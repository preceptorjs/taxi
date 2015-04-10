var taxi = require('../..');

var url = 'http://localhost:4444/wd/hub';
var capabilities = { browserName: 'firefox' };
var options = { mode: taxi.Driver.MODE_SYNC };

before(function () {
    this.taxi = taxi;
    this.driver = taxi(url, capabilities, options);
});

after(function () {
    this.driver.dispose();
});

module.exports = {
    url: url,
    capabilities: capabilities,
    options: options
};