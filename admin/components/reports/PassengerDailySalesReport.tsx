import { TripReport as ITripReport } from '@ayahay/http';
import { useAuth } from '@/contexts/AuthContext';
import { forwardRef } from 'react';
import styles from './Reports.module.scss';
import { MOPBreakdown } from './SummarySalesPerVessel';
import { roundToTwoDecimalPlacesAndAddCommas } from '@/services/reporting.service';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);

interface PassengerDailySalesReportProps {
  data: ITripReport;
}

export const two_columns_grid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
};

export const three_columns_grid = {
  display: 'grid',
  gridAutoRows: '1fr',
  gridTemplateColumns: '1fr 1fr 1fr',
};

function padZeroes(num: any, size: number) {
  num = num.toString();
  while (num.length < size) num = '0' + num;
  return num;
}

const PassengerDailySalesReport = forwardRef(function (
  { data }: PassengerDailySalesReportProps,
  ref
) {
  const BASE_URL = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_URL;
  const SHIPPING_LINE_LOGO = `${BASE_URL}/shipping_line_logo/`;
  const { loggedInAccount } = useAuth();
  const user = loggedInAccount?.email;
  const date = dayjs().tz('Asia/Shanghai').format('MMMM D, YYYY');

  const mopBreakdown: MOPBreakdown = {
    OTC: {
      aggFare: 0,
    },
    Agency: {
      aggFare: 0,
    },
    Online: {
      aggFare: 0,
    },
    Collect: {
      aggFare: 0,
    },
    RoundTrip: {
      aggFare: 0,
    },
  };

  let totalPassengers = data.passengers?.length;
  let totalTicketSale = 0;
  let totalRefundAmount = 0;
  let totalCollectTicketSale = 0;
  let totalRoundTripTicketSale = 0;

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
              src={`${SHIPPING_LINE_LOGO}${data.shippingLine?.logoFilename}`}
              height={50}
            />
            <span style={{ fontWeight: 'bold' }}>{data.shippingLine.name}</span>
          </div>
          <span className={styles['center-div']} style={{ fontWeight: 'bold' }}>
            PASSENGER DAILY SALES REPORT
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
            <p>VESSEL NAME: {data.shipName}</p>
            <p>VOYAGE: {data.voyageNumber}</p>
            <p>
              ROUTE: {data.srcPort.name} to {data.destPort.name}
            </p>
            <p>
              SCHEDULE:&nbsp;
              {dayjs(data.departureDate)
                .tz('Asia/Shanghai')
                .format('MMMM D, YYYY [at] h:mm A')}
            </p>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              marginRight: 0,
            }}
          >
            <p>User: {user}</p>
            <p>Date Printed: {date}</p>
          </div>
        </div>

        <div
          className={`${styles['center-div']} ${styles['font-style']}`}
          style={{ marginTop: 10 }}
        >
          <table
            style={{
              width: '95%',
              borderCollapse: 'collapse',
              textAlign: 'center',
              fontSize: 8,
            }}
          >
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <th>Passenger Name</th>
                <th>Teller</th>
                <th>Reference</th>
                <th>Accommodation</th>
                <th>Discount Type</th>
                <th style={{ textAlign: 'left' }}>Discount</th>
                <th style={{ textAlign: 'left' }}>Ticket Cost</th>
                <th style={{ textAlign: 'left' }}>Refund</th>
                <th>Payment Method</th>
                <th>Collect</th>
                <th>Round Trip</th>
              </tr>
            </thead>
            <tbody>
              {data.passengers?.map((passenger, idx) => {
                const collect = passenger.collect;
                const roundTrip = passenger.roundTrip;
                totalTicketSale += roundTrip ? 0 : passenger.ticketSale;
                totalRefundAmount += passenger.refundAmount;
                totalCollectTicketSale += collect
                  ? passenger.discountAmount
                  : 0;
                totalRoundTripTicketSale += roundTrip
                  ? passenger.ticketSale
                  : 0;
                const paymentStatus = passenger.paymentStatus;

                if (paymentStatus === 'Online') {
                  mopBreakdown.Online.aggFare += passenger.ticketSale;
                } else if (paymentStatus === 'Agency') {
                  mopBreakdown.Agency.aggFare += passenger.ticketSale;
                } else if (collect) {
                  mopBreakdown.Collect.aggFare += passenger.discountAmount;
                } else if (paymentStatus === 'Round Trip') {
                  mopBreakdown.RoundTrip.aggFare += passenger.ticketSale;
                } else {
                  mopBreakdown.OTC.aggFare += passenger.ticketSale;
                }

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
                const ticketCost = `PHP ${roundToTwoDecimalPlacesAndAddCommas(
                  passenger.ticketSale
                )}`;

                return (
                  <tr>
                    <td style={{ textAlign: 'left', paddingLeft: 15 }}>
                      {passenger.passengerName}
                    </td>
                    <td>{passenger.teller}</td>
                    <td>{padZeroes(idx + 1, 4)}</td>
                    <td>{passenger.accommodation}</td>
                    <td>{passenger.discount}</td>
                    <td style={{ textAlign: 'left' }}>
                      {collect ? '' : discountAmount}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      {roundTrip ? '' : ticketCost}
                    </td>
                    <td style={{ textAlign: 'left' }}>{refundAmount}</td>
                    <td>{paymentStatus}</td>
                    <td>{collect ? discountAmount : ''}</td>
                    <td>{roundTrip ? ticketCost : ''}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <td colSpan={4}>TOTAL</td>
                <td>{totalPassengers}</td>
                <td style={{ textAlign: 'left' }}>-</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalTicketSale)}
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalRefundAmount)}
                </td>
                <td>-</td>
                <td>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalCollectTicketSale)}
                </td>
                <td>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    totalRoundTripTicketSale
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div
          className={`${styles['three-uneven-columns-grid']} ${styles['font-style']}`}
          style={{
            marginTop: 15,
            paddingLeft: 22,
            paddingRight: 22,
          }}
        >
          <table
            style={{
              borderCollapse: 'collapse',
              textAlign: 'center',
              fontSize: 8,
              maxHeight: 10,
            }}
          >
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <th
                  className={styles['header-border']}
                  style={{ borderLeft: '0.001px solid black' }}
                >
                  Mode of Payment
                </th>
                <th className={styles['header-border']}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(mopBreakdown).map((mop: string) => {
                return (
                  <tr>
                    <td
                      className={styles['cell-border']}
                      style={{ borderLeft: '0.001px solid black' }}
                    >
                      {mop}
                    </td>
                    <td className={styles['cell-border']}>
                      <div className={styles['wrap']}>
                        <div style={{ textAlign: 'left' }}>
                          PHP&nbsp;
                          {roundToTwoDecimalPlacesAndAddCommas(
                            mopBreakdown[mop as keyof MOPBreakdown].aggFare
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td
                  className={styles['cell-border']}
                  style={{ borderLeft: '0.001px solid black' }}
                >
                  Refund
                </td>
                <td className={styles['cell-border']}>
                  <div className={styles['wrap']}>
                    <div style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(totalRefundAmount)}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <td
                  className={styles['cell-border']}
                  style={{ borderLeft: '0.001px solid black' }}
                >
                  TOTAL SALES
                </td>
                <td className={styles['cell-border']}>
                  <div className={styles['wrap']}>
                    <div style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(
                        totalTicketSale +
                          totalRefundAmount +
                          totalCollectTicketSale +
                          totalRoundTripTicketSale
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>

          <div></div>

          <table
            style={{
              borderCollapse: 'collapse',
              textAlign: 'center',
              fontSize: 8,
            }}
          >
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <th
                  className={styles['header-border']}
                  style={{ borderLeft: '0.001px solid black' }}
                >
                  Discount Type
                </th>
                <th className={styles['header-border']}>Accommodation</th>
                <th className={styles['header-border']}>Total</th>
                <th className={styles['header-border']}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.passengerDiscountsBreakdown?.map((discountType) => {
                return (
                  <tr>
                    <td
                      className={styles['cell-border']}
                      style={{ borderLeft: '0.001px solid black' }}
                    >
                      {discountType.typeOfDiscount}
                    </td>
                    <td className={styles['cell-border']}>
                      {discountType.cabinName}
                    </td>
                    <td className={styles['cell-border']}>
                      {discountType.totalBooked}
                    </td>
                    <td className={styles['cell-border']}>
                      <div className={styles['wrap']}>
                        <div style={{ textAlign: 'left' }}>
                          PHP&nbsp;
                          {roundToTwoDecimalPlacesAndAddCommas(
                            discountType.totalSales
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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

export default PassengerDailySalesReport;
