import { Button, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';

export function usePassengerColumns() {
  const columns: ColumnsType<any> = [
    {
      title: 'Reference',
      dataIndex: 'reference',
      key: 'reference',
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
      key: 'discountType',
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'On Boarded' ? 'success' : 'warning'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => handleViewBooking(record)}>
          View Booking
        </Button>
      ),
    },
  ];

  const handleViewBooking = (record: any) => {
    // Implement view booking logic
  };

  return { columns };
}
