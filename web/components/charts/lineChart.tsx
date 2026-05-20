'use client';
import { Chart as ChartJS, ArcElement } from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
ChartJS.register(ArcElement);

interface ChartProp {
  data: any;
}

export default function LineChart({ data }: ChartProp) {
  return <Line data={data}></Line>;
}
