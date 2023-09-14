const logger = require('./logger');
const nextActions = {};

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
