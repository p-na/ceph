import { Helper } from '../helper.po';
import { PageHelper } from '../page-helper.po';
import { FilesystemsPage } from './filesystems.po';

describe('Filesystems page', () => {
  let page: FilesystemsPage;

  beforeAll(() => {
    page = new FilesystemsPage();
  });

  afterEach(() => {
    Helper.checkConsole();
  });

  describe('breadcrumb test', () => {
    beforeAll(() => {
      page.navigateTo();
    });

    it('should open and show breadcrumb', () => {
      expect(PageHelper.getBreadcrumbText()).toEqual('Filesystems');
    });
  });
});
