'use client';
import React from 'react';
import type { FC, ReactNode } from 'react';
import {
  Card,
  Switch,
  Form,
  Input,
  Select,
  Button,
  Space,
  Table,
  Spin,
  Alert,
  message,
} from 'antd';
import type { TableProps } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { SelectProps } from 'antd/es/select';
import type { BaseOptionType, DefaultOptionType } from 'antd/es/select';
import { useState, useEffect } from 'react';
import axios from '@ayahay/services/axios';
import {
  FormFieldPreference,
  Port,
  SavePreferenceData,
  INITIAL_PREFERENCES,
  ShippingLine,
} from '../types';

const { Option } = Select;

const PassengerInformationTab: FC = () => {
  const [form] = Form.useForm();
  const [preferences, setPreferences] =
    useState<FormFieldPreference[]>(INITIAL_PREFERENCES);
  const [selectedPort, setSelectedPort] = useState<number>();
  const [selectedShippingLine, setSelectedShippingLine] = useState<number>();
  const [ports, setPorts] = useState<Port[]>([]);
  const [shippingLines, setShippingLines] = useState<ShippingLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userShippingLineId, setUserShippingLineId] = useState<number>();

  useEffect(() => {
    const loginUser = JSON.parse(localStorage.getItem('logged-in-account')!);
    const userRole = loginUser?.data?.role;
    const shippingLineId = loginUser?.data?.shipping_line_id;
    setIsSuperAdmin(userRole === 'SuperAdmin');
    setUserShippingLineId(shippingLineId);
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchShippingLines();
    } else {
      fetchPorts();
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin && selectedShippingLine) {
      fetchPortsByShippingLine();
    }
  }, [selectedShippingLine]);

  useEffect(() => {
    if (selectedPort) {
      fetchPreferences();
    }
  }, [selectedPort]);

  const fetchShippingLines = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/shipping-lines`
      );
      setShippingLines(response.data);
    } catch (error: any) {
      console.error('Error fetching shipping lines:', error);
      message.error(`Failed to fetch shipping lines: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortsByShippingLine = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/shipping-lines/${selectedShippingLine}/ports`
      );
      setPorts(response.data);
      setSelectedPort(undefined); // Reset port selection when shipping line changes
    } catch (error: any) {
      console.error('Error fetching ports:', error);
      message.error(`Failed to fetch ports: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPorts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/form-preferences/ports`,
        {
          params: {
            shipping_line_id: userShippingLineId,
          },
        }
      );
      setPorts(response.data);
    } catch (error: any) {
      console.error('Error fetching ports:', error);
      message.error(`Failed to fetch ports: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/form-preferences`,
        {
          params: {
            portId: selectedPort,
            shippingLineId: isSuperAdmin ? selectedShippingLine : undefined,
          },
        }
      );
      if (response.data && response.data.data) {
        const updatedPreferences = INITIAL_PREFERENCES.map((pref) => {
          const savedPref = response.data.data.find(
            (p: any) => p.field === pref.field
          );

          if (!savedPref) {
            return pref;
          }

          const mergedPref = {
            ...pref,
            ...savedPref,
            defaultValue:
              !savedPref.hasOwnProperty('defaultValue') &&
              pref.hasOwnProperty('defaultValue')
                ? pref.defaultValue
                : savedPref.defaultValue === '' ||
                  savedPref.defaultValue === null ||
                  savedPref.defaultValue === undefined
                ? ''
                : savedPref.defaultValue,
          };

          return mergedPref;
        });

        setPreferences(updatedPreferences);
      } else {
        setPreferences(INITIAL_PREFERENCES);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      message.error('Failed to fetch preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingLineChange = (shippingLineId: number) => {
    setSelectedShippingLine(shippingLineId);
  };

  const handlePortChange = (portId: number) => {
    setSelectedPort(portId);
  };

  const handleToggle = (field: string, checked: boolean) => {
    setPreferences(
      preferences.map((pref) =>
        pref.field === field ? { ...pref, enabled: checked } : pref
      )
    );
  };

  const handleDefaultValueChange = (field: string, value: string) => {
    // Convert undefined, null, or strings that are only spaces to empty string
    const sanitizedValue =
      value === undefined || value === null || value.trim() === '' ? '' : value;

    setPreferences(
      preferences.map((pref) =>
        pref.field === field ? { ...pref, defaultValue: sanitizedValue } : pref
      )
    );
  };

  const handleSave = async () => {
    if (!selectedPort) {
      message.warning('Please select a port first');
      return;
    }

    if (isSuperAdmin && !selectedShippingLine) {
      message.warning('Please select a shipping line first');
      return;
    }

    try {
      setSaving(true);
      const data: SavePreferenceData = {
        portId: selectedPort,
        shippingLineId: isSuperAdmin ? selectedShippingLine : undefined,
        preferences: preferences.map((pref) => ({
          field: pref.field,
          enabled: pref.enabled,
          // Always include defaultValue regardless of enabled state
          defaultValue: pref.defaultValue === undefined || 
            pref.defaultValue === null || 
            pref.defaultValue.trim() === '' 
              ? '' 
              : pref.defaultValue.trim(),
        })),
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/form-preferences`,
        data
      );
      message.success('Preferences saved successfully');
      await fetchPreferences();
    } catch (error) {
      console.error('Error saving preferences:', error);
      message.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const columns: TableProps<FormFieldPreference>['columns'] = [
    {
      title: 'Field',
      dataIndex: 'label',
      key: 'label',
      width: '20%',
    },
    {
      title: 'Required',
      dataIndex: 'enabled',
      key: 'enabled',
      width: '15%',
      render: (_: any, record: FormFieldPreference) => (
        <Switch
          checked={record.enabled}
          onChange={(checked) => handleToggle(record.field, checked)}
        />
      ),
    },
    {
      title: 'Default Value',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      width: '65%',
      render: (_: any, record: FormFieldPreference) => {
        if (record.type === 'select' && record.options) {
          return (
            <Select
              style={{ width: '100%' }}
              value={
                record.defaultValue === '' ? undefined : record.defaultValue
              }
              onChange={(value) =>
                handleDefaultValueChange(record.field, value || '')
              }
              allowClear
              placeholder={`Select ${record.label}`}
            >
              {record.options.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          );
        }
        return (
          <Input
            placeholder={`Default value for ${record.label}`}
            value={record.defaultValue}
            onChange={(e) =>
              handleDefaultValueChange(record.field, e.target.value)
            }
            allowClear
          />
        );
      },
    },
  ];

  return (
    <Space
      direction='vertical'
      size='large'
      style={{ width: '100%', paddingTop: '40px' }}
    >
      <div className='portSelection'>
        <Form layout='horizontal'>
          <div style={{ display: 'flex' }}>
            {isSuperAdmin && (
              <Form.Item
                label='Select Shipping Line'
                required
                tooltip='Select a shipping line to view its ports'
                style={{ flex: 1, marginRight: '5px' }}
              >
                <Select
                  placeholder='Select a shipping line'
                  loading={loading}
                  value={selectedShippingLine}
                  onChange={handleShippingLineChange}
                  style={{ width: 'calc(50% - 5px)' }}
                >
                  {shippingLines.map((sl) => (
                    <Option key={sl.id} value={sl.id}>
                      {sl.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            <Form.Item
              label='Select Port'
              required
              tooltip='Preferences will be saved for the selected port'
              style={{ flex: 1 }}
            >
              <Select
                placeholder='Select a port'
                loading={loading}
                value={selectedPort}
                onChange={handlePortChange}
                style={{ width: 'calc(50% - 5px)' }}
                disabled={isSuperAdmin && !selectedShippingLine}
              >
                {ports.map((port) => (
                  <Option key={port.id} value={port.id}>
                    {port.name} ({port.code})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </Form>
      </div>

      {!selectedPort || (isSuperAdmin && !selectedShippingLine) ? (
        <Alert
          message={
            isSuperAdmin && !selectedShippingLine
              ? 'Please Select a Shipping Line'
              : 'Please Select a Port'
          }
          description={
            isSuperAdmin && !selectedShippingLine
              ? 'You need to select a shipping line first to view available ports.'
              : 'You need to select a port to view and edit form preferences.'
          }
          type='info'
          showIcon
        />
      ) : (
        <Spin spinning={loading}>
          <Card
            title='Passenger Information Fields'
            extra={
              <Button
                type='primary'
                onClick={handleSave}
                loading={saving}
                disabled={!selectedPort}
              >
                Save Changes
              </Button>
            }
          >
            <Table
              dataSource={preferences}
              columns={columns}
              rowKey='field'
              pagination={false}
              bordered
            />
          </Card>
        </Spin>
      )}
    </Space>
  );
};

export default PassengerInformationTab;
