import { IBookingTripPassenger } from './booking-trip-passenger.model';
import { IBookingTripVehicle } from './booking-trip-vehicle.model';
import { ITrip } from './trip.model';

export interface IBookingTrip {
  bookingId: string;
  tripId: number;
  trip?: ITrip;

  bookingTripPassengers?: IBookingTripPassenger[];
  bookingTripVehicles?: IBookingTripVehicle[];
}
