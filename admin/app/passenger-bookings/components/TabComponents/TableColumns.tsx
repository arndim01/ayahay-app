import { Tag, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { BookingData } from './types';
import styles from './SharedTable.module.scss';

export const getColumns = (): ColumnsType<BookingData> => [
  {
    title: 'Reference',
    dataIndex: 'reference',
    key: 'reference',
    render: (text: string) => (
      <span className={styles.referenceText}>{text}</span>
    ),
  },
  {
    title: 'Passenger Name',
    dataIndex: 'passengerName',
    key: 'passengerName',
  },
  {
    title: 'Accommodation',
    dataIndex: 'accommodation',
    key: 'accommodation',
  },
  {
    title: 'Discount Type',
    dataIndex: 'discountType',
    key: 'discountType'
  },
  {
    title: 'Payment Method',
    dataIndex: 'paymentMethod',
    key: 'paymentMethod',
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
        color={status === 'On-Board' ? 'success' : 'warning'}
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
