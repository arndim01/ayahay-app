import { Checkbox, Form, FormItemProps } from 'antd';
import React from 'react';

const options = [
  { value: 'Economy', label: 'Economy' },
  { value: 'Tourist', label: 'Tourist' },
  { value: 'Cabin', label: 'Cabin' },
  { value: 'Suite', label: 'Suite' },
];

export default function CabinFilter({ ...formItemProps }: FormItemProps) {
  return (
    <Form.Item {...formItemProps}>
      <Checkbox.Group options={options}></Checkbox.Group>
    </Form.Item>
  );
}
