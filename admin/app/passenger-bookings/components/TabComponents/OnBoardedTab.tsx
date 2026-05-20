'use client';
import { useState, useCallback } from 'react';
import SharedTable from './SharedTable';
import type { TabComponentProps } from './types';
import BarGraph from '../BarGraph';
import CountTables from './CountTables';

export default function OnBoardedTab({ tripId }: TabComponentProps) {
  const [passengerData, setPassengerData] = useState<any[]>([]);

  const handleDataLoaded = useCallback((data: any[]) => {
    // Only store On-Board passengers
    const onBoardedPassengers = data.filter(p => p.status === 'On-Board');
    setPassengerData(onBoardedPassengers);
  }, []);

  return (
    <div className="booking-content">
      <SharedTable 
        tripId={tripId} 
        filterStatus="On-Board"
        onDataLoaded={handleDataLoaded}
      />
      <CountTables 
        showOnBoard 
        data={passengerData}
      />
      <BarGraph data={passengerData} /> {/* Pass filtered data */}
    </div>
  );
}
