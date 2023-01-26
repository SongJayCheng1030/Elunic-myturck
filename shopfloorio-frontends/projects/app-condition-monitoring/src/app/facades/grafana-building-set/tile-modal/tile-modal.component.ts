import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GfDashboardItem, Logger, ModalConfirmComponent, TileProperty } from '@sio/common';
import { distinctUntilChanged } from 'rxjs/operators';
import { MachineVariableDto } from 'shared/common/models';

import { GrafanaBuildingSetService } from '../services/grafana-building-set.service';

@Component({
  selector: 'app-tile-modal',
  templateUrl: './tile-modal.component.html',
  styleUrls: ['./tile-modal.component.scss'],
})
export class TileModalComponent implements OnInit {
  private logger = new Logger('TileModalComponent');

  @Input() assetTypeId!: string;

  @Input() machineVariables!: MachineVariableDto[];

  @Input() totalTiles = 1;

  @Input() property!: TileProperty;

  form!: FormGroup;

  totalRows = 4;
  totalCols = 4;

  widths: number[] = [];

  heights: number[] = [];

  orders: number[] = [];

  dashboardsAndPanels: GfDashboardItem[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly modal: NgbActiveModal,
    private readonly modalService: NgbModal,
    private readonly grafanaBuildingSetService: GrafanaBuildingSetService,
  ) {}

  get isNew(): boolean {
    return !(this.property && !!this.property.id);
  }

  handleSelect() {
    if (!this.property || !this.property.gfDashboardId || !this.property.gfPanelId) {
      return;
    }

    const e = this.dashboardsAndPanels.find(
      p =>
        p.gfDashboardId === this.property.gfDashboardId && p.gfPanelId === this.property.gfPanelId,
    );

    if (e) {
      this.form.patchValue({ grafanaDashboardAndPanel: e.uid });
    }
  }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      name: [null, Validators.required],
      machineVariable: [null, Validators.required],
      width: [null, Validators.required],
      height: [null, Validators.required],
      order: [null, Validators.required],
      isOnAssetType: [false, Validators.required],
      isMagicTile: [false, Validators.required],
      grafanaDashboardAndPanel: [null, Validators.required],
      useOwnVars: [false],
      useVars: [false],
    });

    const magic = this.form.get('isMagicTile');
    if (magic) {
      magic.disable();
    }

    if (this.property) {
      this.logger.info(`Applying data:`, this.property);
      this.form.patchValue(this.property);
    }

    if (this.property?.machineVariable) {
      this.form.patchValue({ machineVariable: this.property.machineVariable.id });
    }

    this.widths = [...Array(this.totalCols).keys()].map(i => i + 1);
    this.heights = [...Array(this.totalRows).keys()].map(i => i + 1);
    this.orders = [...Array(this.totalTiles).keys()].map(i => i + 1);

    this.form.valueChanges
      .pipe(
        distinctUntilChanged((x, y) => {
          return y.grafanaDashboardAndPanel == x.grafanaDashboardAndPanel;
        }),
      )
      .subscribe(() => {
        const selectedPanel = this.dashboardsAndPanels.find(
          p => p.uid === this.form.value.grafanaDashboardAndPanel,
        );

        if (selectedPanel && magic) {
          if (selectedPanel.isDynamicDashboard) {
            magic.enable();
          } else {
            magic.disable();
            magic.patchValue(false);
          }
        }
      });

    this.grafanaBuildingSetService.getDashboardsGrouped$().subscribe(data => {
      this.logger.info(`Found grafana panels:`, data);
      this.dashboardsAndPanels = data;
      this.handleSelect();
    });
  }

  onSubmit(): void {
    const selectedPanel = this.dashboardsAndPanels.find(
      p => p.uid === this.form.value.grafanaDashboardAndPanel,
    );

    if (!selectedPanel) {
      this.logger.error(
        `Cannot submit: invalid value: cannot find dashboard/panel:`,
        this.form.value,
        this.dashboardsAndPanels,
      );
      return;
    }

    const data = {
      name: this.form.value.name,
      parameter: this.form.value.parameter,
      gfDashboardId: selectedPanel.gfDashboardId,
      gfPanelId: selectedPanel.gfPanelId,
      width: this.form.value.width,
      height: this.form.value.height,
      order: this.form.value.order,
      machineVariable: this.form.value.machineVariable,
      // useOwnVars: false,
      // useVars: false,
    };

    if (this.isNew) {
      this.logger.info(`Create new tile:`, data);

      this.grafanaBuildingSetService.createTile(this.assetTypeId, data).subscribe(ret => {
        if (ret) {
          this.logger.info(`Created:`, ret);

          this.modal.close({
            mode: 'new',
            property: ret,
          });
        } else {
          // TODO: add toast on error
        }
      });
    } else {
      this.logger.info(`Save tile data:`, data);

      this.grafanaBuildingSetService
        .updateTile(this.property.id, this.assetTypeId, data)
        .subscribe(ret => {
          if (ret) {
            this.logger.info(`Updated:`, ret);

            this.modal.close({
              mode: 'edit',
              property: ret,
            });
          } else {
            // TODO: add toast on error
          }
        });
    }
  }

  onCancel(): void {
    this.modal.close(null);
  }

  async onDelete(): Promise<void> {
    const confirmed = await this.openConfirmModal();
    if (confirmed) {
      this.modal.close({ mode: 'delete', property: this.property });
    }
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
}
