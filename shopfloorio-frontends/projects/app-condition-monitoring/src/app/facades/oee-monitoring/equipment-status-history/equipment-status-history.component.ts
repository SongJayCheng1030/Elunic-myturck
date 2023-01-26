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
  selector: 'app-equipment-status-history',
  templateUrl: './equipment-status-history.component.html',
  styleUrls: ['./equipment-status-history.component.scss'],
})
export class EquipmentStatusHistoryComponent implements OnInit, AfterViewInit {
  @Input() title?: string;
  @Input() property?: any;
  chart?: Chart;
  @ViewChild('lineChart') chartRef!: ElementRef;

  producingStatusColor = '#85e19a';
  standByStatusColor = '#fcc83d';
  unscheduledDownStatusColor = '#f77b81';
  scheduledDownStatusColor = '#b6d0e6';

  constructor() {}

  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.chart || !this.property || !this.property.equipmentStatusHistory) {
      return;
    }

    this.chart.data.labels = [];
    this.chart.data.datasets[0].data = [];
    this.chart.data.datasets[1].data = [];
    this.chart.data.datasets[2].data = [];
    this.chart.data.datasets[3].data = [];
    this.property.equipmentStatusHistory.forEach(
      (d: {
        x: any;
        productive: number;
        standby: number;
        scheduled: number;
        unscheduled: number;
      }) => {
        if (!this.chart) return;
        this.chart.data.labels?.push(moment(d.x).format('L'));
        if (d.productive === 0 && d.standby === 0 && d.unscheduled === 0 && d.scheduled === 0) {
          this.chart.data.datasets[0].data.push(null);
          this.chart.data.datasets[1].data.push(null);
          this.chart.data.datasets[2].data.push(null);
          this.chart.data.datasets[3].data.push(null);
        } else {
          this.chart.data.datasets[0].data.push(d.productive * 100);
          this.chart.data.datasets[1].data.push(d.standby * 100);
          this.chart.data.datasets[2].data.push(d.unscheduled * 100);
          this.chart.data.datasets[3].data.push(d.scheduled * 100);
        }
      },
    );

    this.chart.update();
  }
  ngAfterViewInit(): void {
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Producing',
            data: [],
            borderColor: this.producingStatusColor,
            backgroundColor: this.producingStatusColor,
            pointRadius: 0,
            fill: true,
          },
          {
            label: 'Standby',
            data: [],
            borderColor: this.standByStatusColor,
            backgroundColor: this.standByStatusColor,
            pointRadius: 0,
            fill: true,
          },
          {
            label: 'Unscheduled down',
            data: [],
            borderColor: this.unscheduledDownStatusColor,
            backgroundColor: this.unscheduledDownStatusColor,
            pointRadius: 0,
            fill: true,
          },
          {
            label: 'Scheduled down',
            data: [],
            borderColor: this.scheduledDownStatusColor,
            backgroundColor: this.scheduledDownStatusColor,
            pointRadius: 0,
            fill: true,
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
            grid: {
              display: false,
            },
            ticks: {
              autoSkipPadding: 10,
              maxRotation: 15,
              font: {
                size: 10,
              },
            },
          },
          y: {
            grid: {
              display: false,
            },
            stacked: true,
            display: true,
            beginAtZero: true,
            min: 0,
            max: 100,
            ticks: {
              font: {
                size: 10,
              },
              stepSize: 20,
            },
          },
        },
      },
    });
  }
}
