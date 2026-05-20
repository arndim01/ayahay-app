import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import {
  Table,
  Button,
  Popconfirm,
  Space,
  message,
  Modal,
  Form,
  Input,
} from 'antd';
import axios from 'axios';

import { IFaq } from '@ayahay/models';

interface Props {
  category: string;
  shippingLineId: number;
}

export interface FaqTableRef {
  refresh: () => void;
}

const FaqTable = forwardRef<FaqTableRef, Props>(function FaqTable(
  { category, shippingLineId },
  ref
) {
  const [faqs, setFaqs] = useState<IFaq[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFaq, setEditingFaq] = useState<IFaq | null>(null);
  const [form] = Form.useForm();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/faq/${category}/${shippingLineId}`
      );
      const rawData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.data)
        ? response.data.data
        : [];

      // Sort by ID (ascending)
      const sortedData = rawData.sort((a: IFaq, b: IFaq) => a.id - b.id);

      setFaqs(sortedData);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      message.error('Failed to fetch FAQs');
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/faq/${id}`);
      message.success('FAQ deleted');
      fetchFaqs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      message.error('Failed to delete FAQ');
    }
  };

  const showEditModal = (faq: IFaq) => {
    setEditingFaq(faq);

    // Transform <br> into \n for display in textarea
    form.setFieldsValue({
      ...faq,
      answer: faq.answer?.replace(/<br\s*\/?>/g, '\n'),
    });

    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      // Convert newlines to <br> before saving
      const payload = {
        ...values,
        answer: values.answer.replace(/\n/g, '<br>'),
      };
      
      if (editingFaq) {
        await axios.put(`${API_URL}/faq/${editingFaq.id}`, payload);
        message.success('FAQ updated');
        setIsModalVisible(false);
        fetchFaqs();
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      message.error('Failed to update FAQ');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingFaq(null);
  };

  useImperativeHandle(ref, () => ({
    refresh: fetchFaqs,
  }));

  useEffect(() => {
    fetchFaqs();
  }, [category, shippingLineId]);

  const columns = [
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
      width: '30%',
      sorter: (a: IFaq, b: IFaq) => a.question.localeCompare(b.question),
    },
    {
      title: 'Answer',
      dataIndex: 'answer',
      key: 'answer',
      width: '70%',
      sorter: (a: IFaq, b: IFaq) => a.answer.localeCompare(b.answer),
      render: (text: string) => (
        <div
          dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: IFaq) => (
        <Space>
          <Button type='link' size='small' onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title='Are you sure to delete this FAQ?'
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger size='small'>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <Table
        columns={columns}
        dataSource={faqs}
        rowKey='id'
        loading={loading}
        bordered
        pagination={{ pageSize: 5 }}
        style={{ width: '100%' }}
      />

      <Modal
        title='Edit FAQ'
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText='Save'
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='question'
            label='Question'
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name='answer' label='Answer' rules={[{ required: true }]}>
            <Input.TextArea rows={4} style={{ height: '200px' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

export default FaqTable;
