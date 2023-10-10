const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { sync: mkdirp } = require('mkdirp');
const { getByName: getAtom } = require('selenium-atoms');
const { errors } = require('webdriver-dfn-error-code');

const _ = require('./helper');
const logger = require('./logger');
const nextActions = require('./next-actions');

const ELEMENT_OFFSET = 1000;

const implicitWaitForCondition = function(func) {
  return _.waitForCondition(func, this?.implicitWaitMs);
};

const sendJSCommand = async function(atom, args, inDefaultFrame) {
  const frames = !inDefaultFrame && this.frame ? [ this.frame ] : [];
  const atomScript = getAtom(atom);
  let script;
  if (frames.length) {
    const elem = getAtom('get_element_from_cache');
    const frame = frames[0];
    script = `(function (window) { var document = window.document;
      return (${atomScript}); })((${elem.toString('utf8')})(${JSON.stringify(frame)}))`;
  } else {
    script = `(${atomScript})`;
  }
  const command = `${script}(${args.map(JSON.stringify).join(',')})`;

  let res;
  await implicitWaitForCondition.call(this, async () => {
    res = await this.page.evaluate(command);
    return !!res;
  });

  if (res.value) {
    return res.value;
  }

  try {
    return JSON.parse(res).value;
  } catch (e) {
    return null;
  }
};

const convertAtoms2Element = function(atoms) {
  const atomsId = atoms && atoms.ELEMENT;

  if (!atomsId) {
    return null;
  }

  const index = this.atoms.push(atomsId) - 1;

  return {
    ELEMENT: index + ELEMENT_OFFSET,
  };
};

const convertElement2Atoms = function(elementId) {
  if (!elementId) {
    return null;
  }

  let atomsId;

  try {
    atomsId = this.atoms[parseInt(elementId, 10) - ELEMENT_OFFSET];
  } catch (e) {
    return null;
  }

  return {
    ELEMENT: atomsId,
  };
};

const findElementOrElements = async function(strategy, selector, ctx, many) {
  strategy = strategy.toLowerCase();

  let result;
  this.elements = {};

  // cache locator
  if (strategy === 'xpath') {
    this.locator = this.page.locator(selector);
  }
  /**
     * `css selector` and `xpath` is default
     */
  if (strategy === 'name') {
    selector = `text=${selector}`;
  } else if (strategy === 'id') {
    selector = `//*[@id="${selector}"]`;
  }

  try {
    await this.page.waitForSelector(selector, {
      state: 'attached',
      timeout: 500,
    });
  } catch (_) {
    result = [];
  }

  if (many) {
    try {
      result = await this.page.$$(selector);
    } catch (e) {
      logger.debug(e);
      result = [];
    }
    const elements = [];
    for (const item of result) {
      const isVisible = await item.isVisible();
      if (!isVisible) {
        continue;
      }
      this.elements[item._guid] = item;
      elements.push({
        ELEMENT: item._guid,
      });
    }
    return elements;
  }

  result = await this.page.$(selector);

  if (!result || _.size(result) === 0) {
    throw new errors.NoSuchElement();
  }

  this.elements[result._guid] = result;

  return {
    ELEMENT: result._guid,
  };
};

const controllers = {};

/**
 * Change focus to another frame on the page.
 *
 * @module setFrame
 * @param {string} frame Identifier(id/name) for the frame to change focus to
 * @return {Promise}
 */
controllers.setFrame = async function(frame) {
  if (!_.isNumber && !frame) {
    this.frame = null;
    logger.debug('Back to default content');
    return null;
  }

  if (frame.ELEMENT) {
    const atomsElement = convertElement2Atoms.call(this, frame.ELEMENT);
    const result = await sendJSCommand.call(this, 'get_frame_window', [ atomsElement ]);
    logger.debug(`Entering into web frame: '${result.WINDOW}'`);
    this.frame = result.WINDOW;
    return null;
  }
  const atom = _.isNumber(frame) ? 'frame_by_index' : 'frame_by_id_or_name';
  const result = await sendJSCommand.call(this, atom, [ frame ]);
  if (!result || !result.WINDOW) {
    throw new errors.NoSuchFrame();
  }
  logger.debug(`Entering into web frame: '${result.WINDOW}'`);
  this.frame = result.WINDOW;
  return null;
};

/**
 * Click on an element.
 * @module click
 * @return {Promise}
 */
controllers.click = async function(elementId, options = {}) {
  const element = this.elements[elementId];
  if (!element) {
    logger.error('click element is not found');
    return null;
  }
  if (!element.isVisible()) {
    logger.error('click element is not visible');
    return null;
  }
  await element.click({
    timeout: 2E3,
    delay: 200,
    ...options,
  }).catch(async e => {
    // 处理一些需要自动重试的异常
    if (e.message.includes('Element is not attached')) {
      await _.sleep(2E3);
      await element.click({
        timeout: 2E3,
        delay: 200,
        ...options,
      });
    } else {
      throw e;
    }
  });
  return null;
};

/**
 * take element screenshot.
 *
 * @module takeElementScreenshot
 * @return {Promise}
 */
controllers.takeElementScreenshot = async function(elementId, params = {}) {
  const { file } = params;
  let image;
  if (elementId) {
    image = await this.elements[elementId].screenshot();
  } else if (this.locator) {
    image = await this.locator.screenshot();
  } else {
    throw new errors.NoSuchElement();
  }
  const base64 = image.toString('base64');
  if (file) {
    const img = new Buffer(base64, 'base64');
    const realPath = path.resolve(file);
    mkdirp(path.dirname(realPath));
    fs.writeFileSync(realPath, img.toString('binary'), 'binary');
  }
  return base64;
};

/**
 * Search for an element on the page, starting from the document root.
 * @module findElement
 * @param {string} strategy The type
 * @param selector Selector string
 * @param {string} ctx The search target.
 * @return {Promise.<Element>}
 */
controllers.findElement = async function(strategy, selector, ctx) {
  return findElementOrElements.call(this, strategy, selector, ctx, false);
};

controllers.findElements = async function(strategy, selector, ctx) {
  return findElementOrElements.call(this, strategy, selector, ctx, true);
};

/**
 * Returns the visible text for the element.
 *
 * @module getText
 * @return {Promise.<string>}
 */
controllers.getText = async function(elementId) {
  const element = this.elements[elementId];
  return element.innerText();
};

/**
 * Clear a TEXTAREA or text INPUT element's value.
 *
 * @module clearText
 * @return {Promise.<string>}
 */
controllers.clearText = async function(elementId) {
  const element = this.elements[elementId];
  await element.fill('');
  return null;
};

/**
 * Set element's value.
 *
 * @module setValue
 * @param elementId
 * @param value
 * @return {Promise.<string>}
 */
controllers.setValue = async function(elementId, value) {
  if (!Array.isArray(value)) {
    value = [ value ];
  }
  const element = this.elements[elementId];
  await element.fill(...value);
  return null;
};


/**
 * Determine if an element is currently displayed.
 *
 * @module isDisplayed
 * @return {Promise.<string>}
 */
controllers.isDisplayed = async function(elementId) {
  const element = this.elements[elementId];
  return element.isVisible();
};

/**
 * Get the value of an element's property.
 *
 * @module getProperty
 * @return {Promise.<string>}
 */
controllers.getProperty = async function(elementId, attrName) {
  const element = this.elements[elementId];
  return element.getAttribute(attrName);
};

/**
 * Get the current page title.
 *
 * @module title
 * @return {Promise.<Object>}
 */
controllers.title = async function() {
  return this.page.title();
};

/**
 * Inject a snippet of JavaScript into the page for execution in the context of the currently selected frame.
 *
 * @module execute
 * @param script script
 * @param [args] script argument array
 * @return {Promise.<string>}
 */
controllers.execute = async function(script, args) {
  if (!args) {
    args = [];
  }

  // args = args.map(arg => {
  //   if (arg.ELEMENT) {
  //     return convertElement2Atoms.call(this, arg.ELEMENT);
  //   } else {
  //     return arg;
  //   }
  // });

  const value = await sendJSCommand.call(this, 'execute_script', [
    script,
    args,
  ], true);

  if (Array.isArray(value)) {
    return value.map(convertAtoms2Element.bind(this));
  }
  return value;

};

/**
 * Retrieve the URL of the current page.
 *
 * @module url
 * @return {Promise.<string>}
 */
controllers.url = async function() {
  return this.page.url();
};

/**
 * Navigate to a new URL.
 *
 * @module get
 * @param url get a new url.
 * @return {Promise.<string>}
 */
controllers.get = async function(url) {
  this.frame = null;
  await this.page.goto(url, {
    waitUntil: 'load' || 'networkidle',
  });
  return null;
};

/**
 * Navigate forwards in the browser history, if possible.
 *
 * @module forward
 * @return {Promise.<string>}
 */
controllers.forward = async function() {
  this.frame = null;
  await this.page.goForward();
  return null;
};

/**
 * Navigate backwards in the browser history, if possible.
 *
 * @module back
 * @return {Promise.<string>}
 */
controllers.back = async function() {
  this.frame = null;
  await this.page.goBack();
  return null;
};

/**
 * Get all window handlers.
 *
 * @module back
 * @return {Promise}
 */
controllers.getWindows = async function() {
  return this.page.frames();
};

/**
 * Change focus to another window.
 *
 * @module setWindow
 * @return {Promise.<string>}
 */
controllers.setWindow = async function() {
  this.page = await this.browserContext.newPage();
  return null;
};

/**
 * Close the current window.
 *
 * @module deleteWindow
 * @return {Promise.<string>}
 */
controllers.deleteWindow = async function() {
  await this.page?.close();
  return null;
};

/**
 * Get the size of the specified window.
 *
 * @module setWindowSize
 * @param [handle] window handle to set size for (optional, default: 'current')
 * @return {Promise.<string>}
 */
controllers.setWindowSize = async function(windowHandle, width, height) {
  await this.page.setViewportSize({
    width,
    height,
  });
  return null;
};

/**
 * Maximize the specified window if not already maximized.
 *
 * @module maximize
 * @param windowHandle window handle
 * @return {Promise.<string>}
 */
controllers.maximize = async function(windowHandle) {
  return this.setWindowSize(windowHandle, 1920, 1080);
};

/**
 * Refresh the current page.
 *
 * @module refresh
 * @return {Promise.<string>}
 */
controllers.refresh = async function() {
  this.frame = null;
  return this.page.reload();
};

/**
 * Get the current page source.
 *
 * @module getSource
 * @return {Promise.<string>}
 */
controllers.getSource = async function() {
  const cmd = 'return document.getElementsByTagName(\'html\')[0].outerHTML';
  return this.execute(cmd);
};

/**
 * Take a screenshot of the current page.
 *
 * @module getScreenshot
 * @return {Promise.<string|null>} The screenshot as a base64 encoded PNG.
 */
controllers.getScreenshot = async function(context, params = {}) {
  // boolean 参数安全处理
  if (typeof params.fullPage === 'string') {
    params.fullPage = params.fullPage === 'true';
  }
  if (params.video) {
    return this.page.video()?.path?.() || null;
  }
  const image = await this.page.screenshot(params);
  const base64 = image.toString('base64');

  if (params.dir) {
    const img = new Buffer(base64, 'base64');
    const dir = path.resolve(params.dir);
    mkdirp(path.dirname(dir));
    fs.writeFileSync(dir, img.toString('binary'), 'binary');
  }
  return base64;
};

/**
 * Query the value of an element's computed CSS property.
 *
 * https://www.w3.org/TR/webdriver/#dfn-get-element-css-value
 * @module getComputedCss
 * @return {Promise.<string>}
 */
controllers.getComputedCss = async function(elementId, propertyName) {
  const element = this.elements[elementId];
  /* istanbul ignore next */
  return this.page.evaluate(([ element, propertyName ]) => window.getComputedStyle(element)[propertyName], [ element, propertyName ]);
};

/**
 * Returns all cookies associated with the address of the current browsing context’s active document.
 *
 * @module getAllCookies
 * @return {Promise.<string>}
 */
controllers.getAllCookies = async function() {
  return this.browserContext.cookies();
};

/**
 * Returns the cookie with the requested name from the associated cookies in the cookie store of the current browsing context’s active document. If no cookie is found, a no such cookie error is returned.
 *
 * @module getNamedCookie
 * @return {Promise.<string>}
 */
controllers.getNamedCookie = async function() {
  return this.browserContext.cookies();
};

/**
 * Adds a single cookie to the cookie store associated with the active document’s address.
 *
 * @module addCookie
 * @return {Promise.<string>}
 */
controllers.addCookie = async function(cookie) {
  await this.browserContext.addCookies(cookie);
  return null;
};

/**
 * Delete either a single cookie by parameter name, or all the cookies associated with the active document’s address if name is undefined.
 *
 * @module deleteCookie
 * @return {Promise.<boolean>}
 */
controllers.deleteCookie = async function(cookie) {
  await this.browserContext.clearCookies(cookie);
  return true;
};

/**
 * Delete All Cookies command allows deletion of all cookies associated with the active document’s address.
 *
 * @module deleteAllCookies
 * @return {Promise.<boolean>}
 */
controllers.deleteAllCookies = async function() {
  await this.browserContext.clearCookies();
  return true;
};

controllers.getContexts = async function() {
  return this.browserContexts;
};

controllers.getContext = async function() {
  return this.browserContext;
};

controllers.setContext = async function(name) {
  const index = this.browserContexts.findIndex(item => item.name === name);
  if (index !== -1) {
    this._setContext(index);
  } else {
    await this._createContext(name);
  }
  return true;
};

controllers.getRect = async function(elementId) {
  const element = this.elements[elementId];
  return element.boundingBox();
};

/**
 * next 标准扩展
 * @return {Promise}
 */
controllers.next = async function(method, args = []) {
  assert(method, 'method name is required');
  return nextActions[method].call(this, ...args);
};

module.exports = controllers;
