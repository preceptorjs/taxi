require('../helper');

var expect = require('chai').expect;

module.exports = function () {

    describe('Touch', function () {

        beforeEach(function () {
            this.touch = this.activeWindow.touch();
        });
    });
};