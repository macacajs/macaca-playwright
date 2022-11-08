const nextActions = {};

nextActions.fileChooser = async function(...args) {
  console.log(args);
  return true;
};

nextActions.fill = async function(...args) {
  return await this.page.fill(...args);
};

nextActions.$$ = async function(...args) {
  return await this.page.$$(...args);
};

module.exports = nextActions;
