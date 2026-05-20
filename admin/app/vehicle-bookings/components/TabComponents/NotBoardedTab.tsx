'use client';
import { useState } from 'react';
import SharedTable from './SharedTable';
import { Table } from 'antd';
import { getColumns } from './TableColumns';
import type { TabComponentProps, VehicleBookingData } from './types';
import BarGraph from '../BarGraph';
import CountTables from './CountTables';

export default function NotBoardedTab({ tripId }: TabComponentProps) {
  const [bookingData, setBookingData] = useState<VehicleBookingData[]>([]);

  return (
    <>
      <SharedTable 
        tripId={tripId}
        filterStatus="Not-boarded"
        onDataLoaded={setBookingData}
      />
      <CountTables 
        showNotBoarded 
        data={bookingData}
      />
      <BarGraph data={bookingData} />
    </>
  );
}
