import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OsdService } from '../../../../shared/api/osd.service';
import { CdValidators } from '../../../../shared/forms/cd-validators';

@Component({
  selector: 'cd-osd-form',
  templateUrl: './osd-form.component.html',
  styleUrls: ['./osd-form.component.scss']
})
export class OsdFormComponent implements OnInit {
  get diagnostics() {
    return this.osdForm.value;
  }

  constructor(private fb: FormBuilder, private osdService: OsdService) {}
  osdForm: FormGroup;

  private static uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      /** tslint:disable:no-bitwise */
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    /** tslint:enable:no-bitwise */
  }

  ngOnInit() {
    this.osdForm = this.fb.group({
      uuid: ['', CdValidators.uuid(false)],
      id: [{ value: '', disabled: true }]
    });
    this.osdForm.get('uuid').statusChanges.subscribe(() => {
      this.handleStateOfIdControl();
    });
  }

  protected handleStateOfIdControl() {
    const uuidControl = this.osdForm.get('uuid');
    const idControl = this.osdForm.get('id');
    if (uuidControl.valid && uuidControl.value !== '') {
      idControl.enable();
    } else {
      idControl.disable();
    }
  }

  createOsd() {
    if (this.osdForm.valid) {
      const params = this.osdForm.value;
      this.osdService.create(params.uuid, params.id).subscribe((value) => {
        console.log(value);
      });
    }
  }

  generateUuid() {
    const uuidControl = this.osdForm.get('uuid');
    uuidControl.setValue(OsdFormComponent.uuidv4());
  }
}
