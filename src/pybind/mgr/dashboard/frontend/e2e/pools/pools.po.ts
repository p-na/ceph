import { browser } from 'protractor';

export class PoolsPage {
  static navigateTo() {
    return browser.get('/#/pool');
  }

  static naviateToPoolCreation() {
    browser.get('/#/pool/create');
    browser.waitForAngular();
    browser.getCurrentUrl().then(url => expect(url.endsWith('create')).toBe(true));
  }
}
