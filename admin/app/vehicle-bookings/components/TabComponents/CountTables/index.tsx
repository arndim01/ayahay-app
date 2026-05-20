'use client';
import { Table, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { VehicleBookingData } from '../types';
import styles from './styles.module.scss';

interface CountData {
  key: string;
  vehicleType: string;
  total: number;
}

const columns: ColumnsType<CountData> = [
  {
    title: 'Vehicle Type',
    dataIndex: 'vehicleType',
    key: 'vehicleType',
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
  },
];

interface CountTablesProps {
  showOnBoard?: boolean;
  showNotBoarded?: boolean;
  data: VehicleBookingData[];
}

export default function CountTables({ 
  showOnBoard = false, 
  showNotBoarded = false,
  data = [] // Add default empty array
}: CountTablesProps) {
  const getVehicleCounts = (status: 'On-boarded' | 'Not-boarded'): CountData[] => {
    if (!Array.isArray(data)) return []; // Add safety check

    const counts = data
      .filter(vehicle => vehicle?.status === status) // Add optional chaining
      .reduce((acc, vehicle) => {
        if (vehicle?.vehicle_type) { // Add null check
          acc[vehicle.vehicle_type] = (acc[vehicle.vehicle_type] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(counts).map(([type, count], index) => ({
      key: index.toString(),
      vehicleType: type || 'Unknown',
      total: count
    }));
  };

  return (
    <div className={styles.countTables}>
      {showOnBoard && (
        <div className={styles.tableWrapper}>
          <h3>Vehicles On-Board</h3>
          <Table 
            columns={columns} 
            dataSource={getVehicleCounts('On-boarded')} 
            pagination={false}
            size="small"
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No further vehicle records to show"
                />
              )
            }}
          />
        </div>
      )}
      
      {showNotBoarded && (
        <div className={styles.tableWrapper}>
          <h3>Vehicles Not Boarded</h3>
          <Table 
            columns={columns} 
            dataSource={getVehicleCounts('Not-boarded')} 
            pagination={false}
            size="small"
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No further vehicle records to show"
                />
              )
            }}
          />
        </div>
      )}
    </div>
  );
}
