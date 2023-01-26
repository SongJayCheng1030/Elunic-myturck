import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart } from 'chart.js';
import moment from 'moment';

@Component({
  selector: 'app-oee-daily-trend',
  templateUrl: './oee-daily-trend.component.html',
  styleUrls: ['./oee-daily-trend.component.scss'],
})
export class OeeDailyTrendComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() title?: string;
  @Input() property?: any;

  chart?: Chart = undefined;
  @ViewChild('barChart') chartRef!: ElementRef;

  yieldStatusColor = '#231f20';
  highStatusColor = '#2bcb7b';
  lowStatusColor = '#fcc83d';
  veryLowStatusColor = '#fcc83d80';

  yScale = {
    display: true,
    beginAtZero: true,
    min: 0,
    max: 100,
    ticks: {
      stepSize: 20,
      font: {
        size: 10,
      },
    },
  };

  constructor() {}
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.chart || !this.property || !this.property.oeeDaily || !this.property.oeeDailyTrend) {
      return;
    }
    this.chart.data.labels = this.property.oeeDaily.map((d: { x: any }) => d.x);

    this.chart.data.labels = [];
    this.chart.data.datasets[0].data = [];
    this.chart.data.datasets[1].data = [];
    this.chart.data.datasets[2].data = [];
    this.chart.data.datasets[3].data = [];
    this.property.oeeDaily.forEach((d: { x: any; y: any; tag: 'low' | 'high' }) => {
      if (!this.chart) return;
      this.chart.data.labels?.push(moment(d.x).format('L'));
      if (d.tag === 'high') {
        this.chart.data.datasets[0].data.push(d.y * 100);
      } else {
        this.chart.data.datasets[0].data.push(0);
      }
      if (d.tag === 'low') {
        this.chart.data.datasets[2].data.push(d.y * 100);
      } else {
        this.chart.data.datasets[2].data.push(0);
      }
    });
    this.property.oeeDailyTrend.forEach((d: { x: any; y: any }) => {
      if (!this.chart) return;
      // if(d.y === 0) {
      //   this.chart.data.datasets[3].data.push(null)
      // } else {
      //   this.chart.data.datasets[3].data.push(d.y*100)
      // }
      this.chart.data.datasets[3].data.push(d.y * 100);
    });
    this.chart.update();
  }

  ngOnInit(): void {}

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
            label: 'Yield trend',
            data: [],
            borderColor: this.yieldStatusColor,
            backgroundColor: this.yieldStatusColor,
            pointRadius: 0,
            borderWidth: 2,
            type: 'line',
            order: 0,
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
          y1: { ...this.yScale, position: 'right', stacked: true },
        },
      },
    });
  }
}
