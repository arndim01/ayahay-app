import { Form, FormItemProps, Radio } from 'antd';
import React from 'react';

interface EnumProps {
  _enum: any;
  disabled?: boolean;
  nullChoiceLabel?: string;
}

export default function EnumRadio({
  _enum,
  disabled,
  nullChoiceLabel,
  ...formItemProps
}: EnumProps & FormItemProps) {
  return (
    <Form.Item {...formItemProps}>
      <Radio.Group disabled={disabled}>
        {nullChoiceLabel && (
          <Radio value={undefined} key={-1}>
            {nullChoiceLabel}
          </Radio>
        )}
        {Object.keys(_enum).map((enumKey) => (
          <Radio value={enumKey} key={enumKey}>
            {_enum[enumKey]}
          </Radio>
        ))}
      </Radio.Group>
    </Form.Item>
  );
}
