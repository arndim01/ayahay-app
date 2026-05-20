import React, { useEffect, useState } from 'react';
import { ITrip } from '@ayahay/models/trip.model';
import { Button, Dropdown, Space, Switch, Select, Modal, Form, Input, InputNumber, Typography } from 'antd';
import { IShippingLine } from '@ayahay/models/shipping-line.model';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
  getAvailableTripsByDateRange,
  updateTripOnlineBooking,
  getTripShip,
  updateTripVessel,
  getRateTableForShip
} from '@/services/trip.service';
import { getShipsByShippingLine } from '@/services/ship.service';
import Table, { ColumnsType } from 'antd/es/table';
import { PaginatedRequest, PortsAndDateRangeSearch } from '@ayahay/http';
import EditCapacity from '@/components/form/EditCapacity';
import { ArrowRightOutlined, DownOutlined, PlusCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useServerPagination } from '@ayahay/hooks';
import { useAuth } from '@/contexts/AuthContext';
import CancelledTripModal from '@/components/modal/CancelledTripModal';
import { NotificationInstance } from 'antd/es/notification/interface';
import AssignVesselModal from '@/components/modal/AssignVesselModal';
import styles from './tripList.module.scss';
import { useFeatureStore } from '@/stores/featureStore';
import { useFeature } from '@/contexts/FeatureContext';
import { getVoyageByTripId, createVoyage, deleteVoyage, updateVoyage } from '@/services/voyage.service';
import QuickBookingModal from '@/components/modal/QuickBookingModal';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(timezone);
dayjs.extend(utc);

const { Text } = Typography;

interface TripListProps {
  searchQuery: PortsAndDateRangeSearch | undefined;
  hasAdminPrivileges: boolean;
  onSetTripAsArrived: (tripId: number) => Promise<void>;
  api: NotificationInstance;
}

const tripActions = (
  trip: ITrip,
  setSelectedTrip: (trip: ITrip | null) => void,
  setIsQuickBookingModalOpen: (isOpen: boolean) => void
): any[] => {
  const actions: any[] = [
    {
      label: (
        <a href={`/trips/${trip.id}/manifest?onboarded=false`} target='_blank'>
          View booked manifest
        </a>
      ),
      key: 'view-manifest',
    },
    {
      label: (
        <a href={`/trips/${trip.id}/manifest?onboarded=true`} target='_blank'>
          View onboarded manifest
        </a>
      ),
      key: 'view-manifest',
    },
    {
      label: (
        <a href={`/trips/${trip.id}/bookings`} target='_blank'>
          View vehicle bookings
        </a>
      ),
      key: 'view-vehicle-bookings',
    },
    {
      label: (
        <a href={`/trips/${trip.id}/void-bookings`} target='_blank'>
          View void bookings
        </a>
      ),
      key: 'view-void-bookings',
    },
    {
      label: 'Quick Booking',
      key: 'quick-booking',
      onClick: () => {
        setSelectedTrip(trip);
        setIsQuickBookingModalOpen(true);
      },
    },
    {
      label: (
        <a href={`/trips/${trip.id}/disbursement`} target='_blank'>
          Disbursements
        </a>
      ),
      key: 'input-disbursements',
    },
    {
      label: (
        <a href={`/trips/${trip.id}/reporting`} target='_blank'>
          Generate reports
        </a>
      ),
      key: 'generate-reports',
    },
  ];

  if (trip.status === 'Awaiting') {
    actions.push(
      ...[
        {
          label: 'Set status to Arrived',
          key: `set-arrived`,
        },
        {
          label: 'Set status to Cancelled',
          key: `set-cancelled`,
        },
      ]
    );
  }

  return actions;
};

const tripAdminActions = (trip: ITrip): any[] => {
  const actions = [];

  if (trip.status === 'Awaiting') {
    actions.push({
      label: 'Assign Vessel',
      key: 'assign-vessel',
    });
  }

  return actions;
};

const CreateVoyageModal = ({ 
  record, 
  visible, 
  onCancel, 
  onSubmit, 
  loading,
  isEditing
}: { 
  record: ITrip, 
  visible: boolean, 
  onCancel: () => void, 
  onSubmit: (values: any) => void,
  loading: boolean,
  isEditing: boolean
}) => {
  const [form] = Form.useForm();
  const [existingVoyage, setExistingVoyage] = useState<any>(null);
  const [loadingVoyage, setLoadingVoyage] = useState(true);

  useEffect(() => {
    const loadExistingVoyage = async () => {
      if (record.id) {
        setLoadingVoyage(true);
        try {
          const data = await getVoyageByTripId(record.id);
          setExistingVoyage(data);
        } catch (error) {
        } finally {
          setLoadingVoyage(false);
        }
      }
    };

    if (visible) {
      form.resetFields();
      loadExistingVoyage();
    }
  }, [visible, record.id, form]);

  return (
    <Modal
      title={isEditing ? "Edit Voyage" : "Create New Voyage"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={isEditing ? "Update" : "Create"}
      confirmLoading={loading}
    >
      <Form
        form={form}
        onFinish={onSubmit}
        layout="vertical"
      >
        <Form.Item
          label="Voyage Number"
          name="number"
          rules={[
            { required: true, message: 'Please input voyage number!' },
            { type: 'number', min: 1, message: 'Voyage number must be greater than 0' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter voyage number"
            autoFocus
          />
        </Form.Item>
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">Trip Details:</Text>
          <div className={styles.tripDetails}>
            <div className={styles.detailRow}>
              <Text strong>Ship ID:</Text>
              <Text>{record.shipId}</Text>
            </div>
            <div className={styles.detailRow}>
              <Text strong>Current Voyage Number:</Text>
              {loadingVoyage ? (
                <Text type="secondary">Loading...</Text>
              ) : existingVoyage ? (
                <Text type="success">{existingVoyage.number}</Text>
              ) : (
                <Text type="warning">Not assigned (Create new voyage)</Text>
              )}
            </div>
            <div className={styles.detailRow}>
              <Text strong>Route:</Text>
              <Text>{record.srcPort?.name} → {record.destPort?.name}</Text>
            </div>
            <div className={styles.detailRow}>
              <Text strong>Departure:</Text>
              <Text>{dayjs(record.departureDateIso).format('MM/DD/YYYY h:mm A')}</Text>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

const VoyageCell = React.memo(({ record, api }: { record: ITrip, api: NotificationInstance }) => {
  const [voyageData, setVoyageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const loadVoyage = async () => {
    if (record.id) {
      try {
        setLoading(true);
        const data = await getVoyageByTripId(record.id);
        if (data) {
          setVoyageData(data);
        }
      } catch (error) {
        api.error({
          message: '',
          description: ''
        });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadVoyage();
  }, [record.id]);

  const formatRemarks = (srcPort?: string, destPort?: string, date?: string) => {
    const source = srcPort || 'Unknown';
    const destination = destPort || 'Unknown';
    const formattedDate = dayjs(date).format('M/D/YYYY, h:mm:ss A');
    return `${source} -> ${destination} ${formattedDate}`;
  };

  const handleEditVoyage = () => {
    setModalVisible(true);
    if (voyageData) {
      // Pre-fill the form with existing voyage number
      form.setFieldsValue({
        number: voyageData.number
      });
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = {
        shipId: record.shipId,
        tripId: record.id,
        number: values.number,
        date: new Date().toISOString(),
        remarks: formatRemarks(
          record.srcPort?.name,
          record.destPort?.name,
          record.departureDateIso
        )
      };

      if (voyageData) {
        // Update existing voyage
        await updateVoyage(record.id, payload);
      } else {
        // Create new voyage
        await createVoyage(payload);
      }

      await loadVoyage();
      setModalVisible(false);
      
      api.success({
        message: 'Success',
        description: `Voyage ${voyageData ? 'updated' : 'created'} successfully`
      });
    } catch (error: any) {
      api.error({
        message: 'Error',
        description: error.message || `Failed to ${voyageData ? 'update' : 'create'} voyage`
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVoyage = async () => {
    try {
      await deleteVoyage(record.id);
      setVoyageData(null);
      
      api.success({
        message: 'Success',
        description: 'Voyage deleted successfully'
      });
    } catch (error) {
      api.error({
        message: 'Error',
        description: 'Failed to delete voyage'
      });
    }
  };

  if (loading) {
    return <span className={styles.loadingPlaceholder}>Loading...</span>;
  }

  return (
    <>
      <div className={styles.voyageContainer}>
        <Space direction="vertical" align="center" size="small">
          <span className={styles.voyageNumber}>
            {voyageData ? `${voyageData.number}` : 'No Voyage Created'}
          </span>
        </Space>
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={handleEditVoyage}
          className={styles.editVoyageBtn}
        />
      </div>
      <CreateVoyageModal
        record={record}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        loading={submitting}
        isEditing={!!voyageData}
      />
    </>
  );
});

VoyageCell.displayName = 'VoyageCell';

export default function TripList({
  searchQuery,
  hasAdminPrivileges,
  onSetTripAsArrived,
  api,
}: TripListProps) {
  const BASE_URL = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_URL;
  const SHIPPING_LINE_LOGO = `${BASE_URL}/shipping_line_logo/`;
  const { loggedInAccount } = useAuth();
  const { voyageEnabled } = useFeature();
  const [tripId, setTripId] = useState(-1);
  const [shipId, setShipId] = useState(-1);
  const [srcPortName, setSrcPortName] = useState<string | undefined>();
  const [destPortName, setDestPortName] = useState<string | undefined>();
  const [isCancelTripModalOpen, setCancelTripModalOpen] = useState(false);
  const [isAssignVesselModalOpen, setAssignVesselModalOpen] = useState(false);
  const [shipNames, setShipNames] = useState<{ [key: number]: string }>({});
  const [ships, setShips] = useState<IShip[]>([]);
  const [selectedShipChange, setSelectedShipChange] = useState<{
    tripId: number;
    newShipId: number;
    shipName: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuickBookingModalOpen, setIsQuickBookingModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<ITrip | null>(null);

  const onClickSetTripAsArrived = async (tripId: number) => {
    await onSetTripAsArrived(tripId);
    resetData();
  };

  const onClickSetTripAsCancelled = async (tripId: number) => {
    setTripId(tripId);
    setCancelTripModalOpen(true);
  };

  const onClickAssignVessel = async (tripId: number, shipId: number) => {
    setTripId(tripId);
    setShipId(shipId);
    setAssignVesselModalOpen(true);
  };

  const onAllowOnlineBookingChange = async (
    tripId: number,
    checked: boolean
  ) => {
    await updateTripOnlineBooking(tripId, checked);
  };

  const loadShipName = async (trip: ITrip) => {
    try {
      if (!trip.shipId || !trip.shippingLineId) {
        setShipNames(prev => ({ ...prev, [trip.id]: 'Not Assigned' }));
        return;
      }

      setShipNames(prev => ({ ...prev, [trip.id]: 'Loading...' }));

      const shipData = await getTripShip(trip.shipId, trip.shippingLineId);

      if (!shipData) {
        setShipNames(prev => ({ ...prev, [trip.id]: 'Not Found' }));
        return;
      }

      setShipNames(prev => ({ ...prev, [trip.id]: shipData.name || 'Unnamed Ship' }));
    } catch (error) {
      setShipNames(prev => ({ ...prev, [trip.id]: 'Error Loading Ship' }));
    }
  };

  const renderPortNames = (record: ITrip) => {
    const srcPortName = record.srcPort?.name || 'Unknown';
    const destPortName = record.destPort?.name || 'Unknown';

    return (
      <div className={styles.routeContainer}>
        <span className={styles.portTag}>{srcPortName}</span>
        <ArrowRightOutlined className={styles.arrow} />
        <span className={styles.portTag}>{destPortName}</span>
      </div>
    );
  };

  const handleVesselChangeConfirm = async () => {
    if (!selectedShipChange || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const { tripId, newShipId } = selectedShipChange;
      const rateTableId = await getRateTableForShip(newShipId);
      
      if (!rateTableId) {
        api.error({
          message: 'Error',
          description: 'No rate table found for this vessel'
        });
        return;
      }

      // Update the vessel
      await updateTripVessel(tripId, newShipId, rateTableId);
      
      // Update local state to reflect the change immediately
      setShipNames(prev => ({
        ...prev,
        [tripId]: ships.find(ship => ship.id === newShipId)?.cabins?.[0]?.name || 'Updated Vessel'
      }));
      
      // Reload the full data
      await resetData();
      
      api.success({
        message: 'Success',
        description: 'Vessel updated successfully'
      });
    } catch (error) {
      console.error('Error updating vessel:', error);
      api.error({
        message: 'Error',
        description: error.response?.data?.message || 'Failed to update vessel'
      });
    } finally {
      setIsSubmitting(false);
      setSelectedShipChange(null);
      setAssignVesselModalOpen(false);
    }
  };

  const loadShips = async () => {
    try {
      if (!loggedInAccount?.shippingLineId) {
        return;
      }
      
      const shipsData = await getShipsByShippingLine(loggedInAccount.shippingLineId);
      
      if (!shipsData?.length) {
        return;
      }
  
      setShips(shipsData);
    } catch (error) {
      api.error({
        message: 'Error',
        description: 'Failed to load vessels'
      });
    }
  };

  useEffect(() => {
    loadShips();
  }, [loggedInAccount?.shippingLineId]);

  const columns: ColumnsType<ITrip> = [
    {
      key: 'logo',
      dataIndex: 'shippingLine',
      className: styles.logoColumn,
      render: (shippingLine: IShippingLine) => {
        // Add null check for shippingLine
        if (!shippingLine?.name) {
          return null;
        }

        return (
          <div className={styles.logoWrapper}>
            <div className={styles.logoContainer}>
              <img
                className={styles.logoImage}
                src={`${SHIPPING_LINE_LOGO}${shippingLine?.logoFilename}`}
                alt={`${shippingLine.name} Logo`}
                height={80}
                onError={(e) => {
                  e.currentTarget.src = '/assets/shipping-line-logos/default.png';
                }}
              />
            </div>
          </div>
        );
      },
      align: 'center',
      responsive: ['md'],
    },
    {
      title: 'Route',
      key: 'srcDestPort',
      className: styles.routeColumn,
      render: (_: string, record: ITrip) => renderPortNames(record),
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: 'Departure Date',
      key: 'departureDateIso',
      className: styles.dateColumn,
      dataIndex: 'departureDateIso',
      render: (departureDateIso: string) => (
        <span >
          {dayjs(departureDateIso)
            .tz('Asia/Shanghai')
            .format('MM/DD/YYYY h:mm A')}
        </span>
      ),
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: 'Status',
      key: 'status',
      className: styles.statusColumn,
      dataIndex: 'status',
      render: (status: string) => (
        <span className={`${styles.status} ${styles[status.toLowerCase()]}`}>
          {status}
        </span>
      ),
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: 'Vessel',
      key: 'vessel',
      className: styles.vesselColumn,
      render: (_: string, record: ITrip) => {
        const currentShip = record.ship || ships.find(ship => ship.id === record.shipId);
        const currentCabinName = currentShip?.cabins?.[0]?.name || shipNames[record.id] || 'Loading...';
        const passengerCapacity = currentShip?.cabins?.[0]?.recommendedPassengerCapacity || 'N/A';
        const vehicleCapacity = currentShip?.recommendedVehicleCapacity || 'N/A';
        
        return (
          <div className={styles.vesselContainer}>
            <div className={styles.vesselInfo}>
              <div className={styles.vesselName}>
                <span className={styles.label}>Current Vessel:</span>
                <span className={styles.value}>{currentCabinName}</span>
              </div>
              <div className={styles.vesselCapacity}>
                <span className={styles.label}>Passenger Capacity:</span>
                <span className={styles.value}>{passengerCapacity}</span>
              </div>
              <div className={styles.vesselCapacity}>
                <span className={styles.label}>Vehicle Capacity:</span>
                <span className={styles.value}>{vehicleCapacity}</span>
              </div>
            </div>
            
            {hasAdminPrivileges && (
              <Dropdown
                menu={{
                  items: ships.map(ship => ({
                    key: ship.id,
                    label: ship.cabins?.[0]?.name || 'Unnamed',
                    onClick: () => {
                      const cabinName = ship.cabins?.[0]?.name || 'Unknown';
                      const pCapacity = ship.cabins?.[0]?.recommendedPassengerCapacity || 'N/A';
                      const vCapacity = ship.recommendedVehicleCapacity || 'N/A';
                      setSelectedShipChange({
                        tripId: record.id,
                        newShipId: ship.id,
                        shipName: `${cabinName} (Pass: ${pCapacity}, Veh: ${vCapacity})`
                      });
                    }
                  }))
                }}
              >
                <Button 
                  className={styles.changeVesselBtn}
                  icon={<DownOutlined />}
                  loading={!ships.length}
                >
                  Change Vessel
                </Button>
              </Dropdown>
            )}
          </div>
        );
      },
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: 'Details',
      key: 'tripDetails',
      render: (_: string, record: ITrip) => (
        <>
          <strong>Route:</strong>&nbsp;
          <span>
            {record.srcPort?.name || 'Unknown'} <ArrowRightOutlined />
            &nbsp;
            {record.destPort?.name || 'Unknown'}
          </span>
          <br></br>
          <strong>Date:</strong>&nbsp;
          {dayjs(record.departureDateIso)
            .tz('Asia/Shanghai')
            .format('MM/DD/YYYY h:mm A')}
          <br></br>
          <strong>Status:</strong>&nbsp;<span>{record.status}</span>
          <br></br>
          <strong>Vessel:</strong>&nbsp;<span>{shipNames[record.id] || 'Loading...'}</span>
        </>
      ),
      responsive: ['xs'],
    },
    {
      title: '',
      key: 'actions',
      className: styles.actionsColumn,
      render: (_, trip: ITrip) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: hasAdminPrivileges
            ? [
              ...tripActions(
                trip,
                setSelectedTrip,
                setIsQuickBookingModalOpen
              ),
              ...tripAdminActions(trip),
            ]
          : tripActions(trip, setSelectedTrip, setIsQuickBookingModalOpen),
            onClick: ({ key }) => {
              if (key === 'set-arrived') {
                onClickSetTripAsArrived(trip.id);
              } else if (key === 'set-cancelled') {
                onClickSetTripAsCancelled(trip.id);
              } else if (key === 'assign-vessel') {
                setSrcPortName(trip.srcPort?.name);
                setDestPortName(trip.destPort?.name);
                onClickAssignVessel(trip.id, trip.shipId);
              }
            },
          }}
        >
          <Button>
            <Space>
              Actions
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      ),
      align: 'center',
    },
  ];

  const voyageColumn: ColumnsType<ITrip>[0] = {
    title: 'Voyage',
    key: 'voyage',
    className: styles.voyageColumn,
    render: (_, record: ITrip) => <VoyageCell record={record} api={api} />,
    align: 'center',
    responsive: ['sm'],
  };

  const getColumns = () => {
    let baseColumns = [...columns];
    
    // Insert voyage column after status column if enabled
    if (voyageEnabled) {
      const statusColumnIndex = baseColumns.findIndex(col => col.key === 'status');
      if (statusColumnIndex !== -1) {
        baseColumns.splice(statusColumnIndex + 1, 0, voyageColumn);
      }
    }

    if (loggedInAccount?.role === 'SuperAdmin') {
      return [...baseColumns, ...adminOnlyColumns, ...superAdminOnlyColumns];
    } else if (hasAdminPrivileges) {
      return [...baseColumns, ...adminOnlyColumns];
    }
    return baseColumns;
  };

  const adminOnlyColumns = [
    {
      title: 'Capacities',
      key: 'editCapacities',
      render: (_: string, record: ITrip) => (
        <div>
          <EditCapacity
            tripId={record.id}
            cabins={record.availableCabins}
            vehicleCapacity={record.vehicleCapacity}
          />
        </div>
      ),
    },
  ];

  const superAdminOnlyColumns = [
    {
      title: 'Online Booking',
      key: 'onlineBooking',
      render: (_: string, record: ITrip) => (
        <Switch
          defaultValue={record.allowOnlineBooking}
          onChange={(checked) => onAllowOnlineBookingChange(record.id, checked)}
        />
      ),
    },
  ];

  const fetchAvailableTripsByDateRange = async (
    pagination: PaginatedRequest
  ) => {
    try {
      const result = await getAvailableTripsByDateRange(
        loggedInAccount?.shippingLineId,
        searchQuery,
        pagination
      );
      
      return result || { total: 0, data: [] };
    } catch (error: any) {
      api.error({
        message: 'Error',
        description: error.message || 'Failed to fetch trips data'
      });
      
      return { total: 0, data: [] };
    }
  };

  const {
    dataInPage: availableTrips,
    antdPagination,
    antdOnChange,
    resetData,
  } = useServerPagination<ITrip>(
    fetchAvailableTripsByDateRange,
    loggedInAccount !== null && loggedInAccount !== undefined
  );

  useEffect(() => resetData(), [searchQuery]);

  useEffect(() => {
    const loadAllShipNames = async () => {
      if (!availableTrips) return;
      
      setShipNames({});
      
      for (const trip of availableTrips) {
        await loadShipName(trip);
      }
    };

    loadAllShipNames();
  }, [availableTrips]);

  return (
    <>
      <div className={styles.tableCard}>
        <div className={styles.responsiveContainer}>
          <Table
            className={styles.tripTable}
            dataSource={availableTrips}
            columns={getColumns()}
            pagination={{
              ...antdPagination,
              className: styles.pagination,
              responsive: true
            }}
            onChange={antdOnChange}
            loading={availableTrips === undefined}
            scroll={{ x: 'max-content' }}
            rowKey={(trip) => trip.id}
            rowClassName={(record) => {
              switch (record.status) {
                case 'Awaiting':
                  return styles.awaitingRow;
                case 'Arrived':
                  return styles.arrivedRow;
                case 'Cancelled':
                  return styles.cancelledRow;
                default:
                  return '';
              }
            }}
          />
        </div>
        <CancelledTripModal
          tripId={tripId}
          setCancelTripModalOpen={setCancelTripModalOpen}
          api={api}
          resetData={resetData}
          open={isCancelTripModalOpen}
        />
        {srcPortName && destPortName && (
          <AssignVesselModal
            tripId={tripId}
            shipId={shipId}
            srcPortName={srcPortName}
            destPortName={destPortName}
            setAssignVesselModalOpen={setAssignVesselModalOpen}
            resetData={resetData}
            api={api}
            open={isAssignVesselModalOpen}
          />
        )}
        {selectedTrip && (
          <QuickBookingModal
            trip={selectedTrip}
            isOpen={isQuickBookingModalOpen}
            onClose={() => {
              setIsQuickBookingModalOpen(false);
              setSelectedTrip(null);
              resetData();
            }}
          />
        )}
      </div>
      <Modal
        title="Confirm Vessel Change"
        open={!!selectedShipChange}
        onOk={handleVesselChangeConfirm}
        onCancel={() => setSelectedShipChange(null)}
        okText={isSubmitting ? "Updating..." : "Yes, change vessel"}
        cancelText="No, cancel"
        className={styles.confirmModal}
        okButtonProps={{ 
          style: { 
            background: '#1890ff',
            borderColor: '#1890ff'
          },
          loading: isSubmitting,
          disabled: isSubmitting
        }}
        cancelButtonProps={{
          style: {
            marginRight: '10px'
          },
          disabled: isSubmitting
        }}
      >
        <div className={styles.modalContent}>
          <div className={styles.warningIcon}>⚠️</div>
          <h3>Change Vessel Confirmation</h3>
          <p>Are you sure you want to change the vessel for this route to:</p>
          <div className={styles.vesselDetails}>
            {selectedShipChange?.shipName}
          </div>
          <p className={styles.warningText}>
            This action may affect existing bookings and schedules.
          </p>
        </div>
      </Modal>
    </>
  );
}
