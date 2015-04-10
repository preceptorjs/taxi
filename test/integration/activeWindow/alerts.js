require('../helper');

var expect = require('chai').expect;

module.exports = function () {

    describe('Alerts', function () {

        beforeEach(function () {
            this.alert = this.activeWindow.alert();
        });
    });
};