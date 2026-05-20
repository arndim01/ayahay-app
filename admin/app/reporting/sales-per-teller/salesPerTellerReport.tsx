'use client';
import SalesPerTeller from '@/components/reports/SalesPerTeller';
import { getSalesPerTeller } from '@/services/reporting.service';
import { DownloadOutlined } from '@ant-design/icons';
import {
  SalesPerTellerReport as ISalesPerTeller,
  TripSearchByDateRange,
} from '@ayahay/http';
import { App, Button } from 'antd';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';

interface SalesPerTellerReportProps {
  searchQuery: TripSearchByDateRange | undefined;
}

export default function SalesPerTellerReport({
  searchQuery,
}: SalesPerTellerReportProps) {
  const { notification } = App.useApp();
  const [data, setData] = useState<ISalesPerTeller | undefined>();
  const salesPerTellerRef = useRef();

  useEffect(() => {
    fetchSalesPerTellerData();
  }, [searchQuery]);

  const fetchSalesPerTellerData = async () => {
    setData(await getSalesPerTeller(searchQuery));
  };

  const handleDownloadSalesPerTeller = async () => {
    if (!salesPerTellerRef.current) {
      notification.error({
        message: 'Download failed',
        description: 'No booking/s or disbursement/s inputted.',
      });
    } else {
      const doc = new jsPDF('l', 'pt', 'a4', true);
      const fileName = 'sales-per-account';

      doc.html(salesPerTellerRef.current, {
        async callback(doc) {
          await doc.save(fileName);
        },
        margin: [25, 0, 25, 0],
      });
    }
  };

  return (
    <div>
      <Button
        type='primary'
        htmlType='submit'
        loading={data === undefined}
        onClick={handleDownloadSalesPerTeller}
      >
        <DownloadOutlined /> Download
      </Button>
      <div style={{ display: 'none' }}>
        {data && searchQuery && (
          <SalesPerTeller
            data={data}
            startDate={searchQuery.startDate}
            endDate={searchQuery.endDate}
            ref={salesPerTellerRef}
          />
        )}
      </div>
    </div>
  );
}
