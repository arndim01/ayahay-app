import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

interface TripDetails {
  shipName: string;
  route: string;
  departureDate: string;
}

export const exportToExcel = (passengerData: any[], summaryData: any, tripDetails: TripDetails) => {
  // Passenger Bookings Sheet
  const bookingsWorksheet = XLSX.utils.json_to_sheet(passengerData.map(p => ({
    Reference: p.reference,
    'Passenger Name': p.passengerName,
    Accommodation: p.accommodation,
    'Discount Type': p.discountType,
    'Payment Method': p.paymentMethod,
    Status: p.status
  })));

  // Summary Sheet
  const summaryRows = Object.entries(summaryData).map(([key, data]: [string, any]) => ({
    'Discount Type': data.discountType,
    'Accommodation': data.accommodation,
    'Total Count': data.total
  }));
  const summaryWorksheet = XLSX.utils.json_to_sheet(summaryRows);

  // Create Workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, bookingsWorksheet, 'Passenger Bookings');
  XLSX.utils.book_append_sheet(wb, summaryWorksheet, 'Summary');

  // Format filename using trip details
  const formattedDate = dayjs(tripDetails.departureDate).format('YYYY-MM-DD');
  const filename = `${tripDetails.shipName}_${tripDetails.route}_${formattedDate}.xlsx`
    .replace(/[/\\?%*:|"<>]/g, '-'); // Replace invalid filename characters

  // Generate & Download
  XLSX.writeFile(wb, filename);
};
