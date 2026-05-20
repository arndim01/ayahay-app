import { IPassenger } from '@ayahay/models/passenger.model';
import { Checkbox, Modal, ModalProps, Typography } from 'antd';
import { useState } from 'react';
import { CheckboxValueType } from 'antd/es/checkbox/Group';

const { Title } = Typography;

interface AddCompanionsModalProps {
  companions: IPassenger[];
  onSubmitCompanions: (companions: IPassenger[]) => void;
}

export default function AddCompanionsModal({
  companions,
  onSubmitCompanions,
  onOk,
  ...modalProps
}: AddCompanionsModalProps & ModalProps) {
  const [selectedCompanionIndices, setSelectedCompanionIndices] = useState<
    CheckboxValueType[]
  >([]);

  const options = companions.map((companion, index) => ({
    value: index,
    label: `${companion.firstName} ${companion.lastName}`,
  }));

  const onOkModal = () => {
    onSubmitCompanions(
      selectedCompanionIndices.map((index) => companions?.[index])
    );
  };

  return (
    <Modal onOk={onOkModal} {...modalProps}>
      <Title level={2}>Add Travel Buddies</Title>
      <Checkbox.Group
        options={options}
        onChange={(checkedValues) => setSelectedCompanionIndices(checkedValues)}
      />
    </Modal>
  );
}
