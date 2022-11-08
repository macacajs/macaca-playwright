const nextActions = {};

nextActions.fileChooser = async function(...args) {
  const [ filePath ] = args;
  const fileChooser = await this.page.waitForEvent('filechooser');
  await fileChooser.setFiles(filePath);
  return true;
};

nextActions.fill = async function(...args) {
  return await this.page.fill(...args);
};

nextActions.$$ = async function(...args) {
  return await this.page.$$(...args);
};

module.exports = nextActions;
