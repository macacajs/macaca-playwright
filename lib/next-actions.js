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

nextActions.fill = async function(args) {
  const element = this.elements[args.type];
  await element.fill(args.args[0]);
  return null;
};

nextActions.$$ = async function(args) {
  let result = null;
  this.elements = {};
  try {
    result = await this.page.$$(args.type, { timeout: 30000 });
  } catch (error) {
    this.elements = {};
    return [];
  }

  if (!result.length) {
    this.elements = {};
    return [];
  }
  const elements = [];
  for (const item of result) {
    if (!await item.isVisible()) continue;
    this.elements[item._guid] = item;
    elements.push({ ELEMENT: item._guid });
  }
  return elements;
};

nextActions.$ = async function(args) {
  let result = null;
  this.elements = {};
  try {
    result = await this.page.$(args.type, { timeout: 30000 });
  } catch (error) {
    this.elements = {};
    return null;
  }

  if (!result) {
    this.elements = {};
    return null;
  }

  this.elements[result._guid] = result;
  return { ELEMENT: result._guid };
};

nextActions.waitForSelector = async function(args) {
  let result = null;
  this.elements = {};
  try {
    result = await this.page.waitForSelector(args.type, { timeout: 30000 });
  } catch (error) {
    this.elements = {};
    return null;
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
