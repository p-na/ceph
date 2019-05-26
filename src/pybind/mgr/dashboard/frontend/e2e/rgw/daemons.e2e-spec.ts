import { Helper } from '../helper.po';
import { PageHelper } from '../page-helper.po';
import { DaemonsPage } from './daemons.po';

describe('RGW daemons page', () => {
  let page: DaemonsPage;

  beforeAll(() => {
    page = new DaemonsPage();
  });

  afterEach(() => {
    Helper.checkConsole();
  });

  describe('breadcrumb and tab tests', () => {
    beforeAll(() => {
      page.navigateTo();
    });

    it('should open and show breadcrumb', () => {
      expect(PageHelper.getBreadcrumbText()).toEqual('Daemons');
    });

    it('should show two tabs', () => {
      expect(PageHelper.getTabsCount()).toEqual(2);
    });

    it('should show daemons list tab at first', () => {
      expect(PageHelper.getTabText(0)).toEqual('Daemons List');
    });

    it('should show overall performance as a second tab', () => {
      expect(PageHelper.getTabText(1)).toEqual('Overall Performance');
    });
  });
});
