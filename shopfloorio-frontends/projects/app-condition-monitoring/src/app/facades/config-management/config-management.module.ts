import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { SioCommonModule } from '@sio/common';

import { FacadeModule } from '..';
import { ConfigManagementComponent } from './config-management.component';
import { ConfigManagementRoutingModule } from './config-management-routing.module';

@NgModule({
  declarations: [ConfigManagementComponent],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NgbDatepickerModule,
    ConfigManagementRoutingModule,
    SioCommonModule,
  ],
})
export class ConfigManagementModule implements FacadeModule {}
