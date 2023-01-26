import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TileProperty } from '@sio/common';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { GrafanaBuildingSetService } from '../services/grafana-building-set.service';

export interface GrafanaChart {
  id: string;
  dashboardAlias: string;
  orgId: number;
  panelId: number;
}

@Component({
  selector: 'app-grafana-admin-panel',
  templateUrl: './grafana-admin-panel.component.html',
  styleUrls: ['./grafana-admin-panel.component.scss'],
})
export class GrafanaAdminPanelComponent implements OnInit {
  @Input() chart!: GrafanaChart;

  @Input() tile!: TileProperty;
  @Input() totalTiles = 1;
  @Output() action = new EventEmitter<any>();

  grafanaDashboardTitle$!: Observable<string>;

  constructor(private readonly grafanaBuildingSetService: GrafanaBuildingSetService) {}

  ngOnInit(): void {
    this.grafanaDashboardTitle$ = this.grafanaBuildingSetService
      .getDashboardPanels$(this.tile.gfDashboardId)
      .pipe(
        map(tiles => tiles.find(tile => tile.panelId === this.tile.gfPanelId)),
        map(tile => (tile ? tile.title : 'Could not find grafana panel')),
        catchError(() => of('Could not find grafana panel')),
      );
  }

  onAction(mode: string) {
    this.action.emit({ mode, id: this.tile.id });
  }
}
