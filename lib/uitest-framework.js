'use strict';

exports.bindFramework = (context) => {
  const { page } = context;
  page.on('console', async msg => {
    const values = [];
    for (const arg of msg.args()) {
      values.push(await arg.jsonValue());
    }
    console.log(...values);
  });
};
