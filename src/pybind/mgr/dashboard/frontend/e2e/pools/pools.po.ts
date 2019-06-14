import { $, browser, by, element } from 'protractor';
import { protractor } from 'protractor/built/ptor';
import { Helper } from '../helper.po';
import { PageHelper } from '../page-helper.po';

export class PoolPageHelper extends PageHelper {
  pages = {
    index: '/#/pool',
    create: '/#/pool/create'
  };

  create(name) {
    return new Promise((resolve) => {
      const start = (new Date).getTime();
      this.navigateTo('create');
      expect(PageHelper.getTitleText()).toBe('Create Pool');

      const inputName = $('input[name=name]');
      inputName.sendKeys(name);
      expect(inputName.getAttribute('value')).toBe(name);

      const inputType = element(by.cssContainingText('select[name=poolType] option', 'replicated'));
      inputType.click();
      expect(element(by.css('select[name=poolType] option:checked')).getText()).toBe(' replicated ');

      element(by.css('cd-submit-button')).click().then(() => {
        browser.wait(() => {
          return PoolPageHelper.getTableCell(name).isDisplayed().then(b => b, () => {});
        }, Helper.TIMEOUT).then(() => {
          resolve((new Date).getTime() - start);
        });
      });
    });
  }

  delete(name) {
    return new Promise((resolve) => {
      this.navigateTo();

      const poolTableCell = PoolPageHelper.getTableCell(name);
      browser.wait(poolTableCell.isPresent(), Helper.TIMEOUT, 'not present :(').then(() => {
        poolTableCell.click();
        $('.table-actions button.dropdown-toggle').click(); // Open submenu
        $('li.delete a').click(); // Click Delete item
        $('#confirmation').click(); // Check `Yes, I am sure` checkbox
        element(by.cssContainingText('button', 'Delete Pool')).click();

        this.navigateTo();
        const EC = protractor.ExpectedConditions;
        browser.wait(EC.presenceOf(PoolPageHelper.getTableCell(name)), Helper.TIMEOUT, 'Takes too long').catch(resolve);
      });
    });
  }

}
