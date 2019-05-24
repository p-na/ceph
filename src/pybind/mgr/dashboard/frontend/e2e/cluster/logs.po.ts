import { browser } from 'protractor';
import { PageHelper } from '../helper.po';

browser.ignoreSynchronization = true;

export class LogsPage extends PageHelper {
  pages: { index: '/#/logs' };
}
