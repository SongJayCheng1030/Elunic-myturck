import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SioCommonModule } from '@sio/common';

import { HasRightDirective } from '../shared/has-right.directive';
import { SharedModule } from '../shared/shared.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { HomeComponent } from './home/home.component';
import { IntegratedViewComponent } from './integrated-view/integrated-view.component';
import { SettingsComponent } from './settings/settings.component';
import { TileConfigsComponent } from './settings/tile-configs/tile-configs.component';
import { PageLayoutComponent } from './shared/components/page-layout/page-layout.component';
import { TileCardComponent } from './shared/components/tile-card/tile-card.component';
import { IconUrlPipe } from './shared/pipes/icon-url.pipe';
import { SafePipe } from './shared/pipes/safe.pipe';

@NgModule({
  declarations: [
    DashboardComponent,
    HomeComponent,
    PageLayoutComponent,
    SettingsComponent,
    TileCardComponent,
    IconUrlPipe,
    HasRightDirective,
    TileConfigsComponent,
    IntegratedViewComponent,
    SafePipe,
  ],
  imports: [CommonModule, DashboardRoutingModule, NgbModule, SharedModule, SioCommonModule],
})
export class DashboardModule {}
