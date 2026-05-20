import { cancelTrip } from '@/services/trip.service';
import { Button, Flex, Form, Input, Modal, ModalProps } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { NotificationInstance } from 'antd/es/notification/interface';
import { useState } from 'react';

interface CancelledTripModalProps {
  tripId: number;
  setCancelTripModalOpen: any;
  resetData: () => void;
  api: NotificationInstance;
}

export default function CancelledTripModal({
  tripId,
  setCancelTripModalOpen,
  resetData,
  api,
  ...modalProps
}: CancelledTripModalProps & ModalProps) {
  const [form] = useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async () => {
    setLoading(true);
    try {
      await form.validateFields(['reason']);
      await cancelTrip(tripId, form.getFieldValue('reason'));
      api.success({
        message: 'Set Status Cancelled',
        description:
          'The status of the selected trip has been set to Cancelled.',
      });

      setCancelTripModalOpen(false);
      form.resetFields();
      resetData();
    } catch {
      api.error({
        message: 'Set Status Failed',
        description: 'Something went wrong.',
      });
    }
    setLoading(false);
  };

  return (
    <Modal
      title='Cancellation Reason'
      closeIcon={false}
      footer={null}
      {...modalProps}
    >
      <Form form={form} onFinish={onFinish}>
        <Form.Item
          label='Reason'
          name='reason'
          rules={[
            {
              required: true,
              message: 'Please input cancellation reason',
            },
          ]}
        >
          <Input placeholder='Reason for trip cancellation...' />
        </Form.Item>
        <Form.Item>
          <Flex justify='space-evenly'>
            <Button onClick={() => setCancelTripModalOpen(false)}>Back</Button>
            <Button type='primary' htmlType='submit' loading={loading}>
              Send
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </Modal>
  );
}
