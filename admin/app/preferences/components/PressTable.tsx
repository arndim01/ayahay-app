import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {
  Table,
  Button,
  Popconfirm,
  Space,
  message,
  Modal,
  Form,
  Input,
  DatePicker,
  Switch,
  Select,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useWatch } from 'antd/es/form/Form';
import axios from 'axios';
import dayjs from 'dayjs';
import { IPress } from '@ayahay/models';

const categoryOptions = ['Research', 'Partnerships', 'Milestones'];
const typeOptions = ['Video', 'Article'];

interface Props {
  shippingLineId: number;
}

export interface PressTableRef {
  refresh: () => void;
}

const PressTable = forwardRef<PressTableRef, Props>(function PressTable(
  { shippingLineId },
  ref
) {
  const [pressItems, setPressItems] = useState<IPress[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<IPress | null>(null);
  const [form] = Form.useForm();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const selectedType = useWatch('type', form); // watch type field reactively

  const fetchPressItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/press/${shippingLineId}`);
      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.data)
        ? response.data.data
        : [];

      const sortedData = data.sort((a: IPress, b: IPress) => a.id - b.id);
      setPressItems(sortedData);
    } catch (error) {
      console.error('Error fetching press items:', error);
      message.error('Failed to fetch press items');
      setPressItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/press/${id}`);
      message.success('Press item deleted');
      fetchPressItems();
    } catch (error) {
      console.error('Error deleting Press item:', error);
      message.error('Failed to delete press item');
    }
  };

  const showEditModal = (item: IPress) => {
    setEditingItem(item);
    form.setFieldsValue({
      ...item,
      content: item.content?.replace(/<br\s*\/?>/g, '\n'),
      publishedDate: item.publishedDate ? dayjs(item.publishedDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const payload: Partial<IPress> = {
        ...values,
        content: values.content.replace(/\n/g, '<br>'),
        publishedDate: values.publishedDate?.toISOString(),
        shippingLineId,
      };

      if (editingItem) {
        await axios.put(`${API_URL}/press/${editingItem.id}`, payload);
        message.success('Press item updated');
        fetchPressItems();
      }

      setIsModalVisible(false);
      setEditingItem(null);
      form.resetFields();
    } catch (error) {
      console.error('Error updating press item:', error);
      message.error('Failed to update press item');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  useImperativeHandle(ref, () => ({
    refresh: fetchPressItems,
  }));

  useEffect(() => {
    fetchPressItems();
  }, [shippingLineId]);

  const columns: ColumnsType<IPress> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Published Date',
      dataIndex: 'publishedDate',
      key: 'publishedDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Published?',
      dataIndex: 'isPublish',
      key: 'isPublish',
      render: (val: boolean) => (val ? 'Yes' : 'No'),
    },
    {
      title: 'Video URL',
      dataIndex: 'videoUrl',
      key: 'videoUrl',
    },
    {
      title: 'Article URL',
      dataIndex: 'articleUrl',
      key: 'articleUrl',
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_: any, record: IPress) => (
        <Space>
          <Button type='link' size='small' onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title='Are you sure to delete this press item?'
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
        dataSource={pressItems}
        rowKey='id'
        loading={loading}
        bordered
        pagination={{ pageSize: 5 }}
        scroll={{ x: 1300 }}
      />

      <Modal
        title='Edit Press Item'
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText='Save'
      >
        <Form form={form} layout='vertical'>
          {/* Category dropdown */}
          <Form.Item
            name='category'
            label='Category'
            rules={[{ required: true }]}
          >
            <Select
              placeholder='Select category'
              options={categoryOptions.map((cat) => ({
                label: cat,
                value: cat,
              }))}
            />
          </Form.Item>

          {/* Type dropdown */}
          <Form.Item name='type' label='Type' rules={[{ required: true }]}>
            <Select
              placeholder='Select type'
              options={typeOptions.map((type) => ({
                label: type,
                value: type,
              }))}
            />
          </Form.Item>

          {/* Conditionally show video/article URL fields */}
          {selectedType === 'Video' && (
            <Form.Item name='videoUrl' label='Video URL'>
              <Input />
            </Form.Item>
          )}

          {selectedType === 'Article' && (
            <Form.Item name='articleUrl' label='Article URL'>
              <Input />
            </Form.Item>
          )}

          <Form.Item name='title' label='Title' rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name='content'
            label='Content'
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name='publishedDate' label='Published Date'>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name='isPublish'
            label='Is Published?'
            valuePropName='checked'
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

export default PressTable;
