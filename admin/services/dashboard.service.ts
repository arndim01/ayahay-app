import { DashboardTrips } from '@ayahay/http';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);

export function buildPaxAndVehicleBookedData(tripData: DashboardTrips[]) {
  if (!tripData || tripData.length === 0) {
    return;
  }

  const labels: string[] = [];
  const paxBooked: number[] = [];
  const vehicleBooked: number[] = [];
  const paxOnboarded: number[] = [];
  const vehicleOnboarded: number[] = [];

  tripData.forEach((trip) => {
    labels.push(
      `${trip.srcPort?.code}-${trip.destPort?.code} ${dayjs(
        trip.departureDateIso
      )
        .tz('Asia/Shanghai')
        .format('MM/DD/YYYY h:mm A')} (${trip.ship?.name})`
    );
    paxBooked.push(trip.passengerCapacities - trip.availableCapacities);
    vehicleBooked.push(trip.vehicleCapacity - trip.availableVehicleCapacity);
    paxOnboarded.push(trip.checkedInPassengerCount ?? 0);
    vehicleOnboarded.push(trip.checkedInVehicleCount ?? 0);
  });

  return {
    labels,
    datasets: [
      {
        label: 'Passenger Booked',
        data: paxBooked,
        borderWidth: 2,
        stack: 'Stack 0',
        backgroundColor: 'rgb(137, 196, 244, 0.4)',
        borderColor: 'rgb(137, 196, 244)',
      },
      {
        label: 'Passenger Onboarded',
        data: paxOnboarded,
        borderWidth: 2,
        stack: 'Stack 0',
        backgroundColor: 'rgb(137, 196, 244)',
      },
      {
        label: 'Vehicle Booked',
        data: vehicleBooked,
        borderWidth: 2,
        stack: 'Stack 1',
        backgroundColor: 'rgb(236, 100, 75, 0.4)',
        borderColor: 'rgb(236, 100, 75)',
      },
      {
        label: 'Vehicle Onboarded',
        data: vehicleOnboarded,
        borderWidth: 2,
        stack: 'Stack 1',
        backgroundColor: 'rgb(236, 100, 75)',
      },
    ],
  };
}
