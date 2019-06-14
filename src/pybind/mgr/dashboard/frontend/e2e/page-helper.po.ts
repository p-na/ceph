import { $, $$, browser, by, element } from 'protractor';

interface Pages {
  index: string;
}

export abstract class PageHelper {
  pages: Pages;

  static getBreadcrumbText() {
    let breadcrumb;
    return browser.wait(() => {
      breadcrumb = $('.breadcrumb-item.active');
      return breadcrumb.isPresent();
    }, 6000).then(() => breadcrumb.getText());
  }

  static getTabText(idx) {
    return $$('.nav.nav-tabs li')
      .get(idx)
      .getText();
  }

  static getTitleText() {
    let title;
    return browser.wait(() => {
      title = $('.panel-title');
      return title.isPresent();
    }).then(() => title.getText());
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
