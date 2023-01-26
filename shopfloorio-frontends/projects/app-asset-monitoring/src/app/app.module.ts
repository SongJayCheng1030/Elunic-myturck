import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SharedSessionService, SioCommonModule } from '@sio/common';
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
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DragAndDropComponent } from './components/drag-and-drop/drag-and-drop.component';
import { ZoomComponent } from './components/zoom/zoom.component';
import { AssetDetailsComponent } from './views/monitoring/asset-details/asset-details.component';
import { AssetDocumentsComponent } from './views/monitoring/asset-documents/asset-documents.component';
import { AssetImageMapComponent } from './views/monitoring/asset-image-map/asset-image-map.component';
import { AssetKpiComponent } from './views/monitoring/asset-kpi/asset-kpi.component';
import { AssetMapComponent } from './views/monitoring/asset-map/asset-map.component';
import { AssetOverviewComponent } from './views/monitoring/asset-overview/asset-overview.component';
import { AssetThroughputComponent } from './views/monitoring/asset-throughput/asset-throughput.component';
import { AssetTilesComponent } from './views/monitoring/asset-tiles/asset-tiles.component';
import { AssetTimelineComponent } from './views/monitoring/asset-timeline/asset-timeline.component';
import { MonitoringComponent } from './views/monitoring/monitoring.component';
import { PulsatingCircleComponent } from './components/pulsating-circle/pulsating-circle.component';

Chart.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
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
);

@NgModule({
  declarations: [
    AppComponent,
    MonitoringComponent,
    AssetOverviewComponent,
    AssetMapComponent,
    AssetDetailsComponent,
    AssetTilesComponent,
    AssetKpiComponent,
    AssetImageMapComponent,
    AssetThroughputComponent,
    DragAndDropComponent,
    ZoomComponent,
    AssetDocumentsComponent,
    AssetTimelineComponent,
    PulsatingCircleComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SioCommonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [SharedSessionService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

function HttpLoaderFactory(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: './assets/i18n/', suffix: '.json' },
    { prefix: './sio-common/assets/i18n/', suffix: '.json' },
  ]);
}

function initializeApp(service: SharedSessionService) {
  return async () => {
    await service.initializeService();
  };
}
