import { LOCALE_ID, TRANSLATIONS, TRANSLATIONS_FORMAT } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { I18n } from '@ngx-translate/i18n-polyfill';
import * as _ from 'lodash';

import { ActionLabels } from "../app/shared/constants/app.constants";
import { TableActionsComponent } from '../app/shared/datatable/table-actions/table-actions.component';
import { CdFormGroup } from '../app/shared/forms/cd-form-group';
import { Permission } from '../app/shared/models/permissions';
import {
  PrometheusAlert,
  PrometheusNotification,
  PrometheusNotificationAlert
} from '../app/shared/models/prometheus-alerts';
import { _DEV_ } from '../unit-test-configuration';
import { RbdListComponent } from "../app/ceph/block/rbd-list/rbd-list.component";
import { SummaryService } from "../app/shared/services/summary.service";
import { RbdService } from "../app/shared/api/rbd.service";
import { BehaviorSubject } from "rxjs";


export function configureTestBed(configuration, useOldMethod?) {
  if (_DEV_ && !useOldMethod) {
    const resetTestingModule = TestBed.resetTestingModule;
    beforeAll((done) =>
      (async () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule(configuration);
        // prevent Angular from resetting testing module
        TestBed.resetTestingModule = () => TestBed;
      })()
        .then(done)
        .catch(done.fail)
    );
    afterAll(() => {
      TestBed.resetTestingModule = resetTestingModule;
    });
  } else {
    beforeEach(async(() => {
      TestBed.configureTestingModule(configuration);
    }));
  }
}

export class PermissionHelper {
  tableActions: TableActionsComponent;
  permission: Permission;
  getTableActionComponent: () => TableActionsComponent;

  constructor(permission: Permission, getTableActionComponent: () => TableActionsComponent) {
    this.permission = permission;
    this.getTableActionComponent = getTableActionComponent;
  }

  setPermissionsAndGetActions(
    createPerm: boolean,
    updatePerm: boolean,
    deletePerm: boolean
  ): TableActionsComponent {
    this.permission.create = createPerm;
    this.permission.update = updatePerm;
    this.permission.delete = deletePerm;
    this.tableActions = this.getTableActionComponent();
    return this.tableActions;
  }

  /**
   * @param fn
   * @param empty
   * @param single
   * @param singleExecuting Uses 'single' if not defined
   * @param multiple Uses 'empty' if not defined
   */
  testScenarios(fn: () => any, empty: any, single: any, singleExecuting?: any, multiple?: any) {
    this.testScenario(
      // 'multiple selections'
      [{}, {}],
      fn,
      _.isUndefined(multiple) ? empty : multiple
    );
    this.testScenario(
      // 'select executing item'
      [{ cdExecuting: 'someAction' }],
      fn,
      _.isUndefined(singleExecuting) ? single : singleExecuting
    );
    this.testScenario([{}], fn, single); // 'select non-executing item'
    this.testScenario([], fn, empty); // 'no selection'
  }

  private testScenario(selection: object[], fn: () => any, expected: any) {
    this.setSelection(selection);
    expect(fn()).toBe(expected);
  }

  setSelection(selection: object[]) {
    this.tableActions.selection.selected = selection;
    this.tableActions.selection.update();
  }
}

export class FormHelper {
  form: CdFormGroup;

  constructor(form: CdFormGroup) {
    this.form = form;
  }

  /**
   * Changes multiple values in multiple controls
   */
  setMultipleValues(values: { [controlName: string]: any }, markAsDirty?: boolean) {
    Object.keys(values).forEach((key) => {
      this.setValue(key, values[key], markAsDirty);
    });
  }

  /**
   * Changes the value of a control
   */
  setValue(control: AbstractControl | string, value: any, markAsDirty?: boolean): AbstractControl {
    control = this.getControl(control);
    if (markAsDirty) {
      control.markAsDirty();
    }
    control.setValue(value);
    return control;
  }

  private getControl(control: AbstractControl | string): AbstractControl {
    if (typeof control === 'string') {
      return this.form.get(control);
    }
    return control;
  }

  /**
   * Change the value of the control and expect the control to be valid afterwards.
   */
  expectValidChange(control: AbstractControl | string, value: any, markAsDirty?: boolean) {
    this.expectValid(this.setValue(control, value, markAsDirty));
  }

  /**
   * Expect that the given control is valid.
   */
  expectValid(control: AbstractControl | string) {
    // 'isValid' would be false for disabled controls
    expect(this.getControl(control).errors).toBe(null);
  }

  /**
   * Change the value of the control and expect a specific error.
   */
  expectErrorChange(
    control: AbstractControl | string,
    value: any,
    error: string,
    markAsDirty?: boolean
  ) {
    this.expectError(this.setValue(control, value, markAsDirty), error);
  }

  /**
   * Expect a specific error for the given control.
   */
  expectError(control: AbstractControl | string, error: string) {
    expect(this.getControl(control).hasError(error)).toBeTruthy();
  }
}

export class FixtureHelper {
  fixture: ComponentFixture<any>;

  constructor(fixture: ComponentFixture<any>) {
    this.fixture = fixture;
  }

  /**
   * Expect a list of id elements to be visible or not.
   */
  expectIdElementsVisible(ids: string[], visibility: boolean) {
    ids.forEach((css) => {
      this.expectElementVisible(`#${css}`, visibility);
    });
  }

  /**
   * Expect a specific element to be visible or not.
   */
  expectElementVisible(css: string, visibility: boolean) {
    expect(Boolean(this.getElementByCss(css))).toBe(visibility);
  }

  getText(css: string) {
    const e = this.getElementByCss(css);
    return e ? e.nativeElement.textContent.trim() : null;
  }

  getElementByCss(css: string) {
    this.fixture.detectChanges();
    return this.fixture.debugElement.query(By.css(css));
  }
}

export class PrometheusHelper {
  createAlert(name, state = 'active', timeMultiplier = 1) {
    return {
      fingerprint: name,
      status: { state },
      labels: {
        alertname: name
      },
      annotations: {
        summary: `${name} is ${state}`
      },
      generatorURL: `http://${name}`,
      startsAt: new Date(new Date('2022-02-22').getTime() * timeMultiplier).toString()
    } as PrometheusAlert;
  }

  createNotificationAlert(name, status = 'firing') {
    return {
      status: status,
      labels: {
        alertname: name
      },
      annotations: {
        summary: `${name} is ${status}`
      },
      generatorURL: `http://${name}`
    } as PrometheusNotificationAlert;
  }

  createNotification(alertNumber = 1, status = 'firing') {
    const alerts = [];
    for (let i = 0; i < alertNumber; i++) {
      alerts.push(this.createNotificationAlert('alert' + i, status));
    }
    return { alerts, status } as PrometheusNotification;
  }

  createLink(url) {
    return `<a href="${url}" target="_blank"><i class="fa fa-line-chart"></i></a>`;
  }
}

const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
    </body>
  </file>
</xliff>
`;

const i18nProviders = [
  { provide: TRANSLATIONS_FORMAT, useValue: 'xlf' },
  { provide: TRANSLATIONS, useValue: XLIFF },
  { provide: LOCALE_ID, useValue: 'en' },
  I18n
];

export { i18nProviders };

export function testTableActions(testBedConf, componentClass) {
  describe('show action buttons and drop down actions depending on permissions', () => {
    let fixture: ComponentFixture<RbdListComponent>;
    let component: RbdListComponent;
    let summaryService: SummaryService;
    let rbdService: RbdService;

    const refresh = (data) => {
      summaryService['summaryDataSource'].next(data);
    };

    configureTestBed(testBedConf);

    beforeEach(() => {
      fixture = TestBed.createComponent(componentClass);
      component = fixture.componentInstance;
      summaryService = TestBed.get(SummaryService);
      rbdService = TestBed.get(RbdService);

      // this is needed because summaryService isn't being reset after each test.
      summaryService['summaryDataSource'] = new BehaviorSubject(null);
      summaryService['summaryData$'] = summaryService['summaryDataSource'].asObservable();
    });

    let tableActions: TableActionsComponent;
    let empty;
    let single;
    let permissionHelper: PermissionHelper;

    const fn = () => tableActions.getCurrentButton().name;

    const getTableActionComponent = (): TableActionsComponent => {
      fixture.detectChanges();
      return fixture.debugElement.query(By.directive(TableActionsComponent)).componentInstance;
    };

    beforeEach(() => {
      permissionHelper = new PermissionHelper(component.permission, () =>
        getTableActionComponent()
      );
      single = ActionLabels.EDIT;
      empty = ActionLabels.CREATE;
    });

    describe('with all', () => {
      beforeEach(() => {
        tableActions = permissionHelper.setPermissionsAndGetActions(true, true, true);
      });

      it(`shows 'Edit' for single selection else 'Add' as main action`, () =>
        permissionHelper.testScenarios(fn, empty, single));

      it('shows all actions', () => {
        expect(tableActions.tableActions.length).toBe(6);
        expect(tableActions.tableActions).toEqual(component.tableActions);
      });
    });

    describe('with read, create and update', () => {
      beforeEach(() => {
        tableActions = permissionHelper.setPermissionsAndGetActions(true, true, false);
      });

      it(`shows 'Edit' for single selection else 'Add' as main action`, () =>
        permissionHelper.testScenarios(fn, empty, single));

      it(`shows all actions except for 'Delete' and 'Move'`, () => {
        expect(tableActions.tableActions.length).toBe(4);
        component.tableActions.pop();
        component.tableActions.pop();
        expect(tableActions.tableActions).toEqual(component.tableActions);
      });
    });

    describe('with read, create and delete', () => {
      beforeEach(() => {
        tableActions = permissionHelper.setPermissionsAndGetActions(true, false, true);
      });

      it(`shows 'Copy' for single selection else 'Add' as main action`, () => {
        single = 'Copy';
        permissionHelper.testScenarios(fn, empty, single);
      });

      it(`shows 'Add', 'Copy', 'Delete' and 'Move' action`, () => {
        expect(tableActions.tableActions.length).toBe(4);
        expect(tableActions.tableActions).toEqual([
          component.tableActions[0],
          component.tableActions[2],
          component.tableActions[4],
          component.tableActions[5]
        ]);
      });
    });

    describe('with read, edit and delete', () => {
      beforeEach(() => {
        tableActions = permissionHelper.setPermissionsAndGetActions(false, true, true);
      });

      it(`shows always 'Edit' as main action`, () => {
        empty = 'Edit';
        permissionHelper.testScenarios(fn, empty, single);
      });

      it(`shows 'Edit', 'Flatten', 'Delete' and 'Move' action`, () => {
        expect(tableActions.tableActions.length).toBe(4);
        expect(tableActions.tableActions).toEqual([
          component.tableActions[1],
          component.tableActions[3],
          component.tableActions[4],
          component.tableActions[5]
        ]);
      });
    });

    describe('with read and create', () => {
      beforeEach(() => {
        tableActions = permissionHelper.setPermissionsAndGetActions(true, false, false);
      });

      it(`shows 'Copy' for single selection else 'Add' as main action`, () => {
        single = 'Copy';
        permissionHelper.testScenarios(fn, empty, single);
      });

      it(`shows 'Copy' and 'Add' actions`, () => {
        expect(tableActions.tableActions.length).toBe(2);
        expect(tableActions.tableActions).toEqual([
          component.tableActions[0],
          component.tableActions[2]
        ]);
      });
    });

    describe('with read and edit', () => {
      beforeEach(() => {
        tableActions = permissionHelper.setPermissionsAndGetActions(false, true, false);
      });

      it(`shows always 'Edit' as main action`, () => {
        empty = 'Edit';
        permissionHelper.testScenarios(fn, empty, single);
      });

      it(`shows 'Edit' and 'Flatten' actions`, () => {
        expect(tableActions.tableActions.length).toBe(2);
        expect(tableActions.tableActions).toEqual([
          component.tableActions[1],
          component.tableActions[3]
        ]);
      });
    });

    describe('with read and delete', () => {
      beforeEach(() => {
        tableActions = permissionHelper.setPermissionsAndGetActions(false, false, true);
      });

      it(`shows always 'Delete' as main action`, () => {
        single = 'Delete';
        empty = 'Delete';
        permissionHelper.testScenarios(fn, empty, single);
      });

      it(`shows 'Delete' and 'Move' actions`, () => {
        expect(tableActions.tableActions.length).toBe(2);
        expect(tableActions.tableActions).toEqual([
          component.tableActions[4],
          component.tableActions[5]
        ]);
      });
    });

    describe('with only read', () => {
      beforeEach(() => {
        tableActions = permissionHelper.setPermissionsAndGetActions(false, false, false);
      });

      it('shows no main action', () => {
        permissionHelper.testScenarios(() => tableActions.getCurrentButton(), undefined, undefined);
      });

      it('shows no actions', () => {
        expect(tableActions.tableActions.length).toBe(0);
        expect(tableActions.tableActions).toEqual([]);
      });
    });
  });

}
