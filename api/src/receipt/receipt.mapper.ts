import { IBOLData, IBookingAttachnmentDetails, IItineraryData } from "@ayahay/models";

export class ReceiptMapper {
  mapReceipt(data: any): any {
    return {
      fare_summary: data.fare_summary.map((item: any) => ({
        amount: typeof item.amount === 'number' 
          ? item.amount.toFixed(2) 
          : (parseFloat(item.amount) || 0).toFixed(2),
        description: item.description,
      })),
      total_amount: typeof data.total_amount === 'number' 
        ? data.total_amount.toFixed(2) 
        : (parseFloat(data.total_amount) || 0).toFixed(2),
      booking_summary_url: data.summary_url,
      booking_details: {
        "Payment Status": data.booking_details["Payment Status"],
        "Booking ID": data.booking_details["Booking ID"],
        "Origin Port": data.booking_details["Origin Port"],
        "Destination Port": data.booking_details["Destination Port"],
        "Booking Date": data.booking_details["Booking Date"],
        "Shipping Line": data.booking_details["Shipping Line"],
        "Booking Ref. No.": data.booking_details["Booking Ref. No."],
        "Onboarding Date and Time": data.booking_details["Onboarding Date and Time"],
      },
    };
  }
  
  mapAttachmentDetails(itineraryData: IItineraryData[],
    itineraryTemplate: number,
    bolData: IBOLData[],
    bolsTemplate: number): IBookingAttachnmentDetails{
      return {
        itineraryData,
        itineraryTemplate,
        bolData,
        bolsTemplate,
      };
  } 
}
