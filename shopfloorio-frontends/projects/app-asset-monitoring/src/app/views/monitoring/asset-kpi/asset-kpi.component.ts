import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-asset-kpi',
  templateUrl: './asset-kpi.component.html',
  styleUrls: ['./asset-kpi.component.scss'],
})
export class AssetKpiComponent implements AfterViewInit {
  equipmentGoal = 85;
  statText = 0;
  statColor = '#e6e6e6';

  @ViewChild('doughnutChart', { static: true }) doughnutChartRef!: ElementRef;
  private doughnutChart!: Chart;

  ngAfterViewInit(): void {
    this.doughnutChart = new Chart(this.doughnutChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [''],
        datasets: [
          {
            label: 'OEE',
            data: [0, 100],
            backgroundColor: ['#2bcb7b', '#e6e6e6'],
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
          tooltip: {
            enabled: false,
          },
        },
      },
    });
    setTimeout(() => {
      let percentUp = 86;
      if (percentUp >= 100) {
        percentUp = Math.round(percentUp);
      }
      const percentDown = 100 - percentUp;
      if (percentUp > 0) {
        this.statColor = percentUp >= this.equipmentGoal ? '#2bcb7b' : '#fcc83d';
      } else {
        this.statColor = '#e6e6e6';
      }
      this.doughnutChart.data.datasets[0].data = [percentUp, percentDown];
      this.doughnutChart.data.datasets[0].backgroundColor = [this.statColor, '#e6e6e6'];
      this.statText = percentUp;
      this.doughnutChart.update();
    });
  }
}
