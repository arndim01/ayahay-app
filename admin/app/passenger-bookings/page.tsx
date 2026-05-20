'use client';
import { Card, Typography, Button } from 'antd';
import { 
  DownloadOutlined, 
  ArrowLeftOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  CalendarOutlined 
} from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import BookingTabs from './components/TabComponents';
import { exportToExcel } from './utils/excelExport';
import styles from './page.module.scss';

const { Title, Text } = Typography;

export default function PassengerBookings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get('tripId');
  const tripData = {
    shipName: searchParams.get('shipName') || '',
    route: searchParams.get('route') || '',
    departureDate: searchParams.get('departureDate') || '',
    passengerCapacity: searchParams.get('passengerCapacity'),
    vehicleCapacity: searchParams.get('vehicleCapacity')
  };

  return (
    <div className={styles.container}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.push('/dashboard')}
        className={styles.backButton}
        type="link"
      >
        Back to Dashboard
      </Button>

      <Card className={styles.tripDetailsCard}>
        <div className={styles.cardHeader}>
          <Title level={4} className={styles.cardTitle}>
            Passenger Bookings
          </Title>
          <Button 
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              document.dispatchEvent(new CustomEvent('export-bookings'));
            }}
          >
            Download Report
          </Button>
        </div>
        <div className={styles.tripInfo}>
          <div className={styles.infoItem}>
            <CompassOutlined className={styles.icon} />
            <div className={styles.infoContent}>
              <Text type="secondary">Vessel Name</Text>
              <Text strong>{tripData.shipName}</Text>
            </div>
          </div>
          <div className={styles.divider} />
          <div className={styles.infoItem}>
            <EnvironmentOutlined className={styles.icon} />
            <div className={styles.infoContent}>
              <Text type="secondary">Route</Text>
              <Text strong>{tripData.route}</Text>
            </div>
          </div>
          <div className={styles.divider} />
          <div className={styles.infoItem}>
            <CalendarOutlined className={styles.icon} />
            <div className={styles.infoContent}>
              <Text type="secondary">Departure Date</Text>
              <Text strong>
                {dayjs(tripData.departureDate).format('MMM DD, YYYY h:mm A')}
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {tripId ? <BookingTabs tripId={tripId} /> : <div>Invalid trip ID</div>}
    </div>
  );
}
