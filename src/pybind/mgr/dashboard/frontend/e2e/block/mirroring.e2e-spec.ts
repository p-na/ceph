import { Helper, PageHelper } from '../helper.po';
import { MirroringPage } from './mirroring.po';

describe('Mirroring page', () => {
  let page: MirroringPage;

  beforeAll(() => {
    page = new MirroringPage();
  });

  afterEach(() => {
    Helper.checkConsole();
  });

  describe('breadcrumb and tab tests', () => {
    beforeAll(() => {
      page.navigateTo();
    });

    it('should open and show breadcrumb', () => {
      expect(PageHelper.getBreadcrumbText()).toEqual('Mirroring');
    });

    it('should show three tabs', () => {
      expect(PageHelper.getTabsCount()).toEqual(3);
    });

    it('should show text for all tabs', () => {
      expect(PageHelper.getTabText(0)).toEqual('Issues');
      expect(PageHelper.getTabText(1)).toEqual('Syncing');
      expect(PageHelper.getTabText(2)).toEqual('Ready');
    });
  });
});
