import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { BsModalRef, BsModalService } from 'ngx-bootstrap';

import { OsdService } from '../../../../shared/api/osd.service';
import { TableComponent } from '../../../../shared/datatable/table/table.component';
import { CellTemplate } from '../../../../shared/enum/cell-template.enum';
import { CdTableColumn } from '../../../../shared/models/cd-table-column';
import { CdTableSelection } from '../../../../shared/models/cd-table-selection';
import { Permission } from '../../../../shared/models/permissions';
import { DimlessBinaryPipe } from '../../../../shared/pipes/dimless-binary.pipe';
import { AuthStorageService } from '../../../../shared/services/auth-storage.service';
import { OsdFlagsModalComponent } from '../osd-flags-modal/osd-flags-modal.component';
import { OsdScrubModalComponent } from '../osd-scrub-modal/osd-scrub-modal.component';

@Component({
  selector: 'cd-osd-list',
  templateUrl: './osd-list.component.html',
  styleUrls: ['./osd-list.component.scss']
})
export class OsdListComponent implements OnInit {
  @ViewChild('statusColor')
  statusColor: TemplateRef<any>;
  @ViewChild('osdUsageTpl')
  osdUsageTpl: TemplateRef<any>;
  @ViewChild('markOsdOutBodyTpl')
  markOsdOutBodyTpl: TemplateRef<any>;
  @ViewChild('markOsdInBodyTpl')
  markOsdInBodyTpl: TemplateRef<any>;
  @ViewChild('markOsdDownBodyTpl')
  markOsdDownBodyTpl: TemplateRef<any>;
  @ViewChild('removeOsdBodyTpl')
  removeOsdBodyTpl: TemplateRef<any>;
  @ViewChild('destroyOsdBodyTpl')
  destroyOsdBodyTpl: TemplateRef<any>;
  @ViewChild(TableComponent)
  tableComponent: TableComponent;

  permission: Permission;
  bsModalRef: BsModalRef;
  osds = [];
  columns: CdTableColumn[];
  selection = new CdTableSelection();

  protected static collectStates(osd) {
    return [osd['in'] ? 'in' : 'out', osd['up'] ? 'up' : 'down'];
  }

  constructor(
    private authStorageService: AuthStorageService,
    private osdService: OsdService,
    private dimlessBinaryPipe: DimlessBinaryPipe,
    private modalService: BsModalService
  ) {
    this.permission = this.authStorageService.getPermissions().osd;
  }

  ngOnInit() {
    this.columns = [
      { prop: 'host.name', name: 'Host' },
      { prop: 'id', name: 'ID', cellTransformation: CellTemplate.bold },
      { prop: 'collectedStates', name: 'Status', cellTemplate: this.statusColor },
      { prop: 'stats.numpg', name: 'PGs' },
      { prop: 'stats.stat_bytes', name: 'Size', pipe: this.dimlessBinaryPipe },
      { name: 'Usage', cellTemplate: this.osdUsageTpl },
      {
        prop: 'stats_history.out_bytes',
        name: 'Read bytes',
        cellTransformation: CellTemplate.sparkline
      },
      {
        prop: 'stats_history.in_bytes',
        name: 'Writes bytes',
        cellTransformation: CellTemplate.sparkline
      },
      { prop: 'stats.op_r', name: 'Read ops', cellTransformation: CellTemplate.perSecond },
      { prop: 'stats.op_w', name: 'Write ops', cellTransformation: CellTemplate.perSecond }
    ];
  }

  updateSelection(selection: CdTableSelection) {
    this.selection = selection;
  }

  /**
   * Returns true if no row is selected or if the selected row is in the given
   * state. Useful for deactivating the corresponding menu entry.
   */
  isNotSelectedOrInState(state: 'in' | 'up' | 'down' | 'out'): boolean {
    const osd = this.selection.first();
    if (this.selection.hasSelection) {
      switch (state) {
        case 'in':
          return osd.in === 1;
        case 'out':
          return osd.in !== 1;
        case 'down':
          return osd.up !== 1;
        case 'up':
          return osd.up === 1;
      }
    }
    return true;
  }

  getOsdList() {
    this.osdService.getList().subscribe((data: any[]) => {
      this.osds = data;
      data.map((osd) => {
        osd.collectedStates = OsdListComponent.collectStates(osd);
        osd.stats_history.out_bytes = osd.stats_history.op_out_bytes.map((i) => i[1]);
        osd.stats_history.in_bytes = osd.stats_history.op_in_bytes.map((i) => i[1]);
        osd.cdIsBinary = true;
        return osd;
      });
    });
  }

  beforeShowDetails(selection: CdTableSelection) {
    return selection.hasSingleSelection;
  }

  scrubAction(deep) {
    if (!this.hasOsdSelected) {
      return;
    }

    const initialState = {
      selected: this.tableComponent.selection.selected,
      deep: deep
    };

    this.bsModalRef = this.modalService.show(OsdScrubModalComponent, { initialState });
  }

  configureClusterAction() {
    this.bsModalRef = this.modalService.show(OsdFlagsModalComponent, {});
  }

  markOut() {
    this.bsModalRef = this.modalService.show(ConfirmationModalComponent, {
      initialState: {
        titleText: 'Mark OSD out',
        buttonText: 'Mark out',
        bodyTpl: this.markOsdOutBodyTpl,
        onSubmit: () => {
          this.osdService.markOut(this.selection.first().id).subscribe(() => {
            this.bsModalRef.hide();
          });
        }
      }
    });
  }

  markIn() {
    this.bsModalRef = this.modalService.show(ConfirmationModalComponent, {
      initialState: {
        titleText: 'Mark OSD in',
        buttonText: 'Mark in',
        bodyTpl: this.markOsdInBodyTpl,
        onSubmit: () => {
          this.osdService.markIn(this.selection.first().id).subscribe(() => {
            this.bsModalRef.hide();
          });
        }
      }
    });
  }

  markDown() {
    this.bsModalRef = this.modalService.show(ConfirmationModalComponent, {
      initialState: {
        titleText: 'Mark OSD down',
        buttonText: 'Mark down',
        bodyTpl: this.markOsdDownBodyTpl,
        onSubmit: () => {
          this.osdService.markDown(this.selection.first().id).subscribe(() => {
            this.bsModalRef.hide();
          });
        }
      }
    });
  }

  create() {
    // TODO new modal?
  }

  reweight() {
    // TODO new modal?
  }

  remove() {
    this.bsModalRef = this.modalService.show(ConfirmationModalComponent, {
      initialState: {
        titleText: 'Remove OSD',
        buttonText: 'Remove OSD',
        bodyTpl: this.removeOsdBodyTpl,
        onSubmit: () => {
          this.osdService.remove(this.selection.first().id).subscribe(() => {
            this.bsModalRef.hide();
          });
        }
      }
    });
  }

  destroy() {
    this.bsModalRef = this.modalService.show(ConfirmationModalComponent, {
      initialState: {
        titleText: 'Destroy OSD',
        buttonText: 'Destroy OSD',
        bodyTpl: this.destroyOsdBodyTpl,
        onSubmit: () => {
          this.osdService.markIn(this.selection.first().id).subscribe(() => {
            this.bsModalRef.hide();
          });
        }
      }
    });
  }

  safeToDestroy() {
    // TODO how to show that?
  }
}
