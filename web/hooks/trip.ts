import useSWR from 'swr';
import { getTrips } from '@ayahay/services/trip.service';
import { useSearchParams } from 'next/navigation';

export function useTripFromSearchParams() {
  const searchParams = useSearchParams();
  const tripIds = searchParams.getAll('tripId').map((tripId) => +tripId);

  const { data, error, isLoading } = useSWR(
    { tripIds: tripIds },
    ({ tripIds }) => getTrips(tripIds)
  );
  return {
    tripIds: tripIds,
    trips: data,
    isLoading,
    error: error,
  };
}
