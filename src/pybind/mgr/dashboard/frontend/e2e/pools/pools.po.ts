import { $, by, element } from 'protractor';
import { PageHelper } from '../helper.po';

export class PoolPageHelper extends PageHelper {
  pages = {
    index: '/#/pool/',
    create: '/#/pool/create'
  };

  createPool(name) {
    this.navigateTo('create');
    expect($('.panel-title').getText()).toBe('Create Pool');

    const inputName = $('input[name=name]');
    inputName.sendKeys(name);
    expect(inputName.getAttribute('value')).toBe(name);

    const inputType = element(by.cssContainingText('select[name=poolType] option', 'replicated'));
    inputType.click();
    inputType.getText().then(text => {
      console.log(`text is: ${text}`);
      expect(element(by.css('select[name=poolType] option:checked')).getText()).toBe(' replicated ');
      element(by.css('cd-submit-button')).click();
    }, () => console.log('failed'));
  }

  deletePool(name) {
    console.log(`PoolPageHelper::deletePool name=${name}`);
    this.navigateTo();

    const cell = element(by.cssContainingText('.datatable-body-cell-label', name));
    console.log(cell);
  }
}
