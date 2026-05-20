import { IPassenger } from '@ayahay/models';
import dayjs from 'dayjs';

// antd form doesn't accept ISO date strings as valid dates, so we have to manually set it
export function toPassengerFormValue(tripId: number, passenger: IPassenger) {
  const { birthdayIso, ...otherPassengerProperties } = passenger;
  return {
    tripId,
    passengerId: passenger.id,
    passenger: {
      birthdayIso: dayjs(birthdayIso),
      ...otherPassengerProperties,
    },
  };
}

export function getInitialPassengerFormValue(
  tripId: number,
  passengerId: number
) {
  return {
    tripId,
    passengerId,
    passenger: { id: passengerId },
  };
}

export function getInitialVehicleFormValue(tripId: number, vehicleId: number) {
  return { tripId, vehicleId, vehicle: { id: vehicleId } };
}
