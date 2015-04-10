require('../helper');

var expect = require('chai').expect;

module.exports = function () {

    describe('LocalStorage', function () {

        beforeEach(function () {
            this.localStorage = this.browser.localStorage();
        });
    });
};