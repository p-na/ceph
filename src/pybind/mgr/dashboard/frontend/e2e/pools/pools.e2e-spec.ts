import { Helper } from '../helper.po';
import { PageHelper } from '../page-helper.po';

describe('Pools page', () => {
  let helper: Helper;

  beforeAll(() => {
    helper = new Helper();
  });

  afterEach(() => {
    Helper.checkConsole();
  });

  describe('breadcrumb and tab tests', () => {
    beforeAll(() => {
      helper.pools.navigateTo();
    });

    it('should open and show breadcrumb', () => {
      expect(PageHelper.getBreadcrumbText()).toEqual('Pools');
    });

    it('should show two tabs', () => {
      expect(PageHelper.getTabsCount()).toEqual(2);
    });

    it('should show pools list tab at first', () => {
      expect(PageHelper.getTabText(0)).toEqual('Pools List');
    });

    it('should show overall performance as a second tab', () => {
      expect(PageHelper.getTabText(1)).toEqual('Overall Performance');
    });
  });

  describe('tests pool creation and deletion', () => {
    const poolName = 'foobar';

    it('should create a pool', () => {
      helper.pools.createPool(poolName);
    });

    it('should delete a pool', () => {
      helper.pools.deletePool(poolName);
    });
  });
});
