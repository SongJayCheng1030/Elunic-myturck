import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { SioCommonModule } from '@sio/common';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  LogarithmicScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';

import { DefaultLayoutComponent } from '../components';

Chart.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  ArcElement,
  DoughnutController,
  LineController,
  LineElement,
  PointElement,
  Legend,
  Title,
  Tooltip,
  Filler,
  LogarithmicScale,
);

const declarations = [DefaultLayoutComponent];

@NgModule({
  declarations,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    RouterModule,
    CdkTreeModule,
    NgbModule,
    TranslateModule,
    SioCommonModule,
  ],
  exports: [
    ...declarations,
    CommonModule,
    CdkTreeModule,
    NgbModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgSelectModule,
    SioCommonModule,
  ],
})
export class SharedModule {}
