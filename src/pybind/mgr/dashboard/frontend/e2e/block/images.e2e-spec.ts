import { Helper } from '../helper.po';
import { PageHelper } from '../page-helper.po';
import { ImagesPage } from './images.po';

describe('Images page', () => {
  let page: ImagesPage;

  beforeAll(() => {
    page = new ImagesPage();
  });

  afterEach(() => {
    Helper.checkConsole();
  });

  describe('breadcrumb and tab tests', () => {
    beforeAll(() => {
      page.navigateTo();
    });

    it('should open and show breadcrumb', () => {
      expect(PageHelper.getBreadcrumbText()).toEqual('Images');
    });

    it('should show three tabs', () => {
      expect(PageHelper.getTabsCount()).toEqual(3);
    });

    it('should show text for all tabs', () => {
      expect(PageHelper.getTabText(0)).toEqual('Images');
      expect(PageHelper.getTabText(1)).toEqual('Trash');
      expect(PageHelper.getTabText(2)).toEqual('Overall Performance');
    });
  });
});
