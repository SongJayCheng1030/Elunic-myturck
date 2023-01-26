import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { Chart } from 'chart.js';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-equipment-kpi-multiple',
  templateUrl: './equipment-kpi-multiple.component.html',
  styleUrls: ['./equipment-kpi-multiple.component.scss'],
})
export class EquipmentKpiMultipleComponent implements AfterViewInit, OnChanges {
  @Input() title?: string;
  @Input() property: { [kpi: string]: number } = {};
  @Input() kpiKeys: string[] = [];
  @ViewChildren('doughnutChart') doughnutCharts!: QueryList<ElementRef>;

  charts: Chart[] = [];

  equipmentGoal = 85;
  defaultColor = '#e6e6e6';
  highStatusColor = '#2bcb7b';
  lowStatusColor = '#fcc83d';

  private doughnutChartSettings = {
    type: 'doughnut',
    data: {
      labels: ['', ''],
      datasets: [
        {
          label: '',
          data: [0, 100],
          backgroundColor: [this.defaultColor, this.defaultColor],
        },
      ],
    },
    options: {
      cutout: '70%',
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  };

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.charts.forEach((c, i) => {
      const percentUp = this.property ? Math.round(this.property[this.kpiKeys[i]] * 100) : 0;
      const percentDown = 100 - percentUp;
      c.data.datasets[0].data = [percentUp, percentDown];
      c.data.datasets[0].backgroundColor = [
        this.statColor(this.property ? this.property[this.kpiKeys[i]] : 0),
        this.defaultColor,
      ];
      c.update();
    });
  }

  ngAfterViewInit(): void {
    if (this.kpiKeys && this.doughnutCharts && this.doughnutCharts.toArray()) {
      this.doughnutCharts.toArray().forEach((chartRef: any, index) => {
        if (chartRef?.nativeElement) {
          const chartSettings = cloneDeep(this.doughnutChartSettings);
          const doughnutChart = new Chart(chartRef.nativeElement, chartSettings as any);
          const percentUp = this.property
            ? Math.round(this.property[this.kpiKeys[index]] * 100)
            : 0;
          const percentDown = 100 - percentUp;
          chartSettings.data.datasets[0].data = [percentUp, percentDown];
          chartSettings.data.datasets[0].backgroundColor = [
            this.statColor(this.property ? this.property[this.kpiKeys[index]] : 0),
            this.defaultColor,
          ];
          doughnutChart.update();
          this.charts.push(doughnutChart);
        }
      });
    }
  }

  upper(str: string) {
    return str ? str.toUpperCase() : '';
  }

  statColor(percent: number): string {
    if (percent) {
      return percent * 100 >= this.equipmentGoal ? this.highStatusColor : this.lowStatusColor;
    }
    return this.defaultColor;
  }

  onMore() {
    if (this.property?.id) {
      this.router.navigate([`/alarm-management/asset/${this.property.id}`]);
    }
  }
}
