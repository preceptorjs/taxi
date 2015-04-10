require('../helper');

var expect = require('chai').expect;

module.exports = function () {

    beforeEach(function () {
        this.activeWindow = this.driver.browser().activeWindow();
    });
};