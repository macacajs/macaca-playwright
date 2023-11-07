const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { sync: mkdirp } = require('mkdirp');
const { errors } = require('webdriver-dfn-error-code');

const _ = require('./helper');
const logger = require('./logger');
const nextActions = require('./next-actions');

const ELEMENT_OFFSET = 1000;

const implicitWaitForCondition = function(func) {
  return _.waitForCondition(func, this?.implicitWaitMs);
};

const sendJSCommand = async function(script) {
  const atomScript = `(function(){return function(){var e=this;
function h(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==
b&&"undefined"==typeof a.call)return"object";return b}function aa(a){var b=h(a);return"array"==b||"object"==b&&"number"==typeof a.length}function ba(a){var b=typeof a;return"object"==b&&null!=a||"function"==b}var l=Date.now||function(){return+new Date};var ca=window;function m(a,b){this.code=a;this.b=n[a]||p;this.message=b||"";var c=this.b.replace(/((?:^|\\s+)[a-z])/g,function(a){return a.toUpperCase().replace(/^[\\s\xa0]+/g,"")}),d=c.length-5;if(0>d||c.indexOf("Error",d)!=d)c+="Error";this.name=c;c=Error(this.message);c.name=this.name;this.stack=c.stack||""}
(function(){var a=Error;function b(){}b.prototype=a.prototype;m.c=a.prototype;m.prototype=new b;m.prototype.constructor=m;m.b=function(b,d,g){for(var f=Array(arguments.length-2),k=2;k<arguments.length;k++)f[k-2]=arguments[k];return a.prototype[d].apply(b,f)}})();var p="unknown error",n={15:"element not selectable",11:"element not visible"};n[31]=p;n[30]=p;n[24]="invalid cookie domain";n[29]="invalid element coordinates";n[12]="invalid element state";n[32]="invalid selector";n[51]="invalid selector";
n[52]="invalid selector";n[17]="javascript error";n[405]="unsupported operation";n[34]="move target out of bounds";n[27]="no such alert";n[7]="no such element";n[8]="no such frame";n[23]="no such window";n[28]="script timeout";n[33]="session not created";n[10]="stale element reference";n[21]="timeout";n[25]="unable to set cookie";n[26]="unexpected alert open";n[13]=p;n[9]="unknown command";m.prototype.toString=function(){return this.name+": "+this.message};var q=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\\s\xa0]+|[\\s\xa0]+$/g,"")};
function r(a,b){for(var c=0,d=q(String(a)).split("."),g=q(String(b)).split("."),f=Math.max(d.length,g.length),k=0;0==c&&k<f;k++){var H=d[k]||"",I=g[k]||"",u=RegExp("(\\\\d*)(\\\\D*)","g"),sa=RegExp("(\\\\d*)(\\\\D*)","g");do{var v=u.exec(H)||["","",""],w=sa.exec(I)||["","",""];if(0==v[0].length&&0==w[0].length)break;c=t(0==v[1].length?0:parseInt(v[1],10),0==w[1].length?0:parseInt(w[1],10))||t(0==v[2].length,0==w[2].length)||t(v[2],w[2])}while(0==c)}return c}function t(a,b){return a<b?-1:a>b?1:0};function x(a,b){for(var c=a.length,d=Array(c),g="string"==typeof a?a.split(""):a,f=0;f<c;f++)f in g&&(d[f]=b.call(void 0,g[f],f,a));return d};var y;a:{var z=e.navigator;if(z){var A=z.userAgent;if(A){y=A;break a}}y=""}function B(a){return-1!=y.indexOf(a)};function da(a,b){var c={},d;for(d in a)b.call(void 0,a[d],d,a)&&(c[d]=a[d]);return c}function C(a,b){var c={},d;for(d in a)c[d]=b.call(void 0,a[d],d,a);return c}function D(a,b){return null!==a&&b in a}function ea(a,b){for(var c in a)if(b.call(void 0,a[c],c,a))return c};function E(){return B("Opera")||B("OPR")}function F(){return(B("Chrome")||B("CriOS"))&&!E()&&!B("Edge")};function G(){return B("iPhone")&&!B("iPod")&&!B("iPad")};var fa=E(),J=B("Trident")||B("MSIE"),ga=B("Edge"),K=B("Gecko")&&!(-1!=y.toLowerCase().indexOf("webkit")&&!B("Edge"))&&!(B("Trident")||B("MSIE"))&&!B("Edge"),ha=-1!=y.toLowerCase().indexOf("webkit")&&!B("Edge");function ia(){var a=y;if(K)return/rv\\:([^\\);]+)(\\)|;)/.exec(a);if(ga)return/Edge\\/([\\d\\.]+)/.exec(a);if(J)return/\\b(?:MSIE|rv)[: ]([^\\);]+)(\\)|;)/.exec(a);if(ha)return/WebKit\\/(\\S+)/.exec(a)}function ja(){var a=e.document;return a?a.documentMode:void 0}
var L=function(){if(fa&&e.opera){var a;var b=e.opera.version;try{a=b()}catch(c){a=b}return a}a="";(b=ia())&&(a=b?b[1]:"");return J&&(b=ja(),b>parseFloat(a))?String(b):a}(),M={},ka=e.document,la=ka&&J?ja()||("CSS1Compat"==ka.compatMode?parseInt(L,10):5):void 0;var ma=B("Firefox"),na=G()||B("iPod"),oa=B("iPad"),N=B("Android")&&!(F()||B("Firefox")||E()||B("Silk")),pa=F(),qa=B("Safari")&&!(F()||B("Coast")||E()||B("Edge")||B("Silk")||B("Android"))&&!(G()||B("iPad")||B("iPod"));function O(a){return(a=a.exec(y))?a[1]:""}var ra=function(){if(ma)return O(/Firefox\\/([0-9.]+)/);if(J||ga||fa)return L;if(pa)return O(/Chrome\\/([0-9.]+)/);if(qa&&!(G()||B("iPad")||B("iPod")))return O(/Version\\/([0-9.]+)/);if(na||oa){var a;if(a=/Version\\/(\\S+).*Mobile\\/(\\S+)/.exec(y))return a[1]+"."+a[2]}else if(N)return(a=O(/Android\\s+([0-9.]+)/))?a:O(/Version\\/([0-9.]+)/);return""}();var P,ta;function Q(a){R?ta(a):N?r(ua,a):r(ra,a)}var R=function(){if(!K)return!1;var a=e.Components;if(!a)return!1;try{if(!a.classes)return!1}catch(b){return!1}var c=a.classes,a=a.interfaces,d=c["@mozilla.org/xpcom/version-comparator;1"].getService(a.nsIVersionComparator),c=c["@mozilla.org/xre/app-info;1"].getService(a.nsIXULAppInfo),g=c.platformVersion,f=c.version;P=function(a){return 0<=d.compare(g,""+a)};ta=function(a){d.compare(f,""+a)};return!0}(),S;
if(N){var va=/Android\\s+([0-9\\.]+)/.exec(y);S=va?va[1]:"0"}else S="0";var ua=S;N&&Q(2.3);N&&Q(4);qa&&Q(6);function wa(){}
function T(a,b,c){if(null==b)c.push("null");else{if("object"==typeof b){if("array"==h(b)){var d=b;b=d.length;c.push("[");for(var g="",f=0;f<b;f++)c.push(g),T(a,d[f],c),g=",";c.push("]");return}if(b instanceof String||b instanceof Number||b instanceof Boolean)b=b.valueOf();else{c.push("{");g="";for(d in b)Object.prototype.hasOwnProperty.call(b,d)&&(f=b[d],"function"!=typeof f&&(c.push(g),xa(d,c),c.push(":"),T(a,f,c),g=","));c.push("}");return}}switch(typeof b){case "string":xa(b,c);break;case "number":c.push(isFinite(b)&&
!isNaN(b)?String(b):"null");break;case "boolean":c.push(String(b));break;case "function":c.push("null");break;default:throw Error("Unknown type: "+typeof b);}}}var ya={'"':'\\\\"',"\\\\":"\\\\\\\\","/":"\\\\/","\\b":"\\\\b","\\f":"\\\\f","\\n":"\\\\n","\\r":"\\\\r","\\t":"\\\\t","\x0B":"\\\u000b"},za=/\uffff/.test("\uffff")?/[\\\\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\\\\"\x00-\x1f\x7f-\xff]/g;
function xa(a,b){b.push('"',a.replace(za,function(a){var b=ya[a];b||(b="\\\\u"+(a.charCodeAt(0)|65536).toString(16).substr(1),ya[a]=b);return b}),'"')};ha||K&&(R?P(3.5):J?0<=r(la,3.5):M[3.5]||(M[3.5]=0<=r(L,3.5)))||J&&(R?P(8):J?r(la,8):M[8]||(M[8]=0<=r(L,8)));function U(a){switch(h(a)){case "string":case "number":case "boolean":return a;case "function":return a.toString();case "array":return x(a,U);case "object":if(D(a,"nodeType")&&(1==a.nodeType||9==a.nodeType)){var b={};b.ELEMENT=Aa(a);return b}if(D(a,"document"))return b={},b.WINDOW=Aa(a),b;if(aa(a))return x(a,U);a=da(a,function(a,b){return"number"==typeof b||"string"==typeof b});return C(a,U);default:return null}}
function V(a,b){return"array"==h(a)?x(a,function(a){return V(a,b)}):ba(a)?"function"==typeof a?a:D(a,"ELEMENT")?Ba(a.ELEMENT,b):D(a,"WINDOW")?Ba(a.WINDOW,b):C(a,function(a){return V(a,b)}):a}function Ca(a){a=a||document;var b=a.$wdc_;b||(b=a.$wdc_={},b.a=l());b.a||(b.a=l());return b}function Aa(a){var b=Ca(a.ownerDocument),c=ea(b,function(b){return b==a});c||(c=":wdc:"+b.a++,b[c]=a);return c}
function Ba(a,b){a=decodeURIComponent(a);var c=b||document,d=Ca(c);if(!D(d,a))throw new m(10,"Element does not exist in cache");var g=d[a];if(D(g,"setInterval")){if(g.closed)throw delete d[a],new m(23,"Window has been closed.");return g}for(var f=g;f;){if(f==c.documentElement)return g;f=f.parentNode}delete d[a];throw new m(10,"Element is no longer attached to the DOM");};function Da(a,b,c,d){d=d||ca;var g;try{a:{var f=a;if("string"==typeof f)try{a=new d.Function(f);break a}catch(k){if(J&&d.execScript){d.execScript(";");a=new d.Function(f);break a}throw k;}a=d==window?f:new d.Function("return ("+f+").apply(null,arguments);")}var H=V(b,d.document),I=a.apply(null,H);g={status:0,value:U(I)}}catch(u){g={status:D(u,"code")?u.code:13,value:{message:u.message}}}c&&(a=[],T(new wa,g,a),g=a.join(""));return g}var W=["_"],X=e;W[0]in X||!X.execScript||X.execScript("var "+W[0]);
for(var Y;W.length&&(Y=W.shift());){var Z;if(Z=!W.length)Z=void 0!==Da;Z?X[Y]=Da:X[Y]?X=X[Y]:X=X[Y]={}};; return this._.apply(null,arguments);}.apply({navigator:typeof window!=undefined?window.navigator:null,document:typeof window!=undefined?window.document:null}, arguments);})`;

  const command = `${atomScript}(${JSON.stringify(script)})`;

  let res;
  await implicitWaitForCondition.call(this, async () => {
    res = await (this.pageIframe || this.page).evaluate(command);
    return !!res;
  });

  if (res.value) {
    return res.value;
  }

  try {
    return JSON.parse(res).value;
  } catch (e) {
    return null;
  }
};

const convertAtoms2Element = function(atoms) {
  const atomsId = atoms && atoms.ELEMENT;

  if (!atomsId) {
    return null;
  }

  const index = this.atoms.push(atomsId) - 1;

  return {
    ELEMENT: index + ELEMENT_OFFSET,
  };
};

const findElementOrElements = async function(strategy, selector, ctx, many) {
  strategy = strategy.toLowerCase();

  let result;
  this.elements = {};

  // cache locator
  if (strategy === 'xpath') {
    this.locator = (this.pageIframe || this.page).locator(selector);
  }
  /**
     * `css selector` and `xpath` is default
     */
  if (strategy === 'name') {
    selector = `text=${selector}`;
  } else if (strategy === 'id') {
    selector = `//*[@id="${selector}"]`;
  }

  try {
    await (this.pageIframe || this.page).waitForSelector(selector, {
      state: 'attached',
      timeout: 500,
    });
  } catch (_) {
    result = [];
  }

  if (many) {
    try {
      result = await (this.pageIframe || this.page).$$(selector);
    } catch (e) {
      logger.debug(e);
      result = [];
    }
    const elements = [];
    for (const item of result) {
      const isVisible = await item.isVisible();
      if (!isVisible) {
        continue;
      }
      this.elements[item._guid] = item;
      elements.push({
        ELEMENT: item._guid,
      });
    }
    return elements;
  }

  result = await (this.pageIframe || this.page).$(selector);

  if (!result || _.size(result) === 0) {
    throw new errors.NoSuchElement();
  }

  this.elements[result._guid] = result;

  return {
    ELEMENT: result._guid,
  };
};

const controllers = {};

/**
 * Change focus to another frame on the page.
 *
 * @module setFrame
 * @return {Promise}
 * @param frameElement
 */
controllers.setFrame = async function(frameElement) {
  let ele;
  if (frameElement) {
    ele = await this.elements[frameElement.ELEMENT];
    if (!ele) {
      throw new errors.NoSuchElement();
    }
    this.pageIframe = await ele.contentFrame();
    if (!this.pageIframe) {
      throw new errors.NoSuchFrame();
    }
  } else {
    // clear pageIframe
    this.pageIframe = null;
    return null;
  }
  return null;
};

/**
 * Click on an element.
 * @module click
 * @return {Promise}
 */
controllers.click = async function(elementId, options = {}) {
  const element = this.elements[elementId];
  if (!element) {
    logger.error('click element is not found');
    return null;
  }
  if (!element.isVisible()) {
    logger.error('click element is not visible');
    return null;
  }
  await element.click({
    timeout: 2E3,
    delay: 200,
    ...options,
  }).catch(async e => {
    // 处理一些需要自动重试的异常
    if (e.message.includes('Element is not attached')) {
      await _.sleep(2E3);
      await element.click({
        timeout: 2E3,
        delay: 200,
        ...options,
      });
    } else {
      throw e;
    }
  });
  return null;
};

/**
 * take element screenshot.
 *
 * @module takeElementScreenshot
 * @return {Promise}
 */
controllers.takeElementScreenshot = async function(elementId, params = {}) {
  const { file } = params;
  let image;
  if (elementId) {
    image = await this.elements[elementId].screenshot();
  } else if (this.locator) {
    image = await this.locator.screenshot();
  } else {
    throw new errors.NoSuchElement();
  }
  const base64 = image.toString('base64');
  if (file) {
    const img = new Buffer(base64, 'base64');
    const realPath = path.resolve(file);
    mkdirp(path.dirname(realPath));
    fs.writeFileSync(realPath, img.toString('binary'), 'binary');
  }
  return base64;
};

/**
 * Search for an element on the page, starting from the document root.
 * @module findElement
 * @param {string} strategy The type
 * @param selector Selector string
 * @param {string} ctx The search target.
 * @return {Promise.<Element>}
 */
controllers.findElement = async function(strategy, selector, ctx) {
  return findElementOrElements.call(this, strategy, selector, ctx, false);
};

controllers.findElements = async function(strategy, selector, ctx) {
  return findElementOrElements.call(this, strategy, selector, ctx, true);
};

/**
 * Returns the visible text for the element.
 *
 * @module getText
 * @return {Promise.<string>}
 */
controllers.getText = async function(elementId) {
  const element = this.elements[elementId];
  return element.innerText();
};

/**
 * Clear a TEXTAREA or text INPUT element's value.
 *
 * @module clearText
 * @return {Promise.<string>}
 */
controllers.clearText = async function(elementId) {
  const element = this.elements[elementId];
  await element.fill('');
  return null;
};

/**
 * Set element's value.
 *
 * @module setValue
 * @param elementId
 * @param value
 * @return {Promise.<string>}
 */
controllers.setValue = async function(elementId, value) {
  if (!Array.isArray(value)) {
    value = [ value ];
  }
  const element = this.elements[elementId];
  await element.fill(...value);
  return null;
};


/**
 * Determine if an element is currently displayed.
 *
 * @module isDisplayed
 * @return {Promise.<string>}
 */
controllers.isDisplayed = async function(elementId) {
  const element = this.elements[elementId];
  return element.isVisible();
};

/**
 * Get the value of an element's property.
 *
 * @module getProperty
 * @return {Promise.<string>}
 */
controllers.getProperty = async function(elementId, attrName) {
  const element = this.elements[elementId];
  return element.getAttribute(attrName);
};

/**
 * Get the current page title.
 *
 * @module title
 * @return {Promise.<Object>}
 */
controllers.title = async function() {
  return (this.pageIframe || this.page).title();
};

/**
 * Inject a snippet of JavaScript into the page for execution in the context of the currently selected frame.
 *
 * @module execute
 * @param script script
 * @return {Promise.<string>}
 */
controllers.execute = async function(script) {

  const value = await sendJSCommand.call(this, script);

  if (Array.isArray(value)) {
    return value.map(convertAtoms2Element.bind(this));
  }
  return value;

};

/**
 * Retrieve the URL of the current page.
 *
 * @module url
 * @return {Promise.<string>}
 */
controllers.url = async function() {
  return (this.pageIframe || this.page).url();
};

/**
 * Navigate to a new URL.
 *
 * @module get
 * @param url get a new url.
 * @return {Promise.<string>}
 */
controllers.get = async function(url) {
  this.pageIframe = null;
  await this.page.goto(url, {
    waitUntil: 'load' || 'networkidle',
  });
  return null;
};

/**
 * Navigate forwards in the browser history, if possible.
 *
 * @module forward
 * @return {Promise.<string>}
 */
controllers.forward = async function() {
  this.pageIframe = null;
  await this.page.goForward();
  return null;
};

/**
 * Navigate backwards in the browser history, if possible.
 *
 * @module back
 * @return {Promise.<string>}
 */
controllers.back = async function() {
  this.pageIframe = null;
  await this.page.goBack();
  return null;
};

/**
 * Get all window handlers.
 *
 * @module back
 * @return {Promise}
 */
controllers.getWindows = async function() {
  return this.page.frames();
};

/**
 * Change focus to another window.
 *
 * @module setWindow
 * @return {Promise.<string>}
 */
controllers.setWindow = async function(name) {
  await this._switchContextPage(name);
  return null;
};

/**
 * Close the current window.
 *
 * @module deleteWindow
 * @return {Promise.<string>}
 */
controllers.deleteWindow = async function() {
  await this.page?.close();
  return null;
};

/**
 * Set the size of the specified window.
 *
 * @module setWindowSize
 * @param [windowHandle] window handle to set size for (optional, default: 'current')
 * @param width
 * @param height
 * @return {Promise.<string>}
 */
controllers.setWindowSize = async function(windowHandle, width, height) {
  if (windowHandle && windowHandle !== 'current') {
    const index = this.browserContexts.findIndex(item => item.name === windowHandle);
    await this.pages[index]?.setViewportSize({
      width,
      height,
    });
    return null;
  }
  await this.page.setViewportSize({
    width,
    height,
  });
  return null;
};

/**
 * Get the size of the specified window.
 *
 * @module getWindowSize
 * @param [windowHandle] window handle to set size for (optional, default: 'current')
 */
controllers.getWindowSize = function(windowHandle) {
  if (windowHandle && windowHandle !== 'current') {
    const index = this.browserContexts.findIndex(item => item.name === windowHandle);
    return this.pages[index]?.viewportSize();
  }
  return this.page.viewportSize();
};

/**
 * Maximize the specified window if not already maximized.
 *
 * @module maximize
 * @param windowHandle window handle
 * @return {Promise.<string>}
 */
controllers.maximize = async function(windowHandle) {
  return this.setWindowSize(windowHandle, 1920, 1080);
};

/**
 * Refresh the current page.
 *
 * @module refresh
 * @return {Promise.<string>}
 */
controllers.refresh = async function() {
  this.pageIframe = null;
  return this.page.reload();
};

/**
 * Get the current page source.
 *
 * @module getSource
 * @return {Promise.<string>}
 */
controllers.getSource = async function() {
  const cmd = 'return document.getElementsByTagName(\'html\')[0].outerHTML';
  return this.execute(cmd);
};

/**
 * Take a screenshot of the current page.
 *
 * @module getScreenshot
 * @return {Promise.<string|null>} The screenshot as a base64 encoded PNG.
 */
controllers.getScreenshot = async function(context, params = {}) {
  // boolean 参数安全处理
  if (typeof params.fullPage === 'string') {
    params.fullPage = params.fullPage === 'true';
  }
  if (params.video) {
    return await this.page.video()?.path?.() || null;
  }
  const image = await this.page.screenshot(params);
  const base64 = image.toString('base64');

  if (params.dir) {
    const img = new Buffer(base64, 'base64');
    const dir = path.resolve(params.dir);
    mkdirp(path.dirname(dir));
    fs.writeFileSync(dir, img.toString('binary'), 'binary');
  }
  return base64;
};

/**
 * Query the value of an element's computed CSS property.
 *
 * https://www.w3.org/TR/webdriver/#dfn-get-element-css-value
 * @module getComputedCss
 * @return {Promise.<string>}
 */
controllers.getComputedCss = async function(elementId, propertyName) {
  const element = this.elements[elementId];
  /* istanbul ignore next */
  return this.page.evaluate(([ element, propertyName ]) => window.getComputedStyle(element)[propertyName], [ element, propertyName ]);
};

/**
 * Returns all cookies associated with the address of the current browsing context’s active document.
 *
 * @module getAllCookies
 * @return {Promise.<string>}
 */
controllers.getAllCookies = async function() {
  return this.browserContext.cookies();
};

/**
 * Returns the cookie with the requested name from the associated cookies in the cookie store of the current browsing context’s active document. If no cookie is found, a no such cookie error is returned.
 *
 * @module getNamedCookie
 * @return {Promise.<string>}
 */
controllers.getNamedCookie = async function() {
  return this.browserContext.cookies();
};

/**
 * Adds a single cookie to the cookie store associated with the active document’s address.
 *
 * @module addCookie
 * @return {Promise.<string>}
 */
controllers.addCookie = async function(cookie) {
  await this.browserContext.addCookies(cookie);
  return null;
};

/**
 * Delete either a single cookie by parameter name, or all the cookies associated with the active document’s address if name is undefined.
 *
 * @module deleteCookie
 * @return {Promise.<boolean>}
 */
controllers.deleteCookie = async function(cookie) {
  await this.browserContext.clearCookies(cookie);
  return true;
};

/**
 * Delete All Cookies command allows deletion of all cookies associated with the active document’s address.
 *
 * @module deleteAllCookies
 * @return {Promise.<boolean>}
 */
controllers.deleteAllCookies = async function() {
  await this.browserContext.clearCookies();
  return true;
};

controllers.getContexts = async function() {
  return this.browserContexts;
};

controllers.getContext = async function() {
  return this.browserContext;
};

controllers.setContext = async function(name, ctxOpts) {
  const index = this.browserContexts.findIndex(item => item.name === name);
  if (index !== -1) {
    this._setContext(index);
  } else {
    await this._createContext(name, ctxOpts);
  }
  return true;
};

controllers.getRect = async function(elementId) {
  const element = this.elements[elementId];
  return element.boundingBox();
};

/**
 * next 标准扩展
 * @return {Promise}
 */
controllers.next = async function(method, args = []) {
  assert(method, 'method name is required');
  return nextActions[method].call(this, ...args);
};

module.exports = controllers;
