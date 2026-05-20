import { IDisbursement, IPort, IShip, IShippingLine } from '@ayahay/models';

export interface TripBasicInfo {
  id: number;
  shippingLine: IShippingLine;
  srcPort: IPort;
  destPort: IPort;
  shipName: string;
  departureDate: string;
  voyageNumber?: number;
}

export interface TripReport extends TripBasicInfo {
  passengers?: {
    passengerName: string;
    teller: string;
    accommodation: string;
    discount: string;
    collect: boolean;
    paymentStatus: string;
    roundTrip: boolean;

    discountAmount: number;
    refundAmount: number;

    // base fare - voucher discount
    ticketSale: number;
    // base fare - voucher discount - refund
    ticketCost: number;
    // base fare + Ayahay convenience fee
    fare: number;
    // round trip fare
    roundTripFare: number;
  }[];
  passengerDiscountsBreakdown?: PaxBreakdown[];
  passengerBreakdown?: PaxBreakdown[];
  passengerRefundBreakdown?: PaxBreakdown[];

  vehicles?: {
    teller: string;
    freightRateReceipt: string;
    referenceNo: string;
    typeOfVehicle: string;
    plateNo: string;
    collect: boolean;
    paymentStatus: string;
    roundTrip: boolean;

    discountAmount: number;
    refundAmount: number;

    // base fare - voucher discount
    ticketSale: number;
    // base fare - voucher discount - refund
    ticketCost: number;
    // base fare + Ayahay convenience fee
    fare: number;
    // round trip fare
    roundTripFare: number;
  }[];
  vehicleTypesBreakdown?: VehicleBreakdown[];
  vehicleBreakdown?: VehicleBreakdown[];
  vehicleRefundBreakdown?: VehicleBreakdown[];

  disbursements?: IDisbursement[];
}

export interface PerVesselReport extends TripReport {
  totalDisbursements: number;
}

export interface PaxBreakdown {
  typeOfDiscount: string;
  cabinName: string;
  totalBooked: number;
  totalSales: number;
  totalCollectSales?: number;
}

export interface VehicleBreakdown {
  typeOfVehicle: string;
  totalBooked: number;
  totalSales: number;
  totalCollectSales?: number;
}

export interface SalesPerTellerReport {
  bookingTripsBreakdown: BookingTripsBreakdown[];

  disbursements: {
    [tripId: number]: DisbursementsPerTeller[];
  };
}

export interface BookingTripsBreakdown extends TripBasicInfo {
  passengerBreakdown: PaxBreakdown[];
  passengerRefundBreakdown: PaxBreakdown[];

  vehicleBreakdown: VehicleBreakdown[];
  vehicleRefundBreakdown: VehicleBreakdown[];
}

export interface DisbursementsPerTeller extends IDisbursement {
  tripId: number;
  srcPortCode: string;
  destPortCode: string;
  departureDateIso: string;
}

export interface TripManifest {
  shipName: string;
  srcPortName: string;
  destPortName: string;
  departureDate: string;
  passengers: {
    fullName: string;
    birthDate: string;
    age: number;
    sex: string;
    nationality: string;
    address: string;
  }[];
}

export interface BillOfLading {
  referenceNo: string;
  consigneeName: string;
  freightRateReceipt: string;
  shipName: string;
  voyageNumber: number;
  shippingLineName: string;
  shippingLineSubsidiary?: string;
  shippingLineAddress: string;
  shippingLineTelephoneNo: string;
  shippingLineFaxNo?: string;

  vehicles: {
    // destPortName and departureDateIso are for round trip purposes
    destPortName: string;
    departureDateIso: string;

    classification?: string;
    modelName: string;
    plateNo: string;
    weight?: string;
    vehicleTypeDesc: string;
    fare: number;
  }[];

  isCollectBooking: boolean;
}

export interface PortsByShip {
  srcPortId: number;
  srcPort?: IPort;
  destPortId: number;
  destPort?: IPort;
  shipId: number;
  ship?: IShip;
  shippingLine?: IShippingLine;
  startDate?: string;
  endDate?: string;
}

export interface VoidBookings {
  referenceNo: string;
  price: string;
  refundType: string;
}

export interface CollectBooking {
  bookingId: string;
  referenceNo: string;
  consigneeName: string;
  freightRateReceipt: string;

  passengers: {
    passengerName: string;
    teller: string;
    accommodation: string;
    discount: string;

    discountAmount: number;
    refundAmount: number;

    // base fare - voucher discount
    ticketSale: number;
    // base fare - voucher discount - refund
    ticketCost: number;
  }[];

  vehicles: {
    teller: string;
    typeOfVehicle: string;
    plateNo: string;

    discountAmount: number;
    refundAmount: number;

    // base fare - voucher discount
    ticketSale: number;
    // base fare - voucher discount - refund
    ticketCost: number;
  }[];
}

export interface CollectTripBooking {
  id: number;
  srcPortName: string;
  destPortName: string;
  departureDateIso: string;
  bookings: CollectBooking[];
}
