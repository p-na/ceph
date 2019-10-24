import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { I18n } from '@ngx-translate/i18n-polyfill';

import { SmartDataResponseV1 } from '../models/smart';
import { ApiModule } from './api.module';

@Injectable({
  providedIn: ApiModule
})
export class OsdService {
  private path = 'api/osd';

  osdRecvSpeedModalPriorities = {
    KNOWN_PRIORITIES: [
      {
        name: null,
        text: this.i18n('-- Select the priority --'),
        values: {
          osd_max_backfills: null,
          osd_recovery_max_active: null,
          osd_recovery_max_single_start: null,
          osd_recovery_sleep: null
        }
      },
      {
        name: 'low',
        text: this.i18n('Low'),
        values: {
          osd_max_backfills: 1,
          osd_recovery_max_active: 1,
          osd_recovery_max_single_start: 1,
          osd_recovery_sleep: 0.5
        }
      },
      {
        name: 'default',
        text: this.i18n('Default'),
        values: {
          osd_max_backfills: 1,
          osd_recovery_max_active: 3,
          osd_recovery_max_single_start: 1,
          osd_recovery_sleep: 0
        }
      },
      {
        name: 'high',
        text: this.i18n('High'),
        values: {
          osd_max_backfills: 4,
          osd_recovery_max_active: 4,
          osd_recovery_max_single_start: 4,
          osd_recovery_sleep: 0
        }
      }
    ]
  };

  constructor(private http: HttpClient, private i18n: I18n) {}

  getList() {
    return this.http.get(`${this.path}`);
  }

  getDetails(id: number) {
    interface OsdData {
      osd_map: { [key: string]: any };
      osd_metadata: { [key: string]: any };
      histogram: { [key: string]: object };
      smart: { [device_identifier: string]: any };
    }
    return this.http.get<OsdData>(`${this.path}/${id}`);
  }

  /**
   * @param id OSD ID
   */
  getSmartData(id: number) {
    return this.http.get<SmartDataResponseV1>(`${this.path}/${id}/smart`);
  }

  scrub(id, deep) {
    return this.http.post(`${this.path}/${id}/scrub?deep=${deep}`, null);
  }

  getFlags() {
    return this.http.get(`${this.path}/flags`);
  }

  updateFlags(flags: string[]) {
    return this.http.put(`${this.path}/flags`, { flags: flags });
  }

  markOut(id: number) {
    return this.http.post(`${this.path}/${id}/mark_out`, null);
  }

  markIn(id: number) {
    return this.http.post(`${this.path}/${id}/mark_in`, null);
  }

  markDown(id: number) {
    return this.http.post(`${this.path}/${id}/mark_down`, null);
  }

  reweight(id: number, weight: number) {
    return this.http.post(`${this.path}/${id}/reweight`, { weight: weight });
  }

  markLost(id: number) {
    return this.http.post(`${this.path}/${id}/mark_lost`, null);
  }

  purge(id: number) {
    return this.http.post(`${this.path}/${id}/purge`, null);
  }

  destroy(id: number) {
    return this.http.post(`${this.path}/${id}/destroy`, null);
  }

  safeToDestroy(ids: string) {
    interface SafeToDestroyResponse {
      'safe-to-destroy': boolean;
      message?: string;
    }
    return this.http.get<SafeToDestroyResponse>(`${this.path}/${ids}/safe_to_destroy`);
  }
}
