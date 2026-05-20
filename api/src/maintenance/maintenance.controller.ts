import { Controller, Get, Param, InternalServerErrorException, Query } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ItineraryMapper } from '../itinerary/itinerary.mapper';
import { BolMapper } from '../bol/bol.mapper';
import { ReceiptMapper } from '../receipt/receipt.mapper';
import { ReceiptService } from '@/receipt/receipt.service';

interface RawQueryResult {
  booking_id: string;
  booking_ref_no: string;
  booking_trips_json: any[];
  booking_date: Date;
  shipping_line_logo: string;
  shipping_line_name: string;
  departure_date: Date;
  src_port_name: string;
  dest_port_name: string;
  cabin_name: string;
  consignee_name?: string;
  shipping_line_tel_no?: string;
  shipping_line_address?: string;
  destination_port?: string;
  vessel_name?: string;
  booking_payment_items_json?: any[];
  payment_status?: string;
  booking_status?: string;
  reference_no?: string;
  original_booking_id?: string;
  payment_items?: Array<{
    price: number;
    description: string;
    type: string;
  }>;
  trip_info: string;
}

@Controller('maintenance')
export class MaintenanceController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly itineraryMapper: ItineraryMapper,
    private readonly bolMapper: BolMapper,
    private readonly receiptMapper: ReceiptMapper,
    private readonly receiptService: ReceiptService
  ) {}

  @Get('test-itinerary')
  async testItinerary() {
    try {

      const bookingId = 149099; // Replace with dynamic variable value
      const results = await this.prisma.$queryRaw<RawQueryResult[]>`
        SELECT 
          tb.id AS booking_id,
          tb.payment_reference AS booking_ref_no,
          tb.booking_trips_json,
          tb.created_at as booking_date,
          sl.logo_filename AS shipping_line_logo,
          sl.name AS shipping_line_name,
          t.departure_date,
          sp.name AS src_port_name,
          dp.name AS dest_port_name,
          c.name AS cabin_name
        FROM ayahay.temp_booking tb
        JOIN ayahay.shipping_line sl ON tb.shipping_line_id = sl.id
        LEFT JOIN LATERAL jsonb_array_elements(tb.booking_trips_json) AS btj(trip_data) ON true
        LEFT JOIN ayahay.trip t ON (btj.trip_data->>'tripId')::int = t.id
        LEFT JOIN ayahay.port sp ON t.src_port_id = sp.id
        LEFT JOIN ayahay.port dp ON t.dest_port_id = dp.id
        LEFT JOIN ayahay.cabin c ON (btj.trip_data->>'cabinId')::int = c.id
        WHERE tb.booking_trips_json IS NOT NULL
        AND tb.id = ${bookingId} -- Ensure we filter by specific ID
        LIMIT 1;
      `;

      if (!results?.length) {
        throw new Error('No test data found in temp_booking table');
      }

      const formattedData = {
        items: results.map(result => {
          const tripInfo = result.booking_trips_json[0];
          const trip = `${result.src_port_name} - ${result.dest_port_name}`;
          
          return tripInfo.bookingTripPassengers.map((passenger: any) => ({
            trip: trip,
            qr_data: '',
            booking_date: new Date(result.booking_date).toLocaleString(),
            ticket_price: passenger.totalPrice.toFixed(2),
            departure_date: new Date(result.departure_date).toLocaleString(),
            passenger_name: `${passenger.passenger.firstName} ${passenger.passenger.lastName}`,
            reference_number: result.booking_ref_no,
            accommodation_name: result.cabin_name,
            shipping_line_logo: `https://ayahay-assets.s3.ap-southeast-2.amazonaws.com/shipping_line_logo/${result.shipping_line_name.replace(/ /g, '_')}.png`,
          }));
        }).flat(),
      };

      return this.itineraryMapper.mapItinerary(formattedData);
    } catch (error) {
      console.error('Error fetching itinerary data:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('test-bol')
  async testBol() {
    try {
      const bookingId = 149099; // Replace with dynamic variable value
      const results = await this.prisma.$queryRaw<RawQueryResult[]>`
        SELECT 
          tb.id AS booking_id,
          tb.payment_reference AS booking_ref_no,
          tb.booking_trips_json,
          tb.consignee_name,
          sl.name AS shipping_line_name,
          sl.telephone_number AS shipping_line_tel_no,
          sl.address AS shipping_line_address,
          t.departure_date,
          dp.name AS destination_port,
          s.name AS vessel_name
        FROM ayahay.temp_booking tb
        JOIN ayahay.shipping_line sl ON tb.shipping_line_id = sl.id
        LEFT JOIN LATERAL jsonb_array_elements(tb.booking_trips_json) AS btj(trip_data) ON true
        LEFT JOIN ayahay.trip t ON (btj.trip_data->>'tripId')::int = t.id
        LEFT JOIN ayahay.port dp ON t.dest_port_id = dp.id
        LEFT JOIN ayahay.ship s ON t.ship_id = s.id
        WHERE tb.booking_trips_json IS NOT NULL
        AND tb.id = ${bookingId} -- Ensure we filter by specific ID
        LIMIT 1;
      `;

      if (!results?.length) {
        throw new Error('No test data found in temp_booking table');
      }

      const formattedData = {
        bols: results.map(result => {
          const tripInfo = result.booking_trips_json[0];
          return tripInfo.bookingTripVehicles.map((vehicle: any) => ({
            cargos: [{
              weight: vehicle.weight || 'L',
              description: vehicle.description || `Vehicle ${vehicle.vehicleId}`,
              ticket_price: vehicle.totalPrice.toFixed(2),
              classification: vehicle.classification || '4W Automobile/Multicab'
            }],
            consignee: result.consignee_name,
            destination: result.destination_port,
            vessel_name: result.vessel_name,
            total_amount: vehicle.totalPrice.toFixed(2),
            departure_date: new Date(result.departure_date).toLocaleDateString(),
            reference_number: result.booking_ref_no,
            shipping_line_name: result.shipping_line_name,
            shipping_line_tel_no: result.shipping_line_tel_no,
            shipping_line_address: result.shipping_line_address,
          }));
        }).flat(),
      };

      return this.bolMapper.mapBol(formattedData);
    } catch (error) {
      console.error('Error fetching BOL data:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('test-receipt')
  async testReceipt() {
    try {
      const bookingId = 149099; // Replace this with the actual variable value
      const results = await this.prisma.$queryRaw<RawQueryResult[]>`
              WITH trip_info AS (
                SELECT t.id as trip_id,
                      sp.name as src_port,
                      dp.name as dest_port,
                      t.departure_date
                FROM ayahay.trip t
                JOIN ayahay.port sp ON t.src_port_id = sp.id
                JOIN ayahay.port dp ON t.dest_port_id = dp.id
              )
              SELECT 
                tb.id AS booking_id,
                tb.payment_reference AS booking_ref_no,
                tb.booking_trips_json,
                tb.booking_payment_items_json,
                tb.created_at as booking_date,
                sl.name AS shipping_line_name,
                b.payment_status,
                b.reference_no,
                b.id as original_booking_id,
                COALESCE(
                  (
                    SELECT json_build_object(
                      'src_port', ti.src_port,
                      'dest_port', ti.dest_port,
                      'departure_date', ti.departure_date
                    )
                    FROM trip_info ti
                    WHERE ti.trip_id = (tb.booking_trips_json->0->>'tripId')::int
                  ),
                  json_build_object(
                    'src_port', 'N/A',
                    'dest_port', 'N/A',
                    'departure_date', NOW()
                  )
                ) as trip_info
              FROM ayahay.temp_booking tb
              JOIN ayahay.shipping_line sl ON tb.shipping_line_id = sl.id
              LEFT JOIN ayahay.booking b ON b.reference_no = tb.payment_reference
              WHERE tb.booking_trips_json IS NOT NULL
              AND tb.id = ${bookingId} -- Use the variable here
              ORDER BY tb.created_at DESC
              LIMIT 1;  -- Ensure only one result is returned
            `;

      if (!results?.length) {
        throw new Error('No test data found in temp_booking table');
      }

      // Helper function to clean description
      const cleanDescription = (description: string) => {
        return description.replace(/\s*\([^)]*\)/g, '').trim();
      };

      // Process a single result (since we now fetch only one)
      const result = results[0];

      const tripInfo = result.trip_info as any || { 
        src_port: 'N/A', 
        dest_port: 'N/A', 
        departure_date: new Date() 
      };

      const passengers = result.booking_trips_json[0]?.bookingTripPassengers || [];
      const vehicle = result.booking_trips_json[0]?.bookingTripVehicles || [];
      // Generate fare summary from passengers
      const passengerSummary = passengers.map((passenger: any) => {
        return passenger.bookingPaymentItems.map((item: any) => ({
          amount: typeof item.price === 'number' ? item.price.toFixed(2) : '0.00',
          description: cleanDescription(item.description || ''),
          type: item.type || 'Fare'
        }));
      }).flat();

      const vehicleSummary = vehicle.map((vehicle: any) => {
        return vehicle.bookingPaymentItems.map((item: any) => ({
          amount: typeof item.price === 'number' ? item.price.toFixed(2) : '0.00',
          description: cleanDescription(item.description || ''),
          type: item.type || 'Fare'
        }));
      }).flat();

      const combinedSummary = [...passengerSummary, ...vehicleSummary];
      const totalAmount = combinedSummary.reduce((sum, item) => sum + parseFloat(item.amount), 0).toFixed(2);

      const processedReceipt = {
        fare_summary: combinedSummary,
        total_amount: totalAmount,
        description: `Total fare for ${passengers.length} passenger(s)`,
        booking_details: {
          "Payment Status": result.payment_status || 'Success',
          "Booking ID": result.booking_id,
          "Origin Port": tripInfo.src_port,
          "Destination Port": tripInfo.dest_port,
          "Booking Date": new Date(result.booking_date).toLocaleDateString(),
          "Shipping Line": result.shipping_line_name,
          "Booking Ref. No.": result.reference_no || result.booking_ref_no,
          "Onboarding Date and Time": new Date(tripInfo.departure_date).toLocaleString(),
        },
      };

      // Map the receipt and return a single object
      return this.receiptMapper.mapReceipt(processedReceipt);
    } catch (error) {
      console.error('Error fetching receipt data:', error);
      throw new InternalServerErrorException(`Failed to fetch receipt data: ${error.message}`);
    }
  }

  @Get('get-receipt')
  async getBookingDetails(@Query('id') id: number, @Query('bookingId') bookingId: string) {
    return this.receiptService.getBookingDetails(id, bookingId);
  }

}