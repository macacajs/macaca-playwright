const logger = require('./logger');
const _ = require('./helper');
const nextActions = {};

nextActions.fileChooser = async function(filePath) {
  const fileChooser = await this.page.waitForEvent('filechooser');
  await fileChooser.setFiles(filePath);
  return true;
};

nextActions.keyboard = async function({ type, args }) {
  const target = this.pageIframe || this.page;
  await target.keyboard[type].apply(target.keyboard, args);
  return true;
};

nextActions.mouse = async function({ type, args }) {
  const target = this.pageIframe || this.page;
  await target.mouse[type].apply(target.mouse, args);
  return true;
};

nextActions.browserType = async function({ func, args }) {
  if (this.browserType && this.browserType[func]) {
    const result = await this.browserType[func].apply(this.browserType, args);
    return result || '';
  }
  logger.error('browserType instance is not found');
};

nextActions.browser = async function({ func, args }) {
  if (this.browser && this.browser.isConnected() && this.browser[func]) {
    const result = await this.browser[func].apply(this.browser, args);
    return result || '';
  }
  logger.error('browser or func is not found');
};

nextActions.locator = async function({ func, args }) {
  if (this.locator && this.locator[func]) {
    const result = await this.locator[func].apply(this.locator, args);
    // 返回locator对象时，缓存
    if (
      result
      && [
        'and',
        'or',
        'getByRole',
        'filter',
        'first',
        'getByAltText',
        'getByLabel',
        'getByPlaceholder',
        'getByRole',
        'getByTestId',
        'getByText',
        'getByTitle',
        'last',
        'locator',
        'nth',
      ].includes(func)
    ) {
      this.locator = result;
    }
    return result || '';
  }
  logger.error('browser or func is not found');
};

// 对当前页面进行方法调用
nextActions.page = async function({ func, args }) {
  if (this.page && !this.page.isClosed() && this.page[func]) {
    await this.page.waitForLoadState();
    const result = await this.page[func].apply(this.page, args);
    // 返回locator相关的方法时需要给 this.locator 赋值
    if (
      result
      && [
        'locator',
        'frameLocator',
        'getByAltText',
        'getByLabel',
        'getByPlaceholder',
        'getByRole',
        'getByTestId',
        'getByText',
        'getByTitle',
        'waitForSelector',
      ].includes(func)) {
      this.locator = result;
    }
    return result || '';
  }
  logger.error('page or func is not found');
};

// 对弹出页面进行方法调用
nextActions.pagePopup = async function({ func, args }) {
  // 等待新弹出页面
  if (!this.pagePopup || this.pagePopup.isClosed()) {
    await _.sleep(2E3);
  }
  if (this.pagePopup && !this.pagePopup.isClosed() && this.pagePopup[func]) {
    await this.pagePopup.waitForLoadState();
    const result = await this.pagePopup[func].apply(this.pagePopup, args);
    return result || '';
  }
  logger.error('pagePopup or func is not found');
};

/**
 * 当前page中frame对象的方法调用
 * @param index 指定为当前page中第几个iframe
 * @param func
 * @param args
 * @return {Promise<*|string>}
 */
nextActions.pageIframe = async function({ index, func, args }) {
  if (_.isNumber(index)) {
    this._setPageIframeByIndex(index);
  }
  if (this.pageIframe && this.pageIframe[func]) {
    await this.pageIframe.waitForLoadState();
    const result = await this.pageIframe[func].apply(this.pageIframe, args);
    if (
      result
        && [
          'locator',
          'frameLocator',
          'frameElement',
          'getByAltText',
          'getByLabel',
          'getByPlaceholder',
          'getByRole',
          'getByTestId',
          'getByText',
          'getByTitle',
          'waitForSelector',
        ].includes(func)) {
      this.locator = result;
    }
    return result || '';
  }
  logger.error('pageIframe or func is not found');
};

nextActions.elementStatus = async function(elementId) {
  const element = this.elements[elementId];
  if (!element) {
    logger.error('Element is not found');
    return null;
  }
  return {
    disabled: await element.isDisabled(),
    editable: await element.isEditable(),
    enabled: await element.isEnabled(),
    hidden: await element.isHidden(),
    visible: await element.isVisible(),
  };
};

module.exports = nextActions;
