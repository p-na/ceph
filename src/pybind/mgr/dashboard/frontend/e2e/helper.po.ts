import { $, $$, browser } from 'protractor';
import { PoolPageHelper } from './pools/pools.po';

interface Pages {
  index: string;
}

export abstract class PageHelper {
  pages: Pages;

  static getBreadcrumbText() {
    return $('.breadcrumb-item.active').getText();
  }

  static getTabText(idx) {
    return $$('.nav.nav-tabs li')
      .get(idx)
      .getText();
  }

  static getTabsCount() {
    return $$('.nav.nav-tabs li').count();
  }

  navigateTo(page = null) {
    let result;
    if (!page) {
      result = browser.get(this.pages.index);
    } else {
      result = browser.get(this.pages[page]);
    }
    browser.waitForAngular();
    browser.getCurrentUrl().then(url => expect(url.endsWith(this.pages[page])).toBe(true));
    return result;
  }
}

export class Helper {
  static EC = browser.ExpectedConditions;
  static TIMEOUT = 10000;

  pools: PoolPageHelper;

  constructor() {
    this.pools = new PoolPageHelper();
  }

  /**
   * Checks if there are any errors on the browser
   *
   * @static
   * @memberof Helper
   */
  static checkConsole() {
    browser
      .manage()
      .logs()
      .get('browser')
      .then(function(browserLog) {
        browserLog = browserLog.filter((log) => {
          return log.level.value > 900; // SEVERE level
        });

        if (browserLog.length > 0) {
          console.log('\n log: ' + require('util').inspect(browserLog));
        }

        expect(browserLog.length).toEqual(0);
      });
  }
}
