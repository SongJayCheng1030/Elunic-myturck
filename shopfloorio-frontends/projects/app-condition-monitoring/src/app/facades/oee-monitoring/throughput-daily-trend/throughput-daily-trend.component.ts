import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart } from 'chart.js';
import moment from 'moment';

@Component({
  selector: 'app-throughput-daily-trend',
  templateUrl: './throughput-daily-trend.component.html',
  styleUrls: ['./throughput-daily-trend.component.scss'],
})
export class ThroughputDailyTrendComponent implements OnInit, AfterViewInit {
  @Input() title?: string;
  @Input() property?: any;
  chart?: Chart;
  @ViewChild('barChart') chartRef!: ElementRef;

  mcbjStatusColor = '#231f20';
  highStatusColor = '#0053a1';
  lowStatusColor = '#558cc0';
  veryLowStatusColor = '#7fa8d080';

  yScale = {
    display: true,
    beginAtZero: true,
    min: 0,
    ticks: {
      font: {
        size: 10,
      },
    },
  };

  constructor() {}

  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !this.chart ||
      !this.property ||
      !this.property.throughputDaily ||
      !this.property.throughputDailyTrend
    ) {
      return;
    }
    this.chart.data.labels = this.property.oeeDaily.map((d: { x: any }) => d.x);

    this.chart.data.labels = [];
    this.chart.data.datasets[0].data = [];
    this.chart.data.datasets[1].data = [];
    this.chart.data.datasets[2].data = [];
    this.chart.data.datasets[3].data = [];
    this.property.throughputDaily.forEach((d: { x: any; y: any; tag: 'low' | 'high' }) => {
      if (!this.chart) return;
      this.chart.data.labels?.push(moment(d.x).format('L'));
      if (d.tag === 'high') {
        this.chart.data.datasets[0].data.push(d.y);
      } else {
        this.chart.data.datasets[0].data.push(0);
      }
      if (d.tag === 'low') {
        this.chart.data.datasets[2].data.push(d.y);
      } else {
        this.chart.data.datasets[2].data.push(0);
      }
    });
    this.property.throughputDailyTrend.forEach((d: { x: any; y: any }) => {
      if (!this.chart) return;
      // if(d.y === 0) {
      //   this.chart.data.datasets[3].data.push(null)
      // } else {
      //   this.chart.data.datasets[3].data.push(d.y)
      // }
      this.chart.data.datasets[3].data.push(d.y);
    });
    this.chart.update();
  }
  ngAfterViewInit(): void {
    const highData = [...Array(5)].map(() => Math.floor(Math.random() * 60) + 40);
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'High',
            data: [],
            backgroundColor: `${this.highStatusColor}bf`,
            order: 1,
          },
          {
            label: 'Very low',
            data: [],
            backgroundColor: this.veryLowStatusColor,
            order: 1,
          },
          {
            label: 'Low',
            data: [],
            backgroundColor: `${this.lowStatusColor}ab`,
            order: 1,
          },
          {
            label: 'MCBF',
            data: [],
            borderColor: this.mcbjStatusColor,
            backgroundColor: this.mcbjStatusColor,
            pointRadius: 0,
            borderWidth: 2,
            type: 'line',
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
            stacked: true,

            ticks: {
              autoSkipPadding: 10,
              maxRotation: 15,
              font: {
                size: 10,
              },
            },
          },
          y: { ...this.yScale, position: 'left', stacked: true },
          y1: {
            ...this.yScale,
            position: 'right',
            stacked: true,
            grid: { drawTicks: false, drawOnChartArea: false },
          },
        },
      },
    });
  }

  toggleScale() {
    if (!this.chart || !this.chart.options.scales || !this.chart.options.scales.y1) {
      return;
    }
    if (this.chart.options.scales.y1.type === 'logarithmic') {
      this.chart.options.scales.y1.type = undefined;
    } else {
      this.chart.options.scales.y1.type = 'logarithmic';
    }
    this.chart.update();
  }
}
