import { IBookingPaymentItem } from '@ayahay/models';
import Table, { ColumnsType } from 'antd/es/table';
import React from 'react';

interface PaymentSummaryProps {
  showTripColumn?: boolean;
  paymentItems?: IBookingPaymentItem[];
}

export default function PaymentSummary({
  showTripColumn,
  paymentItems,
}: PaymentSummaryProps) {
  const paymentItemColumns: ColumnsType<IBookingPaymentItem> = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Trip',
      dataIndex: 'trip',
      key: 'trip',
      hidden: !showTripColumn,
      render: (trip) => {
        return `${trip?.srcPort?.name} -> ${trip?.destPort?.name}`;
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (data) => {
        return `₱${data}`;
      },
    },
  ];

  const paymentItemTotal = (paymentItems: readonly IBookingPaymentItem[]) => {
    let totalPrice = 0;
    const priceColumnIndex = showTripColumn ? 2 : 1;
    paymentItems.forEach((item) => (totalPrice += item.price));

    return (
      <Table.Summary.Row>
        <Table.Summary.Cell index={0}>
          <strong>Total</strong>
        </Table.Summary.Cell>
        {showTripColumn && <Table.Summary.Cell index={1}></Table.Summary.Cell>}
        <Table.Summary.Cell index={priceColumnIndex}>
          <strong>₱{totalPrice}</strong>
        </Table.Summary.Cell>
      </Table.Summary.Row>
    );
  };

  return (
    <Table
      columns={paymentItemColumns}
      dataSource={paymentItems}
      pagination={false}
      loading={paymentItems === undefined}
      tableLayout='fixed'
      summary={paymentItemTotal}
      rowKey={(_, index) => index ?? 0}
    ></Table>
  );
}
