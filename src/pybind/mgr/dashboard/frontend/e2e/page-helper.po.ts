import { $, $$, browser, by, element } from 'protractor';

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

  static getTitleText() {
    return $('.panel-title').getText();
  }

  static getTabsCount() {
    return $$('.nav.nav-tabs li').count();
  }

  static getTableCell(content) {
      return element(by.cssContainingText('.datatable-body-cell-label', content));
  }

  navigateTo(page = null) {
    page = page || 'index';
    const url = this.pages[page];
    return browser.get(url);
      // .then(() => {
      // browser.getCurrentUrl().then(actualUrl => expect(actualUrl).toMatch(new RegExp(`${url}$`)));
    // });
  }
}
