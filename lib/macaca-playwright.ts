import path from 'path';
import { sync as mkdirp } from 'mkdirp';
import playwright, { ElementHandle, Frame, FrameLocator, Locator } from 'playwright';
import DriverBase from 'driver-base';

import _ from './helper';
import initRedirectConsole from './redirect-console';
import controllers from './controllers';
import extraActions from './next-actions';
import os from 'os';

const DEFAULT_CONTEXT = 'DEFAULT_CONTEXT';

type TContextOptions = {
  ignoreHTTPSErrors: boolean,
  locale: string,
  userAgent?: string,
  recordVideo?: object,
  viewport?: object,
  permissions?: string[],
  proxy?: {
    server: string;
    username?: string;
    password?: string;
  };
};

type TDeviceCaps = {
  port?: number;
  locale?: string;
  userAgent?: string;
  recordVideo?: {
    dir: string;
  };
  width?: number;
  height?: number;
  redirectConsole?: boolean;
  proxy?: {
    server: string;
    username?: string;
    password?: string;
  };
};

class Playwright extends DriverBase {
  args: TDeviceCaps = null;
  browserType = null;
  browser = null;
  browserContext = null;
  newContextOptions = {};
  pageIframes: Frame[] = [];
  page = null;
  pagePopup = null;
  pageIframe: Frame = null;
  locator: ElementHandle | Locator | FrameLocator = null; // 当前选中的 element 或 locator
  atoms = [];
  pages = [];
  elements = {};
  browserContexts = [];

  static DEFAULT_CONTEXT = DEFAULT_CONTEXT;

  async startDevice(caps: TDeviceCaps = {}) {
    this.args = _.clone(caps);

    const launchOptions = {
      headless: true,
      browserName: 'chromium',
      ...this.args,
    };
    delete launchOptions.port;
    if (
      this.args.proxy
      && launchOptions.browserName === 'chromium'
      && os.platform() === 'win32'
    ) {
      // Browser proxy option is required for Chromium on Windows.
      launchOptions.proxy = { server: 'per-context' };
    }
    this.browserType = await playwright[launchOptions.browserName];
    this.browser = await this.browserType.launch(launchOptions);
    const newContextOptions: TContextOptions = {
      locale: this.args.locale,
      ignoreHTTPSErrors: true,
      permissions: [
        'clipboard-read',
        'clipboard-write',
      ],
    };

    if (this.args.proxy) {
      newContextOptions.proxy = this.args.proxy;
    }

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
   * 切换窗口
   * @param contextName
   */
  async _switchContextPage(contextName?: string) {
    if (!contextName) {
      contextName = DEFAULT_CONTEXT;
    }
    const index = this.browserContexts.findIndex(it => it.name === contextName);
    this._setContext(index);
    return index;
  }

  _setContext(index: number) {
    this.browserContext = this.browserContexts[index];
    this.page = this.pages[index];
  }

  /**
   * 设置当前的page的Iframes
   */
  _freshPageIframes() {
    this.pageIframes = this.page.mainFrame().childFrames();
  }

  /**
   * 设置当前操作的iframe
   */
  _setPageIframeByIndex(index = 0) {
    this._freshPageIframes();
    if (!this.pageIframes[index]) {
      console.error('target iframe not found');
      return;
    }
    this.pageIframe = this.pageIframes[index];
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
