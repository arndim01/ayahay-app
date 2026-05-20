import { Table, Card, App, Empty } from 'antd';
import { getColumns } from './TableColumns';
import styles from './SharedTable.module.scss';
import { useEffect, useState, useCallback } from 'react';
import type { VehicleBookingData } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SharedTableProps {
  tripId: string;
  filterStatus?: 'On-boarded' | 'Not-boarded';
  onDataLoaded?: (data: VehicleBookingData[]) => void;
}

const SharedTable = ({ tripId, filterStatus, onDataLoaded }: SharedTableProps) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VehicleBookingData[]>([]);

  const fetchVehicles = useCallback(async () => {
    if (!tripId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/booking-trip-vehicles/trip/${tripId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch vehicle bookings');
      }

      const vehicles = await response.json();
      const filteredData = filterStatus 
        ? vehicles.filter((v: VehicleBookingData) => v.status === filterStatus)
        : vehicles;

      setData(filteredData);
      onDataLoaded?.(vehicles);
    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to load vehicle bookings');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [tripId, filterStatus]); // Remove message and onDataLoaded from dependencies

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return (
    <Card className={styles.tableCard}>
      <Table 
        columns={getColumns()}
        dataSource={data}
        loading={loading}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No further vehicle records to show"
            />
          )
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          position: ['bottomCenter']
        }}
      />
    </Card>
  );
};

export default SharedTable;
