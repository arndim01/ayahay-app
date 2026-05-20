import { buildVehicleFromForm } from '@ayahay/services/booking.service';
import { IBookingTripVehicle, IVehicle } from '@ayahay/models';
import { Form, Input, Modal, ModalProps, Typography } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect } from 'react';

const { Title } = Typography;

interface UpdateTripVehicleModalProps {
  originalTripVehicle?: IBookingTripVehicle;
  onUpdateVehicle: (vehicle: IVehicle) => Promise<void>;
}

export default function UpdateTripVehicleModal({
  originalTripVehicle,
  onUpdateVehicle,
  onOk,
  ...modalProps
}: UpdateTripVehicleModalProps & ModalProps) {
  const [form] = useForm();
  useEffect(() => {
    if (!originalTripVehicle?.vehicle) {
      return;
    }

    form.setFieldsValue({ ...originalTripVehicle.vehicle });
  }, [originalTripVehicle]);

  const onOkModal = async () => {
    try {
      await form.validateFields();
      const updatedVehicle = buildVehicleFromForm(form);
      await onUpdateVehicle(updatedVehicle);
    } catch {}
  };

  return (
    <Modal onOk={onOkModal} okText='Confirm' closeIcon={true} {...modalProps}>
      <Title level={2} style={{ fontSize: '20px', marginBottom: '20px' }}>
        Update Trip Vehicle Information
      </Title>
      <Form form={form}>
        <Form.Item
          name='plateNo'
          label='Plate Number'
          colon={false}
          rules={[{ required: true, message: 'Missing plate number' }]}
        >
          <Input placeholder='Plate Number' />
        </Form.Item>
        <Form.Item
          name='modelName'
          label='Model Name'
          colon={false}
          rules={[{ required: true, message: 'Missing model name' }]}
        >
          <Input placeholder='Toyota Innova, Lexus GX' />
        </Form.Item>
      </Form>
    </Modal>
  );
}
