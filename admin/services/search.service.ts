import { FormInstance } from 'antd';
import {
  DashboardTrips,
  PaginatedRequest,
  PaginatedResponse,
  PortsAndDateRangeSearch,
  TripSearchByDateRange,
  TripsSearchQuery
} from '@ayahay/http';
import axios from '@ayahay/services/axios';
import { SEARCH_API } from '@ayahay/constants';
import {
  DEFAULT_NUM_PASSENGERS,
  DEFAULT_NUM_VEHICLES,
  DEFAULT_BOOKING_TYPE,
} from '@ayahay/constants/default';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import { fetchAssociatedEntitiesForReports } from './reporting.service';

export function initializeRangePickerFormFromQueryParams(
  form: FormInstance,
  params: { [p: string]: string }
) {
  const startDate = !isEmpty(params)
    ? dayjs(params.startDate)
    : dayjs().startOf('day');
  const endDate = !isEmpty(params)
    ? dayjs(params.endDate)
    : dayjs().endOf('day');

  form.setFieldsValue({
    dateRange: [startDate, endDate],
  });
}

export function initializePortsAndDateRangeFromQueryParams(
  form: FormInstance,
  params: { [p: string]: string }
): void {
  const startDate = !isEmpty(params)
    ? dayjs(params.startDate)
    : dayjs().startOf('day');
  const endDate = !isEmpty(params)
    ? dayjs(params.endDate)
    : dayjs().endOf('day');

  form.setFieldsValue({
    dateRange: [startDate, endDate],
    srcPortId: params.srcPortId ? +params.srcPortId : undefined,
    destPortId: params.destPortId ? +params.destPortId : undefined,
  });
}

export function initializeSearchFormFromQueryParams(
  form: FormInstance,
  params: { [p: string]: string }
) {
  form.setFieldsValue({
    bookingType: params.bookingType ?? DEFAULT_BOOKING_TYPE,
    srcPortId: params.srcPortId ? +params.srcPortId : undefined,
    destPortId: params.destPortId ? +params.destPortId : undefined,
    passengerCount: params.passengerCount
      ? +params.passengerCount
      : DEFAULT_NUM_PASSENGERS,
    vehicleCount: params.vehicleCount
      ? +params.vehicleCount
      : DEFAULT_NUM_VEHICLES,
    departureDate: dayjs(params.departureDate),
    returnDate: params.returnDate
      ? dayjs(params.returnDate)
      : dayjs(params.departureDate),
    shippingLineIds: params.shippingLineIds
      ?.split(',')
      .map((idString) => +idString),
    cabinTypes: params.cabinTypes?.split(','),
    sort: params.sort ?? 'departureDate',
  });
}

export function buildUrlQueryParamsFromRangePickerForm(
  form: FormInstance
): string | undefined {
  if (form.getFieldValue('dateRange') === null) {
    return;
  }

  const searchQuery: Record<string, string> = {
    startDate: form.getFieldValue('dateRange')[0].startOf('day').toISOString(),
    endDate: form.getFieldValue('dateRange')[1].endOf('day').toISOString(),
  };

  return new URLSearchParams(searchQuery).toString();
}

export function buildUrlQueryParamsFromPortsAndDateRange(
  form: FormInstance
): string | undefined {
  if (form.getFieldValue('dateRange') === null) {
    return;
  }

  const searchQuery: Record<string, string> = {
    startDate: form.getFieldValue('dateRange')[0].startOf('day').toISOString(),
    endDate: form.getFieldValue('dateRange')[1].endOf('day').toISOString(),
    srcPortId: form.getFieldValue('srcPortId')?.toString(),
    destPortId: form.getFieldValue('destPortId')?.toString(),
  };

  Object.keys(searchQuery).forEach((key) => {
    if (searchQuery[key] === undefined) {
      delete searchQuery[key];
    }
  });

  return new URLSearchParams(searchQuery).toString();
}

export function buildSearchQueryFromRangePickerForm(
  form: FormInstance
): TripSearchByDateRange | undefined {
  if (form.getFieldValue('dateRange') === null) {
    return;
  }

  const searchQuery: TripSearchByDateRange = {
    startDate: form.getFieldValue('dateRange')[0].startOf('day').toISOString(),
    endDate: form.getFieldValue('dateRange')[1].endOf('day').toISOString(),
  };

  return searchQuery;
}

export function buildSearchQueryFromPortsAndDateRange(
  form: FormInstance
): PortsAndDateRangeSearch | undefined {
  if (form.getFieldValue('dateRange') === null) {
    return;
  }

  const searchQuery: any = {
    startDate: form.getFieldValue('dateRange')[0].startOf('day').toISOString(),
    endDate: form.getFieldValue('dateRange')[1].endOf('day').toISOString(),
    srcPortId: form.getFieldValue('srcPortId'),
    destPortId: form.getFieldValue('destPortId'),
  };

  return searchQuery;
}

export function getTime(date: string) {
  return new Date(date).toLocaleTimeString('en-US');
}

// Get Trip Information is for the Admin Dashboard
export async function getDashboardTrips(
  shippingLineId: number | undefined,
  searchQuery: PortsAndDateRangeSearch | undefined,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<DashboardTrips> | undefined> {
  if (isEmpty(searchQuery) || shippingLineId === undefined) {
    return;
  }

  const query = new URLSearchParams({
    shippingLineId,
    ...searchQuery,
    ...pagination,
  } as any).toString();

  try {
    const { data: dashboardTrips } = await axios.get<
      PaginatedResponse<DashboardTrips>
    >(`${SEARCH_API}/dashboard?${query}`);

    await fetchAssociatedEntitiesForReports(dashboardTrips.data);
    return dashboardTrips;
  } catch (e) {
    console.error(e);
  }
}

export function buildUrlQueryParamsFromSearchForm(form: FormInstance): string {
  const searchQuery: Record<string, string> = {
    bookingType: form.getFieldValue('bookingType'),
    srcPortId: form.getFieldValue('srcPortId')?.toString(),
    destPortId: form.getFieldValue('destPortId')?.toString(),
    departureDate: form
      .getFieldValue('departureDate')
      .tz('Asia/Shanghai')
      .startOf('date')
      .toISOString(),
    passengerCount: form.getFieldValue('passengerCount')?.toString(),
    vehicleCount: form.getFieldValue('vehicleCount')?.toString(),
    shippingLineIds: form.getFieldValue('shippingLineIds')?.toString(),
    cabinTypes: form.getFieldValue('cabinTypes')?.toString(),
    sort: form.getFieldValue('sort'),
  };

  if (searchQuery.bookingType === 'Round') {
    searchQuery.returnDate = form
      .getFieldValue('returnDate')
      .tz('Asia/Shanghai')
      .startOf('date')
      .toISOString();
  }

  Object.keys(searchQuery).forEach((key) => {
    if (searchQuery[key] === undefined) {
      delete searchQuery[key];
    }
  });

  return new URLSearchParams(searchQuery).toString();
}

export function buildSearchQueryFromSearchForm(
  form: FormInstance
): TripsSearchQuery {
  const searchQuery: TripsSearchQuery = {
    bookingType: form.getFieldValue('bookingType'),
    srcPortId: form.getFieldValue('srcPortId'),
    destPortId: form.getFieldValue('destPortId'),
    departureDate: form
      .getFieldValue('departureDate')
      .tz('Asia/Shanghai')
      .startOf('date')
      .toISOString(),
    passengerCount: form.getFieldValue('passengerCount'),
    vehicleCount: form.getFieldValue('vehicleCount'),
    shippingLineIds: form.getFieldValue('shippingLineIds'),
    cabinTypes: form.getFieldValue('cabinTypes'),
    sort: form.getFieldValue('sort'),
  };

  if (searchQuery.bookingType === 'Round') {
    searchQuery.returnDateIso = form
      .getFieldValue('returnDate')
      .tz('Asia/Shanghai')
      .startOf('date')
      .toISOString();
  }

  return searchQuery;
}

export function buildReturnTripQueryFromFirstQuery(
  firstQuery: TripsSearchQuery
) {
  const returnTripQuery = { ...firstQuery };
  returnTripQuery.srcPortId = firstQuery.destPortId;
  returnTripQuery.destPortId = firstQuery.srcPortId;
  returnTripQuery.departureDate = returnTripQuery.returnDateIso ?? '';

  return returnTripQuery;
}