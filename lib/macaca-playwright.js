'use strict';

const path = require('path');
const { sync: mkdirp } = require('mkdirp');
const playwright = require('playwright');
const DriverBase = require('driver-base');

const _ = require('./helper');
const controllers = require('./controllers');
const initRedirectConsole = require('./redirect-console');

class Playwright extends DriverBase {

  constructor() {
    super();
    this.args = null;
    this.browser = null;
    this.browserContext = null;
    this.frame = null;
    this.page = null;
    this.atoms = [];
  }

  async startDevice(caps = {}) {
    this.args = _.clone(caps);

    const defaultLaunchOptions = {
      headless: true,
    };

    const launchOptions = Object.assign(defaultLaunchOptions, this.args);

    delete launchOptions.port;
    const browserName = this.args.browserName || 'chromium';
    this.browser = await playwright[browserName].launch(launchOptions);
    const newContextOptions = {
      locale: this.args.locale,
      ignoreHTTPSErrors: true,
    };

    if (this.args.userAgent) {
      newContextOptions.userAgent = this.args.userAgent;
    }

    if (this.args.recordVideo) {
      const dir = this.args.recordVideo.dir || path.resolve(process.cwd(), 'videos');
      mkdirp(dir);
      newContextOptions.recordVideo = Object.assign(this.args.recordVideo, {
        dir,
        size: { width: 1280, height: 800 },
      });
    }

    this.browserContext = await this.browser.newContext(newContextOptions);
    this.page = await this.browserContext.newPage();

    if (this.args.redirectConsole) {
      await initRedirectConsole(this);
    }
  }

  async stopDevice() {
    await this.browserContext.close();
    await this.browser.close();
    this.browser = null;
  }

  isProxy() {
    return false;
  }

  whiteList(context) {
    const basename = path.basename(context.url);
    const whiteList = [];
    return !!~whiteList.indexOf(basename);
  }
}

_.extend(Playwright.prototype, controllers);

module.exports = Playwright;
