export class VehicleBookingResponseDto {
  key: string;
  reference: string;
  bol_no: string;
  frr_no: string;
  plate_number: string;
  vehicle_type: string;
  payment_method: 'ONLINE' | 'OTC';
  status: 'On-boarded' | 'Not-boarded';
}
