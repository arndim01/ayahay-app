'use client';
import { Chart as ChartJS, ArcElement } from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(ArcElement);

interface ChartProp {
  data: any;
}

// For not-stacking bar graphs. For stacking graphs, set y.stacked: true
const options = {
  responsive: true,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      beginAtZero: true,
      stacked: true,
    },
  },
};

export default function BarChart({ data }: ChartProp) {
  return <Bar options={options} data={data} plugins={[ChartDataLabels]} />;
}
