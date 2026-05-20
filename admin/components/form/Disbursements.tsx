import EnumSelect from '@ayahay/components/form/EnumSelect';
import {
  DATE_FORMAT_LIST,
  DATE_PLACEHOLDER,
  OPERATION_COSTS,
} from '@ayahay/constants';
import {
  Button,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
} from 'antd';
import dayjs from 'dayjs';
import styles from './Disbursements.module.scss';

const { TextArea } = Input;

interface DisbursementsProps {
  tripDate: string;
  isEdit: boolean;
  handleDisbursementDelete: () => Promise<void>;
}

export default function Disbursements({
  tripDate,
  isEdit,
  handleDisbursementDelete,
}: DisbursementsProps) {
  return (
    <Form.List name='disbursement'>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }, index) => (
            <div key={key}>
              <Divider style={{ paddingTop: 10 }}>
                {isEdit ? 'Edit Disbursement' : `Disbursement ${index + 1}`}
              </Divider>
              <Flex justify='space-between' id={styles['flex-box']}>
                <section style={{ width: '100%', padding: 5 }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'date']}
                    label='Date'
                    rules={[{ required: true, message: 'Missing date' }]}
                  >
                    <DatePicker
                      format={DATE_FORMAT_LIST}
                      placeholder={DATE_PLACEHOLDER}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'officialReceipt']}
                    label='Official Receipt'
                  >
                    <TextArea autoSize />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'paidTo']}
                    label='Paid To'
                    rules={[{ required: true, message: 'Missing paid to' }]}
                  >
                    <TextArea autoSize />
                  </Form.Item>
                </section>
                <section style={{ width: '100%', padding: 5 }}>
                  <EnumSelect
                    _enum={OPERATION_COSTS}
                    disabled={false}
                    showSearch={true}
                    name={[name, 'description']}
                    label='Description'
                    rules={[{ required: true, message: 'Missing description' }]}
                  />
                  <Form.Item
                    {...restField}
                    name={[name, 'purpose']}
                    label='Purpose'
                    rules={[{ required: true, message: 'Missing purpose' }]}
                  >
                    <TextArea autoSize />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'amount']}
                    label='Amount'
                    rules={[{ required: true, message: 'Missing amount' }]}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </section>
              </Flex>
              <Button
                danger
                style={{ display: isEdit ? 'none' : undefined, float: 'right' }}
                onClick={() => remove(name)}
              >
                Remove Disbursement
              </Button>
            </div>
          ))}

          {isEdit && (
            <Button
              type='primary'
              danger
              onClick={handleDisbursementDelete}
              style={{ textAlign: 'right' }}
            >
              Delete Disbursement
            </Button>
          )}
          <Button
            type='dashed'
            onClick={() => add({ date: dayjs(tripDate) })}
            block
            style={{ display: isEdit ? 'none' : undefined }}
          >
            Add Disbursement
          </Button>
        </>
      )}
    </Form.List>
  );
}
