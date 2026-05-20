import { VEHICLE_TYPES_API } from '@ayahay/constants';
import { IVehicleType } from '@ayahay/models';
import axios from './axios';
import { cacheItem, fetchItem } from './cache.service';

export async function getVehicleTypes(): Promise<IVehicleType[] | undefined> {
  const cachedVehicleTypes = fetchItem<IVehicleType[]>('vehicle-types');
  if (cachedVehicleTypes !== undefined) {
    return cachedVehicleTypes;
  }

  try {
    const { data } = await axios.get(`${VEHICLE_TYPES_API}`);
    cacheItem('vehicle-types', data);
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getVehicleType(
  vehicleTypeId: number
): Promise<IVehicleType | undefined> {
  const vehicleTypes = await getVehicleTypes();
  return vehicleTypes?.find((vehicleType) => vehicleType.id === vehicleTypeId);
}
