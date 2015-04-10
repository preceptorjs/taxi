var chai = require("chai");
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var expect = chai.expect;

chai.use(sinonChai);

var Navigator = require('../../lib/navigator');

describe('Navigator', function () {

    beforeEach(function () {
        this.sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        this.sandbox.restore();
        this.sandbox = null;
    });


});