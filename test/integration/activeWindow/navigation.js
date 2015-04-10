require('../helper');

var expect = require('chai').expect;

module.exports = function () {

    describe('Navigation', function () {

        beforeEach(function () {
            this.navigator = this.activeWindow.navigator();
        });
    });
};