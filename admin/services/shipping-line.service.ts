import {
  IShippingLineSchedule,
  ITravelAgency,
  ITrip,
  IVoyage,
  IPort,
  IShippingLine,
} from '@ayahay/models';
import axios from '@ayahay/services/axios';
import { SHIPPING_LINE_API } from '@ayahay/constants';
import { PaginatedRequest, PaginatedResponse } from '@ayahay/http';

export async function getShippingLines(): Promise<IShippingLine[] | undefined> {
  try {
    const { data } = await axios.get(SHIPPING_LINE_API);
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getSchedulesOfShippingLine(
  shippingLineId: number
): Promise<IShippingLineSchedule[] | undefined> {
  try {
    const { data } = await axios.get(
      `${SHIPPING_LINE_API}/${shippingLineId}/schedules`
    );
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getPortsByShippingLine(
  shippingLineId: number
): Promise<IPort[] | undefined> {
  try {
    console.log('getPortsByShippingLine called with:', { shippingLineId });

    const { data } = await axios.get(
      `${SHIPPING_LINE_API}/${shippingLineId}/ports`
    );

    console.log('Shipping line ports received:', {
      count: data.length,
      samplePorts: data.slice(0, 3).map((p: IPort) => p.name),
    });

    return data;
  } catch (e) {
    console.error('Error fetching ports for shipping line:', e);
    return undefined;
  }
}

export async function getPartnerTravelAgenciesOfShippingLine(
  shippingLineId: number,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<ITravelAgency> | undefined> {
  try {
    const { data: travelAgencies } = await axios.get<
      PaginatedResponse<ITravelAgency>
    >(`${SHIPPING_LINE_API}/${shippingLineId}/travel-agencies`);

    return travelAgencies;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
