import { Helper, PageHelper } from '../helper.po';
import { ManagerModulesPage } from './mgr-modules.po';

describe('Manager modules page', () => {
  let page: ManagerModulesPage;

  beforeAll(() => {
    page = new ManagerModulesPage();
  });

  afterEach(() => {
    Helper.checkConsole();
  });

  describe('breadcrumb test', () => {
    beforeAll(() => {
      page.navigateTo();
    });

    it('should open and show breadcrumb', () => {
      expect(PageHelper.getBreadcrumbText()).toEqual('Manager modules');
    });
  });
});
