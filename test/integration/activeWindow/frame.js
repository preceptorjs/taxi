require('../helper');

var expect = require('chai').expect;

module.exports = function () {

    describe('Frame', function () {

        beforeEach(function () {
            this.frame = this.activeWindow.frame();
        });
    });
};