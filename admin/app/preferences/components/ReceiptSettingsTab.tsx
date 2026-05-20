'use client';
import { Card, InputNumber, Form, Button, message } from 'antd';
import { useState, useEffect } from 'react';

export default function ReceiptSettingsTab() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCopies = localStorage.getItem('receipt-copies') || '2';
    form.setFieldsValue({ numberOfCopies: parseInt(savedCopies) });
  }, [form]);

  const handleSubmit = async (values: { numberOfCopies: number }) => {
    setLoading(true);
    try {
      localStorage.setItem('receipt-copies', values.numberOfCopies.toString());
      message.success('Receipt settings saved successfully');
    } catch (error) {
      message.error('Failed to save receipt settings');
    }
    setLoading(false);
  };

  return (
    <Card title="Receipt Settings">
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label="Number of Receipt Copies"
          name="numberOfCopies"
          rules={[{ required: true, message: 'Please input number of copies' }]}
        >
          <InputNumber min={1} max={10} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
