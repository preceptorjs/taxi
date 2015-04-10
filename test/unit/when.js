var chai = require("chai");
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var expect = chai.expect;

chai.use(sinonChai);

var when = require('../../lib/when');
var Promise = require('promise');

describe('When', function () {

    beforeEach(function () {
        this.sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        this.sandbox.restore();
        this.sandbox = null;
    });

    describe('isPromise', function () {

        it('should recognize a promise', function () {
            expect(when.isPromise(Promise.resolve())).to.be.true;
        });

        it('should ignore unknown promise', function () {
            expect(when.isPromise()).to.be.false;
        });

        it('should accept an object with "then" method', function () {
            var obj = {
                then: function () {}
            };
            expect(when.isPromise(obj)).to.be.true;
        });

        it('should accept a function with "then" method', function () {
            var fn = function () {};
            fn.then = function () {};
            expect(when.isPromise(fn)).to.be.true;
        });
    });

    describe('when', function () {

        describe('No Promise', function () {

            beforeEach(function () {
                this.isPromiseStub = this.sandbox.stub(when, 'isPromise');
                this.isPromiseStub.returns(false);
            });

            it('should trigger directly', function () {
                var testValue = 1;

                when(4, function () {
                    testValue = 2;
                });

                expect(testValue).to.be.equal(2);
            });

            it('should return result', function () {
                var fn = function () { return 3; },
                    result;

                result = when(4, fn);

                expect(result).to.be.equal(3);
            });

            it('should supply argument', function () {
                var fn = function (arg) { testValue += arg;},
                    testValue = 1;

                when(4, fn);

                expect(testValue).to.be.equal(5);
            });
        });

        describe('With Promise', function () {

            beforeEach(function () {
                this.isPromiseStub = this.sandbox.stub(when, 'isPromise');
                this.isPromiseStub.returns(true);

                this.returnPromise = Promise.resolve();

                this.promise = {
                    value: 0,
                    then: function () { return this.returnPromise; }.bind(this)
                };
                this.promiseThenStub = this.sandbox.spy(this.promise, 'then');
            });

            it('should trigger later', function () {
                var testValue = 1,
                    cb = function () {
                        testValue = 2;
                    },
                    eb = function () {};

                when(this.promise, cb, eb);

                expect(testValue).to.be.equal(1);

                expect(this.promiseThenStub).to.have.been.calledOnce;
                expect(this.promiseThenStub).to.have.been.calledWith(cb, eb);
            });

            it('should return result', function () {
                var fn = function () { return 3; },
                    result;

                result = when(this.promise, fn);

                expect(result).to.be.equal(this.returnPromise);
            });

            it('should trigger error result', function (done) {
                var cb = function () { done(new Error('Error was not caught by Promise')); },
                    eb = function () { done(); },
                    promise = Promise.resolve().then(function () {
                        throw new Error();
                    }),
                    result;

                result = when(promise, cb, eb);
            });
        });
    });

    describe('whenDone', function () {

        describe('No Promise', function () {

            beforeEach(function () {
                this.isPromiseStub = this.sandbox.stub(when, 'isPromise');
                this.isPromiseStub.returns(false);
            });

            it('should trigger directly', function () {
                var testValue = 1;

                when.done(4, function () {
                    testValue = 2;
                });

                expect(testValue).to.be.equal(2);
            });

            it('should return result', function () {
                var fn = function () { return 3; },
                    result;

                result = when.done(4, fn);

                expect(result).to.be.equal(3);
            });

            it('should supply argument', function () {
                var fn = function (arg) { testValue += arg;},
                    testValue = 1;

                when.done(4, fn);

                expect(testValue).to.be.equal(5);
            });
        });

        describe('With Promise', function () {

            beforeEach(function () {
                this.isPromiseStub = this.sandbox.stub(when, 'isPromise');
                this.isPromiseStub.returns(true);

                this.returnPromise = Promise.resolve();

                this.promise = {
                    value: 0,
                    then: function () {},
                    done: function () { return this.returnPromise; }.bind(this)
                };
                this.promiseDoneStub = this.sandbox.spy(this.promise, 'done');
            });

            it('should trigger later', function () {
                var testValue = 1,
                    cb = function () {
                        testValue = 2;
                    },
                    eb = function () {};

                when.done(this.promise, cb, eb);

                expect(testValue).to.be.equal(1);

                expect(this.promiseDoneStub).to.have.been.calledOnce;
                expect(this.promiseDoneStub).to.have.been.calledWith(cb, eb);
            });

            it('should return result', function () {
                var fn = function () { return 3; },
                    result;

                result = when.done(this.promise, fn);

                expect(result).to.be.equal(this.returnPromise);
            });

            it('should trigger error result', function (done) {
                var cb = function () { done(new Error('Error was not caught by Promise')); },
                    eb = function () { done(); },
                    promise = Promise.resolve().then(function () {
                        throw new Error();
                    }),
                    result;

                result = when.done(promise, cb, eb);
            });
        });
    });

    describe('whenTry', function () {

        beforeEach(function () {
            this.whenStub = this.sandbox.stub(when, 'when', function (val) { return val; });
        });

        it('should call value function', function () {
            var testValue = 1,
                valueFn = function () {
                    testValue = 4
                };

            when.try(valueFn);

            expect(testValue).to.be.equal(4);
        });

        it('should call "when"', function () {
            var cb = function () {},
                eb = function () {},
                fn = function () {
                    return 13;
                },
                result = when.try(fn, cb, eb);

            expect(this.whenStub).to.have.been.calledOnce;
            expect(this.whenStub).to.have.been.calledWith(13, cb, eb);

            expect(result).to.be.equal(13);
        });

        it('should fail and catch', function (done) {
            var err = new Error(),
                cb = function () { done(new Error('Should have triggered an error.')); },
                eb = function () { done(); },
                valueFn = function () {
                    throw err;
                };

            when.try(valueFn, cb, eb);
        });
    });
});