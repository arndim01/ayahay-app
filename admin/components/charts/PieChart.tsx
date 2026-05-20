'use client';
import { Chart as ChartJS, ArcElement } from 'chart.js/auto';
import { Pie } from 'react-chartjs-2';
ChartJS.register(ArcElement);

interface ChartProp {
  data: any;
}

export default function PieChart({ data }: ChartProp) {
  return <Pie data={data}></Pie>;
}
