import { Helper, PageHelper } from '../helper.po';
import { BucketsPage } from './buckets.po';

describe('RGW buckets page', () => {
  let page: BucketsPage;

  beforeAll(() => {
    page = new BucketsPage();
  });

  afterEach(() => {
    Helper.checkConsole();
  });

  describe('breadcrumb test', () => {
    beforeAll(() => {
      page.navigateTo();
    });

    it('should open and show breadcrumb', () => {
      expect(PageHelper.getBreadcrumbText()).toEqual('Buckets');
    });
  });
});
