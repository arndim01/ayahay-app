'use client';
import AboutUsCard from '@/components/AboutUsCard';
import TripSearchQuery from '@/components/search/TripSearchQuery';
import {
  DEFAULT_NUM_PASSENGERS,
  DEFAULT_NUM_VEHICLES,
  DEFAULT_BOOKING_TYPE,
} from '@ayahay/constants/default';
import { Form } from 'antd';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { buildUrlQueryParamsFromSearchForm } from '@/services/search.service';
import styles from './page.module.scss';

export default function Home() {
  const router = useRouter();
  const [form] = Form.useForm();

  const redirectToSearchResults = (_: any) => {
    const queryParams = buildUrlQueryParamsFromSearchForm(form);
    router.push(`/trips?${queryParams}`);
  };

  return (
    <div id={styles['home-page']}>
      <Form
        form={form}
        initialValues={{
          bookingType: DEFAULT_BOOKING_TYPE,
          passengerCount: DEFAULT_NUM_PASSENGERS,
          vehicleCount: DEFAULT_NUM_VEHICLES,
          departureDate: dayjs(),
          returnDate: dayjs(),
        }}
        onFinish={redirectToSearchResults}
        className={styles['landing']}
      >
        <h1>Where Do You Want to Go?</h1>
        <p>Travel around the Philippines</p>
        <TripSearchQuery className={styles['trip-search-query']} />
      </Form>
      <AboutUsCard />
    </div>
  );
}
