import { IPassenger } from '@ayahay/models/passenger.model';
import { Checkbox, Modal, ModalProps, Typography } from 'antd';
import { useState } from 'react';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { useAuth } from '@/contexts/AuthContext';

const { Title } = Typography;

interface LinkPassengerToAccountModalProps {
  passengerToLink: IPassenger;
}

export default function LinkPassengerToAccountModal({
  passengerToLink,
  ...modalProps
}: LinkPassengerToAccountModalProps & ModalProps) {
  const { currentUser } = useAuth();

  return (
    <Modal {...modalProps}>
      <Title level={2}>Link Passenger to Account</Title>
      <p>By clicking OK, we will link the following passenger to :</p>
    </Modal>
  );
}
