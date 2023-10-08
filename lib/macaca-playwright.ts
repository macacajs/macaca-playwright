import path from 'path';
import { sync as mkdirp } from 'mkdirp';
import playwright from 'playwright';
import DriverBase from 'driver-base';

import _ from './helper';
import initRedirectConsole from './redirect-console';
import controllers from './controllers';
import extraActions from './next-actions';

const DEFAULT_CONTEXT = 'DEFAULT_CONTEXT';

type TContextOptions = {
  ignoreHTTPSErrors: boolean,
  locale: string,
  userAgent?: string,
  recordVideo?: string,
  viewport?: object,
};

class Playwright extends DriverBase {
  args = null;
  browser = null;
  browserContext = null;
  newContextOptions = {};
  frame = null;
  page = null;
  popup = null;
  locator = null; // 当前选中的 element
  atoms = [];
  pages = [];
  elements = {};
  browserContexts = [];

  static DEFAULT_CONTEXT = DEFAULT_CONTEXT;

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

    if (this.args.width && this.args.height) {
      newContextOptions.viewport = {
        width: this.args.width,
        height: this.args.height,
      };
    }

    this.newContextOptions = newContextOptions;
    await this._createContext();

    if (this.args.redirectConsole) {
      await initRedirectConsole(this);
    }
  }

  async _createContext(name = DEFAULT_CONTEXT, contextOptions = {}) {
    const index = this.browserContexts.length;
    const newContextOptions = Object.assign({}, contextOptions, this.newContextOptions);
    const browserContext = await this.browser.newContext(newContextOptions);
    browserContext.name = name;
    browserContext.index = index;
    this.browserContexts.push(browserContext);
    this.browserContext = this.browserContexts[index];
    this.pages.push(await this.browserContext.newPage());
    this.page = this.pages[index];
    // Get all popups when they open
    this.page.on('popup', async (popup) => {
      // 提前置空，防止取到缓存
      this.popup = null;
      await popup.waitForLoadState();
      this.popup = popup;
    });
    return index;
  }

  _setContext(index: number) {
    this.browserContext = this.browserContexts[index];
    this.page = this.pages[index];
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
