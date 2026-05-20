import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Button,
  Typography,
  Row,
  Col,
  Input,
  message,
  Steps,
  InputNumber,
  Spin,
} from 'antd';
import type { ButtonProps } from 'antd';
import type { SpinProps } from 'antd';
import type { ModalProps } from 'antd';
import type { TypographyProps } from 'antd';
import type { RowProps } from 'antd';
import type { ColProps } from 'antd';
import type { InputNumberProps } from 'antd';
import type { FormInstance } from 'antd';
import { Alert } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { ITrip } from '@ayahay/models/trip.model';
import {  
  createQuickBooking,
  getTripRates,
} from '@/services/quick-booking.service';
import styles from './QuickBookingModal.module.scss';
import dayjs from 'dayjs';
import { IRateTableRow } from '@ayahay/models';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const { Text } = Typography;
const { Item: FormItem } = Form;

interface PassengerType {
  type: string;
  count: number;
  rate: number;
}

interface QuickBookingModalProps {
  trip: ITrip;
  isOpen: boolean;
  onClose: () => void;
}

interface QuickBookingFormValues {
  passengers: Array<{ type: string; count: number }>;
  totalPrice: number;
}

// Updated passenger types to match exactly with the database discount_type values
const passengerTypes = [
  {
    type: 'ADULT',
    label: 'Adult',
    denominations: [1, 2, 5, 10],
    discountDbValue: null,
  },
  {
    type: 'INFANT',
    label: 'Infant',
    denominations: [1, 2, 5],
    discountDbValue: 'Infant',
  },
  {
    type: 'Child',
    label: 'Child',
    denominations: [1, 2, 5, 10],
    discountDbValue: 'Child',
  },
  {
    type: 'PWD',
    label: 'PWD',
    denominations: [1, 2, 5],
    discountDbValue: 'PWD',
  },
  {
    type: 'Senior',
    label: 'Senior',
    denominations: [1, 2, 5],
    discountDbValue: 'Senior',
  },
  {
    type: 'Student',
    label: 'Student',
    denominations: [1, 2, 5, 10],
    discountDbValue: 'Student',
  },
];

const QuickBookingModal = ({
  trip,
  isOpen,
  onClose,
}: QuickBookingModalProps) => {
  const [form] = Form.useForm<QuickBookingFormValues>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loggedInAccount } = useAuth();
  const [selectedPassengers, setSelectedPassengers] = useState<PassengerType[]>(
    []
  );
  const [rates, setRates] = useState<IRateTableRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && trip) {
      loadRates();
    }
  }, [isOpen, trip]);

  const loadRates = async () => {
    try {
      setLoading(true);
      const ratesData = await getTripRates(trip.id);
      console.log('Loaded rates data from API:', ratesData);

      // Make sure rates are properly processed
      setRates(ratesData);

      // Check if any rates are returned at all
      if (!ratesData || ratesData.length === 0) {
        console.error('No rates found for this trip. Trip ID:', trip.id);
        message.warning(
          'No rates found for this trip. Please contact support.'
        );
      }

      // Check if we have rates for each passenger type
      passengerTypes.forEach((pt) => {
        const discountType = pt.discountDbValue;
        const hasRate = ratesData.some(
          (r: IRateTableRow) =>
            (discountType === null && r.discountType === null) ||
            r.discountType === discountType
        );

        console.log(
          `${pt.label} (${pt.type}) with discount_type "${
            discountType === null ? 'null' : discountType
          }" has rate: ${hasRate ? 'YES' : 'NO'}`
        );
      });
    } catch (error) {
      console.error('Failed to load rates:', error);
      message.error('Failed to load rates');
    } finally {
      setLoading(false);
    }
  };

  // Calculate available passenger capacity
  const availableCapacity = trip?.availableCabins
    ? trip.availableCabins.reduce(
        (sum, cabin) => sum + (cabin.availablePassengerCapacity || 0),
        0
      )
    : 0;

  // Calculate total selected passengers
  const totalSelectedPassengers = selectedPassengers.reduce(
    (sum, p) => sum + p.count,
    0
  );

  const handleFinish = async (values: QuickBookingFormValues) => {
    if (!loggedInAccount?.id) {
      message.error('You must be logged in to create a booking');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Starting quick booking process...');
      console.log('Selected passengers:', selectedPassengers);

      const payload = {
        tripId: trip.id,
        passengers: selectedPassengers.map((p) => ({
          type: p.type,
          count: p.count,
        })),
        totalPrice: calculateTotalAmount(),
        createdByAccountId: loggedInAccount.id,
      };

      console.log('Submitting payload:', payload);
      const booking = await createQuickBooking(payload);
      console.log('Booking created successfully:', booking);

      message.success('Booking created successfully!');

      // Show success modal with booking details
      Modal.success({
        title: 'Booking Created Successfully',
        content: (
          <div className={styles.successModalContent}>
            <div className={styles.bookingReference}>
              <span className={styles.label}>Reference Number:</span>
              <span className={styles.value}>{booking.referenceNo}</span>
            </div>

            <div className={styles.summaryTable}>
              <table>
                <thead>
                  <tr>
                    <th>Passenger Type</th>
                    <th>Count</th>
                    <th>Rate</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPassengers.map((passenger) => {
                    const passengerType = passengerTypes.find(
                      (pt) => pt.type === passenger.type
                    );
                    return (
                      <tr key={passenger.type}>
                        <td>{passengerType?.label}</td>
                        <td>{passenger.count}</td>
                        <td>₱{passenger.rate.toFixed(2)}</td>
                        <td>
                          ₱{(passenger.count * passenger.rate).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}>
                      <span className={styles.strong}>Total Amount</span>
                    </td>
                    <td>
                      <span className={styles.strong}>
                        ₱{calculateTotalAmount().toFixed(2)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className={styles.tripDetails}>
              <div className={styles.sectionTitle}>Trip Details:</div>
              <div className={styles.detail}>
                Route: {trip.srcPort?.name} → {trip.destPort?.name}
              </div>
              <div className={styles.detail}>
                Departure:{' '}
                {dayjs(trip.departureDateIso).format('MM/DD/YYYY h:mm A')}
              </div>
            </div>

            <div className={styles.actionButtons}>
              <Button
                type='primary'
                onClick={() => {
                  window.open(`/bookings/${booking.id}`, '_blank');
                  Modal.destroyAll();
                  onClose();
                  form.resetFields();
                  setSelectedPassengers([]);
                }}
              >
                View Booking Details
              </Button>
              <Button
                type='primary'
                onClick={() => {
                  window.open(`/bookings/${booking.id}?print=true`, '_blank');
                }}
              >
                Print Receipt
              </Button>
              <Button
                onClick={() => {
                  Modal.destroyAll(); // Close success modal
                  setSelectedPassengers([]); // Reset passenger selections
                  form.resetFields(); // Reset form fields
                  // Don't close the quick booking modal or reload page
                }}
              >
                Book Again
              </Button>
              <Button
                onClick={() => {
                  Modal.destroyAll();
                  onClose();
                  form.resetFields();
                  setSelectedPassengers([]);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ),
        width: 700,
        centered: true,
        maskClosable: false,
        footer: null,
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      message.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRateForPassengerType = (type: string): number => {
    const passengerType = passengerTypes.find((pt) => pt.type === type);
    if (!passengerType) {
      console.warn(`Passenger type ${type} not found in passengerTypes`);
      return 0;
    }

    const discountDbValue = passengerType.discountDbValue;

    // Find the rate based on discount type
    const rateRow = rates.find(
      (r) => r.cabinId && r.discountType === discountDbValue
    );

    if (rateRow) {
      return rateRow.fare;
    }

    // If no specific rate found, use base adult rate with standard discount percentages
    const adultRate = rates.find((r) => r.cabinId && r.discountType === null)?.fare || 0;
    if (adultRate === 0) {
      console.warn('No adult base rate found');
      return 0;
    }

    // Apply discount based on passenger type
    switch (type) {
      case 'INFANT':
        return 0; // Free
      case 'Child':
        return adultRate * 0.5; // 50% discount
      case 'Student':
        return adultRate * 0.8; // 20% discount
      case 'Senior':
        case 'PWD': {
          // Remove 12% VAT
          const priceWithoutVat = adultRate / 1.12;
          // Apply 20% discount
          const discountedPrice = priceWithoutVat * 0.8;
          return Math.floor(discountedPrice * 100) / 100; // No VAT added back
        }
      case 'ADULT':
        return adultRate;
      default:
        console.warn(`No rate calculation defined for type: ${type}`);
        return adultRate;
    }
  };

  const handleDenominationClick = (type: string, count: number) => {
    setSelectedPassengers((prev) => {
      const existing = prev.find((p) => p.type === type);
      const rate = getRateForPassengerType(type);

      if (existing) {
        return prev.map((p) =>
          p.type === type ? { ...p, count: p.count + count, rate } : p
        );
      }
      return [...prev, { type, count, rate }];
    });
  };

  const handleDirectCountChange = (type: string, count: number) => {
    setSelectedPassengers((prev) => {
      const existing = prev.find((p) => p.type === type);
      const rate = getRateForPassengerType(type);

      if (existing) {
        if (count <= 0) {
          return prev.filter((p) => p.type !== type);
        }
        return prev.map((p) => (p.type === type ? { ...p, count, rate } : p));
      }
      if (count > 0) {
        return [...prev, { type, count, rate }];
      }
      return prev;
    });
  };

  const handleIncrement = (type: string) => {
    setSelectedPassengers((prev) => {
      const existing = prev.find((p) => p.type === type);
      const rate = getRateForPassengerType(type);

      if (existing) {
        return prev.map((p) =>
          p.type === type ? { ...p, count: p.count + 1, rate } : p
        );
      }
      return [...prev, { type, count: 1, rate }];
    });
  };

  const handleDecrement = (type: string) => {
    setSelectedPassengers((prev) => {
      const existing = prev.find((p) => p.type === type);
      if (!existing) return prev;

      if (existing.count === 1) {
        return prev.filter((p) => p.type !== type);
      }
      return prev.map((p) =>
        p.type === type ? { ...p, count: p.count - 1 } : p
      );
    });
  };

  const calculateTotalAmount = () => {
    return selectedPassengers.reduce((sum, p) => sum + p.count * p.rate, 0);
  };

  const renderPassengerSelection = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size='large' />
          <div style={{ marginTop: '16px' }}>Loading rates...</div>
        </div>
      );
    }

    // Filter to only passenger types we can handle (have rates or fallbacks for)
    const availablePassengerTypes = passengerTypes;

    return (
      <div className={styles.bookingForm}>
        <div className={styles.tripInfo}>
          <Text>
            {trip.srcPort?.name} → {trip.destPort?.name}
          </Text>
          <Text>
            {dayjs(trip.departureDateIso).format('MM/DD/YYYY h:mm A')}
          </Text>
        </div>

        {availablePassengerTypes.map((passengerType) => {
          const selected = selectedPassengers.find(
            (p) => p.type === passengerType.type
          );
          const rate = getRateForPassengerType(passengerType.type);
          const isDisabled = loading || rate <= 0;

          // Skip rendering this passenger type if we don't have a valid rate
          if (isDisabled && passengerType.type !== 'INFANT') {
            console.log(
              `Skipping passenger type ${passengerType.type} with rate ${rate}`
            );
            return null;
          }

          return (
            <div key={passengerType.type} className={styles.passengerRow}>
              <Row align='middle' justify='space-between'>
                <Col span={8}>
                  <Text>{passengerType.label}</Text>
                  <div className={styles.rateText}>
                    Rate: ₱{rate.toFixed(2)}
                  </div>
                </Col>
                <Col span={8}>
                  <div className={styles.denominationButtons}>
                    {passengerType.denominations.map((count) => (
                      <Button
                        key={count}
                        onClick={() =>
                          handleDenominationClick(passengerType.type, count)
                        }
                        disabled={isDisabled}
                      >
                        +{count}
                      </Button>
                    ))}
                  </div>
                </Col>
                <Col span={8}>
                  <div className={styles.countInput}>
                    <Button
                      icon={<MinusOutlined />}
                      onClick={() => handleDecrement(passengerType.type)}
                      disabled={isDisabled || !selected || selected.count <= 0}
                    />
                    <InputNumber
                      className={styles.countInputField}
                      min={0}
                      value={selected?.count || 0}
                      onChange={(value) =>
                        handleDirectCountChange(
                          passengerType.type,
                          value as number
                        )
                      }
                      disabled={isDisabled}
                    />
                    <Button
                      icon={<PlusOutlined />}
                      onClick={() => handleIncrement(passengerType.type)}
                      disabled={isDisabled}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          );
        })}

        <div className={styles.summarySection}>
          <Text className={styles.summaryTitle}>Summary</Text>
          {selectedPassengers.map((passenger) => (
            <div key={passenger.type} className={styles.summaryRow}>
              <Text>
                {passengerTypes.find((pt) => pt.type === passenger.type)?.label}{' '}
                x {passenger.count}
              </Text>
              <Text>₱{(passenger.count * passenger.rate).toFixed(2)}</Text>
            </div>
          ))}
          <div className={styles.totalRow}>
            <Text strong>Total</Text>
            <Text strong>₱{calculateTotalAmount().toFixed(2)}</Text>
          </div>
        </div>
      </div>
    );
  };

  // Cast the entire component to React.ReactElement
  return (
    <Modal
      title='Quick Booking'
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Spin spinning={isSubmitting}>
        <Form
          form={form}
          onFinish={handleFinish}
          layout='vertical'
          initialValues={{
            passengers: [],
            totalPrice: 0,
          }}
        >
          {renderPassengerSelection()}

          {/* Show warning if over capacity */}
          {totalSelectedPassengers > availableCapacity && (
            <Alert
              type="error"
              message={`Not enough available passenger capacity. Requested: ${totalSelectedPassengers}, Available: ${availableCapacity}`}
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <FormItem>
            <Button
              type='primary'
              htmlType='submit'
              disabled={
                isSubmitting ||
                selectedPassengers.length === 0 ||
                totalSelectedPassengers > availableCapacity
              }
              loading={isSubmitting}
              block
            >
              {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
            </Button>
          </FormItem>
        </Form>
      </Spin>
    </Modal>
  ) as React.ReactElement;
};

export default QuickBookingModal;
