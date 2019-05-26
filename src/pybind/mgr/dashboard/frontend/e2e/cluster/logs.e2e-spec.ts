import { Helper } from '../helper.po';
import { PageHelper } from '../page-helper.po';
import { LogsPage } from './logs.po';

describe('Logs page', () => {
  let page: LogsPage;

  beforeAll(() => {
    page = new LogsPage();
  });

  afterEach(() => {
    Helper.checkConsole();
  });

  describe('breadcrumb and tab tests', () => {
    beforeAll(() => {
      page.navigateTo();
    });

    it('should open and show breadcrumb', () => {
      expect(PageHelper.getBreadcrumbText()).toEqual('Logs');
    });

    it('should show two tabs', () => {
      expect(PageHelper.getTabsCount()).toEqual(2);
    });

    it('should show cluster logs tab at first', () => {
      expect(PageHelper.getTabText(0)).toEqual('Cluster Logs');
    });

    it('should show audit logs as a second tab', () => {
      expect(PageHelper.getTabText(1)).toEqual('Audit Logs');
    });
  });
});
