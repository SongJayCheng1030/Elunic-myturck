import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { EquipmentPerfData, InsightDataKpiService, SidebarService } from '@sio/common';
import { Chart } from 'chart.js';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AssetDto } from 'shared/common/models';

import { doughnutChartSettings, lineChartSettings } from './equipment-kpi.definitions';

@Component({
  selector: 'app-equipment-kpi',
  templateUrl: './equipment-kpi.component.html',
  styleUrls: ['./equipment-kpi.component.scss'],
})
export class EquipmentKpiComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroyed$ = new Subject();
  selectedKpi$ = this.kpiService.getSelectedKpiSubject().asObservable();

  equipmentGoal = 85;

  statusText = 'Undefined';
  statusColor = '#e6e6e6';

  statText = 0;
  statColor = '#e6e6e6';

  _asset!: AssetDto;
  @Input() set asset(asset: AssetDto) {
    this._asset = asset;
    combineLatest([this.selectedKpi$, this.kpiService.getPerfDataByEquipment(this._asset.id)])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([selectedKpiType, data]) => {
        if (!data) data = { oee: 0, availability: 0, utilization: 0, yield: 0 };
        const percentUp = Math.round(
          data[selectedKpiType.toLowerCase() as keyof EquipmentPerfData] * 100,
        );
        const percentDown = 100 - percentUp;
        if (percentUp > 0) {
          this.statColor = percentUp >= this.equipmentGoal ? '#2bcb7b' : '#fcc83d';
        } else {
          this.statColor = '#e6e6e6';
        }
        doughnutChartSettings.data.datasets[0].data = [percentUp, percentDown];
        doughnutChartSettings.data.datasets[0].backgroundColor = [this.statColor, '#e6e6e6'];
        this.statText = Math.round(percentUp);
        this.doughnutChart.update();
      });

    this.kpiService
      .getStatusDataByEquipment(this._asset.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        if (!data) return;
        this.statusText = data.status;
        this.statusColor = data.color;
      });

    this.kpiService
      .getThroughput24hByEquipment(this._asset.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        if (!data) return;
        this.lineChart.data.labels = data.map((d: any) => d.x);
        this.lineChart.data.datasets[0].data = data.map((d: any) => d.y);
        this.lineChart.update('none');
      });
  }

  @ViewChild('doughnutChart') doughnutChartRef!: ElementRef;
  private doughnutChart!: Chart;
  @ViewChild('lineChart') lineChartRef!: ElementRef;
  private lineChart!: Chart;

  constructor(
    private readonly kpiService: InsightDataKpiService,
    private sidebarService: SidebarService,
  ) {}
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.doughnutChart = new Chart(
      this.doughnutChartRef.nativeElement,
      doughnutChartSettings as any,
    );
    this.lineChart = new Chart(this.lineChartRef.nativeElement, lineChartSettings as any);

    // const percentUp = 10//this.internalProperty.oee * 100;
    // const percentDown = 100 - percentUp;
    // if (percentUp > 0) {
    //   this.statColor = percentUp >= this.equipmentGoal ? '#2bcb7b' : '#fcc83d';
    // }
    // doughnutChartSettings.data.datasets[0].data = [percentUp, percentDown];
    // doughnutChartSettings.data.datasets[0].backgroundColor = [this.statColor, '#e6e6e6'];
    // this.doughnutChart.update();

    // this.lineChart.data.labels = [...Array(24)].map((val, index) => `${index}h`);
    // this.lineChart.data.datasets[0].data = [...Array(24)].map(() => Math.floor(Math.random() * 100));
    // this.lineChart.update();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  onClick() {
    this.sidebarService.emitEvent({
      select: {
        node: this._asset,
      },
    });
  }
}
