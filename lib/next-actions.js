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

module.exports = nextActions;
