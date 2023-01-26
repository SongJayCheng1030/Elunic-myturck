import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { SioCommonModule } from '@sio/common';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CdkTreeModule,
    NgbModule,
    TranslateModule,
    ColorPickerModule,
    SioCommonModule,
  ],
  exports: [
    CommonModule,
    CdkTreeModule,
    NgbModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    SioCommonModule,
  ],
})
export class SharedModule {}
