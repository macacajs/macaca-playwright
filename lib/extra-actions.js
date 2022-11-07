const extraActions = {};

// TODO 添加本地文件选择实现

extraActions.fill = async function(...args) {
  return await this.page.fill(...args);
};

extraActions.$$ = async function(...args) {
  return await this.page.$$(...args);
};

module.exports = extraActions;
