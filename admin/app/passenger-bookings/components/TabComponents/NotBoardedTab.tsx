'use client';
import { useState, useCallback } from 'react';
import SharedTable from './SharedTable';
import type { TabComponentProps } from './types';
import BarGraph from '../BarGraph';
import CountTables from './CountTables';

export default function NotBoardedTab({ tripId }: TabComponentProps) {
  const [passengerData, setPassengerData] = useState<any[]>([]);

  const handleDataLoaded = useCallback((data: any[]) => {
    // Only store Not-Boarded passengers
    const notBoardedPassengers = data.filter(p => p.status === 'Not-Boarded');
    setPassengerData(notBoardedPassengers);
  }, []);

  return (
    <div className="booking-content">
      <SharedTable 
        tripId={tripId} 
        filterStatus="Not-Boarded"
        onDataLoaded={handleDataLoaded}
      />
      <CountTables 
        showNotBoarded 
        data={passengerData}
      />
      <BarGraph data={passengerData} /> {/* Pass filtered data */}
    </div>
  );
}
