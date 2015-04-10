require('../helper');

var expect = require('chai').expect;

module.exports = function () {

    describe('IME', function () {

        beforeEach(function () {
            this.ime = this.browser.ime();
        });
    });
};