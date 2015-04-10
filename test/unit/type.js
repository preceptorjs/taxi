var chai = require("chai");
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var expect = chai.expect;

chai.use(sinonChai);

var type = require('../../lib/type');

describe('Type', function () {

    beforeEach(function () {
        this.sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        this.sandbox.restore();
        this.sandbox = null;
    });

    describe('type', function () {

        it('should recognize dates', function () {
            expect(type.type(new Date())).to.be.equal('Date');
        });

        it('should recognize reg-ex', function () {
            expect(type.type(new RegExp())).to.be.equal('RegExp');
        });

        it('should recognize Arguments object', function () {
            expect(type.type(arguments)).to.be.equal('Arguments');
        });

        it('should recognize errors', function () {
            expect(type.type(new Error())).to.be.equal('Error');
        });

        it('should recognize an empty array', function () {
            expect(type.type([])).to.be.equal('Array');
        });

        it('should recognize array in array', function () {
            expect(type.type([[]])).to.be.equal('Array.<Array>');
        });

        it('should recognize array of values', function () {
            expect(type.type(["test", 34])).to.be.equal('Array.<Any>');
        });

        it('should recognize array data', function () {
            expect(type.type([{}])).to.be.equal('Array.<Object>');
        });

        it('should recognize null', function () {
            expect(type.type(null)).to.be.equal('null');
        });

        it('should recognize undefined', function () {
            expect(type.type(undefined)).to.be.equal('undefined');
        });

        it('should recognize NaN', function () {
            expect(type.type(NaN)).to.be.equal('NaN');
        });

        it('should recognize String', function () {
            expect(type.type('text')).to.be.equal('String');
        });

        it('should recognize Number', function () {
            expect(type.type(3)).to.be.equal('Number');
        });
    });

    describe('checkType', function () {

        beforeEach(function () {
            this.typeStub = this.sandbox.stub(type, 'type');
        });

        it('should check value', function () {
            this.typeStub.returns('Number');
            type('Test-Name', 3, 'Number');
        });

        it('should fail when incorrect type', function (done) {
            this.typeStub.returns('Number');
            try {
                type('Test-Name', 3, 'String');
                done(new Error('Did not fail type test'));

            } catch (err) {
                expect(err).to.be.instanceof(TypeError);
                done();
            }
        });

        it('should consider casing', function (done) {
            this.typeStub.returns('Number');

            try {
                type('Test-Name', 3, 'number');
                done(new Error('Did not fail type test'));

            } catch (err) {
                done();
            }
        });

        it('should accept empty array for specific array', function () {
            this.typeStub.returns('Array');
            type('Test-Name', [], 'Array.<Number>');
        });

        it('should accept any array', function () {
            this.typeStub.returns('Array.<Number>');
            type('Test-Name', [2], 'Array.<Any>');
        });

        it('should accept non-specific array', function () {
            this.typeStub.returns('Array.<Number>');
            type('Test-Name', [2], 'Array');
        });

        it('should accept optional value', function () {
            this.typeStub.returns('Number');
            type('Test-Name', 3, 'Number?');
        });

        it('should check value', function () {
            this.typeStub.returns('null');
            type('Test-Name', null, 'Number?');
        });
    });
});