export interface BookingData {
  key: string;
  reference: string;
  passengerName: string;
  accommodation: string;
  discountType: string;
  paymentMethod: string;
  status: string;
}

export interface PassengerData {
  reference: string;
  bookingId: string;
  // Add other fields as needed
}

export interface TabComponentProps {
  tripId: string;
}
