import useSWR from 'swr';
import { getTripsByShip } from '@/services/reporting.service';

export function useShipReportingFromSearchParams(params: any) {
  const { data, error, isLoading } = useSWR(
    {
      shipId: +params.shipId,
      srcPortId: +params.srcPortId,
      destPortId: +params.destPortId,
      startDate: params.startDate,
      endDate: params.endDate,
    },
    (args) => getTripsByShip(args)
  );

  return {
    data,
    isLoading,
    error: error,
  };
}
