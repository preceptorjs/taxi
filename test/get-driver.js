'use strict';

var chromedriver = require('chromedriver');
var getDriver = require('../');

var LOCAL = !process.env.CI && process.argv[2] !== 'sauce';
var browserCount = 0;

module.exports = function (options) {
  if (LOCAL) {
    if (browserCount === 0) {
      chromedriver.start();
    }
    browserCount++;
    var browser = getDriver('http://localhost:9515/', {}, options);
    browser.on('disposed', function () {
      if (0 === --browserCount) {
        chromedriver.stop();
      }
    });
    return browser;
  } else {
    throw new Error('Currently not supported');
  }
};