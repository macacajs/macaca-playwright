import path from 'path';
import { sync as mkdirp } from 'mkdirp';
import playwright from 'playwright';
import DriverBase from 'driver-base';

import _ from './helper';
import initRedirectConsole from './redirect-console';
import controllers from './controllers';
import extraActions from './extra-actions';

type TContextOptions = {
  ignoreHTTPSErrors: boolean,
  locale: string,
  userAgent?: string,
  recordVideo?: string,
};

class Playwright extends DriverBase {
  args = null;
  browser = null;
  browserContext = null;
  newContextOptions = {};
  frame = null;
  page = null;
  atoms = [];
  pages = [];
  browserContexts = [];
  currentContextIndex = 0;

  async startDevice(caps = {}) {
    this.args = _.clone(caps);

    const defaultLaunchOptions = {
      headless: true,
    };

    const launchOptions = Object.assign(defaultLaunchOptions, this.args);

    delete launchOptions.port;
    const browserName = this.args.browserName || 'chromium';
    this.browser = await playwright[browserName].launch(launchOptions);
    const newContextOptions: TContextOptions = {
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

    this.newContextOptions = newContextOptions;
    await this._createContext();

    if (this.args.redirectConsole) {
      await initRedirectConsole(this);
    }
  }

  async _createContext(name = 'DEFAULT_CONTEXT', contextOptions = {}) {
    const index = this.browserContexts.length;
    const newContextOptions = Object.assign({}, contextOptions, this.newContextOptions);
    const browserContext = await this.browser.newContext(newContextOptions);
    browserContext.name = name;
    browserContext.index = index;
    this.browserContexts.push(browserContext);
    this.browserContext = this.browserContexts[index];
    this.pages.push(await this.browserContext.newPage());
    this.page = this.pages[index];
    return index;
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
_.extend(Playwright.prototype, extraActions);

module.exports = Playwright;
