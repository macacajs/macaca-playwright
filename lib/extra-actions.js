const extraActions = {};

extraActions.fill = async function(...args) {
  return await this.page.fill(...args);
};

extraActions.$$ = async function(...args) {
  return await this.page.$$(...args);
};

module.exports = extraActions;
