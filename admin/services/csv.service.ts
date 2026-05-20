import { IBooking, ITrip } from '@ayahay/models';
import { mockShip, mockShippingLine } from '@ayahay/mocks';
import { isEmpty, round } from 'lodash';
import dayjs from 'dayjs';

export function processTripCsv(
  file: File,
  onSuccess: (trips: ITrip[]) => void
) {
  processCsvFile(file, processTripRow, onSuccess);
}

export function processCsvFile<T>(
  file: File,
  processRowFn: (row: string[]) => T,
  onSuccess: (values: T[]) => void
) {
  const reader = new FileReader();

  reader.addEventListener(
    'load',
    () => {
      if (typeof reader.result === 'string') {
        const rows = csvStringToArray(reader.result);
        const values = processCsvRows(rows, processRowFn);
        onSuccess(values);
      }
    },
    false
  );

  if (file) {
    reader.readAsText(file);
  }
}

function csvStringToArray(strData: string): string[][] {
  const objPattern = new RegExp(
    '(\\,|\\r?\\n|\\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^\\,\\r\\n]*))',
    'gi'
  );
  let matches: RegExpMatchArray | null = null;
  let result: string[][] = [[]];
  while ((matches = objPattern.exec(strData))) {
    if (matches[1].length && matches[1] !== ',') result.push([]);
    result[result.length - 1].push(
      matches[2] ? matches[2].replace(new RegExp('""', 'g'), '"') : matches[3]
    );
  }
  return result;
}

function processCsvRows<T>(
  rows: string[][],
  processRowFn: (row: string[]) => T
): T[] {
  const values: T[] = [];

  // first row is header row; ignore that
  for (let i = 1; i < rows.length; i++) {
    values.push(processRowFn(rows[i]));
  }

  return values;
}

function processTripRow(row: string[]): any {
  //should return ITrip
  const headers = [
    'shippingLineName',
    'srcPortName',
    'destPortName',
    'departureDate',
    'baseFare',
  ];

  let trip: any = {};
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    trip[header] = row[i];
  }

  const randomId = Math.floor(Math.random() * 1000);
  return {
    id: randomId,
    shipId: randomId,
    ship: mockShip,
    shippingLineId: randomId,
    shippingLine: {
      id: randomId,
      name: trip.shippingLineName,
    },
    srcPortId: randomId,
    srcPort: {
      id: randomId,
      name: trip.srcPortName,
    },
    destPortId: randomId,
    destPort: {
      id: randomId,
      name: trip.destPortName,
    },
    departureDateIso: new Date(trip.departureDate).toISOString(),
    // baseFare: Number.parseFloat(trip.baseFare),
    availableSeatTypes: [],
    availableCabins: [],
    meals: [],
    referenceNo: 'ABC', // generateReferenceNo(randomId),
  };
}

export function processBookingCsv(
  file: File,
  onSuccess: (bookings: IBooking[]) => void
) {
  processCsvFile(file, processBookingRow, onSuccess);
}

function processBookingRow(rowValues: string[]): IBooking {
  const headers = [
    'tripReferenceNo',
    'srcPortName',
    'destPortName',
    'departureDate',
    'totalPrice',
    'paymentReference',
    'firstName',
    'lastName',
    'occupation',
    'sex',
    'civilStatus',
    'birthdayIso',
    'address',
    'nationality',
  ];

  let rowObject: any = {};
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    rowObject[header] = rowValues[i];
  }

  const randomId = Math.floor(Math.random() * 1000);

  const tripReferenceNo = rowObject.tripReferenceNo;
  let trip: any = getTripByReferenceNo(tripReferenceNo); //trip should be ITrip not any
  if (trip === undefined) {
    trip = {
      id: randomId,
      shipId: randomId,
      ship: mockShip,
      shippingLineId: randomId,
      shippingLine: mockShippingLine,
      srcPortId: randomId,
      srcPort: {
        id: randomId,
        name: rowObject.srcPortName,
      },
      destPortId: randomId,
      destPort: {
        id: randomId,
        name: rowObject.destPortName,
      },
      departureDateIso: new Date(rowObject.departureDate).toISOString(),
      // baseFare: 100,
      availableSeatTypes: [],
      availableCabins: [],
      meals: [],
      referenceNo: tripReferenceNo,
    };

    addTrips([trip]);
  }

  const booking: any = {
    // booking should be IBooking
    id: String(randomId),
    tripId: trip.id,
    trip,
    totalPrice: rowObject.totalPrice,
    referenceNo: 'ABC', //generateReferenceNo(randomId),
    paymentReference: rowObject.paymentReference,
    bookingPassengers: [
      {
        id: randomId,
        bookingId: randomId,
        passengerId: randomId,
        passenger: {
          id: randomId,
          firstName: rowObject.firstName,
          lastName: rowObject.lastName,
          occupation: rowObject.occupation,
          sex: rowObject.sex,
          civilStatus: rowObject.civilStatus,
          birthdayIso: new Date(rowObject.birthdayIso).toISOString(),
          address: rowObject.address,
          nationality: rowObject.nationality,
        },
        seatId: randomId,
        // seat,
        meal: 'Bacsilog',
        totalPrice: rowObject.totalPrice,
        // referenceNo: generateReferenceNo(randomId),
      },
    ],
  };

  // createBooking(booking);

  return booking;
}

export async function generateBookingPassengerCsv(
  bookings: IBooking[] | any[]
): Promise<Blob> {
  const headers = [
    'Names',
    'Birth Date',
    'Age',
    'Sex',
    // 'Ticket No.',
    'Nationality',
    'Address',
    'Discount Type',
    'Origin',
    'Destination',
    'Trip Date & Time',
    'Rates',
    'Checked-in',
    'Payment',
  ]
    .map((v) => v.replace('"', '""'))
    .map((v) => `"${v}"`)
    .join(',')
    .concat('\r\n');

  const content = [headers];
  content.push(
    bookings
      .filter(
        (booking) =>
          booking.bookingTrips &&
          booking.bookingTrips.length > 0 &&
          booking.bookingTrips[0].bookingTripPassengers.length > 0
      )
      .map((booking) => {
        const payment =
          isEmpty(booking.createdByAccount) ||
          booking.createdByAccount.role === 'Passenger'
            ? 'Ayahay'
            : 'OTC';
        const trip = booking.bookingTrips[0].trip;
        return (
          booking.bookingTrips[0].bookingTripPassengers &&
          booking.bookingTrips[0].bookingTripPassengers
            .map((bookingTripPassenger: any) => {
              const name =
                bookingTripPassenger.passenger.firstName +
                ' ' +
                bookingTripPassenger.passenger.lastName;
              const birthDate = dayjs(
                bookingTripPassenger.passenger.birthday
              ).format('YYYY-M-D');
              const age = computeAge(bookingTripPassenger.passenger.birthday);
              const departureDate = dayjs(trip.departureDateIso).format(
                'YYYY-M-D h:mm A'
              );

              return [
                name ?? '',
                birthDate ?? '',
                age ?? '',
                bookingTripPassenger.passenger?.sex ?? '',
                // booking?.referenceNo ?? '',
                bookingTripPassenger.passenger?.nationality ?? '',
                bookingTripPassenger.passenger?.address ?? '',
                bookingTripPassenger.passenger?.discountType ?? 'Adult',
                trip?.srcPort.name ?? '',
                trip?.destPort.name ?? '',
                departureDate ?? '',
                round(bookingTripPassenger.totalPrice, 2) ?? '',
                bookingTripPassenger.checkInDate ? 'Yes' : 'No',
                payment,
              ]
                .map(String) // convert every value to String
                .map((v) => v.replace('"', '""')) // escape double colons
                .map((v) => `"${v}"`) // quote it
                .join(','); // comma-separated;
            })
            .join('\r\n')
        );
      })
      .join('\r\n') // rows starting on new lines
  );

  return new Blob([...content], { type: 'text/csv;charset=utf-8;' });
}

export async function generateBookingVehicleCsv(
  bookings: IBooking[] | any[]
): Promise<Blob> {
  const headers = [
    'BOL #',
    'FRR',
    'Vehicle Type',
    'Plate #',
    'Model Name',
    'Origin',
    'Destination',
    'Trip Date & Time',
    'Rates',
    'Checked-in',
    'Payment',
  ]
    .map((v) => v.replace('"', '""'))
    .map((v) => `"${v}"`)
    .join(',')
    .concat('\r\n');

  const content = [headers];
  content.push(
    bookings
      .filter(
        (booking) =>
          booking.bookingTrips &&
          booking.bookingTrips.length > 0 &&
          booking.bookingTrips[0].bookingTripVehicles.length > 0
      )
      .map((booking) => {
        const payment =
          isEmpty(booking.createdByAccount) ||
          booking.createdByAccount.role === 'Passenger'
            ? 'Ayahay'
            : 'OTC';
        const trip = booking.bookingTrips[0].trip;
        const bol = booking.referenceNo;
        const frr = booking.freightRateReceipt;
        return (
          booking.bookingTrips[0].bookingTripVehicles &&
          booking.bookingTrips[0].bookingTripVehicles
            .map((bookingTripVehicle: any) => {
              const departureDate = dayjs(trip.departureDateIso).format(
                'YYYY-M-D h:mm A'
              );

              return [
                bol ?? '',
                frr ?? '',
                bookingTripVehicle.vehicle.vehicleType.description ?? '',
                bookingTripVehicle.vehicle.plateNo ?? '',
                bookingTripVehicle.vehicle.modelName ?? '',
                trip?.srcPort.name ?? '',
                trip?.destPort.name ?? '',
                departureDate ?? '',
                round(bookingTripVehicle.totalPrice, 2) ?? '',
                bookingTripVehicle.checkInDate ? 'Yes' : 'No',
                payment,
              ]
                .map(String) // convert every value to String
                .map((v) => v.replace('"', '""')) // escape double colons
                .map((v) => `"${v}"`) // quote it
                .join(','); // comma-separated;
            })
            .join('\r\n')
        );
      })
      .join('\r\n') // rows starting on new lines
  );

  return new Blob([...content], { type: 'text/csv;charset=utf-8;' });
}

function computeAge(birthday: string) {
  var today = new Date();
  var birthDate = new Date(birthday);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
