'use client';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import styles from './styles.module.scss';

interface CountData {
  key: string;
  discountType: string;
  accommodation: string;
  total: number;
}

const columns: ColumnsType<CountData> = [
  {
    title: 'Discount Type',
    dataIndex: 'discountType',
    key: 'discountType',
    sorter: (a, b) => a.discountType.localeCompare(b.discountType)
  },
  {
    title: 'Accommodation',
    dataIndex: 'accommodation',
    key: 'accommodation',
    sorter: (a, b) => a.accommodation.localeCompare(b.accommodation)
  },
  {
    title: 'Total Count',
    dataIndex: 'total',
    key: 'total',
    sorter: (a, b) => a.total - b.total
  },
];

interface CountTablesProps {
  showOnBoard?: boolean;
  showNotBoarded?: boolean;
  data: Array<any>; // Replace 'any' with your passenger data type
}

export default function CountTables({ 
  showOnBoard = false, 
  showNotBoarded = false,
  data
}: CountTablesProps) {
  const [onBoardData, setOnBoardData] = useState<CountData[]>([]);
  const [notBoardedData, setNotBoardedData] = useState<CountData[]>([]);

  useEffect(() => {
    if (!data) return;

    // Group and count the data
    const groupedData = data.reduce((acc, passenger) => {
      const isOnBoard = passenger.status === 'On-Board';
      const key = `${passenger.discountType}-${passenger.accommodation}`;
      
      if (!acc[isOnBoard ? 'onBoard' : 'notBoarded'][key]) {
        acc[isOnBoard ? 'onBoard' : 'notBoarded'][key] = {
          discountType: passenger.discountType || 'None',
          accommodation: passenger.accommodation,
          total: 0
        };
      }
      
      acc[isOnBoard ? 'onBoard' : 'notBoarded'][key].total += 1;
      return acc;
    }, { onBoard: {}, notBoarded: {} });

    // Convert grouped data to array format
    const formatData = (groupedObj: any) => 
      Object.entries(groupedObj).map(([key, value]: [string, any]) => ({
        key,
        ...value
      }));

    setOnBoardData(formatData(groupedData.onBoard));
    setNotBoardedData(formatData(groupedData.notBoarded));
  }, [data]);

  return (
    <div className={styles.countTables}>
      {showOnBoard && onBoardData.length > 0 && (
        <div className={styles.tableWrapper}>
          <h3>Passenger On-Board Summary</h3>
          <Table 
            columns={columns} 
            dataSource={onBoardData} 
            pagination={false}
            size="small"
          />
        </div>
      )}
      
      {showNotBoarded && notBoardedData.length > 0 && (
        <div className={styles.tableWrapper}>
          <h3>Passenger Not Boarded Summary</h3>
          <Table 
            columns={columns} 
            dataSource={notBoardedData} 
            pagination={false}
            size="small"
          />
        </div>
      )}
    </div>
  );
}
