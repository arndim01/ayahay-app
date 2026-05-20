'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Flex, Form, Typography, Tooltip, Tag } from 'antd';
import styles from './page.module.scss';
import { debounce } from 'lodash';
import {
  buildReturnTripQueryFromFirstQuery,
  buildSearchQueryFromSearchForm,
  buildUrlQueryParamsFromSearchForm,
  initializeSearchFormFromQueryParams,
} from '@/services/search.service';

import TripSearchQuery from '@/components/search/TripSearchQuery';
import TripSearchResults from '@ayahay/components/tables/TripSearchResults';
import { TripsSearchQuery } from '@ayahay/http';
import { useRouter, useSearchParams } from 'next/navigation';
import { IPort, ITrip } from '@ayahay/models';
import { getPort } from '@ayahay/services/port.service';
import { toPhilippinesTime } from '@ayahay/services/date.service';
import { isTripBookingCutOff } from '@ayahay/services/trip.service';
import dayjs from 'dayjs';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthGuard } from '@/hooks/auth';
const { Title } = Typography;

export default function Trips() {
  useAuthGuard([
    'ShippingLineStaff',
    'ShippingLineAdmin',
    'SuperAdmin',
    'TravelAgencyStaff',
    'TravelAgencyAdmin',
  ]);
  const { loggedInAccount } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const [srcPort, setSrcPort] = useState<IPort | undefined>();
  const [destPort, setDestPort] = useState<IPort | undefined>();

  const bookingType = Form.useWatch('bookingType', form);
  const passengerCount = Form.useWatch('passengerCount', form);
  const vehicleCount = Form.useWatch('vehicleCount', form);
  const srcPortId = Form.useWatch('srcPortId', form);
  const destPortId = Form.useWatch('destPortId', form);

  const [selectedTrips, setSelectedTrips] = useState<ITrip[]>([{} as any]);
  const [searchQueries, setSearchQueries] = useState<TripsSearchQuery[]>([
    {} as TripsSearchQuery,
  ]);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number>(0);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // Check if the user role can bypass booking cut-off
  const canBypassCutOff = () => {
    const bypassRoles = [
      'SuperAdmin',
      'ShippingLineAdmin',
      'ShippingLineStaff',
    ];
    return bypassRoles.includes(loggedInAccount?.role);
  };

  // Check if booking cutoff date has passed, respecting role-based permissions
  const isBookingCutOff = (trip: ITrip): boolean => {
    if (!trip || !trip.id) return false;
    if (canBypassCutOff()) {
      return false; // Bypass roles are not restricted by cutoff dates
    }
    return trip.bookingCutOffDateIso
      ? dayjs().isAfter(dayjs(trip.bookingCutOffDateIso))
      : false;
  };

  // Check if any selected trip has a passed cutoff date
  const hasAnyCutOffTrip = (): boolean => {
    return selectedTrips.some((trip) => isBookingCutOff(trip));
  };

  const onPageLoad = () => {
    const params = Object.fromEntries(searchParams.entries());
    initializeSearchFormFromQueryParams(form, params);
    debounceSearch();
  };

  useEffect(onPageLoad, []);

  useEffect(() => {
    setSelectedTrips([{} as any]);
    setActiveSearchIndex(0);
  }, [loggedInAccount]);

  useEffect(() => {
    validateSelectedTrips();
  }, [selectedTrips]);

  useEffect(() => {
    fetchSrcPort();
  }, [srcPortId]);

  useEffect(() => {
    fetchDestPort();
  }, [destPortId]);

  /*
    these form items can be updated thru form.setFieldValue, so Form.onValueChange does not
    fire when they are updated. as a workaround, we watch the items manually for form changes
    and use it as dependency in useEffect
   */
  useEffect(() => debounceSearch(), [passengerCount, vehicleCount]);

  const fetchSrcPort = async () => {
    setSrcPort(await getPort(srcPortId));
  };

  const fetchDestPort = async () => {
    setDestPort(await getPort(destPortId));
  };

  const debounceSearch = useCallback(debounce(buildSearchQueries, 300), []);

  function buildSearchQueries() {
    const query = buildSearchQueryFromSearchForm(form);
    const returnTripQuery = buildReturnTripQueryFromFirstQuery(query);
    if (returnTripQuery === undefined) {
      setSearchQueries([query]);
    } else {
      setSearchQueries([query, returnTripQuery]);
    }
    setSelectedTrips([{} as any]);
    setActiveSearchIndex(0);
    updateUrl();
  }

  const updateUrl = () => {
    const updatedQueryParams = buildUrlQueryParamsFromSearchForm(form);
    const updatedUrl = `${window.location.origin}${window.location.pathname}?${updatedQueryParams}`;
    window.history.replaceState({ path: updatedUrl }, '', updatedUrl);
  };

  const selectTrip = (index: number, trip: ITrip) => {
    if (bookingType === 'Single') {
      // Don't allow booking if cut-off date has passed
      if (isBookingCutOff(trip)) {
        // Display error message or alert for single trips
        setErrorMessages([
          'Booking is no longer available as the cut-off date has passed.',
        ]);
        return;
      }
      redirectToBookingPage([trip.id]);
      return;
    }
    const trips = [...selectedTrips];
    if (index === selectedTrips.length) {
      trips.push(trip);
    } else {
      trips[index] = trip;
    }
    setSelectedTrips(trips);

    if (activeSearchIndex === 0) {
      setActiveSearchIndex(1);
    }
  };

  const validateSelectedTrips = () => {
    const errors = [];
    const tripShippingLines = new Set(
      selectedTrips.map((trip) => trip.shippingLineId)
    );
    if (tripShippingLines.size !== 1) {
      errors.push('All trips must be from the same shipping line.');
    }
    for (let i = 1; i < selectedTrips.length; i++) {
      const previousTrip = selectedTrips[i - 1];
      const currentTrip = selectedTrips[i];
      if (
        dayjs(currentTrip.departureDateIso).isBefore(
          previousTrip.departureDateIso
        )
      ) {
        errors.push(
          `The ${currentTrip.srcPort?.name} -> ${currentTrip.destPort?.name} trip must depart before the ${previousTrip.srcPort?.name} -> ${previousTrip.destPort?.name} trip.`
        );
        break;
      }
    }
    setErrorMessages(errors);
  };

  const confirmRoundTripSchedule = () => {
    const tripIds = selectedTrips.map((trip) => trip.id);
    redirectToBookingPage(tripIds);
  };

  const redirectToBookingPage = (tripIds: number[]) => {
    const tripIdsQuery = tripIds.map((tripId) => `tripId=${tripId}`).join('&');
    router.push(`/bookings/create?${tripIdsQuery}`);
  };

  const scheduleCardClass = (scheduleIndex: number) => {
    if (scheduleIndex === activeSearchIndex) {
      return `${styles['flight-schedule-card']} ${styles['selected']}`;
    }
    return styles['flight-schedule-card'];
  };

  // Generate tooltip text based on the status of selected trips
  const getBookingButtonTooltip = (): string | null => {
    if (hasAnyCutOffTrip()) {
      if (canBypassCutOff()) {
        return 'You can bypass the booking cut-off date restrictions';
      }
      return 'Booking has been cut off for one or more selected trips';
    }
    return null;
  };

  // Render cut-off date information for single trip
  const renderSingleTripCutoffInfo = (trip: ITrip) => {
    if (!trip || !trip.id || !trip.bookingCutOffDateIso) return null;

    return (
      <div
        style={{
          marginTop: '10px',
          padding: '8px 12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
        }}
      >
        <p style={{ fontSize: '14px', color: '#666', margin: '0 0 4px 0' }}>
          <strong>Booking Cut-off Date:</strong>
        </p>
        <p
          style={{
            fontSize: '14px',
            margin: '0',
            color: isBookingCutOff(trip) ? '#f5222d' : '#666',
          }}
        >
          {toPhilippinesTime(
            trip.bookingCutOffDateIso,
            'MMMM D, YYYY [at] h:mm A'
          )}
          {isBookingCutOff(trip) && ' (Expired)'}
        </p>
      </div>
    );
  };

  return (
    <Form
      form={form}
      onValuesChange={(_, __) => debounceSearch()}
      onFinish={(_) => debounceSearch()}
    >
      <div className={styles['query-container']}>
        <TripSearchQuery />
      </div>
      <div className={styles['main-container']}>
        {/*<div className={styles['left-container']}>*/}
        {/*  <div className={styles['left-card']}>*/}
        {/*    /!* <div className={styles['cabin-card']}>*/}
        {/*      <CabinFilter name='cabinTypes' label='Cabin Types' />*/}
        {/*    </div> *!/*/}
        {/*    <div className={styles['shipping-card']}>*/}
        {/*      <ShippingLineFilter*/}
        {/*        name='shippingLineIds'*/}
        {/*        label='Shipping Lines'*/}
        {/*      />*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}
        <div className={styles['right-container']}>
          <div className={styles['sort-container']}>
            {/*<div className={styles['sort-card']}>*/}
            {/*  <TripSortOptions name='sort' label='Sort By' />*/}
            {/*</div>*/}
          </div>
          {bookingType === 'Round' && (
            <div style={{ marginBottom: '32px' }}>
              <Title level={2} style={{ fontSize: '24px' }}>
                Round Trip Schedule
              </Title>
              <Flex gap='large' align='center'>
                <Card
                  onClick={() => setActiveSearchIndex(0)}
                  className={scheduleCardClass(0)}
                >
                  <Title
                    level={3}
                    style={{ fontSize: '18px', marginBottom: '0' }}
                  >
                    {srcPort?.name} -&gt; {destPort?.name}
                  </Title>
                  {selectedTrips[0]?.id && (
                    <div>
                      {toPhilippinesTime(
                        selectedTrips[0].departureDateIso,
                        'MMMM D, YYYY [at] h:mm A'
                      )}
                      {isBookingCutOff(selectedTrips[0]) && (
                        <Tag color='red' style={{ marginLeft: '8px' }}>
                          Booking Cut Off
                        </Tag>
                      )}
                    </div>
                  )}
                  {!selectedTrips[0]?.id && <p>No trip selected</p>}
                </Card>
                <Card
                  onClick={() => setActiveSearchIndex(1)}
                  className={scheduleCardClass(1)}
                >
                  <Title
                    level={3}
                    style={{ fontSize: '18px', marginBottom: '0' }}
                  >
                    {destPort?.name} -&gt; {srcPort?.name}
                  </Title>
                  {selectedTrips[1]?.id && (
                    <div>
                      {toPhilippinesTime(
                        selectedTrips[1].departureDateIso,
                        'MMMM D, YYYY [at] h:mm A'
                      )}
                      {isBookingCutOff(selectedTrips[1]) && (
                        <Tag color='red' style={{ marginLeft: '8px' }}>
                          Booking Cut Off
                        </Tag>
                      )}
                    </div>
                  )}
                  {!selectedTrips[1]?.id && <p>No trip selected</p>}
                </Card>
                <Tooltip title={getBookingButtonTooltip()}>
                  <div style={{ position: 'relative' }}>
                    <Button
                      type='primary'
                      size='large'
                      disabled={
                        errorMessages.length > 0 ||
                        selectedTrips.length !== 2 ||
                        selectedTrips.some((trip) => !trip.id) ||
                        (hasAnyCutOffTrip() && !canBypassCutOff())
                      }
                      onClick={() => confirmRoundTripSchedule()}
                      style={{
                        position: 'relative',
                        overflow: 'hidden',
                        minWidth: '120px',
                        fontWeight: 'bold',
                      }}
                    >
                      {hasAnyCutOffTrip() && !canBypassCutOff() && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                            background:
                              'repeating-linear-gradient(45deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)',
                            zIndex: 0,
                          }}
                        />
                      )}
                      <span style={{ position: 'relative', zIndex: 1 }}>
                        Book Now!
                      </span>
                    </Button>
                    {hasAnyCutOffTrip() && !canBypassCutOff() && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: 'red',
                          color: 'white',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          zIndex: 2,
                        }}
                      >
                        !
                      </div>
                    )}
                    {hasAnyCutOffTrip() && canBypassCutOff() && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: 'orange',
                          color: 'white',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          zIndex: 2,
                        }}
                      >
                        BP
                      </div>
                    )}
                  </div>
                </Tooltip>
              </Flex>
              <div style={{ marginTop: '8px' }}>
                {errorMessages.map((error, index) => (
                  <p style={{ color: 'red' }} key={index}>
                    {error}
                  </p>
                ))}
                {hasAnyCutOffTrip() && !canBypassCutOff() && (
                  <p style={{ color: 'red', fontWeight: 'bold' }}>
                    <span role='img' aria-label='warning'>
                      ⚠️
                    </span>{' '}
                    Booking is no longer available as the cut-off date has
                    passed.
                  </p>
                )}
                {hasAnyCutOffTrip() && canBypassCutOff() && (
                  <p style={{ color: 'orange', fontWeight: 'bold' }}>
                    <span role='img' aria-label='warning'>
                      ⚠️
                    </span>{' '}
                    You can bypass the booking cut-off date restrictions due to
                    your role.
                  </p>
                )}
                {/* Display booking cut-off dates */}
                {selectedTrips.filter((trip) => trip.id).length === 2 && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      <strong>Booking Cut-off Dates:</strong>
                    </p>
                    {selectedTrips[0]?.id && (
                      <p
                        style={{
                          fontSize: '14px',
                          margin: '2px 0',
                          color: isBookingCutOff(selectedTrips[0])
                            ? '#f5222d'
                            : '#666',
                        }}
                      >
                        {srcPort?.name} → {destPort?.name}:{' '}
                        {selectedTrips[0].bookingCutOffDateIso
                          ? toPhilippinesTime(
                              selectedTrips[0].bookingCutOffDateIso,
                              'MMMM D, YYYY [at] h:mm A'
                            )
                          : 'Not specified'}
                      </p>
                    )}
                    {selectedTrips[1]?.id && (
                      <p
                        style={{
                          fontSize: '14px',
                          margin: '2px 0',
                          color: isBookingCutOff(selectedTrips[1])
                            ? '#f5222d'
                            : '#666',
                        }}
                      >
                        {destPort?.name} → {srcPort?.name}:{' '}
                        {selectedTrips[1].bookingCutOffDateIso
                          ? toPhilippinesTime(
                              selectedTrips[1].bookingCutOffDateIso,
                              'MMMM D, YYYY [at] h:mm A'
                            )
                          : 'Not specified'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className={styles['results-card']}>
            <TripSearchResults
              searchQuery={searchQueries[activeSearchIndex]}
              selectedTrip={selectedTrips[activeSearchIndex]}
              onSelectTrip={(tripId) => selectTrip(activeSearchIndex, tripId)}
            />
            {/* Show cut-off info for single trip */}
            {bookingType === 'Single' &&
              selectedTrips[0]?.id &&
              renderSingleTripCutoffInfo(selectedTrips[0])}
          </div>
        </div>
      </div>
    </Form>
  );
}
