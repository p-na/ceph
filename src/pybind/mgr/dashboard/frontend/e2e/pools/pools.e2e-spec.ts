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

    it('should create and delete a pool', () => {
      helper.pools.create(poolName).then(
        (creationTime) => {
          console.log(`creating a pool and verifying it exists took ${creationTime} milliseconds`);
          helper.pools.delete(poolName).then((deletionTime) => {
            console.log(`pool deleted and verified its deletion took ${deletionTime}`);
          });
        });
    });
  });
});
