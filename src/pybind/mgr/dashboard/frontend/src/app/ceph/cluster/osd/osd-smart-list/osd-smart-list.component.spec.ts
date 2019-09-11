import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsModule } from 'ngx-bootstrap/tabs';

import _ = require('lodash');
import { of } from 'rxjs';

import { configureTestBed, i18nProviders } from '../../../../../testing/unit-test-helper';
import { OsdService } from '../../../../shared/api/osd.service';
import { SharedModule } from '../../../../shared/shared.module';
import { OsdSmartListComponent } from './osd-smart-list.component';

describe('OsdSmartListComponent', () => {
  let component: OsdSmartListComponent;
  let fixture: ComponentFixture<OsdSmartListComponent>;
  let osdService: OsdService;

  const SMART_DATA_VERSION_1_0 = require('./fixtures/smart_data_version_1_0_response.json');

  const spyOnGetSmartData = (fn: (id: number) => any) =>
    spyOn(osdService, 'getSmartData').and.callFake(fn);

  /**
   * Initializes the component after it spied upon the `getSmartData()` method of `OsdService`.
   * @param data The data to be used to return when `getSmartData()` is called.
   * @param simpleChanges (optional) The changes to be used for `ngOnChanges()` method.
   */
  const initializeComponentWithData = (data?: any, simpleChanges?: SimpleChanges) => {
    spyOnGetSmartData(() => of(data || SMART_DATA_VERSION_1_0));
    component.ngOnInit();
    const changes: SimpleChanges = simpleChanges || {
      osdId: new SimpleChange(null, 0, true)
    };
    component.ngOnChanges(changes);
  };

  /**
   * Sets attributes for all returned devices according to the given path. The syntax is the same
   * as used in lodash.update().
   *
   * @example
   * patchData('json_format_version', [2, 0])  // sets the value of `json_format_version` to [2, 0]
   *                                           // for all devices
   *
   * patchData('json_format_version[0]', 2)    // same result
   *
   * @param path The path to the attribute
   * @param newValue The new value
   */
  const patchData = (path: string, newValue: any): any => {
    return _.reduce(
      SMART_DATA_VERSION_1_0,
      (result, dataObj, deviceId) => {
        _.update(dataObj, path, _.isFunction(newValue) ? newValue : () => newValue);
        result[deviceId] = dataObj;
        return result;
      },
      {}
    );
  };

  configureTestBed({
    declarations: [OsdSmartListComponent],
    imports: [TabsModule, SharedModule, HttpClientTestingModule],
    providers: [i18nProviders]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OsdSmartListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    osdService = TestBed.get(OsdService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('tests version 1.x', () => {
    beforeEach(() => initializeComponentWithData());

    it('should return with proper keys', () => {
      _.each(component.data, (smartData, _deviceId) => {
        expect(_.keys(smartData)).toEqual(['info', 'smart', 'device', 'identifier']);
      });
    });

    it('should not contain excluded keys in `info`', () => {
      const excludes = [
        'ata_smart_attributes',
        'ata_smart_selective_self_test_log',
        'ata_smart_data'
      ];
      _.each(component.data, (smartData, _deviceId) => {
        _.each(excludes, (exclude) => expect(smartData.info[exclude]).toBeUndefined());
      });
    });
  });

  it('should not work for version 2.x', () => {
    initializeComponentWithData(patchData('json_format_version', [2, 0]));
    expect(component.data).toEqual({});
    expect(component.incompatible).toBeTruthy();
  });
});
