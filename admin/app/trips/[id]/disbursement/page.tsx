'use client';
import { Button, Flex, Spin, Typography } from 'antd';
import styles from './page.module.scss';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { getDisbursementsByTrip } from '@/services/disbursement.service';
import { useAuthGuard } from '@/hooks/auth';
import { useEffect, useState } from 'react';
import { IDisbursement, ITrip } from '@ayahay/models';
import { getTripDetails } from '@/services/trip.service';
import { useAuth } from '@/contexts/AuthContext';
import { getAxiosError } from '@ayahay/services/error.service';
import Table, { ColumnsType } from 'antd/es/table';
import { useServerPagination } from '@ayahay/hooks';
import { PaginatedRequest } from '@ayahay/http';
import { EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import DisbursementModal from '@/components/modal/DisbursementModal';

dayjs.extend(timezone);
dayjs.extend(utc);

const { Title } = Typography;

export default function DisbursementPage({ params }: any) {
  useAuthGuard(['ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin']);
  const { loggedInAccount } = useAuth();
  const [hasAdminPrivileges, setHasAdminPrivileges] = useState(false);
  const [trip, setTrip] = useState<ITrip | undefined>();
  const [disbursementModalOpen, setDisbursementModalOpen] = useState(false);
  const [editDisbursement, setEditDisbursement] = useState<
    IDisbursement | undefined
  >();
  const [isEdit, setIsEdit] = useState(false);
  const [errorCode, setErrorCode] = useState<number | undefined>();
  const tripId = params.id;

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }

    const _hasAdminPrivileges =
      loggedInAccount?.role === 'ShippingLineAdmin' ||
      loggedInAccount?.role === 'SuperAdmin';
    setHasAdminPrivileges(_hasAdminPrivileges);

    fetchTrip();
  }, [loggedInAccount]);

  const fetchTrip = async (): Promise<void> => {
    try {
      setTrip(await getTripDetails(Number(tripId)));
    } catch (e) {
      const axiosError = getAxiosError(e);
      if (axiosError === undefined) {
        setErrorCode(500);
      } else {
        setErrorCode(axiosError.statusCode);
      }
    }
  };

  const fetchDisbursements = async (pagination: PaginatedRequest) => {
    return getDisbursementsByTrip(tripId, pagination);
  };

  const {
    dataInPage: disbursements,
    antdPagination,
    antdOnChange,
    resetData,
  } = useServerPagination<IDisbursement>(
    fetchDisbursements,
    loggedInAccount !== null && loggedInAccount !== undefined
  );

  const columns: ColumnsType<IDisbursement> = [
    {
      title: 'Date',
      key: 'date',
      render: (_, { dateIso }) => (
        <span>{dayjs(dateIso).tz('Asia/Shanghai').format('MM/DD/YYYY')}</span>
      ),
      align: 'center',
      responsive: ['md'],
    },
    {
      title: 'Official Receipt',
      key: 'officialReceipt',
      dataIndex: 'officialReceipt',
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: 'Paid To',
      key: 'paidTo',
      dataIndex: 'paidTo',
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: 'Description',
      key: 'description',
      dataIndex: 'description',
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: 'Purpose',
      key: 'purpose',
      dataIndex: 'purpose',
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: 'Amount',
      key: 'amount',
      dataIndex: 'amount',
      align: 'center',
      responsive: ['sm'],
    },
  ];

  const adminOnlyColumns = [
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: IDisbursement) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => {
            setDisbursementModalOpen(true);
            setEditDisbursement(record);
            setIsEdit(true);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className={styles['main-container']}>
      {errorCode === undefined && (
        <>
          <Title level={1} style={{ fontSize: 25 }}>
            Disbursements
          </Title>
          <Spin
            size='large'
            spinning={trip === undefined}
            className={styles['spinner']}
          />
          {trip && (
            <div>
              <Flex justify='space-between'>
                <section>
                  <div>
                    <strong>Trip:</strong>&nbsp;{trip.srcPort?.name}
                    &nbsp;to&nbsp;
                    {trip.destPort?.name}
                  </div>
                  <div>
                    <strong>Departure Date:</strong>&nbsp;
                    {dayjs(trip.departureDateIso)
                      .tz('Asia/Shanghai')
                      .format('MM/DD/YYYY [at] h:mm A')}
                  </div>
                  <div>
                    <strong>Voyage #:</strong>&nbsp;
                    {trip.voyage?.number}
                  </div>
                </section>
                <section>
                  <Button
                    type='primary'
                    icon={<PlusCircleOutlined />}
                    onClick={() => {
                      setDisbursementModalOpen(true);
                      setIsEdit(false);
                    }}
                  >
                    Add Disbursements
                  </Button>
                </section>
              </Flex>

              <Table
                dataSource={disbursements}
                columns={
                  hasAdminPrivileges
                    ? [...columns, ...adminOnlyColumns]
                    : columns
                }
                pagination={antdPagination}
                onChange={antdOnChange}
                loading={disbursements === undefined}
                tableLayout='fixed'
                rowKey={(disbursement) => disbursement.id}
              />

              <DisbursementModal
                tripId={tripId}
                trip={trip}
                editDisbursement={editDisbursement}
                isEdit={isEdit}
                setDisbursementModalOpen={setDisbursementModalOpen}
                resetData={resetData}
                open={disbursementModalOpen}
                width={1000}
              />
            </div>
          )}
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
            href={`mailto:it@ayahay.com?subject=I cannot access disbursements page`}
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
