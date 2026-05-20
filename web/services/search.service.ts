import { FormInstance } from 'antd';
import { TripsSearchQuery } from '@ayahay/http';
import dayjs from 'dayjs';
import {
  DEFAULT_NUM_PASSENGERS,
  DEFAULT_NUM_VEHICLES,
  DEFAULT_BOOKING_TYPE,
} from '@ayahay/constants/default';

const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone'); // dependent on utc plugin

dayjs.extend(utc);
dayjs.extend(timezone);

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
