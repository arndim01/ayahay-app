import { Form, FormItemProps, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { getShippingLines } from '@ayahay/services/shipping-line.service';
import { IShippingLine } from '@ayahay/models';

const { Option } = Select;

export default function ShippingLineFilter({
  ...formItemProps
}: FormItemProps) {
  const [allShippingLines, setAllShippingLines] = useState(
    [] as IShippingLine[]
  );
  const [shippingLineOptions, setShippingLineOptions] = useState(
    [] as IShippingLine[]
  );

  useEffect(() => {
    const initializeShippingLines = async () => {
      const shippingLines = (await getShippingLines()) ?? [];
      setAllShippingLines(shippingLines);
      setShippingLineOptions(shippingLines);
    };

    initializeShippingLines();
  }, []);

  const onSearchShippingLine = (value: string) => {
    let filteredShippingLines: IShippingLine[];
    if (!value) {
      filteredShippingLines = allShippingLines;
    } else {
      filteredShippingLines = allShippingLines.filter(
        (port) => port.name.toLowerCase().indexOf(value.toLowerCase()) >= 0
      );
    }
    setShippingLineOptions(filteredShippingLines);
  };

  return (
    <Form.Item {...formItemProps}>
      <Select
        mode='multiple'
        placeholder='Filter by Shipping Line'
        filterOption={false}
        notFoundContent={null}
        showSearch
        onSearch={onSearchShippingLine}
        onSelect={() => setShippingLineOptions(allShippingLines)}
      >
        {shippingLineOptions.map((port) => (
          <Option key={port.id} value={port.id}>
            {port.name}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
}
