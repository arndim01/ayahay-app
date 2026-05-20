'use client';
import { getTime } from '@/services/search.service';
import { ITrip } from '@ayahay/models';
import { mockTrips } from '@ayahay/mocks';
import { Button } from 'antd';
import { find, join, split } from 'lodash';
import React, { useEffect, useState } from 'react';
import Seats from './seats';
import styles from './page.module.scss';
import PieChart from '@/components/charts/PieChart';
import TripBookings from './tripBookings';
import { useSearchParams } from 'next/navigation';

const data = {
  labels: ['Red', 'Blue', 'Yellow'],
  datasets: [
    {
      label: 'My First Dataset',
      data: [300, 50, 100],
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)',
      ],
      hoverOffset: 4,
    },
  ],
};

export default function Details() {
  const searchParams = useSearchParams();
  const [tripData, setTripData] = useState({} as ITrip);
  const [seatMapBtnClicked, setSeatMapBtnClicked] = useState(false);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    const fetchTrip = find(mockTrips, { id: Number(params.tripId) })!;
    // const fetchBookings = getAllBookingsOfTrip(fetchTrip?.id);
    // console.log(fetchBookings);

    // const filteredBookings = filter(fetchBookings, { fetchTrip });
    // console.log(filteredBookings);

    setTripData(fetchTrip);
  }, []);

  return (
    <div>
      <div>
        <h3>Trip Info:</h3>
        {tripData && (
          <div>
            <strong>Source:</strong> {tripData.srcPort?.name}
            <br></br>
            <strong>Destination:</strong> {tripData.destPort?.name}
            <br></br>
            <strong>Departure Date & Time:</strong>{' '}
            {split(tripData.departureDateIso, 'T')[0]}{' '}
            {getTime(tripData.departureDateIso)}
            <br></br>
            <strong>Trip Type:</strong> {tripData.type}
            <br></br>
            <strong>Seats Types:</strong>{' '}
            {join(tripData.availableSeatTypes, ', ')}
            <br></br>
            <strong>Cabin Types:</strong> {join(tripData.availableCabins, ', ')}
            <br></br>
            <strong>Meals:</strong> {join(tripData.meals, ', ')}
            <br></br>
            <strong>Base:</strong> {tripData.baseFare}
          </div>
        )}
      </div>
      <div>
        <h3>Booking Info:</h3>
        <TripBookings tripId={tripData.id} />
      </div>
      <div className={styles.chart}>
        <PieChart data={data} />
      </div>
      <Button
        type='primary'
        size='large'
        onClick={() => setSeatMapBtnClicked(true)}
      >
        Seat Map
      </Button>
      {seatMapBtnClicked && (
        <Seats
          shipId={tripData.ship.id}
          cabinType={tripData.ship.cabins[0].type}
          floor={tripData.ship.cabins[0].name}
        />
      )}
    </div>
  );
}
