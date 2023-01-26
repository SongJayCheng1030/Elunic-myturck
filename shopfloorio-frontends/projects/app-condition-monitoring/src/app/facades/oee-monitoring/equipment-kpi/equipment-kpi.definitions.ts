export const lineChartSettings = {
  type: 'line',
  data: {
    labels: [''],
    datasets: [
      {
        borderColor: '#0053a15e',
        backgroundColor: '#0053a15e',
        pointRadius: 0,
        borderWidth: 0,
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
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        ticks: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    },
  },
};

export const doughnutChartSettings = {
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
};
