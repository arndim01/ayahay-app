import { DatePicker, Form, Input } from 'antd';
import EnumRadio from '@ayahay/components/form/EnumRadio';
import { SEX, DATE_FORMAT_LIST, DATE_PLACEHOLDER } from '@ayahay/constants';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';

export default function PassengerFields() {
  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current > dayjs().endOf('day');
  };

  return (
    <>
      <Form.Item
        name='firstName'
        label='First Name'
        colon={false}
        rules={[{ required: true, message: 'Missing first name' }]}
      >
        <Input placeholder='First Name' />
      </Form.Item>
      <Form.Item
        name='lastName'
        label='Last Name'
        colon={false}
        rules={[{ required: true, message: 'Missing last name' }]}
      >
        <Input placeholder='Last Name' />
      </Form.Item>
      <EnumRadio
        _enum={SEX}
        name='sex'
        label='Sex'
        colon={false}
        rules={[{ required: true, message: 'Missing sex' }]}
      />
      <Form.Item
        name='birthdayIso'
        label='Date of Birth'
        colon={false}
        rules={[{ required: true, message: 'Missing Date of Birth' }]}
      >
        <DatePicker
          format={DATE_FORMAT_LIST}
          placeholder={DATE_PLACEHOLDER}
          style={{ minWidth: '20%' }}
          disabledDate={disabledDate}
        />
      </Form.Item>
      <Form.Item
        name='address'
        label='Address'
        colon={false}
        rules={[{ required: true, message: 'Missing address' }]}
      >
        <Input placeholder='Region, Province, Municipality' />
      </Form.Item>
      <Form.Item
        name='nationality'
        label='Nationality'
        colon={false}
        rules={[{ required: true, message: 'Missing nationality' }]}
      >
        <Input placeholder='Filipino, Chinese, American, etc.' />
      </Form.Item>
    </>
  );
}
