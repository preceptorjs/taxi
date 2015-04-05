//var taxi = require('../..');
//
//describe('Taxi', function () {
//
//    before(function () {
//        this.driver = taxi('http://localhost:4444/wd/hub', { browserName:'firefox' }, { mode: taxi.Driver.MODE_SYNC });
//        this.browser = this.driver.browser();
//        this.activeWindow = this.browser.activeWindow();
//    });
//
//    after(function () {
//        this.driver.dispose();
//    });
//
//
//    describe('Navigation', function () {
//
//        beforeEach(function () {
//            this.navigator = this.activeWindow.navigator();
//        });
//
//        it('should have a driver', function () {
//            expect(this.navigator.getDriver()).to.not.be.null;
//        });
//
//        it('should not have an url', function () {
//            this.activeWindow.navigator().
//        });
//    });
//});