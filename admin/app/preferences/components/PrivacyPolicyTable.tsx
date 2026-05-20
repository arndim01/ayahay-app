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
  Select,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import { IPrivacyPolicy, ParagraphBlock } from '@ayahay/models';

interface Props {
  shippingLineId: number;
  onDeleted?: (shippingLineId: number) => void;
}

export interface PrivacyPolicyTableRef {
  refresh: () => void;
}

const titleOptions = [
  { label: 'Privacy Policy', value: 'introduction' },
  { label: '1. Information We Collect', value: 'information-we-collect' },
  {
    label: '2. How We Use Your Information',
    value: 'how-we-use-your-information',
  },
  { label: '3. Sharing Your Information', value: 'sharing-your-information' },
  { label: '4. Security', value: 'security' },
  { label: '5. Your Choices', value: 'your-choices' },
  { label: "6. Children's Privacy", value: 'childrens-privacy' },
  { label: '7. Updates to this Privacy Policy', value: 'updates-to-policy' },
  { label: '8. Contact Us', value: 'contact-us' },
];

const PrivacyPolicyTable = forwardRef<PrivacyPolicyTableRef, Props>(
  function PrivacyPolicyTable({ shippingLineId, onDeleted }, ref) {
    const [items, setItems] = useState<IPrivacyPolicy[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<IPrivacyPolicy | null>(null);
    const [form] = Form.useForm();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/privacy-policy/${shippingLineId}`
        );
        setItems(response.data);
      } catch (error) {
        console.error(error);
        message.error('Failed to fetch privacy policy');
      } finally {
        setLoading(false);
      }
    };

    const handleDelete = async (id: number) => {
      try {
        await axios.delete(`${API_URL}/privacy-policy/${id}`);
        message.success('Policy deleted');
        fetchItems();
        if (onDeleted) {
          onDeleted();
        }
      } catch (error) {
        console.error(error);
        message.error('Failed to delete policy');
      }
    };

    const showEditModal = (item: IPrivacyPolicy) => {
      setEditingItem(item);
      const isIntro = item.titleId === 'introduction';

      if (isIntro && Array.isArray(item.content)) {
        form.setFieldsValue({
          title: item.title,
          content1: item.content[0]?.text || '',
          content2: item.content[1]?.text || '',
        });
      } else {
        const textContent =
          typeof item.content === 'string'
            ? item.content
            : Array.isArray(item.content)
            ? (item.content as ParagraphBlock[]).map((p) => p.text).join('\n')
            : '';

        form.setFieldsValue({
          title: item.title,
          content: textContent,
        });
      }

      setIsModalVisible(true);
    };

    const handleModalOk = async () => {
      try {
        const values = await form.validateFields();
        const selected = titleOptions.find((opt) => opt.label === values.title);
        const isIntroduction = selected?.value === 'introduction';

        const payload: Partial<IPrivacyPolicy> = {
          titleId: selected?.value || '',
          title: values.title,
          content: isIntroduction
            ? [
                { type: 'paragraph', text: values.content1 },
                { type: 'paragraph', text: values.content2 },
              ]
            : values.content
                .split('\n')
                .filter((text: string) => text.trim() !== '')
                .map((text: string) => ({ type: 'paragraph', text })),
          shippingLineId,
        };

        if (editingItem) {
          await axios.patch(
            `${API_URL}/privacy-policy/${editingItem.id}`,
            payload
          );
          message.success('Policy updated');
        }

        fetchItems();
        setIsModalVisible(false);
        setEditingItem(null);
        form.resetFields();
      } catch (error) {
        console.error(error);
        message.error('Failed to update policy');
      }
    };

    const handleModalCancel = () => {
      setIsModalVisible(false);
      setEditingItem(null);
      form.resetFields();
    };

    useImperativeHandle(ref, () => ({
      refresh: fetchItems,
    }));

    useEffect(() => {
      fetchItems();
    }, [shippingLineId]);

    const columns: ColumnsType<IPrivacyPolicy> = [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
      },
      {
        title: 'Content',
        dataIndex: 'content',
        key: 'content',
        render: (val) => {
          if (typeof val === 'string') return val;
          if (Array.isArray(val)) {
            return (val as ParagraphBlock[])
              .map((p) => `• ${p.text}`)
              .join('\n');
          }
          return '';
        },
      },
      {
        title: 'Actions',
        key: 'actions',
        fixed: 'right',
        width: 120,
        render: (_: any, record: IPrivacyPolicy) => (
          <Space>
            <Button
              type='link'
              size='small'
              onClick={() => showEditModal(record)}
            >
              Edit
            </Button>
            <Popconfirm
              title='Are you sure to delete this policy?'
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
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <Table
          columns={columns}
          dataSource={items}
          rowKey='id'
          loading={loading}
          bordered
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title='Edit Privacy Policy'
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText='Save'
        >
          <Form form={form} layout='vertical'>
            <Form.Item name='title' label='Title'>
              <div
                style={{
                  padding: '4px 11px',
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                  minHeight: 30,
                  lineHeight: '30px',
                }}
              >
                {form.getFieldValue('title')}
              </div>
            </Form.Item>

            {form.getFieldValue('title') === 'Privacy Policy' ? (
              <>
                <Form.Item
                  name='content1'
                  label='Paragraph 1'
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name='content2'
                  label='Paragraph 2'
                  rules={[{ required: true }]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
              </>
            ) : (
              <Form.Item
                name='content'
                label='Content (One paragraph per line)'
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={6} />
              </Form.Item>
            )}
          </Form>
        </Modal>
      </div>
    );
  }
);

export default PrivacyPolicyTable;
