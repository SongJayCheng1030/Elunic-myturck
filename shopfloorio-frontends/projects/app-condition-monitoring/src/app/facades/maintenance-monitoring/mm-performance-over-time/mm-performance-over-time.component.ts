import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import moment from 'moment';

@Component({
  selector: 'app-mm-performance-over-time',
  templateUrl: './mm-performance-over-time.component.html',
  styleUrls: ['./mm-performance-over-time.component.scss'],
})
export class MmPerformanceOverTimeComponent implements OnInit {
  @Input() title?: string;
  @Input() property?: any;
  @Input() settings?: any;

  chart?: Chart;
  @ViewChild('lineChart') chartRef!: ElementRef;

  legends = [
    {
      stat: 'performance',
      color: '#231f20',
      label: 'STATUS.PERFORMANCE',
    },
    {
      stat: 'warning',
      color: '#ffe7b1',
      label: 'STATUS.WARNING_LIMIT',
    },
    {
      stat: 'critical',
      color: '#fbb6b7',
      label: 'STATUS.CRITICAL_LIMIT',
    },
  ];
  max = 100;
  yScale = {
    stacked: true,
    display: true,
    beginAtZero: true,
    min: 0,
    max: this.max,
    ticks: {
      font: {
        size: 10,
      },
      stepSize: 25,
    },
  };

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    this.updateChart();
  }

  updateChart() {
    if (!this.chart || !this.property || !this.property.performanceHistory) {
      return;
    }

    this.chart.data.labels = [];
    this.chart.data.datasets[0].data = [];
    this.chart.data.datasets[1].data = [];
    this.chart.data.datasets[2].data = [];
    this.chart.data.datasets[3].data = [];
    this.chart.data.datasets[4].data = [];
    this.chart.data.datasets[5].data = [];

    this.property.performanceHistory.forEach((performance: any) => {
      this.chart?.data.labels?.push(moment(performance.time).format('MM.DD.YYYY'));
      const settings = this.property.settings;
      this.chart?.data.datasets[0].data.push(settings.criticalLimitMin);
      this.chart?.data.datasets[1].data.push(settings.warningLimitMin - settings.criticalLimitMin);
      this.chart?.data.datasets[2].data.push(settings.warningLimitMax - settings.warningLimitMin);
      this.chart?.data.datasets[3].data.push(settings.criticalLimitMax - settings.warningLimitMax);
      this.chart?.data.datasets[4].data.push(this.max - settings.criticalLimitMax);
      this.chart?.data.datasets[5].data.push(performance.value);
    });

    this.chart.update();
  }

  ngAfterViewInit(): void {
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            borderColor: this.legendColor('critical'),
            backgroundColor: this.legendColor('critical'),
            pointRadius: 0,
            fill: true,
            order: 1,
          },
          {
            data: [],
            borderColor: this.legendColor('warning'),
            backgroundColor: this.legendColor('warning'),
            pointRadius: 0,
            fill: true,
            order: 1,
          },
          {
            data: [],
            borderColor: '#fff',
            backgroundColor: '#fff',
            pointRadius: 0,
            fill: true,
            order: 1,
          },
          {
            data: [],
            borderColor: this.legendColor('warning'),
            backgroundColor: this.legendColor('warning'),
            pointRadius: 0,
            fill: true,
            order: 1,
          },
          {
            data: [],
            borderColor: this.legendColor('critical'),
            backgroundColor: this.legendColor('critical'),
            pointRadius: 0,
            fill: true,
            order: 1,
          },
          {
            data: [],
            borderColor: this.legendColor('performance'),
            backgroundColor: this.legendColor('performance'),
            borderWidth: 2,
            pointRadius: 0,
            order: 0,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            ticks: {
              align: 'end',
              font: {
                size: 10,
              },
            },
          },
          y: this.yScale,
          y1: {
            ...this.yScale,
            ticks: { display: false },
            grid: { drawTicks: false, drawOnChartArea: false, drawBorder: false },
          },
        },
      },
    });
    this.updateChart();
  }

  legendColor(stat: string): string {
    return this.legends.find(legend => legend.stat === stat)?.color || '';
  }
}
