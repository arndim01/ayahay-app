import { buildPassengerFromForm } from '@ayahay/services/booking.service';
import { IBookingTripPassenger, IPassenger } from '@ayahay/models';
import { Form, Modal, ModalProps, Typography } from 'antd';
import { useForm } from 'antd/es/form/Form';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import PassengerFields from '@ayahay/web/components/form/PassengerFields';

const { Title } = Typography;

interface UpdateTripPassengerModalProps {
  originalTripPassenger?: IBookingTripPassenger;
  onUpdatePassenger: (passenger: IPassenger) => Promise<void>;
}

export default function UpdateTripPassengerModal({
  originalTripPassenger,
  onUpdatePassenger,
  onOk,
  ...modalProps
}: UpdateTripPassengerModalProps & ModalProps) {
  const [form] = useForm();
  useEffect(() => {
    if (!originalTripPassenger?.passenger) {
      return;
    }

    form.setFieldsValue({
      ...originalTripPassenger.passenger,
      birthdayIso: dayjs(originalTripPassenger.passenger.birthdayIso),
    });
  }, [originalTripPassenger]);

  const onOkModal = async () => {
    try {
      await form.validateFields();
      const updatedPassenger = buildPassengerFromForm(form);
      await onUpdatePassenger(updatedPassenger);
    } catch {}
  };

  return (
    <Modal onOk={onOkModal} okText='Confirm' closeIcon={true} {...modalProps}>
      <Title level={2} style={{ fontSize: '20px', marginBottom: '20px' }}>
        Update Trip Passenger Information
      </Title>
      <Form form={form}>
        <PassengerFields />
      </Form>
    </Modal>
  );
}
