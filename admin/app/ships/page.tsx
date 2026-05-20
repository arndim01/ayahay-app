'use client';
import { Button, Table, Typography,Switch,message } from 'antd';
import React, { useEffect, useState } from 'react';
import { ColumnsType } from 'antd/es/table';
import { IShip } from '@ayahay/models';
import { getShipsOfMyShippingLine, updateShipCargoRequired } from '@/services/ship.service';
import { useAuthGuard } from '@/hooks/auth';

export default function ShipsPage() {
  useAuthGuard(['ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin']);
  const [ships, setShips] = useState<IShip[]>([]);
  const [loading, setLoading] = useState(false);
  const { Title } = Typography;

  const fetchShips = async () => {
    try {
      const data = await getShipsOfMyShippingLine();
      setShips(data);
    } catch (error) {
      message.error('Failed to fetch ships');
    }
  };

  const handleCargoRequiredToggle = async (shipId: number, checked: boolean) => {
    try {
      setLoading(true);
      await updateShipCargoRequired(shipId, checked);
      message.success('Ship cargo requirement updated successfully');
      await fetchShips(); // Refresh the list
    } catch (error) {
      message.error('Failed to update cargo requirement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShips();
  }, []);


const columns: ColumnsType<IShip> = [
  {
    title: 'Vessel Name',
    key: 'name',
    dataIndex: 'name',
  },
  {
    title: 'Recommended Vehicle Capacity',
    key: 'recommendedVehicleCapacity',
    dataIndex: 'recommendedVehicleCapacity',
  },
  {
    title: 'Actions',
    render: (_, ship: IShip) => (
      <div>
        <Button type='primary' href={`/ships/${ship.id}`} target='_blank'>
          View
        </Button>
      </div>
    ),
  },
  {
    title: 'Cargo Required',
    key: 'cargoRequired',
    width: '15%',
    render: (_, ship: IShip) => (
      <Switch
        checked={ship.cargoRequired}
        onChange={(checked) => handleCargoRequiredToggle(ship.id, checked)}
        loading={loading}
      />
    ),
  },
];

  return (
    <div style={{ margin: '32px' }}>
      <Title level={1}>Vessels</Title>
      <Table columns={columns} dataSource={ships} tableLayout='fixed' />
    </div>
  );
}
