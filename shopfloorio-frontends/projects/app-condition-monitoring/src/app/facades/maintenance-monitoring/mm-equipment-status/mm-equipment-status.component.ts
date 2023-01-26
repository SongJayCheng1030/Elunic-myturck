import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import DataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-mm-equipment-status',
  templateUrl: './mm-equipment-status.component.html',
  styleUrls: ['./mm-equipment-status.component.scss'],
})
export class MmEquipmentStatusComponent implements AfterViewInit {
  @ViewChild('barChartCurrent') chartCurrentRef!: ElementRef;
  @ViewChild('barChartHistory') chartHistoryRef!: ElementRef;
  @Input() current = false;
  @Input() useSwitch = false;

  legends = [
    {
      color: '#f0484f',
      icon: 'alarm',
      label: 'STATUS.CRITICAL',
    },
    {
      color: '#f57100',
      icon: 'down',
      label: 'STATUS.DEGRADING',
    },
    {
      color: '#fcc83d',
      icon: 'warning',
      label: 'STATUS.WARNING',
    },
    {
      color: '#e6e6e6',
      icon: 'good',
      label: 'STATUS.GOOD',
    },
  ];

  private chartCurrent?: Chart;
  private chartHistory?: Chart;

  constructor() {}

  ngAfterViewInit(): void {
    this.initChart();
  }

  onToggle() {
    this.current = !this.current;
    this.initChart();
  }

  initChart() {
    if (this.current) {
      this.initCurrentChart();
      this.initCurrentData();
    } else {
      this.initHistoryChart();
      this.initHistoryData();
    }
  }

  getLegend(label: string) {
    return this.legends.find(legend => legend.label === label);
  }

  private initCurrentData() {
    if (this.chartCurrent) {
      const goodData = [...Array(5)].map(() => Math.floor(Math.random() * 20) + 10);
      const warningData = [...Array(5)].map(() => Math.floor(Math.random() * 5) + 10);
      const degradingData = [...Array(5)].map(() => Math.floor(Math.random() * 5) + 10);
      this.chartCurrent.data.datasets = [
        {
          label: 'Good',
          data: goodData,
          backgroundColor: this.getLegend('STATUS.GOOD')?.color,
        },
        {
          label: 'Warning',
          data: warningData,
          backgroundColor: this.getLegend('STATUS.WARNING')?.color,
        },
        {
          label: 'Degrading',
          data: degradingData,
          backgroundColor: this.getLegend('STATUS.DEGRADING')?.color,
        },
        {
          label: 'Critical',
          data: goodData.map((value, i) => 60 - value - warningData[i] - degradingData[i]),
          backgroundColor: this.getLegend('STATUS.CRITICAL')?.color,
        },
      ];
      this.chartCurrent.update();
    }
  }

  private initCurrentChart() {
    if (!this.chartCurrent) {
      this.chartCurrent = new Chart(this.chartCurrentRef.nativeElement, {
        plugins: [DataLabels],
        type: 'bar',
        data: {
          labels: [''],
          datasets: [],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: {
            datalabels: {
              font: {
                size: 10,
              },
              color: 'white',
            },
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
                font: {
                  size: 8,
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
  }

  private initHistoryData() {
    if (this.chartHistory) {
      this.chartHistory.data.labels = [
        'Past 4 hours',
        'Past 3 hours',
        'Past 2 hours',
        'Past 1 hours',
        'Current',
      ];
      const goodData = [...Array(5)].map(() => Math.floor(Math.random() * 20) + 10);
      const warningData = [...Array(5)].map(() => Math.floor(Math.random() * 5) + 10);
      const degradingData = [...Array(5)].map(() => Math.floor(Math.random() * 5) + 10);
      this.chartHistory.data.datasets = [
        {
          label: 'Good',
          data: goodData,
          backgroundColor: this.getLegend('STATUS.GOOD')?.color,
        },
        {
          label: 'Warning',
          data: warningData,
          backgroundColor: this.getLegend('STATUS.WARNING')?.color,
        },
        {
          label: 'Degrading',
          data: degradingData,
          backgroundColor: this.getLegend('STATUS.DEGRADING')?.color,
        },
        {
          label: 'Critical',
          data: goodData.map((value, i) => 60 - value - warningData[i] - degradingData[i]),
          backgroundColor: this.getLegend('STATUS.CRITICAL')?.color,
        },
      ];
      this.chartHistory.update();
    }
  }

  private initHistoryChart() {
    if (!this.chartHistory) {
      this.chartHistory = new Chart(this.chartHistoryRef.nativeElement, {
        type: 'bar',
        data: {
          labels: [''],
          datasets: [],
        },
        options: {
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
                font: {
                  size: 8,
                },
                color: '#b1b1b1',
              },
            },
            y: {
              beginAtZero: true,
              min: 0,
              stacked: true,
              title: {
                display: true,
                padding: {
                  bottom: 20,
                },
                color: '#b2b2b2',
                text: 'Equipment',
              },
              ticks: {
                stepSize: 20,
                font: {
                  size: 8,
                },
                color: '#9f9f9f',
              },
            },
          },
        },
      });
    }
  }
}
