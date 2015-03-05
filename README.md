# Taxi

This is a Cabbie-fork.

Am Object-oriented Selenium WebDriver Client for Node.

[![npm version](https://badge.fury.io/js/taxi.svg)](http://badge.fury.io/js/taxi)

[![NPM](https://nodei.co/npm/taxi.png?downloads=true)](https://nodei.co/npm/taxi/)
[![NPM](https://nodei.co/npm-dl/taxi.png?months=3&height=2)](https://nodei.co/npm/taxi/)

[API Documentation](http://preceptorjs.github.io/taxi/docs)

[Coverage Report](http://preceptorjs.github.io/taxi/coverage/lcov-report/)

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
