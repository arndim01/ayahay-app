import { Button, Form, InputNumber, Popover, Space } from 'antd';
import React from 'react';
import {
  DEFAULT_NUM_PASSENGERS,
  DEFAULT_NUM_VEHICLES,
} from '@ayahay/constants/default';

export default function PassengerAndVehicleCount() {
  const form = Form.useFormInstance();

  const passengerCount = Form.useWatch('passengerCount', form);
  const vehicleCount = Form.useWatch('vehicleCount', form);

  const countPopoverContent = (
    <div>
      <CountPopover label='Passenger' inputName='passengerCount' />
      <CountPopover label='Vehicle' inputName='vehicleCount' />
    </div>
  );

  return (
    <Popover
      placement='bottomLeft'
      title='Passengers/Vehicles'
      content={countPopoverContent}
      trigger='click'
    >
      <label>Passengers | Vehicles</label>
      <div style={{ padding: '6.5px 11px' }}>
        <span>{passengerCount ?? DEFAULT_NUM_PASSENGERS} Passenger | </span>
        <span>{vehicleCount ?? DEFAULT_NUM_VEHICLES} Vehicle </span>
      </div>
      <Form.Item name='passengerCount' hidden={true}>
        <InputNumber />
      </Form.Item>
      <Form.Item name='vehicleCount' hidden={true}>
        <InputNumber />
      </Form.Item>
    </Popover>
  );
}

interface CountPopoverProps {
  label: string;
  inputName: string;
}

function CountPopover({ label, inputName }: CountPopoverProps) {
  const form = Form.useFormInstance();

  const numPassenger = Form.useWatch(inputName, form);

  const onDecrement = () => {
    form.setFieldValue(inputName, form.getFieldValue(inputName) - 1);
  };

  const onIncrement = () => {
    form.setFieldValue(inputName, form.getFieldValue(inputName) + 1);
  };

  return (
    <div>
      <Space>
        <span>{label}</span>
        <Button
          shape='circle'
          disabled={
            numPassenger === 0 ||
            (inputName === 'passengerCount' && numPassenger === 1)
          }
          onClick={() => onDecrement()}
        >
          -
        </Button>
        <span>{numPassenger}</span>
        <Button shape='circle' onClick={() => onIncrement()}>
          +
        </Button>
      </Space>
    </div>
  );
}
