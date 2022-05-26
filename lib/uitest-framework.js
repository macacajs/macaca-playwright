'use strict';

// https://github.com/hugomrdias/playwright-test/blob/master/src/utils/index.js
const kleur = require('kleur');

const messageTypeToConsoleFn = {
  log: console.log,
  warning: console.warn,
  error: console.error,
  info: console.info,
  assert: console.assert,
  debug: console.debug,
  trace: console.trace,
  dir: console.dir,
  dirxml: console.dirxml,
  profile: console.profile,
  profileEnd: console.profileEnd,
  startGroup: console.group,
  startGroupCollapsed: console.groupCollapsed,
  endGroup: console.groupEnd,
  table: console.table,
  count: console.count,
  timeEnd: console.timeEnd,

  // we ignore calls to console.clear, as we don't want the page to clear our terminal
  // clear: console.clear
};


exports.bindFramework = async (context) => {
  const { page, browserContext } = context;
  await browserContext.exposeFunction('_screenshot', async text => {
    await page.screenshot({ path: Date.now() + 'screenshot.png' });
    // console.log('a', a);
  });
  async function redirectConsole(msg) {
    const type = msg.type();
    const consoleFn = messageTypeToConsoleFn[type];
  
    if (!consoleFn) {
      return;
    }
    const text = msg.text();
    const { url, lineNumber, columnNumber } = msg.location();
    let msgArgs;
  
    try {
      msgArgs = await Promise.all(
        msg.args().map((arg) => arg.jsonValue())
      );
    } catch {
      // ignore error runner was probably force stopped
    }
  
    if (msgArgs && msgArgs.length > 0) {
      consoleFn.apply(console, msgArgs);
    } else if (text) {
      let color = 'white';
  
      if (
        text.includes(
          'Synchronous XMLHttpRequest on the main thread is deprecated'
        )
      ) {
        return;
      }
      switch (type) {
        case 'error':
          color = 'red';
          break;
        case 'warning':
          color = 'yellow';
          break;
        case 'info':
        case 'debug':
          color = 'blue';
          break;
        default:
          break;
      }
  
      consoleFn(kleur[color](text));
  
      console.info(
        kleur.gray(
          `${url}${
            lineNumber
              ? ':' + lineNumber + (columnNumber ? ':' + columnNumber : '')
              : ''
          }`
        )
      );
      await context.stopDevice();
    }
  }
  page.on('console', redirectConsole);
};
