import { Component, TemplateRef } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'cd-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss']
})
export class InfoModalComponent {
  bodyTemplate: TemplateRef<any>;
  content: string;
  ctx: {[key: string]: string};

  closeBtnName = 'Ok';
  title = 'Information';
  style: 'info' | 'danger' | 'warning' | 'success' = 'info';

  constructor(public bsModalRef: BsModalRef) { }
}
