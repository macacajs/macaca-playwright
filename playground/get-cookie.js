const Playwright = require('../dist/lib/macaca-playwright');

async function main() {
  const driver = new Playwright();
  await driver.startDevice({
    headless: false,
  });
  await driver.get('https://www.baidu.com');
  const cookies = await driver.getAllCookies();
  const res = cookies.find(item => item.name === 'BAIDUID');
  await driver.stopDevice();
  return res?.value;
}

main()
  .then(res => {
    console.log(res);
  })
  .catch(e => {
    console.log(e);
  });
