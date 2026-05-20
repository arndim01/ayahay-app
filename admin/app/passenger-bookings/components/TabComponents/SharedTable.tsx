import { Table, Card } from 'antd';
import { getColumns } from './TableColumns';
import styles from './SharedTable.module.scss';
import { useEffect, useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SharedTableProps {
  tripId: string;
  filterStatus?: 'On-Board' | 'Not-Boarded';
  onDataLoaded?: (data: any[]) => void;  // Add this prop
}

export default function SharedTable({ tripId, filterStatus, onDataLoaded }: SharedTableProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchPassengers = useCallback(async () => {
    if (!tripId) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/booking-trip-passengers/trip/${tripId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const passengers = await response.json();
      
      const filteredData = filterStatus 
        ? passengers.filter((p: any) => p.status === filterStatus)
        : passengers;

      setData(filteredData);
      onDataLoaded?.(passengers);
    } catch (error) {
      console.error('Error:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [tripId, filterStatus]);

  useEffect(() => {
    fetchPassengers();
  }, [fetchPassengers]);

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  };

  return (
    <Card className={styles.tableCard}>
      <Table 
        columns={getColumns()} 
        dataSource={getCurrentPageData()}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data.length,
          onChange: (page) => setCurrentPage(page),
          showTotal: (total, range) => 
            `Showing ${range[0]}-${range[1]} of ${total} records`,
          style: { marginTop: 16 }
        }}
        loading={loading}
        className={styles.bookingTable}
        scroll={{ x: 'max-content', y: '400px' }}
      />
    </Card>
  );
}
