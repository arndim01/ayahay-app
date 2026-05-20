import { Descriptions, Skeleton, Grid } from 'antd';
import { ITrip } from '@ayahay/models';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

interface TripSummaryProps {
  trip?: ITrip;
  showSlots?: boolean;
}

const { useBreakpoint } = Grid;

export default function TripSummary({ trip, showSlots }: TripSummaryProps) {
  const screens = useBreakpoint();
  return (
    <Skeleton loading={trip === undefined} active>
      {trip && (
        <Descriptions
          bordered={screens.sm}
          column={{ xxl: 1, xl: 1, lg: 2, md: 2, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label='Origin Port'>
            {trip.srcPort?.name}
          </Descriptions.Item>
          <Descriptions.Item label='Destination Port'>
            {trip.destPort?.name}
          </Descriptions.Item>
          <Descriptions.Item label='Departure Date'>
            {dayjs(trip.departureDateIso)
              .tz('Asia/Shanghai')
              .format('MMM D, YYYY [at] h:mm A')}
          </Descriptions.Item>
          <Descriptions.Item label='Shipping Line'>
            {trip.shippingLine?.name}
          </Descriptions.Item>
          {showSlots && (
            <>
              <Descriptions.Item label='Passenger Slots'>
                {trip.availableCabins
                  .map((tripCabin) => tripCabin.availablePassengerCapacity)
                  .reduce((capacityA, capacityB) => capacityA + capacityB, 0)}
              </Descriptions.Item>
              <Descriptions.Item label='Vehicle Slots'>
                {trip.availableVehicleCapacity}
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      )}
    </Skeleton>
  );
}
