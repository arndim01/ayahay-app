'use client';
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Spin,
  message,
  Modal,
  Form,
  Input,
  Select,
  Card
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './TermsAndConditions.module.scss';

import { ITermsAndConditions, IShippingLine } from '@ayahay/models';
import * as TermsAndConditionsService from '@ayahay/services/terms-and-conditions.service';
import { getShippingLines } from '@ayahay/services/shipping-line.service';

const TermsAndConditions = () => {
  const [records, setRecords] = useState<ITermsAndConditions[]>([]);
  const [loading, setLoading] = useState(false);
  const [shippingLines, setShippingLines] = useState<IShippingLine[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  // New state variables to track if user is ShippingLineAdmin and their shipping line ID
  const [isShippingLineAdmin, setIsShippingLineAdmin] = useState<boolean>(false);
  const [adminShippingLineId, setAdminShippingLineId] = useState<number | null>(null);

  // For SuperAdmin: fetch all Terms & Conditions
  const fetchAllTerms = async () => {
    setLoading(true);
    try {
      const terms = await TermsAndConditionsService.getAllTermsAndConditions();
      if (terms) {
        setRecords(terms);
      }
    } catch (error) {
      console.error('Error fetching Terms and Conditions:', error);
    } finally {
      setLoading(false);
    }
  };

  // For ShippingLineAdmin: fetch Terms & Conditions for their shipping line only
  const fetchShippingLineTerms = async (shippingLineId: number) => {
    setLoading(true);
    try {
      const term = await TermsAndConditionsService.getAdminShippingLineTermsAndConditions(shippingLineId);
      if (term) {
        // Since our table expects an array, wrap the single record in an array
        setRecords([term]);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error(`Error fetching Terms and Conditions for shipping line ${shippingLineId}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Shipping Lines for select options
  const fetchShippingLineOptions = async () => {
    try {
      const lines = await getShippingLines();
      if (lines) {
        setShippingLines(lines);
      }
    } catch (error) {
      console.error('Error fetching shipping lines:', error);
    }
  };

  // Delete a record
  const handleDeleteRecord = async (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete these Terms and Conditions?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        setLoading(true);
        try {
          const deletedRecord = await TermsAndConditionsService.deleteTermsAndConditions(id);
          if (deletedRecord) {
            setRecords((prev) => prev.filter((r) => r.id !== id));
            message.success('Record deleted successfully');
          }
        } catch (error) {
          console.error(`Error deleting record with id ${id}:`, error);
          message.error('Error deleting record');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Open modal to create a new record
  const handleAddRecord = () => {
    setEditingId(null);
    form.resetFields();
    // If user is ShippingLineAdmin, set the shipping line field to their own shipping line
    if (isShippingLineAdmin && adminShippingLineId) {
      form.setFieldsValue({ shippingLineId: adminShippingLineId });
    }
    setModalVisible(true);
  };

  // Open modal to edit an existing record
  const handleEditRecord = (record: ITermsAndConditions) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      shippingLineId: record.shippingLineId,
      content: record.content,
      status: record.status,
    });
    setModalVisible(true);
  };

  // Handle form submit for create or update
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editingId !== null) {
        // Update logic
        const updated = await TermsAndConditionsService.updateTermsAndConditions(editingId, values);
        if (updated) {
          setRecords((prev) =>
            prev.map((r) => (r.id === editingId ? updated : r))
          );
          message.success('Record updated successfully');
        }
      } else {
        // Create logic
        const created = await TermsAndConditionsService.createTermsAndConditions(values);
        if (created) {
          setRecords((prev) => [...prev, created]);
          message.success('Record created successfully');
        }
      }
      form.resetFields();
      setModalVisible(false);
      setEditingId(null);
    } catch (error: any) {
      console.error('Error submitting record:', error);
      // Extract error message from axios response if available
      const errorMsg = error?.response?.data?.message || 'Error submitting record';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // On component mount, retrieve the logged-in user's role and fetch data accordingly
  useEffect(() => {
    const loginUserString = localStorage.getItem('logged-in-account');
    if (loginUserString) {
      const loginUser = JSON.parse(loginUserString);
      const userRole = loginUser?.data?.role;
      if (userRole === 'ShippingLineAdmin') {
        setIsShippingLineAdmin(true);
        const shippingLineId = loginUser.data.shippingLineId;
        setAdminShippingLineId(shippingLineId);
        fetchShippingLineTerms(shippingLineId);
      } else {
        // For other roles (e.g., SuperAdmin), fetch all terms
        fetchAllTerms();
      }
    } else {
      // Fallback: fetch all terms if no logged-in user is found
      fetchAllTerms();
    }
    // Always fetch shipping lines for the select options
    fetchShippingLineOptions();
  }, []);

  // Table columns definition
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Shipping Line',
      dataIndex: 'shippingLineId',
      key: 'shippingLineId',
      render: (id: number) => {
        const line = shippingLines.find((l) => l.id === id);
        return line ? line.name : id;
      },
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: Date) => (value ? new Date(value).toLocaleString() : ''),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (value: Date) => (value ? new Date(value).toLocaleString() : ''),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ITermsAndConditions) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => handleEditRecord(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            type="primary"
            danger
            onClick={() => handleDeleteRecord(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.pageContainer}>
      {/* Header with Title (left) and Button (right) */}
      <div className={styles.headerContainer}>
        <h1>Terms and Conditions</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddRecord}
        >
          Create New Record
        </Button>
      </div>

      <Spin spinning={loading}>
        <Card className={styles.tableCard}>
          <Table dataSource={records} columns={columns} rowKey="id" />
        </Card>
      </Spin>

      <Modal
        title={editingId ? 'Edit Record' : 'Create New Record'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        onOk={handleSubmit}
        okText="Submit"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Shipping Line"
            name="shippingLineId"
            rules={[{ required: true, message: 'Please select a shipping line' }]}
          >
            <Select
              placeholder="Select a shipping line"
              // If the user is a ShippingLineAdmin, disable the field and filter the options to only their shipping line
              disabled={isShippingLineAdmin}
            >
              {shippingLines
                .filter((line) =>
                  !isShippingLineAdmin || line.id === adminShippingLineId
                )
                .map((line) => (
                  <Select.Option key={line.id} value={line.id}>
                    {line.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item label="Content" name="content">
            <Input.TextArea placeholder="Enter Terms and Conditions content" />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TermsAndConditions;
