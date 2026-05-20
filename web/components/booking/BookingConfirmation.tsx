import { IBooking } from '@ayahay/models/booking.model';
import React from 'react';
import BookingSummary from '@ayahay/components/descriptions/BookingSummary';
import { Button, Form, Input, Radio, Typography } from 'antd';

const { Title } = Typography;

interface BookingConfirmationProps {
  tentativeBooking?: IBooking;
  hasPrivilegedAccess: boolean;
  onRequestBooking?: (tentativeBookingId: number) => void;
  onStartPayment?: (tentativeBookingId: number) => void;
  onPreviousStep?: () => void;
}

export default function BookingConfirmation({
  tentativeBooking,
  hasPrivilegedAccess,
  onPreviousStep,
  onRequestBooking,
  onStartPayment,
}: BookingConfirmationProps) {
  const form = Form.useFormInstance();

  const isBookingRequestFlow = false;

  const onClickRequestBooking = async () => {
    const validationResult = await doFinalValidation();
    if (!onRequestBooking || !validationResult) {
      return;
    }

    onRequestBooking(tentativeBooking?.id as any);
  };

  const onClickPay = async () => {
    const validationResult = await doFinalValidation();
    if (!onStartPayment || !validationResult) {
      return;
    }
    onStartPayment(tentativeBooking?.id as any);
  };

  const doFinalValidation = async () => {
    if (tentativeBooking === undefined) {
      return false;
    }

    try {
      await form.validateFields([
        ['contactEmail'],
        ['contactMobile'],
        ['consigneeName'],
      ]);
    } catch {
      return false;
    }

    return true;
  };

  const payButtonAction = hasPrivilegedAccess ? 'Receive' : 'Pay';

  return (
    <div>
      <Title level={2}>Confirm Booking</Title>
      <div style={{ margin: '32px 0' }}>
        {tentativeBooking && (
          <BookingSummary booking={tentativeBooking} titleLevel={3} />
        )}
        {!tentativeBooking && (
          <p>
            Something went wrong. Please book again or contact a system
            administrator if the issue persists.
          </p>
        )}
      </div>
      {!hasPrivilegedAccess && !isBookingRequestFlow && (
        <div>
          <Form.Item name='paymentGateway' label='Payment Method' colon={false}>
            <Radio.Group>
              <Radio value='PayMongo'>
                PayMongo (Visa, Mastercard, GCash, Maya, BPI, UBP)
              </Radio>
              <Radio value='Dragonpay'>
                Dragonpay (Bayad Center, M Lhuilier, OTC)
              </Radio>
            </Radio.Group>
          </Form.Item>
        </div>
      )}
      <div>
        {isBookingRequestFlow && (
          <Button type='primary' onClick={onClickRequestBooking}>
            Request Booking
          </Button>
        )}

        {!isBookingRequestFlow && (
          <Button type='primary' onClick={onClickPay}>
            {payButtonAction} ₱{tentativeBooking?.totalPrice}
          </Button>
        )}
        <Button onClick={() => onPreviousStep && onPreviousStep()}>
          Book Again
        </Button>
      </div>
    </div>
  );
}
