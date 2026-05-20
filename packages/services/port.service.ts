import { PORTS_API, SHIPPING_LINE_API, TRIP_API } from '@ayahay/constants';
import { IPort } from '@ayahay/models';
import axios from './axios';
import { cacheItem, fetchItem } from './cache.service';

export async function getPorts(
  shippingLineId?: number
): Promise<IPort[] | undefined> {
  // Use the standard 'ports' cache key
  // If a shipping line ID is provided, we'll bypass cache to ensure fresh data
  console.log('getPorts called with shippingLineId:', shippingLineId);

  if (!shippingLineId) {
    const cachedPorts = fetchItem<IPort[]>('ports');
    if (cachedPorts !== undefined) {
      console.log('Using cached ports:', { count: cachedPorts.length });
      return cachedPorts;
    }
  }

  // If white label, only get the ports of the specific shipping line
  const whiteLabel = process.env.NEXT_PUBLIC_SHIPPING_LINE_ID;
  try {
    let ports;
    let apiUrl = '';

    // Priority order:
    // 1. Use passed shippingLineId if available (logged in user's)
    // 2. Use white label shipping line ID if defined
    // 3. Otherwise get all ports

    if (shippingLineId) {
      apiUrl = `${SHIPPING_LINE_API}/${shippingLineId}/ports`;
      console.log('Fetching ports for user shipping line:', {
        shippingLineId,
        apiUrl,
      });
      const { data } = await axios.get(apiUrl);
      ports = data;

      // If shipping line ports are empty, fall back to all ports
      if (!ports || ports.length === 0) {
        console.log(
          'No ports found for shipping line, falling back to all ports'
        );
        apiUrl = PORTS_API;
        const { data } = await axios.get(apiUrl);
        ports = data;
      }
    } else if (whiteLabel !== undefined) {
      apiUrl = `${SHIPPING_LINE_API}/${whiteLabel}/ports`;
      console.log('Fetching ports for white label:', { whiteLabel, apiUrl });
      const { data } = await axios.get(apiUrl);
      ports = data;

      // If white label ports are empty, fall back to all ports
      if (!ports || ports.length === 0) {
        console.log(
          'No ports found for white label, falling back to all ports'
        );
        apiUrl = PORTS_API;
        const { data } = await axios.get(apiUrl);
        ports = data;
      }
    } else {
      apiUrl = PORTS_API;
      console.log('Fetching all ports:', { apiUrl });
      const { data } = await axios.get(apiUrl);
      ports = data;
      // Only cache the full list of ports
      cacheItem('ports', ports, 60 * 24 * 7);
    }

    console.log('Ports fetched:', { count: ports.length, source: apiUrl });
    return ports;
  } catch (e) {
    console.error('Error fetching ports:', e);

    // If there's an error fetching shipping line ports, fall back to all ports
    try {
      console.log('Error occurred, falling back to all ports');
      const { data } = await axios.get(PORTS_API);
      return data;
    } catch (fallbackError) {
      console.error('Fallback to all ports also failed:', fallbackError);
      return undefined;
    }
  }
}

export async function getPort(portId?: number): Promise<IPort | undefined> {
  if (!portId) return undefined;

  // Here we don't pass a shippingLineId because we want to search across all ports
  const ports = await getPorts();
  if (!ports) return undefined;

  return ports.find((port) => port.id === portId);
}

export async function getDestinationPorts(
  originPortId: number,
  shippingLineId?: number
): Promise<IPort[] | undefined> {
  if (!originPortId) return [];

  try {
    console.log('Fetching destination ports for:', {
      originPortId,
      shippingLineId,
      fetchingAllDestinations: !shippingLineId,
    });

    let url = `${TRIP_API}/destination-ports?portId=${originPortId}`;

    // Only include shippingLineId in URL if it's provided and not null
    if (shippingLineId) {
      url += `&shippingLineId=${shippingLineId}`;
      console.log(`Filtering destinations by shipping line: ${shippingLineId}`);
    } else {
      console.log(
        'No shipping line ID provided, fetching all possible destinations'
      );
    }

    const { data } = await axios.get(url);
    console.log('Destination ports received:', {
      count: data?.length || 0,
      portNames: data?.slice(0, 5).map((p: IPort) => p.name),
    });

    return data;
  } catch (e) {
    console.error('Error fetching destination ports:', e);
    return undefined;
  }
}

// Fetch available port pairs for a shipping line
export async function getPortPairsForShippingLine(
  shippingLineId: number
): Promise<{ originId: number; destinationId: number }[] | undefined> {
  if (!shippingLineId) return [];

  try {
    console.log('Fetching port pairs for shipping line:', { shippingLineId });

    // Use the shipping line schedules endpoint to get valid port pairs
    const { data } = await axios.get(
      `${SHIPPING_LINE_API}/${shippingLineId}/schedules`
    );

    if (!data || !Array.isArray(data)) {
      console.error('Invalid response format for shipping line schedules');
      return [];
    }

    // Extract unique port pairs from schedules
    const portPairs = data
      .filter((schedule) => schedule.srcPort && schedule.destPort)
      .map((schedule) => ({
        originId: schedule.srcPort.id,
        destinationId: schedule.destPort.id,
      }));

    // Remove duplicates
    const uniquePairs = Array.from(
      new Set(portPairs.map((pair) => JSON.stringify(pair)))
    ).map((pairStr) => JSON.parse(pairStr));

    console.log('Port pairs extracted:', {
      count: uniquePairs.length,
      samplePairs: uniquePairs.slice(0, 3),
    });

    return uniquePairs;
  } catch (e) {
    console.error('Error fetching port pairs:', e);
    return [];
  }
}
