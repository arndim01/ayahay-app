import { Tag, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { VehicleBookingData } from './types';
import styles from './SharedTable.module.scss';

export const getColumns = (): ColumnsType<VehicleBookingData> => [
  {
    title: 'Reference No.',
    dataIndex: 'reference',
    key: 'reference',
    render: (text: string) => (
      <span className={styles.referenceText}>{text}</span>
    ),
  },
  {
    title: 'BOL No.',
    dataIndex: 'bol_no',
    key: 'bol_no',
  },
  {
    title: 'FRR No.',
    dataIndex: 'frr_no',
    key: 'frr_no',
    render: (text: string) => (
      <span className={text === 'NA' ? styles.naText : styles.frrText}>
        {text}
      </span>
    ),
  },
  {
    title: 'Plate Number',
    dataIndex: 'plate_number',
    key: 'plate_number',
  },
  {
    title: 'Vehicle Type',
    dataIndex: 'vehicle_type',
    key: 'vehicle_type',
  },
  {
    title: 'Payment Method',
    dataIndex: 'payment_method',
    key: 'payment_method',
    render: (text: string) => (
      <Tag color={text === 'ONLINE' ? 'processing' : 'default'}>{text}</Tag>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Tag 
        className={styles.statusTag} 
        color={status === 'On-boarded' ? 'success' : 'warning'}
      >
        {status}
      </Tag>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Button type="primary" size="small" className={styles.actionButton}>
        View Details
      </Button>
    ),
  },
];
