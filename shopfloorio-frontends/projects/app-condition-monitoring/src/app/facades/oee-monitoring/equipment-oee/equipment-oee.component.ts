import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { EquipmentKpiOverviewDto, InsightDataKpiService } from '@sio/common';
import { Chart } from 'chart.js';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-equipment-oee',
  templateUrl: './equipment-oee.component.html',
  styleUrls: ['./equipment-oee.component.scss'],
})
export class EquipmentOeeComponent implements AfterViewInit {
  equipmentGoal = 85;

  private colors = {
    HIGH: '#2bcb7b',
    LOW: '#fcc83d',
    UNDEFINED: '#cccccc',
  };
  private chart?: Chart;
  legend: Array<{ label: string; data: number[]; backgroundColor: string }> = [];
  private destroyed$ = new Subject();
  @ViewChild('barChart') chartRef!: ElementRef;

  constructor(private readonly insightDataKpiService: InsightDataKpiService) {}

  ngAfterViewInit(): void {
    this.initChart();
    this.initData();
  }

  getSelectedKpiSubject() {
    return this.insightDataKpiService.getSelectedKpiSubject();
  }

  private initData() {
    combineLatest([
      this.insightDataKpiService.getSelectedKpiSubject(),
      this.insightDataKpiService.getEquipmentOEEOverview(),
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([kpi, alldata]) => {
        if (!this.chart) return;
        const data = alldata[kpi.toString().toLowerCase()];
        if (!Object.keys(data)) return;
        const datasets: Array<{ label: string; data: number[]; backgroundColor: string }> = [];
        Object.keys(data).forEach(k =>
          datasets.push({
            label: k,
            data: [data[k as keyof EquipmentKpiOverviewDto].count],
            backgroundColor: this.colors[k as keyof EquipmentKpiOverviewDto],
          }),
        );
        this.legend = datasets;
        const animate = this.chart.data.datasets.length > 0 ? 'none' : 'active';
        this.chart.data.datasets = datasets;
        this.chart.update(animate);
      });
  }

  private initChart() {
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: [''],
        datasets: [],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks: {
              autoSkipPadding: 10,
              maxRotation: 15,
              font: {
                size: 10,
              },

              // stepSize: 10,
              // maxTicksLimit: 60
            },
          },
          y: {
            stacked: true,
          },
        },
      },
    });
  }
}
