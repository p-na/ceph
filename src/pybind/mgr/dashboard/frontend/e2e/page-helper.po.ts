import { $, $$, browser } from 'protractor';

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
    page = page || 'index';
    const url = this.pages[page];
    const result = browser.get(url);
    browser.waitForAngular();
    browser.getCurrentUrl().then(actualUrl => expect(actualUrl).toMatch(new RegExp(`${url}$`)));
    return result;
  }
}
