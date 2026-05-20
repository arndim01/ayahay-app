export interface IItineraryData {
    trip: string;
    qr_data: string;
    booking_date: string;
    ticket_price: string;
    departure_date: string;
    passenger_name: string;
    reference_number: string;
    accommodation_name?: string;
    shipping_line_logo?: string;
  }
  
  export interface IBOLData {
    cargos: {
      weight: string;
      description: string;
      ticket_price: string;
      classification: string;
    }[];
    consignee?: string;
    destination?: string;
    vessel_name?: string;
    total_amount: string;
    departure_date: string;
    reference_number: string;
    shipping_line_name: string;
    shipping_line_tel_no?: string;
    shipping_line_address?: string;
  }
  
  export interface IReceiptData {
    fare_summary: {
      amount: string;
      description: string;
      type: string;
    }[];
    total_amount: string;
    description: string;
    booking_details: {
      "Payment Status": string;
      "Booking ID": number;
      "Origin Port": string;
      "Destination Port": string;
      "Booking Date": string;
      "Shipping Line": string;
      "Booking Ref. No.": string;
      "Onboarding Date and Time": string;
    };
  }
  
  export interface ICombinedBookingResponse {
    itinerary: IItineraryData[];
    bols: IBOLData[];
    receipt: IReceiptData;
  }

  export interface IBookingAttachnmentDetails {
    itineraryData: IItineraryData[];
    itineraryTemplate: number;
    bolData: IBOLData[];
    bolsTemplate: number;
  }