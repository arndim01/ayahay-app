export class ItineraryMapper {
  mapItinerary(data: any): any {
    return {
      items: data.items.map((item: any) => ({
        trip: item.trip,
        qr_data: item.qr_data,
        booking_date: item.booking_date,
        ticket_price: typeof item.ticket_price === 'number' 
          ? item.ticket_price.toFixed(2) 
          : (parseFloat(item.ticket_price) || 0).toFixed(2),
        departure_date: item.departure_date,
        passenger_name: item.passenger_name,
        reference_number: item.reference_number,
        accommodation_name: item.accommodation_name,
        shipping_line_logo: item.shipping_line_logo,
      })),
    };
  }
}
