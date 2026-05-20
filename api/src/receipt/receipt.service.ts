import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { ItineraryMapper } from '@/itinerary/itinerary.mapper';
import { BolMapper } from '@/bol/bol.mapper';
import { ReceiptMapper } from '@/receipt/receipt.mapper';
import { IItineraryData, IBOLData, IReceiptData, ICombinedBookingResponse } from '@ayahay/models';


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

const extractTextPattern = (value: string): string => {
    const pattern = /\((.*?)\)/;
    const matches = value.match(pattern);
    return matches ? matches[1] : '';
};
  

@Injectable()
export class ReceiptService {

    private readonly logger = new Logger(ReceiptService.name);
    constructor(
        private readonly prisma: PrismaService,
        private readonly itineraryMapper: ItineraryMapper,
        private readonly bolMapper: BolMapper,
        private readonly receiptMapper: ReceiptMapper,
    ) {}

    async fetchItinerary(tempId: number, bookingId: string): Promise<IItineraryData[]> {
        try {
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
                AND tb.id = ${tempId}
                LIMIT 1;
            `;
    
            if (!results?.length) {
                throw new Error('No test data found in temp_booking table');
            }
    
            const result = results[0];
    
            const itineraryList: IItineraryData[] = result.booking_trips_json.flatMap((trip: any) => {
                const tripLabel = `${trip.trip.srcPort.name} - ${trip.trip.destPort.name}`;
                const departureDate = new Date(trip.trip.departureDateIso).toLocaleString('en-US', { timeZone: 'Asia/Manila' });
                const bookingDate = new Date(result.booking_date).toLocaleString('en-US', { timeZone: 'Asia/Manila' });
                const referenceNumber = bookingId.substring(0, 6).toUpperCase();
                const qrData = `${process.env.WEB_URL}/booking/confirmed/${bookingId}`;
                const logoUrl = `https://ayahay-assets.s3.ap-southeast-2.amazonaws.com/shipping_line_logo/${result.shipping_line_logo}`;
    
                return trip.bookingTripPassengers.map((passenger: any): IItineraryData => ({
                    trip: tripLabel,
                    qr_data: qrData,
                    booking_date: bookingDate,
                    ticket_price: passenger.totalPrice.toFixed(2),
                    departure_date: departureDate,
                    passenger_name: `${passenger.passenger.firstName} ${passenger.passenger.lastName}`,
                    reference_number: referenceNumber,
                    accommodation_name: extractTextPattern(passenger.bookingPaymentItems[0].description),
                    shipping_line_logo: logoUrl,
                }));
            });
    
            return this.itineraryMapper.mapItinerary({ items: itineraryList });
        } catch (error) {
            console.error('Error fetching itinerary data:', error);
            throw new InternalServerErrorException(error.message);
        }
    }
    
    async fetchBol(tempId: number, bookingId: string): Promise<IBOLData[]> {
        try {
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
                AND tb.id = ${tempId}
                LIMIT 1;
            `;
    
            if (!results?.length) {
                throw new Error('No test data found in temp_booking table');
            }
    
            const result = results[0];
    
            const bolList: IBOLData[] = result.booking_trips_json.flatMap((trip: any) => {
                console.log(trip.trip)
                return trip.bookingTripVehicles.map((vehicle: any): IBOLData => ({
                    cargos: [{
                        weight: vehicle.weight || 'L',
                        description: vehicle.vehicle.modelName,
                        ticket_price: vehicle.priceWithoutMarkup.toFixed(2),
                        classification: extractTextPattern(vehicle.bookingPaymentItems[0].description),
                    }],
                    consignee: result.consignee_name,
                    destination: trip.trip.destPort.name,
                    vessel_name: result.vessel_name,
                    total_amount: vehicle.priceWithoutMarkup.toFixed(2),
                    departure_date: new Date(trip.trip.departureDateIso).toLocaleDateString('en-US', { timeZone: 'Asia/Manila' }),
                    reference_number: bookingId.substring(0, 6).toUpperCase(),
                    shipping_line_name: result.shipping_line_name,
                    shipping_line_tel_no: result.shipping_line_tel_no,
                    shipping_line_address: result.shipping_line_address,
                }));
            });
    
            return this.bolMapper.mapBol({bols: bolList});
        } catch (error) {
            console.error('Error fetching BOL data:', error);
            throw new InternalServerErrorException(error.message);
        }
    }

    async fetchReceipt(tempId: number, bookingId: string): Promise<IReceiptData> {
        try {
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
                    AND tb.id = ${tempId} -- Use the variable here
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
            summary_url: `${process.env.WEB_URL}/booking/confirmed/${bookingId}`,
            booking_details: {
                "Payment Status": result.payment_status || 'Success',
                "Booking ID": bookingId,
                "Origin Port": tripInfo.src_port,
                "Destination Port": tripInfo.dest_port,
                "Booking Date": new Date(result.booking_date).toLocaleDateString('en-US', { timeZone: 'Asia/Manila' }),
                "Shipping Line": result.shipping_line_name,
                "Booking Ref. No.": bookingId.substring(0, 6).toUpperCase(),
                "Onboarding Date and Time": new Date(tripInfo.departure_date).toLocaleString('en-US', { timeZone: 'Asia/Manila' }),
            },
            };

            // Map the receipt and return a single object
            return this.receiptMapper.mapReceipt(processedReceipt);
        } catch (error) {
            console.error('Error fetching receipt data:', error);
            throw new InternalServerErrorException(`Failed to fetch receipt data: ${error.message}`);
        }
    }

    async getBookingDetails(tempId: number, bookingId: string): Promise<ICombinedBookingResponse> {
        const itinerary = await this.fetchItinerary(tempId, bookingId);
        const bols = await this.fetchBol(tempId, bookingId);
        const receipt = await this.fetchReceipt(tempId, bookingId);
        return { itinerary, bols, receipt };
    }
}