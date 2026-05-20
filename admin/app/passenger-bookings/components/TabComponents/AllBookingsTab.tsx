'use client';
import SharedTable from './SharedTable';
import type { TabComponentProps } from './types';
import BarGraph from '../BarGraph';
import CountTables from './CountTables';
import { useState, useCallback, useEffect } from 'react';
import { exportToExcel } from '../../utils/excelExport';
import { useSearchParams } from 'next/navigation';

export default function AllBookingsTab({ tripId }: TabComponentProps) {
  const searchParams = useSearchParams();
  const [passengerData, setPassengerData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<any>({ onBoard: [], notBoarded: [] });

  const handleDataLoaded = useCallback((data: any[]) => {
    setPassengerData(data);
    
    // Process summary data when passenger data is loaded
    const grouped = data.reduce((acc: any, passenger) => {
      const status = passenger.status;
      const key = `${passenger.discountType}-${passenger.accommodation}`;
      const group = status === 'On-Board' ? 'onBoard' : 'notBoarded';
      
      if (!acc[group][key]) {
        acc[group][key] = {
          discountType: passenger.discountType || 'None',
          accommodation: passenger.accommodation,
          total: 0
        };
      }
      
      acc[group][key].total += 1;
      return acc;
    }, { onBoard: {}, notBoarded: {} });

    // Convert grouped data to arrays
    const formatData = (groupedObj: any) => 
      Object.entries(groupedObj).map(([key, value]: [string, any]) => ({
        key,
        ...value
      }));

    setSummaryData({
      onBoard: formatData(grouped.onBoard),
      notBoarded: formatData(grouped.notBoarded)
    });
  }, []);

  useEffect(() => {
    const handleExport = () => {
      if (passengerData.length > 0) {
        const tripDetails = {
          shipName: searchParams.get('shipName') || 'Unknown',
          route: searchParams.get('route') || 'Unknown',
          departureDate: searchParams.get('departureDate') || new Date().toISOString()
        };

        exportToExcel(passengerData, summaryData, tripDetails);
      }
    };

    document.addEventListener('export-bookings', handleExport);
    return () => document.removeEventListener('export-bookings', handleExport);
  }, [passengerData, summaryData, searchParams]);

  return (
    <div className="booking-content">
      <SharedTable 
        tripId={tripId} 
        onDataLoaded={handleDataLoaded}
      />
      <CountTables 
        showOnBoard 
        showNotBoarded 
        data={passengerData}
      />
      <BarGraph data={passengerData} /> {/* Pass actual passenger data instead of mockData */}
    </div>
  );
}
