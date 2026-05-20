import { Form, Input, Modal, ModalProps, Select, Typography } from 'antd';
import React from 'react';
import { useForm } from 'antd/es/form/Form';
import { BOOKING_CANCELLATION_TYPE } from '@ayahay/constants';

const { Title } = Typography;

interface BookingCancellationModalProps {
  onConfirmCancellation: (
    cancellationReason: string,
    reasonType: keyof typeof BOOKING_CANCELLATION_TYPE
  ) => void;
}

const refundOptions = [
  {
    label: 'Full refund',
    value: 'NoFault',
  },
  {
    label: '80% refund',
    value: 'PassengersFault',
  },
];

export default function BookingCancellationModal({
  onConfirmCancellation,
  onOk,
  ...modalProps
}: BookingCancellationModalProps & ModalProps) {
  const [form] = useForm();

  const onOkModal = async () => {
    try {
      await form.validateFields(['remarks']);
      onConfirmCancellation(
        form.getFieldValue('remarks'),
        form.getFieldValue('reasonType')
      );
    } catch {}
  };

  return (
    <Modal onOk={onOkModal} okText='Refund' closeIcon={true} {...modalProps}>
      <Title level={2} style={{ fontSize: '20px' }}>
        Are you sure you want to refund this booking? This action cannot be
        undone.
      </Title>
      <Form form={form} initialValues={{ reasonType: 'NoFault' }}>
        <Form.Item
          label='Remarks'
          name='remarks'
          rules={[
            {
              required: true,
              message: 'Please input the cancellation remarks',
            },
          ]}
        >
          <Input placeholder='Cancellation, change of mind, processed mistakenly, etc.' />
        </Form.Item>
        <Form.Item label='Refund Type' name='reasonType'>
          <Select options={refundOptions} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
