'use client';
import { useAuthGuard } from '@/hooks/auth';
import { Button, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from '../page.module.scss';
import { DownloadOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import SummarySalesPerVessel from '@/components/reports/SummarySalesPerVessel';
import { useShipReportingFromSearchParams } from '@/hooks/reporting';
import { useSearchParams } from 'next/navigation';
import { getShippingLine } from '@ayahay/services/shipping-line.service';
import { IShippingLine } from '@ayahay/models';

const { Title } = Typography;

export default function ReportingPage() {
  useAuthGuard(['ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin']);
  const [shippingLine, setShippingLine] = useState<IShippingLine>();
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const { data } = useShipReportingFromSearchParams(params);
  const summarySalesPerVesselRef = useRef();

  useEffect(() => {
    fetchShippingLine();
  }, []);

  const fetchShippingLine = async () => {
    setShippingLine(await getShippingLine(+params.shippingLineId));
  };

  const handleDownloadSummarySalesPerVessel = async () => {
    const doc = new jsPDF('l', 'pt', 'a4', true);
    const fileName =
      params.reportType === undefined
        ? 'summary-sales-per-trip'
        : 'summary-sales-per-vessel';

    doc.html(summarySalesPerVesselRef.current, {
      async callback(doc) {
        await doc.save(fileName);
      },
      margin: [25, 0, 25, 0],
    });
  };

  return (
    <div className={styles['main-container']}>
      <Title level={1} style={{ fontSize: 25 }}>
        Summary Sales
      </Title>
      <Button
        type='primary'
        htmlType='submit'
        loading={data === undefined}
        onClick={handleDownloadSummarySalesPerVessel}
      >
        <DownloadOutlined /> Download
      </Button>
      <div style={{ display: 'none' }}>
        {data && shippingLine && (
          <SummarySalesPerVessel
            data={data}
            shippingLine={shippingLine}
            startDate={params.startDate}
            endDate={params.endDate}
            reportType={params.reportType}
            ref={summarySalesPerVesselRef}
          />
        )}
      </div>
    </div>
  );
}
