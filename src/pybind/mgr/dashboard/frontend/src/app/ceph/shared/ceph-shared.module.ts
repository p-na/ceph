import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SharedModule } from '../../shared/shared.module';
import { SmartListComponent } from './smart-list/smart-list.component';

@NgModule({
  imports: [CommonModule, SharedModule, TabsModule],
  exports: [SmartListComponent],
  declarations: [SmartListComponent]
})
export class CephSharedModule {}
