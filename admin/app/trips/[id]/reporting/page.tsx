'use client';
import React, { useEffect, useRef, useState } from 'react';
import { TripReport as ITripReport } from '@ayahay/http';
import {
  computeExpenses,
  getTripsReporting,
} from '@/services/reporting.service';
import { Button, Select, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useAuthGuard } from '@/hooks/auth';
import { useAuth } from '@/contexts/AuthContext';
import PassengerDailySalesReport from '@/components/reports/PassengerDailySalesReport';
import jsPDF from 'jspdf';
import SummarySalesPerVoyage from '@/components/reports/SummarySalesPerVoyage';
import ProfitAndLossStatement from '@/components/reports/ProfitAndLossStatement';
import CargoDailySalesReport from '@/components/reports/CargoDailySalesReport';
import { getAxiosError } from '@ayahay/services/error.service';
import styles from './page.module.scss';
import MySalesReport from '@/components/reports/MySales';

const { Title } = Typography;

enum STATUS {
  ON_TIME = 'ON TIME',
  LATE = 'LATE',
}

export default function TripReportingPage({ params }: any) {
  useAuthGuard(['ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin']);
  const { loggedInAccount } = useAuth();
  const dailySalesReportRef = useRef();
  const cargoDailySalesReportRef = useRef();
  const summarySalesPerVoyageRef = useRef();
  const profitAndLossStatementRef = useRef();
  const mySalesRef = useRef();
  const [tripsReporting, setTripsReporting] = useState<
    ITripReport | undefined
  >();
  const [status, setStatus] = useState(STATUS.ON_TIME);
  const [expenses, setExpenses] = useState({});
  const [errorCode, setErrorCode] = useState<number | undefined>();

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }
    const tripId = params.id;
    fetchTripsReporting(tripId);
  }, [loggedInAccount]);

  const fetchTripsReporting = async (tripId: number): Promise<void> => {
    try {
      const data = await getTripsReporting(tripId);
      setTripsReporting(data);

      const computedExpenses = computeExpenses(data.disbursements);
      setExpenses(computedExpenses);
    } catch (e) {
      const axiosError = getAxiosError(e);
      if (axiosError === undefined) {
        setErrorCode(500);
      } else {
        setErrorCode(axiosError.statusCode);
      }
    }
  };

  const handleStatusChange = (value: string) => {
    setStatus(STATUS[value as keyof typeof STATUS]);
  };

  const handleDownloadDailySales = async () => {
    const doc = new jsPDF('l', 'pt', 'a4', true);
    doc.html(dailySalesReportRef.current, {
      async callback(doc) {
        await doc.save('passenger-daily-sales-report');
      },
      margin: [25, 0, 25, 0],
    });
  };

  const handleDownloadCargoDailySales = async () => {
    const doc = new jsPDF('l', 'pt', 'a4', true);
    doc.html(cargoDailySalesReportRef.current, {
      async callback(doc) {
        await doc.save('cargo-daily-sales-report');
      },
      margin: [25, 0, 25, 0],
    });
  };

  const handleDownloadSummarySalesPerVoyage = async () => {
    const doc = new jsPDF('l', 'pt', 'a4', true);
    doc.html(summarySalesPerVoyageRef.current, {
      async callback(doc) {
        await doc.save('summary-sales-per-voyage');
      },
      margin: [25, 0, 25, 0],
    });
  };

  const handleDownloadProfitAndLossStatement = async () => {
    const doc = new jsPDF('l', 'pt', 'a4', true);
    doc.html(profitAndLossStatementRef.current, {
      async callback(doc) {
        await doc.save('profit-and-loss-statement');
      },
      margin: [25, 0, 25, 0],
    });
  };

  const handleDownloadMySales = async () => {
    const doc = new jsPDF('l', 'pt', 'a4', true);
    doc.html(mySalesRef.current, {
      async callback(doc) {
        await doc.save('my-sales');
      },
      margin: [25, 0, 25, 0],
    });
  };

  return (
    <div className={styles['main-container']}>
      {errorCode === undefined && (
        <>
          <Title level={1} className={styles['title']}>
            Passenger Daily Sales Report
          </Title>
          <Button
            type='primary'
            htmlType='submit'
            loading={tripsReporting === undefined}
            onClick={handleDownloadDailySales}
            className={styles['download-btn']}
          >
            <DownloadOutlined /> Download
          </Button>
          <div style={{ display: 'none' }}>
            {tripsReporting && (
              <PassengerDailySalesReport
                data={tripsReporting}
                ref={dailySalesReportRef}
              />
            )}
          </div>
          <Title level={1} className={styles['title']}>
            Cargo Daily Sales Report
          </Title>
          <Button
            type='primary'
            htmlType='submit'
            loading={tripsReporting === undefined}
            onClick={handleDownloadCargoDailySales}
            className={styles['download-btn']}
          >
            <DownloadOutlined /> Download
          </Button>
          <div style={{ display: 'none' }}>
            {tripsReporting && (
              <CargoDailySalesReport
                data={tripsReporting}
                ref={cargoDailySalesReportRef}
              />
            )}
          </div>
          <Title level={1} className={styles['title']}>
            Summary Sales Per Voyage
          </Title>
          <div>
            Status:&nbsp;
            <Select
              options={Object.keys(STATUS).map((enumKey) => ({
                value: enumKey,
                label: STATUS[enumKey as keyof typeof STATUS],
              }))}
              onChange={handleStatusChange}
              defaultValue={STATUS.ON_TIME}
              style={{ minWidth: '20%' }}
            />
          </div>
          <Button
            type='primary'
            htmlType='submit'
            loading={tripsReporting === undefined}
            onClick={handleDownloadSummarySalesPerVoyage}
            className={styles['download-btn']}
          >
            <DownloadOutlined /> Download
          </Button>
          <div style={{ display: 'none' }}>
            {tripsReporting && (
              <SummarySalesPerVoyage
                data={tripsReporting}
                status={status}
                ref={summarySalesPerVoyageRef}
              />
            )}
          </div>
          <Title level={1} className={styles['title']}>
            Profit and Loss Statement
          </Title>
          <Button
            type='primary'
            htmlType='submit'
            loading={tripsReporting === undefined}
            onClick={handleDownloadProfitAndLossStatement}
            className={styles['download-btn']}
          >
            <DownloadOutlined /> Download
          </Button>
          <div style={{ display: 'none' }}>
            {tripsReporting && (
              <ProfitAndLossStatement
                data={tripsReporting}
                expenses={expenses}
                ref={profitAndLossStatementRef}
              />
            )}
          </div>
          <Title level={1} className={styles['title']}>
            My Sales
          </Title>
          <Button
            type='primary'
            htmlType='submit'
            loading={tripsReporting === undefined}
            onClick={handleDownloadMySales}
            className={styles['download-btn']}
          >
            <DownloadOutlined /> Download
          </Button>
          <div style={{ display: 'none' }}>
            {tripsReporting && (
              <MySalesReport data={tripsReporting} ref={mySalesRef} />
            )}
          </div>
        </>
      )}
      {errorCode === 404 && (
        <p className={styles['error-text']}>
          The trip does not exist. Try again after a few minutes or&nbsp;
          <Button
            type='link'
            href={`mailto:it@ayahay.com?subject=Trip Not Found`}
            className={styles['no-padding']}
          >
            contact us for assistance
          </Button>
          .
        </p>
      )}
      {errorCode === 403 && (
        <p className={styles['error-text']}>
          You are not authorized to view this page.&nbsp;
          <Button
            type='link'
            href={`mailto:it@ayahay.com?subject=I cannot access vehicle bookings`}
            className={styles['no-padding']}
          >
            Contact us for assistance
          </Button>
          &nbsp;if you think this is a mistake.
        </p>
      )}
      {errorCode === 500 && (
        <p className={styles['error-text']}>Something went wrong.</p>
      )}
    </div>
  );
}
