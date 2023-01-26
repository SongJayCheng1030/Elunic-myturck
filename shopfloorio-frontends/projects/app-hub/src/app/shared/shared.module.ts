import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ColorPickerModule } from 'ngx-color-picker';

import { ButtonComponent } from './components/button/button.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { InputComponent } from './components/input/input.component';
import { PageCardLayoutComponent } from './components/page-card-layout/page-card-layout.component';

@NgModule({
  declarations: [InputComponent, ButtonComponent, PageCardLayoutComponent, CheckboxComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ColorPickerModule, TranslateModule],
  providers: [],
  bootstrap: [],
  exports: [InputComponent, ButtonComponent, PageCardLayoutComponent, CheckboxComponent],
})
export class SharedModule {}
