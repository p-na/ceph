import { $, browser, by, element } from 'protractor';
import { Helper } from '../helper.po';
import { PoolsPage } from './pools.po';

describe('Pools page', () => {
  // let page: PoolsPage;

  beforeAll(() => {
    // page = new PoolsPage();
  });

  afterEach(() => {
    Helper.checkConsole();
  });

  describe('breadcrumb and tab tests', () => {
    beforeAll(() => {
      PoolsPage.navigateTo();
    });

    it('should open and show breadcrumb', () => {
      expect(Helper.getBreadcrumbText()).toEqual('Pools');
    });

    it('should show two tabs', () => {
      expect(Helper.getTabsCount()).toEqual(2);
    });

    it('should show pools list tab at first', () => {
      expect(Helper.getTabText(0)).toEqual('Pools List');
    });

    it('should show overall performance as a second tab', () => {
      expect(Helper.getTabText(1)).toEqual('Overall Performance');
    });

    it('should create a pool', () => {
      PoolsPage.naviateToPoolCreation();
      expect($('.panel-title').getText()).toBe('Create Pool');

      const inputName = $('input[name=name]');
      inputName.sendKeys('foobar');
      expect(inputName.getAttribute('value')).toBe('foobar');

      const inputType = element(by.cssContainingText('select[name=poolType] option', 'replicated'));
      console.log(inputType.getText());
      inputType.click(); // select
      expect(inputType.element(by.css('option:checked')).getText()).toBe('replicated');

      // element(by.cssContainingText('select[name=poolType]', 'replicated')).click();
      // $('form[name=form]').submit();
      // element(by.name('form')).submit();
      // browser.getCurrentUrl().then(url => expect(url).toBe('/#/pool'));
    });
  });
});
