import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  AssetService,
  DevicesService,
  Logger,
  ModalConfirmComponent,
  TileModalResult,
  TileProperty,
} from '@sio/common';
import { orderBy } from 'lodash';
import { from, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AssetDto } from 'shared/common/models';

import {
  GrafanaClickEvent,
  GrafanaPanelComponent,
} from '../../grafana-panel/grafana-panel.component';
import { GrafanaBuildingSetService } from '../../services/grafana-building-set.service';
import { TimebrokerService, TimeRange } from '../../services/timebroker.service';
import { TileModalComponent } from '../../tile-modal/tile-modal.component';

@Component({
  selector: 'app-grafana-building-set-asset',
  templateUrl: './grafana-building-set-asset.component.html',
  styleUrls: ['./grafana-building-set-asset.component.scss'],
})
export class GrafanaBuildingSetAssetComponent implements OnInit {
  private internalAssetId!: string;

  asset!: AssetDto;

  deviceId$!: Observable<string | null>;

  @Input() set assetId(id: string) {
    this.logger.info(`Update assetId=`, id);
    this.internalAssetId = id;

    from(this.assetService.getAsset(id)).subscribe(asset => {
      this.logger.info(`Loaded asset:`, asset);
      this.asset = asset;
    });

    this.deviceId$ = this.devicesService
      .getOneByAssetId(id)
      .pipe(map(device => (device ? device.id : null)));

    if (this.tileSubs) {
      this.tileSubs.unsubscribe();
    }

    this.tileSubs = this.gfBuildingSetService.getTilesByAssetId$(id).subscribe(tiles => {
      this.tiles = tiles;
      this.logger.info(`Got ${this.tiles.length} tiles to display`, this.tiles);
      this.updateTileOrders();
    });
  }

  private logger: Logger = new Logger('GrafanaBuildingSetAssetComponent');

  maxCells = 16;
  gridCells = 0;
  gridRows = 4;
  tiles: TileProperty[] = [];
  adminView = false;

  private tileSubs!: Subscription;

  @ViewChildren(GrafanaPanelComponent) grafanaPanels?: QueryList<GrafanaPanelComponent>;

  constructor(
    private modalService: NgbModal,
    private readonly gfBuildingSetService: GrafanaBuildingSetService,
    private readonly timebroker: TimebrokerService,
    private readonly assetService: AssetService,
    private readonly devicesService: DevicesService,
    private router: Router,
  ) {}

  ngOnInit(): void {}

  toggleViewMode() {
    this.router.navigate(['/alarm-management/admin/']);
  }

  onRangeSelect(range: any) {
    this.logger.info(`onRangeSelect:`, range);
    this.timebroker.setFromTo(range.from, range.to);
  }

  get dateRange(): Observable<TimeRange> {
    return this.timebroker.timeRangeDistinct$;
  }

  numSequence(n: number): number[] {
    return Array(n);
  }

  onAction(event: any) {
    if (event) {
      const prop = this.tiles.find(tile => tile.id === event.id);
      if (prop) {
        switch (event.mode) {
          case 'edit':
            this.onEditTile(prop);
            break;
          case 'delete':
            this.onDelete(prop.id);
            break;
          case 'next':
            this.updateTileOrders(event.mode, prop);
            break;
          case 'back':
            this.updateTileOrders(event.mode, prop);
            break;
          default:
            break;
        }
      }
    }
  }

  onLinkClick(evt: GrafanaClickEvent) {
    this.grafanaPanels?.forEach(panel => {
      if (panel.property?.id === evt.tile?.id) {
        if (panel.property?.useOwnVars) panel.setGrafanaVariables(evt.vars);
      } else if (panel.property?.useVars) panel.setGrafanaVariables(evt.vars);
    });
  }

  async onAddTile(): Promise<void> {
    const result = await this.openTileModal();
    if (result && result.mode === 'new' && result.property) {
      this.tiles.push(result.property);
      this.updateTileOrders();
    }
  }

  async onEditTile(property: TileProperty): Promise<void> {
    const result = await this.openTileModal(property);
    if (result && result.property) {
      try {
        if (result.mode === 'delete') {
          this.deleteTileById(result.property.id);
        } else if (result.mode === 'edit') {
          this.tiles = this.tiles.map(p => (p.id === property.id ? result.property : p));
        }
        this.updateTileOrders();
      } catch (ex) {}
    }
  }

  async onDelete(id: string): Promise<void> {
    const confirmed = await this.openConfirmModal();
    if (confirmed) {
      this.deleteTileById(id);
    }
  }

  private deleteTileById(id: string) {
    this.gfBuildingSetService.deleteTile$(id).subscribe(ok => {
      if (ok) {
        this.tiles = this.tiles.filter(p => p.id !== id);
        this.updateTileOrders();
      } else {
        // TODO: handle error
      }
    });
  }

  private openConfirmModal(): Promise<boolean> {
    const modal = this.modalService.open(ModalConfirmComponent, { centered: true });

    modal.componentInstance.content = {
      title: 'MODALS.DELETE_TILE_CONFIRM.TITLE',
      body: 'MODALS.DELETE_TILE_CONFIRM.BODY',
      confirm: 'MODALS.DELETE_TILE_CONFIRM.CONFIRM',
      abort: 'MODALS.DELETE_TILE_CONFIRM.ABORT',
    };
    return modal.result;
  }

  private openTileModal(property?: TileProperty): Promise<TileModalResult | null> {
    const modal = this.modalService.open(TileModalComponent, {
      centered: true,
      backdrop: 'static',
    });
    modal.componentInstance.assetId = this.internalAssetId;

    if (property) {
      modal.componentInstance.mode = 'edit';
      modal.componentInstance.property = property;
      modal.componentInstance.totalTiles = this.tiles.length;
    } else {
      modal.componentInstance.totalTiles = this.tiles.length + 1;
    }
    return modal.result;
  }

  updateTileOrders(mode: string | null = '', property: TileProperty | null = null) {
    if (mode && property && ['next', 'back'].includes(mode)) {
      let touched = false;
      switch (mode) {
        case 'next':
          if (property.order < this.tiles.length) {
            property.order = property.order + 1;
            touched = true;
          }
          break;
        case 'back':
          if (property.order > 1) {
            property.order = property.order - 1;
            touched = true;
          }
          break;
      }

      if (!touched) {
        this.updateOrders();
        return;
      }

      this.logger.info(`Update property order:`, mode, property, this.internalAssetId);
      this.gfBuildingSetService
        .updateTile(property.id, this.internalAssetId, property)
        .subscribe(updated => {
          this.logger.info(`Property order updated:`, updated);
          this.updateOrders();
        });
    } else {
      this.updateOrders();
    }
  }

  updateOrders() {
    this.tiles = orderBy(this.tiles, 'order');
    if (this.tiles) {
      const maxRows = 40;
      const maxColumns = 4;
      let cells = 0;
      let rowCells = 0;
      this.tiles.forEach(tile => {
        rowCells += tile.height;
        cells += tile.height * tile.width;
      });
      this.gridCells = cells;
      this.gridRows = rowCells > maxRows ? maxRows : rowCells < maxColumns ? maxColumns : rowCells;
      if (this.gridRows > maxColumns && (maxColumns * this.gridRows) / this.gridCells > 2) {
        const packedRows = Math.floor(this.gridRows * 0.75);
        if (packedRows > maxColumns) {
          this.gridRows = packedRows;
          if (this.gridRows > maxRows) {
            this.gridRows = maxRows;
          }
        }
      }
      this.maxCells = maxColumns * this.gridRows;
    }
  }
}
