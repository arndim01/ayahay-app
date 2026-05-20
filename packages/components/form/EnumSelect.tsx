import { Form, FormItemProps, Select } from 'antd';
import React from 'react';

interface EnumProps {
  _enum: any;
  disabled: boolean;
  showSearch?: boolean;
}

export default function EnumSelect({
  _enum,
  disabled,
  showSearch,
  ...formItemProps
}: EnumProps & FormItemProps) {
  return (
    <Form.Item {...formItemProps}>
      <Select
        disabled={disabled}
        placeholder='Select an option...'
        options={Object.keys(_enum).map((enumKey) => ({
          value: enumKey,
          label: _enum[enumKey],
        }))}
        showSearch={showSearch}
      />
    </Form.Item>
  );
}
