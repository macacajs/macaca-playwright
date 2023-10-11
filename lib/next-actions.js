const logger = require('./logger');
const _ = require('./helper');
const nextActions = {};

nextActions.rebuildContextPage = async function(name, pageOpts) {
  await this._rebuildContextPage(name, pageOpts);
  return true;
};

nextActions.fileChooser = async function(filePath) {
  const fileChooser = await this.page.waitForEvent('filechooser');
  await fileChooser.setFiles(filePath);
  return true;
};

nextActions.keyboard = async function({ type, args }) {
  await this.page.keyboard[type].apply(this.page.keyboard, args);
  return true;
};

nextActions.mouse = async function({ type, args }) {
  await this.page.mouse[type].apply(this.page.mouse, args);
  return true;
};

// 对当前页面进行方法调用
nextActions.page = async function({ func, args }) {
  if (this.page && !this.page.isClosed() && this.page[func]) {
    await this.page.waitForLoadState();
    const result = await this.page[func].apply(this.page, args);
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

nextActions.elementStatus = async function(elementId) {
  const element = this.elements[elementId];
  if (!element) {
    logger.error('click Element is not found');
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
