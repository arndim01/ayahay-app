'use client';
import { BarChartOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import styles from './styles.module.scss';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarGraph({ data }: { data: any[] }) {
  const boardingCounts = data.reduce((acc, passenger) => {
    const status = passenger.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: ['Passenger Status'],
    datasets: [
      {
        label: 'On-Board',
        data: [boardingCounts['On-Board'] || 0],
        backgroundColor: 'rgba(82, 196, 26, 0.6)',
        borderColor: 'rgba(82, 196, 26, 1)',
        borderWidth: 1,
        barThickness: 50,
      },
      {
        label: 'Not Boarded',
        data: [boardingCounts['Not-Boarded'] || 0],
        backgroundColor: 'rgba(250, 140, 22, 0.6)',
        borderColor: 'rgba(250, 140, 22, 1)',
        borderWidth: 1,
        barThickness: 50,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} passengers`;
          },
        },
      },
      // Add labels on top of bars using the built-in afterDraw hook
      afterDraw: (chart: any) => {
        const ctx = chart.ctx;
        ctx.save();
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        chart.data.datasets.forEach((dataset: any, i: number) => {
          const meta = chart.getDatasetMeta(i);
          meta.data.forEach((bar: any, index: number) => {
            const value = dataset.data[index];
            if (value) {
              ctx.fillText(value.toString(), bar.x, bar.y - 5);
            }
          });
        });
        ctx.restore();
      }
    }
  };

  return (
    <div className={styles.barGraph}>
      {!data && (
        <Skeleton.Node active>
          <BarChartOutlined style={{ fontSize: 40, color: '#bfbfbf' }} />
        </Skeleton.Node>
      )}
      {data && data.length > 0 && (
        <div style={{ height: '400px', width: '100%' }}>
          <Bar data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}
