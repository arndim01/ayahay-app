'use client';
import { useAuthGuard } from '@/hooks/auth';
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  Row,
  Typography,
} from 'antd';
import styles from './page.module.scss';
import dayjs from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';
import {
  CollectOption,
  CollectTripBooking,
  PortsAndDateRangeSearch,
} from '@ayahay/http';
import { RangePickerProps } from 'antd/es/date-picker';
import { DATE_FORMAT_LIST, DATE_PLACEHOLDER } from '@ayahay/constants';
import {
  buildSearchQueryFromPortsAndDateRange,
  buildUrlQueryParamsFromPortsAndDateRange,
  initializePortsAndDateRangeFromQueryParams,
} from '@/services/search.service';
import { DownloadOutlined, FilePdfTwoTone } from '@ant-design/icons';
import jsPDF from 'jspdf';
import { getCollectTripBookings } from '@/services/reporting.service';
import { getTripsForCollectBooking } from '@/services/trip.service';
import CollectTripBookings from '@/components/reports/CollectTripBookings';
import { useAuth } from '@/contexts/AuthContext';
import { IShippingLine } from '@ayahay/models';
import { getShippingLine } from '@ayahay/services/shipping-line.service';
import PortsFilter from '@/components/form/PortsFilter';

const { RangePicker } = DatePicker;
const { Title } = Typography;

export default function CollectBookingsPage() {
  useAuthGuard(['ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin']);
  const { loggedInAccount } = useAuth();
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    {} as PortsAndDateRangeSearch | undefined
  );
  const [data, setData] = useState([] as CollectTripBooking[] | undefined);
  const [tripOptions, setTripOptions] = useState([] as CollectOption[]);
  const [checkedList, setCheckedList] = useState([] as string[]);
  const [checkAll, setCheckAll] = useState(false);
  const [buildReportClicked, setBuildReportClicked] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [shippingLine, setShippingLine] = useState<IShippingLine>();
  const collectBookingsRef = useRef();

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
    fetchShippingLine(loggedInAccount);
  }, [loggedInAccount]);

  const fetchShippingLine = async (loggedInAccount: any) => {
    setShippingLine(await getShippingLine(loggedInAccount.shippingLineId));
  };

  const debounceSearch = useCallback(debounce(performSearch, 300), []);

  function performSearch() {
    const query = buildSearchQueryFromPortsAndDateRange(form);
    setSearchQuery(query);
    updateUrl();
    setBuildReportClicked(false);
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

  useEffect(() => {
    setCheckAll(false);
    setCheckedList([]);
    fetchTrips(searchQuery);
  }, [searchQuery]);

  const fetchTrips = async (searchQuery: any) => {
    const trips = await getTripsForCollectBooking(searchQuery);
    if (trips === undefined) {
      return;
    }

    setTripOptions(trips);
  };

  const onChange = (list: any) => {
    setCheckedList(list);
    setCheckAll(list.length === tripOptions.length);
    setBuildReportClicked(false);
  };

  const onCheckAllChange = (e: any) => {
    setCheckedList(
      e.target.checked ? tripOptions.map(({ value }) => value) : []
    );
    setCheckAll(e.target.checked);
    setBuildReportClicked(false);
  };

  const fetchCollectTripBookings = async () => {
    setIsFetchingData(true);
    setData(await getCollectTripBookings(checkedList));
    setIsFetchingData(false);
    setBuildReportClicked(true);
  };

  const handleDownloadCollectBookings = async () => {
    const doc = new jsPDF('l', 'pt', 'a4', true);
    doc.html(collectBookingsRef.current, {
      async callback(doc) {
        await doc.save(`collect-bookings`);
      },
      margin: [25, 0, 25, 0],
    });
  };

  return (
    <div className={styles['main-container']}>
      <Title level={1} style={{ fontSize: 25 }}>
        Collect Bookings
      </Title>
      <Form
        form={form}
        initialValues={{ dateRange: [dayjs(), dayjs()] }}
        onValuesChange={(_, __) => debounceSearch()}
        onFinish={fetchCollectTripBookings}
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

        {tripOptions && (
          <div style={{ margin: 10, marginBottom: 20 }}>
            <Checkbox onChange={onCheckAllChange} checked={checkAll}>
              Check all
            </Checkbox>
            <Divider />
            <Checkbox.Group value={checkedList} onChange={onChange}>
              <Row gutter={[64, 24]}>
                {tripOptions.map((option) => {
                  return (
                    <Col xs={24} md={12} lg={8} xxl={6}>
                      <Checkbox value={option.value}>{option.label}</Checkbox>
                    </Col>
                  );
                })}
              </Row>
            </Checkbox.Group>
          </div>
        )}

        <div className={styles['buttons']}>
          <Button
            htmlType='submit'
            disabled={searchQuery === undefined || checkedList.length === 0}
            loading={data === undefined}
          >
            <FilePdfTwoTone /> Build Report
          </Button>
          <Button
            type='primary'
            disabled={!buildReportClicked}
            loading={isFetchingData}
            onClick={handleDownloadCollectBookings}
          >
            <DownloadOutlined /> Download
          </Button>
        </div>
      </Form>

      <div style={{ display: 'none' }}>
        {data && shippingLine && (
          <CollectTripBookings
            data={data}
            shippingLine={shippingLine}
            ref={collectBookingsRef}
          />
        )}
      </div>
    </div>
  );
}
