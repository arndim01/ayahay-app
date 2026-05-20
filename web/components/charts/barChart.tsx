'use client';
import { Chart as ChartJS, ArcElement } from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
ChartJS.register(ArcElement);

interface ChartProp {
  data: any;
}

export default function BarChart({ data }: ChartProp) {
  return <Bar data={data}></Bar>;
}
