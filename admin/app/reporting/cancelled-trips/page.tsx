'use client';
import { useAuthGuard } from '@/hooks/auth';
import { DatePicker, Form } from 'antd';
import styles from './page.module.scss';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';
import { TripSearchByDateRange } from '@ayahay/http';
import { RangePickerProps } from 'antd/es/date-picker';
import { DATE_FORMAT_LIST, DATE_PLACEHOLDER } from '@ayahay/constants';
import {
  buildSearchQueryFromPortsAndDateRange,
  buildUrlQueryParamsFromPortsAndDateRange,
  initializePortsAndDateRangeFromQueryParams,
} from '@/services/search.service';
import CancelledTripList from './cancelledTripList';
import PortsFilter from '@/components/form/PortsFilter';

const { RangePicker } = DatePicker;

export default function CancelledTrips() {
  useAuthGuard(['ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin']);
  const { loggedInAccount } = useAuth();
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    {} as TripSearchByDateRange | undefined
  );

  const onPageLoad = () => {
    const params = Object.fromEntries(searchParams.entries());
    initializePortsAndDateRangeFromQueryParams(form, params);
    debounceSearch();
  };

  useEffect(onPageLoad, []);

  useEffect(() => {
    if (loggedInAccount === null) {
      return;
    }
  }, [loggedInAccount]);

  const debounceSearch = useCallback(debounce(performSearch, 300), []);

  function performSearch() {
    const query = buildSearchQueryFromPortsAndDateRange(form);
    setSearchQuery(query);
    updateUrl();
  }

  const updateUrl = () => {
    const updatedQueryParams = buildUrlQueryParamsFromPortsAndDateRange(form);
    const updatedUrl = `${window.location.origin}${window.location.pathname}?${updatedQueryParams}`;
    window.history.replaceState({ path: updatedUrl }, '', updatedUrl);
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    const lastYear = dayjs().subtract(1, 'year');
    return lastYear && current < lastYear.startOf('day');
  };

  return (
    <div className={styles['main-container']}>
      <Form
        form={form}
        initialValues={{ dateRange: [dayjs(), dayjs()] }}
        onValuesChange={(_, __) => debounceSearch()}
      >
        <Form.Item name='dateRange' label='Date Range'>
          <RangePicker
            disabledDate={disabledDate}
            format={DATE_FORMAT_LIST}
            placeholder={[DATE_PLACEHOLDER, DATE_PLACEHOLDER]}
            className={styles['range-picker']}
          />
        </Form.Item>
        <div className={styles['port-input']}>
          <PortsFilter debounceSearch={debounceSearch} />
        </div>
      </Form>

      <div>
        <CancelledTripList
          shippingLineId={loggedInAccount?.shippingLineId}
          searchQuery={searchQuery}
          loggedInAccount={loggedInAccount}
        />
      </div>
    </div>
  );
}
