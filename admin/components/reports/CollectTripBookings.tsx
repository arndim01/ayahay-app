import { CollectTripBooking } from '@ayahay/http';
import { useAuth } from '@/contexts/AuthContext';
import { forwardRef } from 'react';
import styles from './Reports.module.scss';
import {
  three_columns_grid,
  two_columns_grid,
} from './PassengerDailySalesReport';
import { roundToTwoDecimalPlacesAndAddCommas } from '@/services/reporting.service';
import dayjs from 'dayjs';
import { IShippingLine } from '@ayahay/models';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);

interface CollectTripBookingsProps {
  data: CollectTripBooking[];
  shippingLine: IShippingLine;
}

const CollectTripBookings = forwardRef(function (
  { data, shippingLine }: CollectTripBookingsProps,
  ref
) {
  const BASE_URL = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_URL;
  const SHIPPING_LINE_LOGO = `${BASE_URL}/shipping_line_logo/`;
  const { loggedInAccount } = useAuth();
  const user = loggedInAccount?.email;
  const date = dayjs().tz('Asia/Shanghai').format('MMMM D, YYYY');

  let totalTicketSale = 0;
  let totalRefundAmount = 0;

  return (
    <div ref={ref}>
      <div style={{ fontSize: 9, width: 842 }}>
        <div className={styles['center-div']}>
          <img src='/assets/ayahay-logo.png' height={25} />
          <span
            style={{
              fontSize: 10,
              color: '#1f4e79',
              fontWeight: 'bold',
            }}
          >
            AYAHAY TECHNOLOGY CORP
          </span>
        </div>
        <div className={styles['font-style']} style={three_columns_grid}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img
              src={`${SHIPPING_LINE_LOGO}${shippingLine?.logoFilename}`}
              height={50}
            />
            <span style={{ fontWeight: 'bold' }}>{shippingLine.name}</span>
          </div>
          <span className={styles['center-div']} style={{ fontWeight: 'bold' }}>
            COLLECT BOOKINGS
          </span>
        </div>
        <div
          className={styles['font-style']}
          style={{
            ...two_columns_grid,
            padding: '0px 58px',
          }}
        >
          <div>
            <p>User: {user}</p>
            <p>Date Printed: {date}</p>
          </div>
        </div>
        {data.map((tripBooking) => {
          return (
            <div
              className={`${styles['center-div']} ${styles['font-style']}`}
              style={{ marginTop: 15 }}
            >
              <table
                style={{
                  width: '95%',
                  borderCollapse: 'collapse',
                  textAlign: 'center',
                  fontSize: 8,
                }}
              >
                <caption style={{ textAlign: 'left' }}>
                  <>
                    <span style={{ fontWeight: 'bold' }}>VOYAGE: </span>
                    <span>{`${tripBooking.srcPortName} to ${
                      tripBooking.destPortName
                    } at ${dayjs(tripBooking.departureDateIso).format(
                      'MMMM D, YYYY h:mm A'
                    )}`}</span>
                  </>
                </caption>
                <thead style={{ backgroundColor: '#ddebf7' }}>
                  <tr>
                    {/* <th>Booking ID</th> */}
                    <th>Consignee</th>
                    <th>BOL #</th>
                    {/* <th>FRR</th> */}
                    <th>Teller</th>
                    <th></th>
                    <th>Name/Plate #</th>
                    <th>Discount/Vehicle Type</th>
                    <th style={{ textAlign: 'left' }}>Discount</th>
                    <th style={{ textAlign: 'left' }}>Ticket Cost</th>
                    <th style={{ textAlign: 'left' }}>Refund</th>
                  </tr>
                </thead>
                <tbody>
                  {tripBooking.bookings.map((booking, dataIdx) => {
                    const firstData = dataIdx === 0;
                    const bookingPassengerLength = booking.passengers.length;
                    const bookingVehicleLength = booking.vehicles.length;
                    const hasPassenger = bookingPassengerLength > 0;
                    const hasVehicle = bookingVehicleLength > 0;
                    const borderStyle = '0.001px solid black';

                    const passengerBreakdown = hasPassenger
                      ? booking.passengers.map((passenger, idx) => {
                          totalTicketSale += passenger.ticketSale;
                          totalRefundAmount += passenger.refundAmount;
                          const lastElement =
                            bookingPassengerLength - 1 === idx;
                          const discountAmount = passenger.discountAmount
                            ? `PHP ${roundToTwoDecimalPlacesAndAddCommas(
                                passenger.discountAmount
                              )}`
                            : '';
                          const refundAmount = passenger.refundAmount
                            ? `PHP ${roundToTwoDecimalPlacesAndAddCommas(
                                passenger.refundAmount
                              )}`
                            : '';

                          const rowStyle =
                            !hasVehicle && lastElement
                              ? { borderBottom: borderStyle }
                              : {};

                          return (
                            <tr
                              className={styles['row-side-borders']}
                              style={
                                firstData && idx === 0
                                  ? {
                                      ...rowStyle,
                                      borderTop: borderStyle,
                                    }
                                  : rowStyle
                              }
                            >
                              {idx === 0 ? (
                                <>
                                  {/* <td>{booking.id}</td> */}
                                  <td>{booking.consigneeName}</td>
                                  <td>{booking.referenceNo}</td>
                                  {/* <td>{booking.freightRateReceipt}</td> */}
                                  <td>{passenger.teller}</td>
                                  <td>Passenger</td>
                                </>
                              ) : (
                                <>
                                  {/* <td></td> */}
                                  <td></td>
                                  <td></td>
                                  {/* <td></td> */}
                                  <td></td>
                                  <td></td>
                                </>
                              )}

                              <td>{passenger.passengerName}</td>
                              <td>{passenger.discount}</td>
                              <td style={{ textAlign: 'left' }}>
                                {discountAmount}
                              </td>
                              <td style={{ textAlign: 'left' }}>
                                PHP&nbsp;
                                {roundToTwoDecimalPlacesAndAddCommas(
                                  passenger.ticketSale
                                )}
                              </td>
                              <td style={{ textAlign: 'left' }}>
                                {refundAmount}
                              </td>
                            </tr>
                          );
                        })
                      : [];

                    const vehicleBreakdown = hasVehicle
                      ? booking.vehicles.map((vehicle, idx) => {
                          totalTicketSale += vehicle.ticketSale;
                          totalRefundAmount += vehicle.refundAmount;
                          const lastElement = bookingVehicleLength - 1 === idx;
                          const discountAmount = vehicle.discountAmount
                            ? `PHP ${roundToTwoDecimalPlacesAndAddCommas(
                                vehicle.discountAmount
                              )}`
                            : '';
                          const refundAmount = vehicle.refundAmount
                            ? `PHP ${roundToTwoDecimalPlacesAndAddCommas(
                                vehicle.refundAmount
                              )}`
                            : '';

                          const rowStyle = lastElement
                            ? { borderBottom: borderStyle }
                            : {};

                          return (
                            <tr
                              className={styles['row-side-borders']}
                              style={
                                !hasPassenger && firstData && idx === 0
                                  ? {
                                      ...rowStyle,
                                      borderTop: borderStyle,
                                    }
                                  : rowStyle
                              }
                            >
                              {!hasPassenger && idx === 0 ? (
                                <>
                                  {/* <td>{booking.id}</td> */}
                                  <td>{booking.consigneeName}</td>
                                  <td>{booking.referenceNo}</td>
                                  {/* <td>{booking.freightRateReceipt}</td> */}
                                  <td>{vehicle.teller}</td>
                                  <td>Cargo</td>
                                </>
                              ) : hasPassenger && idx === 0 ? (
                                <>
                                  {/* <td></td> */}
                                  <td></td>
                                  <td></td>
                                  {/* <td></td> */}
                                  <td></td>
                                  <td>Cargo</td>
                                </>
                              ) : (
                                <>
                                  {/* <td></td> */}
                                  <td></td>
                                  <td></td>
                                  {/* <td></td> */}
                                  <td></td>
                                  <td></td>
                                </>
                              )}

                              <td>{vehicle.plateNo}</td>
                              <td>{vehicle.typeOfVehicle}</td>
                              <td style={{ textAlign: 'left' }}>
                                {discountAmount}
                              </td>
                              <td style={{ textAlign: 'left' }}>
                                PHP&nbsp;
                                {roundToTwoDecimalPlacesAndAddCommas(
                                  vehicle.ticketSale
                                )}
                              </td>
                              <td style={{ textAlign: 'left' }}>
                                {refundAmount}
                              </td>
                            </tr>
                          );
                        })
                      : [];

                    return [...passengerBreakdown, ...vehicleBreakdown];
                  })}
                </tbody>
                <tfoot style={{ backgroundColor: '#ddebf7' }}>
                  <tr style={{ fontWeight: 'bold' }}>
                    <td colSpan={7}>TOTAL</td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(totalTicketSale)}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(totalRefundAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}

        <div
          className={styles['font-style']}
          style={{ ...three_columns_grid, marginTop: 50 }}
        >
          <div className={styles['center-div']}>
            <span
              style={{
                borderTop: '1px solid black',
                padding: '0 60px',
              }}
            >
              CHECKED
            </span>
          </div>
          <div className={styles['center-div']}>
            <span
              style={{
                borderTop: '1px solid black',
                padding: '0 60px',
              }}
            >
              AUDITED
            </span>
          </div>
          <div className={styles['center-div']}>
            <span
              style={{
                borderTop: '1px solid black',
                padding: '0 60px',
              }}
            >
              APPROVED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CollectTripBookings;
