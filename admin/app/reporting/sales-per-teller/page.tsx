'use client';
import { useAuthGuard } from '@/hooks/auth';
import {
  buildSearchQueryFromRangePickerForm,
  buildUrlQueryParamsFromRangePickerForm,
  initializeRangePickerFormFromQueryParams,
} from '@/services/search.service';
import { TripSearchByDateRange } from '@ayahay/http';
import { DatePicker, Form, Typography } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import styles from './page.module.scss';
import { DATE_FORMAT_LIST, DATE_PLACEHOLDER } from '@ayahay/constants';
import SalesPerTellerReport from './salesPerTellerReport';

const { RangePicker } = DatePicker;
const { Title } = Typography;

export default function SalesPerTellerPage() {
  useAuthGuard(['ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin']);
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    {} as TripSearchByDateRange | undefined
  );

  const onPageLoad = () => {
    const params = Object.fromEntries(searchParams.entries());
    initializeRangePickerFormFromQueryParams(form, params);
    debounceSearch();
  };

  useEffect(onPageLoad, []);

  const debounceSearch = useCallback(debounce(performSearch, 300), []);

  function performSearch() {
    const query = buildSearchQueryFromRangePickerForm(form);
    setSearchQuery(query);
    updateUrl();
  }

  const updateUrl = () => {
    const updatedQueryParams = buildUrlQueryParamsFromRangePickerForm(form);
    const updatedUrl = `${window.location.origin}${window.location.pathname}?${updatedQueryParams}`;
    window.history.replaceState({ path: updatedUrl }, '', updatedUrl);
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    const lastYear = dayjs().subtract(1, 'year');
    return lastYear && current < lastYear.startOf('day');
  };

  return (
    <div className={styles['main-container']}>
      <Title level={1} style={{ fontSize: 25 }}>
        Sales Per Account
      </Title>
      <Form
        form={form}
        initialValues={{ dateRange: [dayjs(), dayjs()] }}
        onValuesChange={(_, __) => debounceSearch()}
      >
        <div className={styles['form-item']}>
          <Form.Item name='dateRange' label='Date Range'>
            <RangePicker
              disabledDate={disabledDate}
              format={DATE_FORMAT_LIST}
              placeholder={[DATE_PLACEHOLDER, DATE_PLACEHOLDER]}
              className={styles['range-picker']}
            />
          </Form.Item>
        </div>
      </Form>

      <SalesPerTellerReport searchQuery={searchQuery} />
    </div>
  );
}
