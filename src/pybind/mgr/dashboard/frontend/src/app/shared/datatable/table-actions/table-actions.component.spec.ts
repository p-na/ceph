import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { configureTestBed, PermissionHelper } from '../../../../testing/unit-test-helper';
import { ComponentsModule } from '../../components/components.module';
import { CdTableAction } from '../../models/cd-table-action';
import { CdTableSelection } from '../../models/cd-table-selection';
import { Permission } from '../../models/permissions';
import { TableActionsComponent } from './table-actions.component';

describe('TableActionsComponent', () => {
  let component: TableActionsComponent;
  let fixture: ComponentFixture<TableActionsComponent>;
  let addAction: CdTableAction;
  let editAction: CdTableAction;
  let protectAction: CdTableAction;
  let unprotectAction: CdTableAction;
  let deleteAction: CdTableAction;
  let copyAction: CdTableAction;
  let permissionHelper: PermissionHelper;
  let fn, multiple, singleExecuting, single, empty;

  const setUpTableActions = () => {
    component.tableActions = [
      addAction,
      editAction,
      protectAction,
      unprotectAction,
      copyAction,
      deleteAction
    ];
  };

  const getTableActionComponent = (): TableActionsComponent => {
    setUpTableActions();
    component.ngOnInit();
    return component;
  };

  configureTestBed({
    declarations: [TableActionsComponent],
    imports: [ComponentsModule, RouterTestingModule]
  });

  beforeEach(() => {
    addAction = {
      permission: 'create',
      icon: 'fa-plus',
      canBePrimary: (selection: CdTableSelection) => !selection.hasSelection,
      name: 'Add'
    };
    editAction = {
      permission: 'update',
      icon: 'fa-pencil',
      name: 'Edit'
    };
    copyAction = {
      permission: 'create',
      icon: 'fa-copy',
      canBePrimary: (selection: CdTableSelection) => selection.hasSingleSelection,
      disable: (selection: CdTableSelection) =>
        !selection.hasSingleSelection || selection.first().cdExecuting,
      name: 'Copy'
    };
    deleteAction = {
      permission: 'delete',
      icon: 'fa-times',
      canBePrimary: (selection: CdTableSelection) => selection.hasSelection,
      disable: (selection: CdTableSelection) =>
        !selection.hasSelection || selection.first().cdExecuting,
      name: 'Delete'
    };
    protectAction = {
      permission: 'update',
      icon: 'fa-lock',
      canBePrimary: () => false,
      visible: (selection: CdTableSelection) => selection.hasSingleSelection,
      name: 'Protect'
    };
    unprotectAction = {
      permission: 'update',
      icon: 'fa-unlock',
      canBePrimary: () => false,
      visible: (selection: CdTableSelection) => !selection.hasSingleSelection,
      name: 'Unprotect'
    };
    fixture = TestBed.createComponent(TableActionsComponent);
    component = fixture.componentInstance;
    component.selection = new CdTableSelection();
    component.permission = new Permission();
    component.permission.read = true;
    permissionHelper = new PermissionHelper(component.permission, () => getTableActionComponent());
    permissionHelper.setPermissionsAndGetActions(true, true, true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should ngInit should be called with no permissions', () => {
    component.permission = undefined;
    component.ngOnInit();
    expect(component.tableActions).toEqual([]);
    expect(component.dropDownActions).toEqual([]);
  });

  describe('useRouterLink', () => {
    const testLink = '/api/some/link';
    it('should use a link generated from a function', () => {
      addAction.routerLink = () => testLink;
      expect(component.useRouterLink(addAction)).toBe(testLink);
    });

    it('should use the link as it is because it is a string', () => {
      addAction.routerLink = testLink;
      expect(component.useRouterLink(addAction)).toBe(testLink);
    });

    it('should not return anything because no link is defined', () => {
      expect(component.useRouterLink(addAction)).toBe(undefined);
    });

    it('should not return anything because the action is disabled', () => {
      editAction.routerLink = testLink;
      expect(component.useRouterLink(editAction)).toBe(undefined);
    });
  });

  describe('disableSelectionAction', () => {

    beforeEach(() => {
      fn = () => null;
      multiple = false;
      singleExecuting = false;
      single = false;
      empty = false;
    });

    it('tests disabling addAction', () => {
      fn = () => component.disableSelectionAction(addAction);
      permissionHelper.testScenarios(fn, empty, single, singleExecuting, multiple);
    });

    it('tests disabling editAction', () => {
      fn = () => component.disableSelectionAction(editAction);
      multiple = true;
      empty = true;
      singleExecuting = true;
      permissionHelper.testScenarios(fn, empty, single, singleExecuting, multiple);
    });

    it('tests disabling deleteAction', () => {
      fn = () => component.disableSelectionAction(deleteAction);
      multiple = false;
      empty = true;
      singleExecuting = true;
      permissionHelper.testScenarios(fn, empty, single, singleExecuting, multiple);
    });

    it('tests disabling copyAction', () => {
      fn = () => component.disableSelectionAction(copyAction);
      multiple = true;
      empty = true;
      singleExecuting = true;
      permissionHelper.testScenarios(fn, empty, single, singleExecuting, multiple);
    });
  });

  describe('get current button', () => {
    const hiddenScenario = () => {
      multiple = undefined;
      empty = undefined;
      singleExecuting = undefined;
      single = undefined;
    };

    const setScenario = (defaultAction, selectionAction) => {
      single = selectionAction;
      singleExecuting = selectionAction;
      multiple = defaultAction;
      empty = defaultAction;
    };

    beforeEach(() => {
      fn = () => component.getCurrentButton();
      singleExecuting = copyAction;
      single = copyAction;
      empty = addAction;
    });

    it('gets add for no, edit for single and delete for multiple selections', () => {
      setScenario(addAction, editAction);
      multiple = deleteAction;
      permissionHelper.setPermissionsAndGetActions(true, true, true);
      permissionHelper.testScenarios(fn, empty, single, singleExecuting, multiple);
    });

    it('gets add action except for selections where it shows edit action', () => {
      setScenario(addAction, editAction);
      permissionHelper.setPermissionsAndGetActions(true, true, false);
      permissionHelper.testScenarios(fn, empty, single, singleExecuting, multiple);
    });

    it('gets add for no, copy for single and delete for multiple selections', () => {
      setScenario(addAction, copyAction);
      multiple = deleteAction;
      permissionHelper.setPermissionsAndGetActions(true, false, true);
      permissionHelper.testScenarios(fn, empty, single, singleExecuting, multiple);
    });

    it('gets add action except for selections where it shows copy action', () => {
      setScenario(addAction, copyAction);
      permissionHelper.setPermissionsAndGetActions(true , false, false);
      permissionHelper.testScenarios(fn, empty, single, singleExecuting, multiple);
    });

    it('should always get edit action except delete for multiple items', () => {
      setScenario(editAction, editAction);
      multiple = deleteAction;
      permissionHelper.setPermissionsAndGetActions(false, true, true);
      permissionHelper.testScenarios(fn, empty, single, singleExecuting, multiple);
    });

    it('should always get edit action', () => {
      setScenario(editAction, editAction);
      permissionHelper.setPermissionsAndGetActions(false, true, false);
      permissionHelper.testScenarios(fn, empty, single, singleExecuting, multiple);
    });

    it('should always get delete action', () => {
      setScenario(deleteAction, deleteAction);
      permissionHelper.setPermissionsAndGetActions(false, false, true);
      permissionHelper.testScenarios(fn, empty, single, singleExecuting, multiple);
    });

    it('should not get any button with no permissions', () => {
      hiddenScenario();
      permissionHelper.setPermissionsAndGetActions(false, false, false);
      permissionHelper.testScenarios(fn, empty, single, singleExecuting, multiple);
    });

    it('should not get any button if only a drop down should be shown', () => {
      hiddenScenario();
      component.onlyDropDown = 'Drop down label';
      permissionHelper.setPermissionsAndGetActions(true, true, true);
      permissionHelper.testScenarios(fn, empty, single, singleExecuting, multiple);
    });
  });

  describe('show drop down', () => {
    const testShowDropDownActions = (perms, expected) => {
      permissionHelper.setPermissionsAndGetActions(perms[0], perms[1], perms[2]);
      expect(`${perms} ${component.showDropDownActions()}`).toBe(`${perms} ${expected}`);
    };

    it('is shown if multiple items are found depending on the permissions', () => {
      [[true, false, false], [true, true, true], [true, true, false], [true, false, true], [false, true, true], [false, true, false]].forEach((perms) => {
        testShowDropDownActions(perms, true);
      });
    });

    it('is not shown if only 1 or less items are found depending on the permissions', () => {
      [[false, false, true], [false, false, false]].forEach((perms) => {
        testShowDropDownActions(perms, false);
      });
    });
  });

  describe('with drop down only', () => {
    beforeEach(() => {
      component.onlyDropDown = 'displayMe';
    });

    it('should not return any button with getCurrentButton', () => {
      expect(component.getCurrentButton()).toBeFalsy();
    });
  });

  it('should convert any name to a proper CSS class', () => {
    expect(component.toClassName('Create')).toBe('create');
    expect(component.toClassName('Mark x down')).toBe('mark-x-down');
    expect(component.toClassName('?Su*per!')).toBe('super');
  });
});
