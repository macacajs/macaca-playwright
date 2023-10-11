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
  recordVideo?: object,
  viewport?: object,
};

class Playwright extends DriverBase {
  args = null;
  browser = null;
  browserContext = null;
  newContextOptions = {};
  frame = null;
  page = null;
  pagePopup = null;
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
      newContextOptions.recordVideo = {
        dir,
        size: { width: 1280, height: 800 },
        ...this.args.recordVideo,
      };
    }

    if (this.args.width && this.args.height) {
      newContextOptions.viewport = {
        width: this.args.width,
        height: this.args.height,
      };
      // 录像大小为窗口大小
      if (this.args.recordVideo) {
        newContextOptions.recordVideo = {
          ...newContextOptions.recordVideo,
          size: {
            width: this.args.width,
            height: this.args.height,
          },
        };
      }
    }

    this.newContextOptions = newContextOptions;
    await this._createContext();

    if (this.args.redirectConsole) {
      await initRedirectConsole(this);
    }
  }

  async _createContext(contextName?: string, contextOptions = {}) {
    if (!contextName) {
      contextName = DEFAULT_CONTEXT;
    }
    const index = this.browserContexts.length;
    const newContextOptions = {
      ...this.newContextOptions,
      ...contextOptions,
    };
    const browserContext = await this.browser.newContext(newContextOptions);
    browserContext.name = contextName;
    browserContext.index = index;
    this.browserContexts.push(browserContext);
    this.browserContext = this.browserContexts[index];
    this.pages.push(await this.browserContext.newPage());
    this.page = this.pages[index];
    // Get all popups when they open
    this.page.on('popup', async (popup) => {
      this.pagePopup = popup;
    });
    return index;
  }

  /**
   * 重建页面（变更配置）
   * 因为Page会继承Context的配置，通过重建保留cookie的方式达到不同设备环境快速访问的目的
   * @param contextName
   * @param contextOptions
   */
  async _rebuildContextPage(contextName?: string, contextOptions = {}) {
    if (!contextName) {
      contextName = DEFAULT_CONTEXT;
    }
    const index = this.browserContexts.findIndex(it => it.name === contextName);
    if (!this.browserContexts[index]) {
      console.error('target browserContext not found.');
      return null;
    }
    const cookies = await this.browserContexts[index].cookies().catch(e => {
      console.error(e.message);
    });
    const newContext = await this.browser.newContext({
      ...this.newContextOptions,
      ...contextOptions,
    });
    // 保留cookie
    if (cookies) {
      await newContext.addCookies(cookies);
    }
    // 先新建后关闭
    const newPage = await newContext.newPage();
    newPage.on('popup', async (popup) => {
      this.pagePopup = popup;
    });
    if (this.pages[index] && !this.pages[index].isClosed()) {
      const oldUrl = this.pages[index].url();
      await this.pages[index].close();
      await this.browserContexts[index].close();
      newPage.goto(oldUrl);
    }
    this.pages[index] = newPage;
    this.browserContexts[index] = newContext;
    this.page = this.pages[index];
    this.browserContext = this.browserContexts[index];
    return index;
  }

  /**
   * 切换窗口
   * @param contextName
   */
  async _switchContextPage(contextName?: string) {
    if (!contextName) {
      contextName = DEFAULT_CONTEXT;
    }
    const index = this.browserContexts.findIndex(it => it.name === contextName);
    this.browserContext = this.browserContexts[index];
    this.page = this.pages[index];
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
