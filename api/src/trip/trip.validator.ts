import { Injectable } from '@nestjs/common';
import { ErrorDict, UpdateTripCapacityRequest } from '@ayahay/http';

@Injectable()
export class TripValidator {
  public validateUpdateTripCapacityRequest(
    trip: any,
    updateTripCapacityRequest: UpdateTripCapacityRequest
  ): ErrorDict | undefined {
    const errors: ErrorDict = {};

    const reservedVehicleCapacity =
      trip.vehicleCapacity - trip.availableVehicleCapacity;
    if (reservedVehicleCapacity > updateTripCapacityRequest.vehicleCapacity) {
      errors[
        'vehicleCapacity'
      ] = `There are ${reservedVehicleCapacity} vehicles reserved for this trip. The new vehicle capacity must be greater than or equal to this number.`;
    }

    // Note: We're no longer validating trip cabins as they're not used anymore
    // The validation below is kept for backwards compatibility with other APIs

    for (let i = 0; i < updateTripCapacityRequest.cabinCapacities.length; i++) {
      const { cabinId, passengerCapacity } =
        updateTripCapacityRequest.cabinCapacities[i];

      const tripCabin = trip.availableCabins?.find(
        (tripCabin) => tripCabin.cabinId === Number(cabinId)
      );

      if (tripCabin === undefined) {
        errors[`cabinCapacities[${i}].cabinId`] = 'The cabin does not exist.';
        continue;
      }

      const reservedPassengerCapacity =
        tripCabin.passengerCapacity - tripCabin.availablePassengerCapacity;
      if (reservedPassengerCapacity > passengerCapacity) {
        errors[
          `cabinCapacities[${i}].passengerCapacity`
        ] = `There are ${reservedPassengerCapacity} passengers reserved for this cabin. The new passenger capacity must be greater than or equal to this number.`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return errors;
    }

    return undefined;
  }
}
