'use client';
import { useState } from 'react';
import SharedTable from './SharedTable';
import { Table } from 'antd';
import { getColumns } from './TableColumns';
import type { TabComponentProps, VehicleBookingData } from './types';
import BarGraph from '../BarGraph';
import CountTables from './CountTables';

export default function OnBoardedTab({ tripId }: TabComponentProps) {
  const [bookingData, setBookingData] = useState<VehicleBookingData[]>([]);

  return (
    <>
      <SharedTable 
        tripId={tripId}
        filterStatus="On-boarded"
        onDataLoaded={setBookingData}
      />
      <CountTables 
        showOnBoard 
        data={bookingData}
      />
      <BarGraph data={bookingData} />
    </>
  );
}
