'use strict';

if (process.argv[2] === 'child') {
  const path = require('path');
  const Playwright = require('../../lib/macaca-playwright');
  const driver = new Playwright();
  (async () => {
    await driver.startDevice({
      headless: true,
      redirectConsole: true,
    });
    if (process.argv[3] === 'load4') {
      await driver.get('file://' + path.resolve(__dirname, '../webpages/4.html'));
    } else {
      await driver.execute(`console.${process.argv[3]}('${process.argv[4]}')`);
    }
    await driver.stopDevice();
  })();
  
} else {
  const { fork } = require('child_process');

  module.exports = function(type, value) {
    const child = fork(__filename, [ 'child', type, value ], { silent: true });
    const data = [];

    child.stdout.on('data', chunk => data.push(chunk));
    child.stderr.on('data', chunk => data.push(chunk));

    return new Promise((resolve) => {
      child.on('exit', () => {
        resolve(data.join('').trimEnd());
      });
    });
  };
}
