

const _ = require('lodash');

_.sleep = function(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

_.waitForCondition = function(func, wait/* ms*/, interval/* ms*/) {
  wait = wait || 5000;
  interval = interval || 500;
  const start = Date.now();
  const end = start + wait;

  const fn = function() {
    return new Promise((resolve, reject) => {
      const continuation = (res, rej) => {
        const now = Date.now();

        if (now < end) {
          res(_.sleep(interval).then(fn));
        } else {
          rej(`Wait For Condition timeout ${wait}`);
        }
      };
      func().then(isOk => {

        if (isOk) {
          resolve();
        } else {
          continuation(resolve, reject);
        }
      }).catch(() => {
        continuation(resolve, reject);
      });
    });
  };
  return fn();
};

module.exports = _;
