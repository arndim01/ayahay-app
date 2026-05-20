'use client';
import { BarChartOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { VehicleBookingData } from '../TabComponents/types';
import styles from './styles.module.scss';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarGraphProps {
  data: VehicleBookingData[];
}

export default function BarGraph({ data = [] }: BarGraphProps) {
  const boardingCounts = {
    'On-boarded': data.filter(v => v.status === 'On-boarded').length,
    'Not-boarded': data.filter(v => v.status === 'Not-boarded').length
  };

  const chartData = {
    labels: ['Vehicle Bookings'],
    datasets: [
      {
        label: 'On-boarded',
        data: [boardingCounts['On-boarded']],
        backgroundColor: 'rgba(82, 196, 26, 0.6)',
        borderColor: 'rgba(82, 196, 26, 1)',
        borderWidth: 1,
        barThickness: 50,
      },
      {
        label: 'Not-boarded',
        data: [boardingCounts['Not-boarded']],
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
            return `${label}: ${value} vehicles`;
          },
        },
      },
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className={styles.barGraph}>
        <Skeleton.Node active>
          <BarChartOutlined style={{ fontSize: 40, color: '#bfbfbf' }} />
        </Skeleton.Node>
      </div>
    );
  }

  return (
    <div className={styles.barGraph}>
      <div style={{ height: '400px', width: '100%' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
