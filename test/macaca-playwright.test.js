const path = require('path');
const assert = require('power-assert');

const _ = require('../lib/helper');
const Playwright = require('../lib/macaca-playwright');
const { devices } = require('playwright');

const headless = !!process.env.CI;

describe('test/macaca-playwright.test.js', function() {
  let res;
  this.timeout(5 * 60E3);
  const customUserAgent = 'custom userAgent';

  describe('methods testing with chromium', function() {

    const driver = new Playwright();

    beforeEach(async () => {
      const videoDir = path.resolve(__dirname, '..', 'videos');
      await driver.startDevice({
        headless,
        userAgent: customUserAgent,
        recordVideo: {
          dir: videoDir,
        },
      });
      await driver.get('file://' + path.resolve(__dirname, 'webpages/1.html'));
    });

    afterEach(async () => {
      await driver.stopDevice();
    });

    it('getSource', async () => {
      res = await driver.getSource();
      assert(res.includes('<html>'));
    });

    it('execute', async () => {
      res = await driver.execute('return navigator.userAgent');
      assert.equal(res, customUserAgent);
    });

    it('title', async () => {
      res = await driver.title();
      assert.equal(res, 'Document 1');
    });

    it('setWindowSize', async () => {
      await driver.setWindowSize(null, 600, 600);
      await driver.maximize();
    });

    it('screenshot', async () => {
      res = await driver.getScreenshot();
      assert(res);
    });

    it('element screenshot', async () => {
      await driver.page.setContent('<div><button id="input">Click me</button></div>');
      await driver.findElement('xpath', '//*[@id="input"]');
      res = await driver.takeElementScreenshot();
      assert(res);
    });

    it('setValue and clearText', async () => {
      const input = await driver.findElement('id', 'input');
      await driver.setValue(input.ELEMENT, [ 'aaa' ]);
      await driver.clearText(input.ELEMENT);
      await driver.setValue(input.ELEMENT, [ 'macaca' ]);
    });

    it('isDisplayed', async () => {
      const button = await driver.findElement('id', 'input');
      res = await driver.isDisplayed(button.ELEMENT);
      assert.equal(res, true);
    });

    it('elementStatus', async () => {
      const button = await driver.findElement('id', 'input');
      res = await driver.elementStatus(button.ELEMENT);
      assert(res.disabled === false);
      assert(res.editable === true);
      assert(res.enabled === true);
      assert(res.hidden === false);
      assert(res.visible === true);
    });

    it('click', async () => {
      const button = await driver.findElement('id', 'input');
      await driver.click(button.ELEMENT, { delay: 300 });
    });

    it('rebuildContextPage & getWindowSize', async () => {
      await driver.rebuildContextPage('DEFAULT_CONTEXT', {
        ...devices['iPhone 13 Pro Max'],
      });
      const size = await driver.getWindowSize();
      assert(size.width === 428);
    });

    it('getRect', async () => {
      const button = await driver.findElement('id', 'input');
      res = await driver.getRect(button.ELEMENT);
      assert(res.x);
      assert(res.y);
      assert(res.width);
      assert(res.height);
    });

    it('getComputedCss', async () => {
      const button = await driver.findElement('id', 'button-1');
      res = await driver.getComputedCss(button.ELEMENT, 'padding');
      assert.equal(res, '5px 10px');
    });

    it('redirect location', async () => {
      const link = await driver.findElement('id', 'link-1');
      await driver.click(link.ELEMENT);
      res = await driver.title();
      assert.equal(res, 'Document 2');
      await driver.back();
      await _.sleep(1000);
      await driver.refresh();
      await _.sleep(1000);
      res = await driver.title();
      assert.equal(res, 'Document 1');
    });

    it('open in new window', async () => {
      const link = await driver.findElement('id', 'link-2');
      await driver.click(link.ELEMENT);
      await driver.maximize();
    });

    it('window handlers', async () => {
      const windows = await driver.getWindows();
      assert.equal(windows.length, 1);
      res = await driver.title();
      assert.equal(res, 'Document 1');
    });

    it('getAllCookies', async () => {
      await driver.get('https://www.google.com.hk');
      res = await driver.getAllCookies();
      assert(Array.isArray(res));
    });
  });
});
