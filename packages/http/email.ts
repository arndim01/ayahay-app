export interface TripCancelEmailRequest {
  tripId: number;
  reason: string;
}

export interface EmailRole {
  email: string;
  role: string;
}
