export interface AvailableBooking {
  tripId: number;

  cabinId: number;

  seatId?: number;
  seatName?: string;
  seatTypeId?: number;
}
