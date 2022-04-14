# macaca-playwright

---

[![NPM version][npm-image]][npm-url]
[![CI][ci-image]][ci-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![node version][node-image]][node-url]

[npm-image]: https://img.shields.io/npm/v/macaca-playwright.svg
[npm-url]: https://npmjs.org/package/macaca-playwright
[ci-image]: https://github.com/macacajs/macaca-playwright/actions/workflows/ci.yml/badge.svg
[ci-url]: https://github.com/macacajs/macaca-playwright/actions/workflows/ci.yml
[coveralls-image]: https://img.shields.io/coveralls/macacajs/macaca-playwright.svg
[coveralls-url]: https://coveralls.io/r/macacajs/macaca-playwright?branch=master
[node-image]: https://img.shields.io/badge/node.js-%3E=_16-green.svg
[node-url]: http://nodejs.org/download/

> [Playwright](//github.com/microsoft/playwright) is a framework for Web Testing and Automation. It allows testing Chromium, Firefox and WebKit with a single API. Macaca Playwright is a long-term maintained browser driver as a candidate for Macaca Playwright driver.

<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars.githubusercontent.com/u/1011681?v=4" width="100px;"/><br/><sub><b>xudafeng</b></sub>](https://github.com/xudafeng)<br/>|[<img src="https://avatars.githubusercontent.com/u/52845048?v=4" width="100px;"/><br/><sub><b>snapre</b></sub>](https://github.com/snapre)<br/>|
| :---: | :---: |


This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Thu Apr 14 2022 23:05:55 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->

## Installment

```bash
$ npm i macaca-playwright -g
```

## Usage as module

```javascript
const fs = require('fs');
const path = require('path');
const Playwright = require('macaca-playwright');

const playwright = new Playwright();

async function() {
  /**
    default options
    {
      headless: false,
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      userAgent: 'userAgent string'
    }
  */
  await playwright.startDevice({
    headless: true // in silence
  });

  await playwright.maximize();
  await playwright.setWindowSize(null, 500, 500);
  await playwright.get('https://www.baidu.com');
  const imgData = await playwright.getScreenshot();
  const img = new Buffer(imgData, 'base64');
  const p = path.join(__dirname, '..', 'screenshot.png')
  fs.writeFileSync(p, img.toString('binary'), 'binary');
  console.log(`screenshot: ${p}`);

  await playwright.stopDevice();
};
```
