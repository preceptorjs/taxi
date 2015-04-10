var info = require('../helper');

var expect = require('chai').expect;

module.exports = function () {

    describe('Status', function () {

        before(function () {
            this.status = this.taxi.Driver.getStatus(info.url, info.options);
        });

        it('should get the build-version', function () {
            expect(this.status.getBuildVersion()).to.be.a('string');
        });

        it('should get the build-revision', function () {
            expect(this.status.getBuildRevision()).to.be.a('string');
        });

        it('should get the build-time', function () {
            expect(this.status.getBuildTime()).to.be.a('string');
        });

        it('should get the OS-architecture', function () {
            expect(this.status.getOSArchitecture()).to.be.a('string');
        });

        it('should get the OS-name', function () {
            expect(this.status.getOSName()).to.be.a('string');
        });

        it('should get the OS-version', function () {
            expect(this.status.getOSVersion()).to.be.a('string');
        });

        it('should get the Java-version', function () {
            expect(this.status.getJavaVersion()).to.be.a('string');
        });
    });
};