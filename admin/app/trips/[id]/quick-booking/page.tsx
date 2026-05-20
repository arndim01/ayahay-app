'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Typography,
  Row,
  Col,
  message,
  Spin,
  Select,
  InputNumber,
  Space,
  DatePicker,
} from 'antd';
import { ITrip } from '@ayahay/models/trip.model';
import dayjs from 'dayjs';
import styles from './styles.module.scss';
import {
  getTripDetails,
  getAvailableTripsByDateRange,
} from '@/services/trip.service';
import {
  createQuickBooking,
  getTripRates,
} from '@/services/quick-booking.service';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';
import PortsFilter from '@/components/form/PortsFilter';
import { DATE_FORMAT_LIST, DATE_PLACEHOLDER } from '@ayahay/constants';
import {
  buildSearchQueryFromPortsAndDateRange,
  buildUrlQueryParamsFromPortsAndDateRange,
  initializePortsAndDateRangeFromQueryParams,
} from '@/services/search.service';

const { Title, Text } = Typography;
const { Option } = Select;

interface PaymentModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  totalAmount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  totalAmount,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        payable: totalAmount.toFixed(2),
      });
    }
  }, [visible, totalAmount, form]);

  const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amountPaid = parseFloat(e.target.value) || 0;
    const payable = parseFloat(form.getFieldValue('payable')) || 0;
    const change = amountPaid - payable;
    form.setFieldsValue({ change: change >= 0 ? change.toFixed(2) : '0.00' });
  };

  return (
    <Modal
      title='Payment Details'
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => form.submit()}
      okText='Done'
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={(values) => {
          onSubmit(values);
          form.resetFields();
        }}
      >
        <Form.Item
          name='amountPaid'
          label='Amount Paid'
          rules={[{ required: true, message: 'Please input amount paid' }]}
        >
          <Input
            type='number'
            step='0.01'
            min='0'
            onChange={handleAmountPaidChange}
            placeholder='Enter amount paid'
          />
        </Form.Item>
        <Form.Item
          name='payable'
          label='Payable'
          rules={[{ required: true, message: 'Please input payable amount' }]}
        >
          <Input
            type='number'
            step='0.01'
            min='0'
            placeholder='Enter payable amount'
            disabled
          />
        </Form.Item>
        <Form.Item name='change' label='Change'>
          <Input disabled placeholder='0.00' />
        </Form.Item>
      </Form>
    </Modal>
  );
};

interface PassengerType {
  type: string;
  count: number;
  rate: number;
}

interface Rate {
  type: string;
  rate: number;
}

interface QuickBookingProps {
  params: {
    id: string;
  };
}

export default function QuickBooking({ params }: QuickBookingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const [trip, setTrip] = useState<ITrip | null>(null);
  const [availableTrips, setAvailableTrips] = useState<ITrip[]>([]);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedPassengers, setSelectedPassengers] = useState<PassengerType[]>(
    []
  );
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  const passengerTypes = [
    { type: 'ADULT', label: 'Adult' },
    { type: 'STUDENT', label: 'Student' },
    { type: 'SENIOR_CITIZEN', label: 'Senior Citizen' },
    { type: 'PWD', label: 'PWD' },
    { type: 'CHILD', label: 'Child' },
  ];

  // Initialize form with URL params
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    initializePortsAndDateRangeFromQueryParams(form, params);
    debounceSearch();
  }, []);

  const debounceSearch = useCallback(debounce(performSearch, 300), []);

  async function performSearch() {
    try {
      setLoading(true);
      const query = buildSearchQueryFromPortsAndDateRange(form);
      if (!query) return;

      const result = await getAvailableTripsByDateRange(
        undefined,
        {
          startDate: query.startDate,
          endDate: query.endDate,
          srcPortId: query.srcPortId,
          destPortId: query.destPortId,
        },
        { page: 1, size: 100 }
      );

      setAvailableTrips(result.data || []);

      // If we have a trip ID in params, select that trip
      if (params.id) {
        const selectedTrip = result.data?.find(
          (t) => t.id === Number(params.id)
        );
        if (selectedTrip) {
          await handleTripSelect(selectedTrip.id);
        }
      }
    } catch (error) {
      messageApi.error('Failed to load available trips');
    } finally {
      setLoading(false);
    }
  }

  const handleTripSelect = async (tripId: number) => {
    try {
      setLoading(true);
      const [tripData, ratesData] = await Promise.all([
        getTripDetails(tripId),
        getTripRates(tripId),
      ]);

      if (tripData) {
        setTrip(tripData);
        // Update URL without page reload
        router.push(`/trips/${tripId}/quick-booking`);
      }

      if (ratesData) {
        setRates(ratesData);
      }

      // Reset passenger selections when changing trips
      setSelectedPassengers([]);
    } catch (error) {
      messageApi.error('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const handleDenominationClick = (type: string, count: number) => {
    setSelectedPassengers((prev) => {
      const existing = prev.find((p) => p.type === type);
      const rate = rates.find((r) => r.type === type)?.rate || 0;

      if (existing) {
        if (existing.count === count) {
          // If clicking the same count, remove the selection
          return prev.filter((p) => p.type !== type);
        }
        return prev.map((p) => (p.type === type ? { ...p, count, rate } : p));
      }
      return [...prev, { type, count, rate }];
    });
  };

  const calculateTotalAmount = () => {
    return selectedPassengers.reduce((sum, p) => sum + p.count * p.rate, 0);
  };

  const handleBookItClick = () => {
    if (selectedPassengers.length === 0) {
      messageApi.error('Please select at least one passenger');
      return;
    }
    setIsPaymentModalVisible(true);
  };

  const handlePaymentSubmit = async (values: any) => {
    try {
      const payload = {
        tripId: Number(params.id),
        passengers: selectedPassengers.map(({ type, count }) => ({
          type,
          count,
        })),
        payment: {
          amountPaid: parseFloat(values.amountPaid),
          payable: parseFloat(values.payable),
          change: parseFloat(values.change || '0'),
        },
      };

      await createQuickBooking(payload);
      messageApi.success('Booking successful!');
      setIsPaymentModalVisible(false);
      setSelectedPassengers([]);
    } catch (error: any) {
      messageApi.error(
        error.response?.data?.message || 'Failed to process booking'
      );
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {contextHolder}
      <Card className={styles.bookingCard}>
        <Title level={4}>Quick Booking</Title>

        <Form
          form={form}
          initialValues={{ dateRange: [dayjs(), dayjs()] }}
          onValuesChange={(_, __) => debounceSearch()}
        >
          <Form.Item name='dateRange' label='Date Range'>
            <DatePicker
              format={DATE_FORMAT_LIST}
              placeholder={DATE_PLACEHOLDER}
              className={styles['date-picker']}
              disabledDate={(current) =>
                current && current < dayjs().startOf('day')
              }
            />
          </Form.Item>
          <div className={styles['port-input']}>
            <PortsFilter debounceSearch={debounceSearch} />
          </div>
        </Form>

        <div className={styles.tripSelector}>
          <Text strong>Available Trips:</Text>
          <Select
            style={{ width: '100%' }}
            value={trip?.id}
            onChange={handleTripSelect}
            loading={loading}
            placeholder='Select a trip'
            optionFilterProp='children'
            showSearch
          >
            {availableTrips.map((t) => (
              <Option key={t.id} value={t.id}>
                {t.srcPort?.name} → {t.destPort?.name} (
                {dayjs(t.departureDateIso).format('MM/DD/YYYY h:mm A')})
              </Option>
            ))}
          </Select>
        </div>

        {trip && (
          <div className={styles.tripInfo}>
            <Text>
              {trip.srcPort?.name} → {trip.destPort?.name}
            </Text>
            <Text>
              {dayjs(trip.departureDateIso).format('MM/DD/YYYY h:mm A')}
            </Text>
          </div>
        )}

        <div className={styles.bookingForm}>
          {passengerTypes.map((passengerType) => (
            <Row key={passengerType.type} className={styles.passengerRow}>
              <Col span={6}>
                <Text>{passengerType.label}</Text>
              </Col>
              <Col span={12}>
                <div className={styles.denominationButtons}>
                  {[1, 2, 5, 10].map((count) => (
                    <Button
                      key={count}
                      onClick={() =>
                        handleDenominationClick(passengerType.type, count)
                      }
                      className={
                        selectedPassengers.some(
                          (p) =>
                            p.type === passengerType.type && p.count === count
                        )
                          ? styles.selectedButton
                          : ''
                      }
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </Col>
              <Col span={6} className={styles.rateDisplay}>
                <Text>
                  Rate: ₱
                  {(
                    rates.find((r) => r.type === passengerType.type)?.rate || 0
                  ).toFixed(2)}
                </Text>
              </Col>
            </Row>
          ))}

          <div className={styles.totalSection}>
            <Row>
              <Col span={12}>
                <Text strong>Total Passengers:</Text>
              </Col>
              <Col span={12} className={styles.totalValue}>
                {selectedPassengers.reduce((sum, p) => sum + p.count, 0)}
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Text strong>Total Amount:</Text>
              </Col>
              <Col span={12} className={styles.totalValue}>
                ₱{calculateTotalAmount().toFixed(2)}
              </Col>
            </Row>
          </div>

          <Button
            type='primary'
            block
            size='large'
            onClick={handleBookItClick}
            className={styles.bookButton}
            disabled={selectedPassengers.length === 0}
          >
            Book It!
          </Button>
        </div>
      </Card>

      <PaymentModal
        visible={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        onSubmit={handlePaymentSubmit}
        totalAmount={calculateTotalAmount()}
      />
    </div>
  );
}
