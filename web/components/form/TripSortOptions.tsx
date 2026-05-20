import { Form, FormItemProps, Select } from 'antd';
import React, { useEffect } from 'react';

const options = [
  { value: 'departureDate', label: 'Earliest' },
  { value: 'basePrice', label: 'Cheapest' },
];

export default function TripSortOptions({ ...formItemProps }: FormItemProps) {
  const initializeShippingLines = () => {};

  useEffect(initializeShippingLines, []);

  return (
    <Form.Item {...formItemProps}>
      <Select options={options}></Select>
    </Form.Item>
  );
}
