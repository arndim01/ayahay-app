import { REPORTING_API } from '@ayahay/constants';
import {
  TripReport,
  TripManifest,
  PortsByShip,
  PerVesselReport,
  DashboardTrips,
  PaginatedRequest,
  PaginatedResponse,
  VoidBookings,
  CollectTripBooking,
  TripSearchByDateRange,
  SalesPerTellerReport,
  BillOfLading
} from '@ayahay/http';
import axios from '@ayahay/services/axios';
import { getPort, getPorts } from '@ayahay/services/port.service';
import { getShip, getShips } from '@ayahay/services/ship.service';
import { isEmpty } from 'lodash';

export async function getTripsReporting(tripId: number): Promise<TripReport> {
  const { data } = await axios.get(
    `${REPORTING_API}/trips/${tripId}/reporting`
  );
  return data;
}

export async function getPortsByShip(
  startDate: string,
  endDate: string
): Promise<PortsByShip[] | undefined> {
  const { data } = await axios.get<PortsByShip[]>(`${REPORTING_API}/ports`, {
    params: { startDate, endDate },
  });

  await fetchAssociatedEntitiesForReports(data);
  return data;
}

export async function getTripsByShip({
  shipId,
  srcPortId,
  destPortId,
  startDate,
  endDate,
}: PortsByShip): Promise<PerVesselReport[] | undefined> {
  try {
    const { data } = await axios.get(`${REPORTING_API}/trips/ships`, {
      params: { shipId, srcPortId, destPortId, startDate, endDate },
    });
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getTripManifest(
  tripId: number,
  onboarded: string
): Promise<TripManifest | undefined> {
  const { data } = await axios.get(
    `${REPORTING_API}/trips/${tripId}/manifest?onboarded=${onboarded}`
  );
  return data;
}

export async function getVoidBookingTripPassengers(
  tripId: number,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<VoidBookings> | undefined> {
  const query = new URLSearchParams(pagination as any).toString();

  try {
    const { data } = await axios.get<PaginatedResponse<VoidBookings>>(
      `${REPORTING_API}/trips/${tripId}/void/booking/passenger?${query}`
    );
    return data;
  } catch (e) {
    console.error(e);
  }
}

export async function getVoidBookingTripVehicles(
  tripId: number,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<VoidBookings> | undefined> {
  const query = new URLSearchParams(pagination as any).toString();

  try {
    const { data } = await axios.get<PaginatedResponse<VoidBookings>>(
      `${REPORTING_API}/trips/${tripId}/void/booking/vehicle?${query}`
    );
    return data;
  } catch (e) {
    console.error(e);
  }
}

export async function getCollectTripBookings(
  tripIds: string[]
): Promise<CollectTripBooking[] | undefined> {
  const tripIdsArray: string[] = [];
  tripIds.forEach((tripId) => tripIdsArray.push(...tripId.split(',')));

  const tripIdQuery = new URLSearchParams();
  tripIdsArray.forEach((tripId) => tripIdQuery.append('tripIds', tripId));

  try {
    const { data } = await axios.get<CollectTripBooking[]>(
      `${REPORTING_API}/trip/booking/collect?${tripIdQuery.toString()}`
    );
    return data;
  } catch (e) {
    console.error(e);
  }
}

export async function getSalesPerTeller(
  dates: TripSearchByDateRange | undefined
): Promise<SalesPerTellerReport | undefined> {
  if (isEmpty(dates)) {
    return;
  }

  try {
    const { data } = await axios.get(`${REPORTING_API}/sales-per-teller`, {
      params: { ...dates },
    });
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export function computeExpenses(disbursements: any[] | undefined) {
  if (disbursements === undefined) {
    return 0;
  }

  let expenses: any = {};
  disbursements.forEach(({ amount, description }) => {
    if (expenses.hasOwnProperty(description)) {
      expenses[description] += amount;
    } else {
      expenses[description] = amount;
    }
  });

  return expenses;
}

export async function fetchAssociatedEntitiesForReports(
  data: DashboardTrips[] | PortsByShip[]
): Promise<void> {
  // this ensures all ports and shipping lines are cached before a getById is called
  // without this, the parallel call to getById will all fetch getAll at the same time for N times
  await Promise.allSettled([getPorts(), getShips()]);
  await Promise.all(data.map((d) => fetchAssociatedEntitiesForReport(d)));
}

export async function fetchAssociatedEntitiesForReport(
  data: DashboardTrips | PortsByShip
): Promise<void> {
  const [srcPort, destPort, ship] = await Promise.allSettled([
    getPort(data.srcPortId),
    getPort(data.destPortId),
    getShip(data.shipId),
  ]);
  data.srcPort = srcPort.status === 'fulfilled' ? srcPort.value : undefined;
  data.destPort = destPort.status === 'fulfilled' ? destPort.value : undefined;
  data.ship = ship.status === 'fulfilled' ? ship.value : undefined;
}

export function roundToTwoDecimalPlacesAndAddCommas(amount: number): string {
  return (Math.round(amount * 100) / 100)
    .toFixed(2)
    .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
}

export async function getBillOfLading(
  bookingId: string
): Promise<BillOfLading | undefined> {
  try {
    const { data } = await axios.get(`${REPORTING_API}/${bookingId}/bol`);
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function updateBookingFRR(
  bookingId: string,
  frr: string
): Promise<void> {
  try {
    await axios.patch(`${REPORTING_API}/${bookingId}/bol/frr`, frr);
  } catch (e) {
    console.error(e);
  }
}
