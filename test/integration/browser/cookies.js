require('../helper');

var expect = require('chai').expect;

module.exports = function () {

    describe('Cookies', function () {

        beforeEach(function () {
            this.cookieStorage = this.browser.cookieStorage();
        });
    });
};