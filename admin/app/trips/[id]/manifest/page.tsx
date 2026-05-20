'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TripManifest as ITripManifest } from '@ayahay/http';
import TripManifest from '@/components/reports/TripManifest';
import { getTripManifest } from '@/services/reporting.service';
import { Button, FloatButton, Skeleton } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useAuthGuard } from '@/hooks/auth';
import { useAuth } from '@/contexts/AuthContext';
import { getAxiosError } from '@ayahay/services/error.service';
import { useSearchParams } from 'next/navigation';
import { CSSProperties } from 'react';

const textCenter: CSSProperties = { textAlign: 'center' as const };
const noPadding: CSSProperties = { padding: '0' };

export default function TripManifestPage({ params }: any) {
  const { loggedInAccount } = useAuth();
  useAuthGuard(['ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin']);
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams.entries());
  const manifestRef = useRef<HTMLDivElement>(null);
  const [manifest, setManifest] = useState<ITripManifest | undefined>();
  const [errorCode, setErrorCode] = useState<number | undefined>();

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }
    const tripId = params.id;
    fetchManifest(tripId);
  }, [loggedInAccount]);

  const fetchManifest = async (tripId: number): Promise<void> => {
    try {
      setManifest(await getTripManifest(tripId, query.onboarded));
    } catch (e) {
      const axiosError = getAxiosError(e);
      if (axiosError === undefined) {
        setErrorCode(500);
      } else {
        setErrorCode(axiosError.statusCode);
      }
    }
  };

  return (
    <div style={{ padding: '32px' }} ref={manifestRef}>
      {errorCode === undefined && (
        <>
          <Skeleton loading={manifest === undefined}>
            {manifest && <TripManifest manifest={manifest} />}
          </Skeleton>

          <FloatButton
            className='hide-on-print'
            type='primary'
            onClick={() => window.print()}
            tooltip='Print'
            icon={<PrinterOutlined height={72} width={72} />}
          ></FloatButton>
        </>
      )}
      {errorCode === 404 && (
        <p style={textCenter}>
          The trip does not exist. Try again after a few minutes or&nbsp;
          <Button
            type='link'
            href={`mailto:it@ayahay.com?subject=Trip Not Found`}
            style={noPadding}
          >
            contact us for assistance
          </Button>
          .
        </p>
      )}
      {errorCode === 403 && (
        <p style={textCenter}>
          You are not authorized to view this manifest.&nbsp;
          <Button
            type='link'
            href={`mailto:it@ayahay.com?subject=I cannot access my manifest`}
            style={noPadding}
          >
            Contact us for assistance
          </Button>
          &nbsp;if you think this is a mistake.
        </p>
      )}
      {errorCode === 500 && <p style={textCenter}>Something went wrong.</p>}
    </div>
  );
}
