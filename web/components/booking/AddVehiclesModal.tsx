import { IPassenger, IVehicle } from '@ayahay/models';
import { Checkbox, Modal, ModalProps, Typography } from 'antd';
import { useState } from 'react';
import { CheckboxValueType } from 'antd/es/checkbox/Group';

const { Title } = Typography;

interface AddVehiclesModalProps {
  vehicles: IVehicle[];
  onSubmitVehicles: (vehicles: IVehicle[]) => void;
}

export default function AddVehiclesModal({
  vehicles,
  onSubmitVehicles,
  onOk,
  ...modalProps
}: AddVehiclesModalProps & ModalProps) {
  const [selectedVehicleIndices, setSelectedVehicleIndices] = useState<
    CheckboxValueType[]
  >([]);

  const options = vehicles?.map((vehicle, index) => ({
    value: index,
    label: `${vehicle.modelName} ${vehicle.plateNo}`,
  }));

  const onOkModal = () => {
    onSubmitVehicles(selectedVehicleIndices.map((index) => vehicles?.[index]));
  };

  return (
    <Modal onOk={onOkModal} {...modalProps}>
      <Title level={2}>Add Registered Vehicles</Title>
      <Checkbox.Group
        options={options}
        onChange={(checkedValues) => setSelectedVehicleIndices(checkedValues)}
      />
    </Modal>
  );
}
