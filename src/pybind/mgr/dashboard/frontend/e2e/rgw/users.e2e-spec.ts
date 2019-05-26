import { Helper } from '../helper.po';
import { PageHelper } from '../page-helper.po';
import { UsersPage } from './users.po';

describe('RGW users page', () => {
  let page: UsersPage;

  beforeAll(() => {
    page = new UsersPage();
  });

  afterEach(() => {
    Helper.checkConsole();
  });

  describe('breadcrumb test', () => {
    beforeAll(() => {
      page.navigateTo();
    });

    it('should open and show breadcrumb', () => {
      expect(PageHelper.getBreadcrumbText()).toEqual('Users');
    });
  });
});
