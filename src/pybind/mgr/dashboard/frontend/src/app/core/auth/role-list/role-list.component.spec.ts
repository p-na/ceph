import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { ToastModule } from 'ng2-toastr';
import { TabsModule } from 'ngx-bootstrap/tabs';

import {
  configureTestBed,
  i18nProviders,
  PermissionHelper
} from '../../../../testing/unit-test-helper';
import { ActionLabels } from '../../../shared/constants/app.constants';
import { TableActionsComponent } from '../../../shared/datatable/table-actions/table-actions.component';
import { SharedModule } from '../../../shared/shared.module';
import { RoleDetailsComponent } from '../role-details/role-details.component';
import { UserTabsComponent } from '../user-tabs/user-tabs.component';
import { RoleListComponent } from './role-list.component';

describe('RoleListComponent', () => {
  let component: RoleListComponent;
  let fixture: ComponentFixture<RoleListComponent>;

  configureTestBed({
    declarations: [RoleListComponent, RoleDetailsComponent, UserTabsComponent],
    imports: [
      SharedModule,
      ToastModule.forRoot(),
      TabsModule.forRoot(),
      RouterTestingModule,
      HttpClientTestingModule
    ],
    providers: i18nProviders
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('show action buttons and drop down actions depending on permissions', () => {
    let tableActions: TableActionsComponent;
    let single;
    let empty;
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
        expect(tableActions.tableActions.length).toBe(3);
        expect(tableActions.tableActions).toEqual(component.tableActions);
      });
    });

    describe('with read, create and update', () => {
      beforeEach(() => {
        tableActions = permissionHelper.setPermissionsAndGetActions(true, true, false);
      });

      it(`shows 'Edit' for single selection else 'Add' as main action`, () =>
        permissionHelper.testScenarios(fn, empty, single));

      it(`shows 'Add' and 'Edit' action`, () => {
        expect(tableActions.tableActions.length).toBe(2);
        component.tableActions.pop();
        expect(tableActions.tableActions).toEqual(component.tableActions);
      });
    });

    describe('with read, create and delete', () => {
      beforeEach(() => {
        tableActions = permissionHelper.setPermissionsAndGetActions(true, false, true);
      });

      it(`shows 'Delete' for single selection else 'Add' as main action`, () => {
        single = 'Delete';
        permissionHelper.testScenarios(fn, empty, single);
      });

      it(`shows 'Add' and 'Delete' action`, () => {
        expect(tableActions.tableActions.length).toBe(2);
        expect(tableActions.tableActions).toEqual([
          component.tableActions[0],
          component.tableActions[2]
        ]);
      });
    });

    describe('with read, edit and delete', () => {
      beforeEach(() => {
        tableActions = permissionHelper.setPermissionsAndGetActions(false, true, true);
      });

      it(`shows always 'Edit' as main action`, () => {
        empty = ActionLabels.EDIT;
        permissionHelper.testScenarios(fn, empty, single);
      });

      it(`shows 'Edit' and 'Delete' action`, () => {
        expect(tableActions.tableActions.length).toBe(2);
        expect(tableActions.tableActions).toEqual([
          component.tableActions[1],
          component.tableActions[2]
        ]);
      });
    });

    describe('with read and create', () => {
      beforeEach(() => {
        tableActions = permissionHelper.setPermissionsAndGetActions(true, false, false);
      });

      it(`shows always 'Add' as main action`, () => {
        single = ActionLabels.CREATE;
        permissionHelper.testScenarios(fn, empty, single);
      });

      it(`shows only 'Add' action`, () => {
        expect(tableActions.tableActions.length).toBe(1);
        expect(tableActions.tableActions).toEqual([component.tableActions[0]]);
      });
    });

    describe('with read and update', () => {
      beforeEach(() => {
        tableActions = permissionHelper.setPermissionsAndGetActions(false, true, false);
      });

      it(`shows always 'Edit' as main action`, () => {
        empty = ActionLabels.EDIT;
        permissionHelper.testScenarios(fn, empty, single);
      });

      it(`shows only 'Edit' action`, () => {
        expect(tableActions.tableActions.length).toBe(1);
        expect(tableActions.tableActions).toEqual([component.tableActions[1]]);
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

      it(`shows only 'Delete' action`, () => {
        expect(tableActions.tableActions.length).toBe(1);
        expect(tableActions.tableActions).toEqual([component.tableActions[2]]);
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
});
