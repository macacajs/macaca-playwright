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

nextActions.waitForSelector = async function(args) {
  let result = null;
  this.elements = {};
  try {
    result = await this.page.waitForSelector(args.type, ...args.args);
  } catch (error) {
    this.elements = {};
    result = null;
  }

  if (!result) {
    this.elements = {};
    return null;
  }

  this.elements[result._guid] = result;
  return { ELEMENT: result._guid };
};

nextActions.boundingBox = async function(args) {
  const elementId  = args.type;
  const element = this.elements[elementId];
  return await element.boundingBox();
};


module.exports = nextActions;
