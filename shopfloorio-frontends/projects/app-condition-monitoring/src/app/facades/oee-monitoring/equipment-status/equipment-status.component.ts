import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { InsightDataKpiService } from '@sio/common';
import { Chart } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-equipment-status',
  templateUrl: './equipment-status.component.html',
  styleUrls: ['./equipment-status.component.scss'],
})
export class EquipmentStatusComponent implements OnInit, AfterViewInit, OnDestroy {
  destroyed$ = new Subject();
  @ViewChild('barChart') chartRef!: ElementRef;

  private chart?: Chart;
  legend: Array<{ label: string; data: number[]; backgroundColor: string }> = [];

  constructor(private readonly insightDataKpiService: InsightDataKpiService) {}
  ngOnInit(): void {
    this.initData();
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  private initData() {
    this.insightDataKpiService
      .getEquipmentStatusOverview()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        if (!this.chart) return;
        if (!Object.keys(data)) return;
        const datasets: Array<{ label: string; data: number[]; backgroundColor: string }> = [];
        Object.keys(data).forEach(k =>
          datasets.push({
            label: k,
            data: [data[k].abs],
            backgroundColor: data[k].color,
          }),
        );
        // datasets.sort((a, b) => b.data[0] - a.data[0]).reverse()
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
            // beginAtZero: true,
            stacked: true,
            ticks: {
              autoSkipPadding: 10,
              maxRotation: 15,
              font: {
                size: 10,
              },
            },
          },
          y: {
            stacked: true,
          },
        },
      },
    });
  }
  ngOnDestroy(): void {
    this.destroyed$.next(null);
    this.destroyed$.complete();
  }
}
