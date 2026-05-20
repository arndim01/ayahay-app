import { updateTripCabinCapacity } from '@/services/trip.service';
import { EditOutlined } from '@ant-design/icons';
import { ITripCabin } from '@ayahay/models';
import { Button, Popover, Space, notification } from 'antd';
import { useEffect, useState } from 'react';

interface EditCapacityProps {
  tripId: number;
  cabins: ITripCabin[];
  vehicleCapacity: number;
}

export default function EditCapacity({
  tripId,
  cabins,
  vehicleCapacity,
}: EditCapacityProps) {
  const [cabinCount, setCabinCount] = useState({} as CabinCount);
  const [vehicleCount, setVehicleCount] = useState(vehicleCapacity);
  const [open, setOpen] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    const _cabinCount: CabinCount = {};
    cabins.forEach((cabin) => {
      _cabinCount[cabin.cabinId] = {
        label: cabin.cabin.cabinType!.name,
        passengercapacity: Number(cabin.passengerCapacity),
        availablePassengerCapacity: Number(cabin.passengerCapacity),
      };
    });
    setCabinCount(_cabinCount);
  }, []);

  const onDecrement = (key?: string) => {
    if (key) {
      setCabinCount({
        [key]: {
          ...cabinCount[key],
          availablePassengerCapacity:
            cabinCount[key].availablePassengerCapacity - 1,
        },
      });
    } else {
      setVehicleCount(vehicleCount - 1);
    }
  };

  const onIncrement = (key?: string) => {
    if (key) {
      setCabinCount({
        [key]: {
          ...cabinCount[key],
          availablePassengerCapacity:
            Number(cabinCount[key].availablePassengerCapacity) + 1,
        },
      });
    } else {
      setVehicleCount(vehicleCount + 1);
    }
  };

  const changeCapacityLimit = (
    newCabinsCapacity: any,
    newVehicleCapacity: number
  ) => {
    const request = {
      vehicleCapacity: newVehicleCapacity,
      cabinCapacities: Object.keys(newCabinsCapacity).map((cabinId) => {
        return {
          cabinId: Number(cabinId),
          passengerCapacity:
            newCabinsCapacity[cabinId].availablePassengerCapacity,
        };
      }),
    };
    try {
      updateTripCabinCapacity(tripId, request);
      setOpen(false);
      api.success({
        message: 'Update Capacity Success',
        description: 'The selected capacity has been updated successfully.',
      });
    } catch (e) {
      api.error({
        message: 'Update Capacity Failed',
        description: 'The selected capacity failed to update',
      });
    }
  };

  const capacityPopoverContent = (
    <div>
      {Object.keys(cabinCount).map((cabinId) => {
        return (
          <CountPopover
            label={cabinCount[cabinId].label}
            minCapacity={cabinCount[cabinId].passengercapacity}
            count={cabinCount[cabinId].availablePassengerCapacity}
            onDecrement={onDecrement}
            onIncrement={onIncrement}
            cabinId={cabinId}
          />
        );
      })}
      <CountPopover
        label='Vehicle'
        minCapacity={vehicleCapacity}
        count={vehicleCount}
        onDecrement={onDecrement}
        onIncrement={onIncrement}
      />
      <Button
        type='primary'
        htmlType='submit'
        onClick={() => changeCapacityLimit(cabinCount, vehicleCount)}
        block
      >
        Save Changes
      </Button>
    </div>
  );

  return (
    <>
      {contextHolder}
      <Popover
        placement='bottomLeft'
        title='Capacities'
        content={capacityPopoverContent}
        trigger='click'
        open={open}
        onOpenChange={() => setOpen(!open)}
      >
        <Button type='text'>
          <EditOutlined />
        </Button>
      </Popover>
    </>
  );
}

interface CountPopoverProps {
  label: string;
  minCapacity: number;
  count: number;
  onDecrement: (key?: string) => void;
  onIncrement: (key?: string) => void;
  cabinId?: string;
}

function CountPopover({
  label,
  minCapacity,
  count,
  onDecrement,
  onIncrement,
  cabinId,
}: CountPopoverProps) {
  return (
    <div>
      <Space>
        <span>{label}</span>
        <Button
          shape='circle'
          disabled={minCapacity === count}
          onClick={() => onDecrement(cabinId)}
        >
          -
        </Button>
        <span>{count}</span>
        <Button shape='circle' onClick={() => onIncrement(cabinId)}>
          +
        </Button>
      </Space>
    </div>
  );
}

interface CabinCount {
  [key: string]: {
    label: string;
    passengercapacity: number;
    availablePassengerCapacity: number;
  };
}
