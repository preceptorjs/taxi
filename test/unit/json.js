var chai = require("chai");
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var expect = chai.expect;

chai.use(sinonChai);

var JSON = require('../../lib/json');

describe('JSON', function () {

    beforeEach(function () {
        this.sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        this.sandbox.restore();
        this.sandbox = null;
    });

    describe('stringify', function () {

        it('should stringify', function () {
            expect(JSON.stringify({ test:23 })).to.be.equal('{\n    "test": 23\n}');
        });

        it('should stringify with different indent', function () {
            JSON.stringify.indent = 2;
            expect(JSON.stringify({ test:23 })).to.be.equal('{\n  "test": 23\n}');
        });
    });

    describe('parse', function () {

        it('should parse a string', function () {
            expect(JSON.parse('{"test":23}')).to.be.deep.equal({test:23});
        });

        it('should fail when giving non-string', function (done) {
            try {
                JSON.parse(23);
                done(new Error('Did not fail when parsing non-string.'));
            } catch (err) {
                done();
            }
        });

        it('should stringify Buffers', function () {
            expect(JSON.parse(new Buffer('"test"'))).to.be.equal('test');
        });

        it('should fail when unreadable', function (done) {
            try {
                JSON.parse('test');
                done(new Error('Did not fail with non-json.'));
            } catch (err) {
                done();
            }
        });
    });
});