'use client';
import { useState, useEffect } from 'react';
import SharedTable from './SharedTable';
import type { TabComponentProps, VehicleBookingData } from './types';
import BarGraph from '../BarGraph';
import CountTables from './CountTables';

interface AllBookingsTabProps extends TabComponentProps {
  onDataLoaded?: (data: VehicleBookingData[]) => void;
}

export default function AllBookingsTab({ tripId, onDataLoaded }: AllBookingsTabProps) {
  const [bookingData, setBookingData] = useState<VehicleBookingData[]>([]);

  const handleDataLoaded = (data: VehicleBookingData[]) => {
    setBookingData(data);
    onDataLoaded?.(data);
  };

  return (
    <>
      <SharedTable 
        tripId={tripId} 
        onDataLoaded={handleDataLoaded}
      />
      <CountTables 
        showOnBoard 
        showNotBoarded 
        data={bookingData}
      />
      <BarGraph data={bookingData} />
    </>
  );
}
