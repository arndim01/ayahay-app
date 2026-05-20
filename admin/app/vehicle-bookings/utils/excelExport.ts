import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { VehicleBookingData } from '../components/TabComponents/types';

interface TripDetails {
  shipName: string;
  route: string;
  departureDate: string;
}

export const exportToExcel = (
  data: VehicleBookingData[], 
  tripDetails: TripDetails
): void => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  console.log('Exporting data:', data);

  // Prepare the data for Excel
  const excelData = data.map(item => ({
    'Reference No.': item.reference,
    'BOL No.': item.bol_no,
    'FRR No.': item.frr_no,
    'Plate Number': item.plate_number,
    'Vehicle Type': item.vehicle_type,
    'Payment Method': item.payment_method,
    'Status': item.status
  }));

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicle Bookings');

  // Add summary sheet
  const summaryData = [
    ['Trip Details'],
    ['Ship Name', tripDetails.shipName],
    ['Route', tripDetails.route],
    ['Departure Date', dayjs(tripDetails.departureDate).format('YYYY-MM-DD HH:mm')],
    [],
    ['Summary'],
    ['Total Vehicles', data.length],
    ['On-boarded', data.filter(item => item.status === 'On-boarded').length],
    ['Not-boarded', data.filter(item => item.status === 'Not-boarded').length],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Generate filename
  const dateStr = dayjs(tripDetails.departureDate).format('YYYY-MM-DD');
  const fileName = `${tripDetails.shipName}_${tripDetails.route}_${dateStr}_vehicles.xlsx`;

  // Save file
  XLSX.writeFile(workbook, fileName);
};
