'use strict';

const path = require('path');
const playwright = require('playwright');
const DriverBase = require('driver-base');

const _ = require('./helper');
const pkg = require('../package');
const controllers = require('./controllers');

class Playwright extends DriverBase {

  constructor() {
    super();
    this.args = null;
    this.browser = null;
    this.frame = null;
    this.page = null;
    this.atoms = [];
  }

  async startDevice(caps) {
    this.args = _.clone(caps || {});

    const defaultLaunchOptions = {
      headless: true,
    };

    const launchOptions = Object.assign(defaultLaunchOptions, this.args);

    delete launchOptions.port;
    const browserName = this.args.browserName || 'chromium';
    this.browser = await playwright[browserName].launch(launchOptions);
    const newPageOptions = {
      userAgent: this.args.userAgent || pkg.description,
    };
    this.page = await this.browser.newPage(newPageOptions);
  }

  async stopDevice() {
    this.browser.close();
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
