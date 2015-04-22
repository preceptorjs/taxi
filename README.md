# Taxi

An Object-oriented Selenium WebDriver Client for Node.

[![Build Status](https://img.shields.io/travis/preceptorjs/taxi.svg)](http://travis-ci.org/preceptorjs/taxi)
[![Coveralls Coverage](https://img.shields.io/coveralls/preceptorjs/taxi.svg)](https://coveralls.io/r/preceptorjs/taxi)
[![Code Climate Grade](https://img.shields.io/codeclimate/github/preceptorjs/taxi.svg)](https://codeclimate.com/github/preceptorjs/taxi)

[![NPM version](https://badge.fury.io/js/taxi.svg)](https://www.npmjs.com/package/taxi)
[![NPM License](https://img.shields.io/npm/l/taxi.svg)](https://www.npmjs.com/package/taxi)

[![NPM](https://nodei.co/npm/taxi.png?downloads=true&stars=true)](https://www.npmjs.com/package/taxi)
[![NPM](https://nodei.co/npm-dl/taxi.png?months=3&height=2)](https://www.npmjs.com/package/taxi)

[![Coverage Report](https://img.shields.io/badge/Coverage_Report-Available-blue.svg)](http://preceptorjs.github.io/taxi/coverage/lcov-report/)
[![API Documentation](https://img.shields.io/badge/API_Documentation-Available-blue.svg)](http://preceptorjs.github.io/taxi/docs/)

[![Gitter Support](https://img.shields.io/badge/Support-Gitter_IM-yellow.svg)](https://gitter.im/preceptorjs/support)

## Installation

```shell
npm install taxi
```

## Usage

```js
var assert = require('assert');
var taxi = require('taxi');

var driver = taxi('http://localhost:4444/wd/hub', { browserName:'firefox' }, { mode: taxi.Driver.MODE_SYNC });
var browser = driver.browser();
var activeWindow = browser.activeWindow();

// Set url and assert a header-text
activeWindow.navigator().setUrl('http://www.example.com');
assert.equal(activeWindow.getElement('h1').getText(), 'Example Domain');

// Click on element
activeWindow.getElement('h1').mouse().click();

// Click on a specific coordinate
activeWindow.mouse().clickAt(500, 200);

// Close active window
activeWindow.close();

driver.dispose();
```

## Object Reference

![Object Reference](objectReference.png)


## License

  MIT
