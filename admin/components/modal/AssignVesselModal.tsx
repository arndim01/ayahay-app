import { getRateTablesByShippingLineIdAndName } from '@/services/rate-table.service';
import { updateTripVessel } from '@/services/trip.service';
import { IRateTable, IShip } from '@ayahay/models';
import { getShips } from '@ayahay/services/ship.service';
import { Button, Flex, Form, Modal, ModalProps, Select } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { NotificationInstance } from 'antd/es/notification/interface';
import { useEffect, useState } from 'react';

interface AssignVesselModalProps {
  tripId: number;
  shipId: number;
  srcPortName: string;
  destPortName: string;
  setAssignVesselModalOpen: any;
  resetData: () => void;
  api: NotificationInstance;
}

export default function AssignVesselModal({
  tripId,
  shipId,
  srcPortName,
  destPortName,
  resetData,
  setAssignVesselModalOpen,
  api,
  ...modalProps
}: AssignVesselModalProps & ModalProps) {
  const [form] = useForm();
  const [ships, setShips] = useState<IShip[] | undefined>();
  const [rateTables, setRateTables] = useState<IRateTable[] | undefined>();
  const [selectedShip, setSelectedShip] = useState<{
    label: string;
    value: number;
  }>();
  const [selectedRate, setSelectedRate] = useState<{
    label: string;
    value: number;
  }>();

  useEffect(() => {
    fetchShips();
  }, []);

  const fetchShips = async () => {
    setShips(await getShips());
  };

  useEffect(() => {
    fetchRateTables();
  }, [selectedShip]);

  const fetchRateTables = async () => {
    setRateTables(
      await getRateTablesByShippingLineIdAndName(
        srcPortName,
        destPortName,
        selectedShip?.label
      )
    );
  };

  const onFinish = async () => {
    try {
      await updateTripVessel(tripId, selectedShip!.value, selectedRate!.value);
      api.success({
        message: 'New Vessel Assigned',
        description:
          'The vessel of the selected trip has been successfully changed.',
      });
      setAssignVesselModalOpen(false);
      form.resetFields();
      resetData();
    } catch {
      api.error({
        message: 'Assign Vessel Failed',
        description: 'Something went wrong.',
      });
    }
  };

  return (
    <Modal
      title='Assign Vessel'
      closeIcon={false}
      footer={null}
      destroyOnClose={true}
      {...modalProps}
    >
      <Form form={form} onFinish={onFinish} preserve={false}>
        <Form.Item
          name='vessel'
          label='Choose Vessel'
          rules={[{ required: true, message: 'Please choose a vessel' }]}
        >
          <Select
            options={ships?.map((ship) => ({
              label: ship.name,
              value: ship.id,
              disabled: ship.id === shipId ? true : false,
            }))}
            onChange={(_, option: any) => {
              setSelectedShip(option);
              form.resetFields(['rate']);
              setSelectedRate(undefined);
            }}
          ></Select>
        </Form.Item>

        <Form.Item
          name='rate'
          label='Choose Rate'
          rules={[{ required: true, message: 'Please choose a rate' }]}
        >
          <Select
            options={rateTables?.map((rateTable) => ({
              label: rateTable.name,
              value: rateTable.id,
            }))}
            onChange={(_, option: any) => setSelectedRate(option)}
          ></Select>
        </Form.Item>

        <Form.Item>
          <Flex justify='space-evenly'>
            <Button onClick={() => setAssignVesselModalOpen(false)}>
              Back
            </Button>
            <Button type='primary' htmlType='submit' disabled={!selectedRate}>
              Submit
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </Modal>
  );
}
