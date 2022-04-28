'use strict';

const assert = require('power-assert');

const _ = require('../lib/helper');
const Playwright = require('../lib/macaca-playwright');
const path = require('path');

describe('video testing', function() {
  this.timeout(5 * 60 * 1000);
  const driver = new Playwright();
  const customUserAgent = 'custom userAgent';

  before(async () => {
    await driver.startDevice({
      headless: false,
      userAgent: customUserAgent,
      width: 800,
      height: 600,
    });
    // 开启录像
    await driver.startMediaRecorder('videos/', 800, 600);
  });

  it('set input value', async () => {
    await driver.get('file://' + path.resolve(__dirname, 'webpages/1.html'));
    await driver.maximize();
    const html = await driver.getSource();
    assert(html.includes('<html>'));
    const uesrAgent = await driver.execute('return navigator.userAgent');
    assert.equal(uesrAgent, customUserAgent);

    const input = await driver.findElement('id', 'input');
    await driver.setValue(input.ELEMENT, 'aaa');
    await driver.clearText(input.ELEMENT);
    await driver.setValue(input.ELEMENT, 'macaca');
    const style = await driver.getComputedCss(input.ELEMENT, 'display');
    assert.equal(style, 'inline-block');
    await _.sleep(500);

    let button = await driver.findElement('id', 'button-1');
    const buttonIsDiaplayed = await driver.isDisplayed(button.ELEMENT);
    assert.equal(buttonIsDiaplayed, true);

    const bgColor = await driver.getComputedCss(button.ELEMENT, 'background-color');
    assert.equal(bgColor, 'rgb(255, 255, 255)');

    button = await driver.findElement('id', 'button-1');
    await driver.click(button.ELEMENT);
    await _.sleep(300);
    const box = await driver.findElement('id', 'target');
    const boxText = await driver.getText(box.ELEMENT);
    assert.equal(boxText, 'macaca');
  });

  after(async () => {
    // FIXME 录像未找到
    await driver.stopMediaRecorder();
    await driver.stopDevice();
  });

});
