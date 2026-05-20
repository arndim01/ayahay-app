'use client';
import React, { useState, useEffect } from 'react';
import {
  Table,
  Form,
  Input,
  Button,
  Card,
  Space,
  Select,
  Row,
  Col,
  message,
  Tooltip,
  Spin,
  Modal,
  TimePicker,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import styles from '../page.module.scss';
import { BookingCutoff, ShippingLine, Port } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const ShippingLineBookingCutoff: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [cutoffData, setCutoffData] = useState<BookingCutoff[]>([]);
  const [shippingLines, setShippingLines] = useState<ShippingLine[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [cutOffType, setCutOffType] = useState<string>('');

  useEffect(() => {
    fetchCutoffData();
    fetchShippingLines();
    fetchPorts();
  }, []);

  useEffect(() => {
    if (cutOffType === 'fixed_hour') {
      form.setFieldValue('cut_off_value', 24);
    }
  }, [cutOffType, form]);

  const fetchCutoffData = async () => {
    try {
      setLoading(true);
      const token: any = JSON.parse(localStorage.getItem('jwt')!);
      const response = await fetch(`${API_URL}/preference/booking-cutoff`, {
        headers: {
          Authorization: `Bearer ${token.data}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setCutoffData(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShippingLines = async () => {
    try {
      const token: any = JSON.parse(localStorage.getItem('jwt')!);
      const response = await fetch(`${API_URL}/shipping-lines`, {
        headers: {
          Authorization: `Bearer ${token.data}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch shipping lines');
      const data = await response.json();
      setShippingLines(data);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchPorts = async () => {
    try {
      const token: any = JSON.parse(localStorage.getItem('jwt')!);
      const response = await fetch(`${API_URL}/api/form-preferences/ports`, {
        // Updated endpoint
        headers: {
          Authorization: `Bearer ${token.data}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch ports');
      const data = await response.json();
      setPorts(data);
    } catch (error) {
      handleError(error);
    }
  };

  const columns = [
    {
      title: 'Shipping Line',
      dataIndex: 'shipping_line_name',
      key: 'shipping_line_name',
    },
    {
      title: 'Route',
      children: [
        {
          title: 'Origin',
          dataIndex: 'origin_port_name',
          key: 'origin_port_name',
        },
        {
          title: 'Destination',
          dataIndex: 'destination_port_name',
          key: 'destination_port_name',
        },
      ],
    },
    {
      title: 'Cut Off Details',
      children: [
        {
          title: 'Condition Type',
          dataIndex: 'cut_off_condition_type',
          key: 'cut_off_condition_type',
        },
        {
          title: 'Hours',
          dataIndex: 'cut_off_value',
          key: 'cut_off_value',
        },
      ],
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title='Edit Cut Off'>
            <Button
              icon={<EditOutlined />}
              type='primary'
              size='middle'
              className='bg-blue-500 hover:bg-blue-600 border-none shadow-md'
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title='Delete Cut Off'>
            <Button
              icon={<DeleteOutlined />}
              type='primary'
              size='middle'
              danger
              className='shadow-md'
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleAddCutoff = () => {
    setShowForm(true);
    setEditingId(null);
    form.resetFields();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleError = (error: any) => {
    message.error('An error occurred: ' + error.message);
    console.error(error);
  };

  const handleEdit = (record: BookingCutoff) => {
    setEditingId(record.id);
    setShowForm(true);
    setCutOffType(record.cut_off_condition_type);
    form.setFieldsValue({
      shipping_line_id: record.shipping_line_id,
      origin: record.origin,
      destination: record.destination,
      cut_off_condition_type: record.cut_off_condition_type,
      cut_off_value: record.cut_off_value,
    });
  };

  const handleCreate = async (values: any) => {
    try {
      const token: any = JSON.parse(localStorage.getItem('jwt')!);
      const loginUser = JSON.parse(localStorage.getItem('logged-in-account')!);
      const response = await fetch(`${API_URL}/preference/booking-cutoff`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.data}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          created_by: loginUser.data.email,
          updated_by: loginUser.data.email,
        }),
      });

      if (!response.ok) throw new Error('Failed to create cutoff');

      message.success('Cut off added successfully');
      setShowForm(false);
      form.resetFields();
      fetchCutoffData();
    } catch (error) {
      handleError(error);
    }
  };

  const handleUpdate = async (values: any) => {
    try {
      const token: any = JSON.parse(localStorage.getItem('jwt')!);
      const loginUser = JSON.parse(localStorage.getItem('logged-in-account')!);
      const response = await fetch(
        `${API_URL}/preference/booking-cutoff/${editingId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token.data}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...values,
            updated_by: loginUser.data.email,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update cutoff');

      message.success('Cut off updated successfully');
      setShowForm(false);
      setEditingId(null);
      form.resetFields();
      fetchCutoffData();
    } catch (error) {
      handleError(error);
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      values['destination'] = Number(values['destination']);
      values['origin'] = Number(values['origin']);
      values['shipping_line_id'] = Number(values['shipping_line_id']);
      values['cut_off_value'] = Number(values['cut_off_value']);

      if (editingId) {
        await handleUpdate(values);
      } else {
        await handleCreate(values);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = async (record: any) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this cut off?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          const token: any = JSON.parse(localStorage.getItem('jwt')!);
          const response = await fetch(
            `${API_URL}/preference/booking-cutoff/${record.id}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token.data}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) throw new Error('Failed to delete cutoff');

          message.success('Cut off deleted successfully');
          fetchCutoffData();
        } catch (error) {
          handleError(error);
        }
      },
    });
  };

  return (
    <div className={styles.componentContainer}>
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={showForm ? 14 : 24}>
          <Card className={styles.card} bodyStyle={{ padding: '24px' }}>
            <div className={styles.header}>
              <h1>Booking Cut Off</h1>
              {!showForm && (
                <Tooltip title='Add New Cut Off'>
                  <Button
                    type='primary'
                    icon={<PlusOutlined />}
                    onClick={handleAddCutoff}
                    className={styles.addButton}
                  >
                    Add Cut Off
                  </Button>
                </Tooltip>
              )}
            </div>

            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={cutoffData}
                className={styles.table}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} items`,
                  className: 'pt-4',
                }}
                scroll={{ x: 800 }}
              />
            </Spin>
          </Card>
        </Col>

        {showForm && (
          <Col xs={24} xl={10}>
            <Card
              className={styles.formCard}
              title={editingId ? 'Edit Cut Off' : 'Add New Cut Off'}
            >
              <Form form={form} layout='vertical' onFinish={handleModalSubmit}>
                <Form.Item
                  name='shipping_line_id'
                  label='Shipping Line'
                  rules={[
                    {
                      required: true,
                      message: 'Please select a shipping line',
                    },
                  ]}
                >
                  <Select
                    placeholder='Select shipping line'
                    options={shippingLines.map((line) => ({
                      value: line.id,
                      label: `${line.id} - ${line.name}`,
                    }))}
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name='origin'
                      label='Origin'
                      rules={[
                        { required: true, message: 'Please select an origin' },
                      ]}
                    >
                      <Select
                        placeholder='Select origin'
                        options={ports.map((port) => ({
                          value: port.id,
                          label: `${port.id} - ${port.name}`,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name='destination'
                      label='Destination'
                      rules={[
                        {
                          required: true,
                          message: 'Please select a destination',
                        },
                      ]}
                    >
                      <Select
                        placeholder='Select destination'
                        options={ports.map((port) => ({
                          value: port.id,
                          label: `${port.id} - ${port.name}`,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name='cut_off_condition_type'
                      label='Cut Off Condition'
                      rules={[
                        {
                          required: true,
                          message: 'Please select a cut off condition',
                        },
                      ]}
                    >
                      <Select
                        placeholder='Select condition type'
                        options={[
                          { value: 'fixed_hour', label: 'Fixed Hour' },
                          {
                            value: 'number_of_hours',
                            label: 'Number of Hours',
                          },
                        ]}
                        onChange={(value) => {
                          setCutOffType(value);
                          if (value === 'fixed_hour') {
                            form.setFieldValue('cut_off_value', 24);
                          } else {
                            form.setFieldValue('cut_off_value', undefined);
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name='cut_off_value'
                      label='Value'
                      rules={[
                        { required: true, message: 'Please enter a value' },
                      ]}
                    >
                      {cutOffType === 'fixed_hour' ? (
                        <Input
                          type='number'
                          placeholder='Enter hour (0-24)'
                          min={0}
                          max={24}
                        />
                      ) : (
                        <Input
                          type='number'
                          placeholder='Enter hours'
                          min={1}
                          max={72}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item className={styles.formButtons}>
                  <Space>
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button
                      type='primary'
                      htmlType='submit'
                      className='bg-blue-500 hover:bg-blue-600'
                    >
                      {editingId ? 'Update' : 'Save'}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ShippingLineBookingCutoff;
