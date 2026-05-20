import { Form, Input, Modal, ModalProps, Typography } from 'antd';
import React from 'react';
import { useForm } from 'antd/es/form/Form';

const { Title } = Typography;

interface RemarksConfirmModalProps {
  confirmationText: string;
  inputPlaceholder: string;
  onConfirm: (remarks: string) => void;
}

export default function RemarksConfirmModal({
  confirmationText,
  inputPlaceholder,
  onConfirm,
  onOk,
  ...modalProps
}: RemarksConfirmModalProps & ModalProps) {
  const [form] = useForm();

  const onOkModal = async () => {
    try {
      await form.validateFields(['remarks']);
      onConfirm(form.getFieldValue('remarks'));
    } catch {}
  };

  return (
    <Modal onOk={onOkModal} closeIcon={true} {...modalProps}>
      <Title level={2} style={{ fontSize: '20px' }}>
        {confirmationText}
      </Title>
      <Form form={form}>
        <Form.Item
          label='Remarks'
          name='remarks'
          rules={[
            {
              required: true,
              message: 'This field is required',
            },
          ]}
        >
          <Input placeholder={inputPlaceholder} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
