import { forwardRef } from 'react';
import { TripReport as ITripReport } from '@ayahay/http';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Reports.module.scss';
import {
  three_columns_grid,
  two_columns_grid,
} from './PassengerDailySalesReport';
import { OPERATION_COSTS } from '@ayahay/constants';
import { roundToTwoDecimalPlacesAndAddCommas } from '@/services/reporting.service';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);

interface ProfitAndLossStatementProps {
  data: ITripReport;
  expenses: any;
}

const ProfitAndLossStatement = forwardRef(function (
  { expenses, data }: ProfitAndLossStatementProps,
  ref
) {
  const BASE_URL = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_URL;
  const SHIPPING_LINE_LOGO = `${BASE_URL}/shipping_line_logo/`;
  const { loggedInAccount } = useAuth();
  const user = loggedInAccount?.email;
  const date = dayjs().tz('Asia/Shanghai').format('MMMM D, YYYY');

  const breakdown = {
    passenger: {
      OTC: {
        totalSales: 0,
        totalRefund: 0,
        totalNetSales: 0,
      },
      Agency: {
        totalSales: 0,
        totalRefund: 0,
        totalNetSales: 0,
      },
      Collect: {
        totalSales: 0,
        totalRefund: 0,
        totalNetSales: 0,
      },
      Online: {
        totalSales: 0,
        totalRefund: 0,
        totalNetSales: 0,
      },
      RoundTrip: {
        totalSales: 0,
        totalRefund: 0,
        totalNetSales: 0,
      },
    },
    vehicle: {
      OTC: {
        totalSales: 0,
        totalRefund: 0,
        totalNetSales: 0,
      },
      Agency: {
        totalSales: 0,
        totalRefund: 0,
        totalNetSales: 0,
      },
      Collect: {
        totalSales: 0,
        totalRefund: 0,
        totalNetSales: 0,
      },
      Online: {
        totalSales: 0,
        totalRefund: 0,
        totalNetSales: 0,
      },
      RoundTrip: {
        totalSales: 0,
        totalRefund: 0,
        totalNetSales: 0,
      },
    },
  };

  let totalPassengerSales = 0;
  let totalPassengerRefund = 0;
  let totalPassengerNetSales = 0;

  let totalVehicleSales = 0;
  let totalVehicleRefund = 0;
  let totalVehicleNetSales = 0;

  let totalExpenses = 0;

  data.passengers?.map((passenger) => {
    const paymentStatus = passenger.paymentStatus;
    totalPassengerSales += passenger.collect
      ? passenger.discountAmount
      : passenger.ticketSale;
    totalPassengerRefund += passenger.refundAmount;
    totalPassengerNetSales += passenger.ticketCost;

    if (paymentStatus === 'Online') {
      breakdown.passenger.Online.totalSales += passenger.ticketSale;
      breakdown.passenger.Online.totalRefund += passenger.refundAmount;
      breakdown.passenger.Online.totalNetSales += passenger.ticketCost;
    } else if (paymentStatus === 'Agency') {
      breakdown.passenger.Agency.totalSales += passenger.ticketSale;
      breakdown.passenger.Agency.totalRefund += passenger.refundAmount;
      breakdown.passenger.Agency.totalNetSales += passenger.ticketCost;
    } else if (passenger.collect) {
      breakdown.passenger.Collect.totalSales += passenger.discountAmount;
      breakdown.passenger.Collect.totalRefund += passenger.refundAmount;
      breakdown.passenger.Collect.totalNetSales += passenger.ticketCost;
    } else if (paymentStatus === 'Round Trip') {
      breakdown.passenger.RoundTrip.totalSales += passenger.ticketSale;
      breakdown.passenger.RoundTrip.totalRefund += passenger.refundAmount;
      breakdown.passenger.RoundTrip.totalNetSales += passenger.ticketCost;
    } else {
      breakdown.passenger.OTC.totalSales += passenger.ticketSale;
      breakdown.passenger.OTC.totalRefund += passenger.refundAmount;
      breakdown.passenger.OTC.totalNetSales += passenger.ticketCost;
    }
  });

  data.vehicles?.map((vehicle) => {
    const paymentStatus = vehicle.paymentStatus;
    totalVehicleSales += vehicle.collect
      ? vehicle.discountAmount
      : vehicle.ticketSale;
    totalVehicleRefund += vehicle.refundAmount;
    totalVehicleNetSales += vehicle.ticketCost;

    if (paymentStatus === 'Online') {
      breakdown.vehicle.Online.totalSales += vehicle.ticketSale;
      breakdown.vehicle.Online.totalRefund += vehicle.refundAmount;
      breakdown.vehicle.Online.totalNetSales += vehicle.ticketCost;
    } else if (paymentStatus === 'Agency') {
      breakdown.vehicle.Agency.totalSales += vehicle.ticketSale;
      breakdown.vehicle.Agency.totalRefund += vehicle.refundAmount;
      breakdown.vehicle.Agency.totalNetSales += vehicle.ticketCost;
    } else if (vehicle.collect) {
      breakdown.vehicle.Collect.totalSales += vehicle.discountAmount;
      breakdown.vehicle.Collect.totalRefund += vehicle.refundAmount;
      breakdown.vehicle.Collect.totalNetSales += vehicle.ticketCost;
    } else if (paymentStatus === 'Round Trip') {
      breakdown.vehicle.RoundTrip.totalSales += vehicle.ticketSale;
      breakdown.vehicle.RoundTrip.totalRefund += vehicle.refundAmount;
      breakdown.vehicle.RoundTrip.totalNetSales += vehicle.ticketCost;
    } else {
      breakdown.vehicle.OTC.totalSales += vehicle.ticketSale;
      breakdown.vehicle.OTC.totalRefund += vehicle.refundAmount;
      breakdown.vehicle.OTC.totalNetSales += vehicle.ticketCost;
    }
  });

  const paymentMethods = ['OTC', 'Online', 'Agency', 'Collect', 'RoundTrip'];

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
            PROFIT AND LOSS STATEMENT
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
        {paymentMethods.map((paymentMethod) => {
          return (
            <div
              className={`${styles['center-div']} ${styles['font-style']}`}
              style={{ marginTop: 5 }}
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
                    <th>Vessel</th>
                    <th>Teller</th>
                    <th>Description</th>
                    <th>Total Sales</th>
                    <th>Refund</th>
                    <th>Net Sales</th>
                  </tr>
                </thead>
                <caption style={{ textAlign: 'left', fontWeight: 'bold' }}>
                  {paymentMethod}
                </caption>
                <tbody>
                  <tr>
                    <td>{data.shipName}</td>
                    <td>{data.passengers && data.passengers[0]?.teller}</td>
                    <td>PAX INCOME</td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(
                        paymentMethod === 'OTC'
                          ? breakdown.passenger.OTC.totalSales
                          : paymentMethod === 'Agency'
                          ? breakdown.passenger.Agency.totalSales
                          : paymentMethod === 'Collect'
                          ? breakdown.passenger.Collect.totalSales
                          : paymentMethod === 'RoundTrip'
                          ? breakdown.passenger.RoundTrip.totalSales
                          : breakdown.passenger.Online.totalSales
                      )}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(
                        paymentMethod === 'OTC'
                          ? breakdown.passenger.OTC.totalRefund
                          : paymentMethod === 'Agency'
                          ? breakdown.passenger.Agency.totalRefund
                          : paymentMethod === 'Collect'
                          ? breakdown.passenger.Collect.totalRefund
                          : paymentMethod === 'RoundTrip'
                          ? breakdown.passenger.RoundTrip.totalRefund
                          : breakdown.passenger.Online.totalRefund
                      )}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(
                        paymentMethod === 'OTC'
                          ? breakdown.passenger.OTC.totalNetSales
                          : paymentMethod === 'Agency'
                          ? breakdown.passenger.Agency.totalNetSales
                          : paymentMethod === 'Collect'
                          ? breakdown.passenger.Collect.totalNetSales
                          : paymentMethod === 'RoundTrip'
                          ? breakdown.passenger.RoundTrip.totalNetSales
                          : breakdown.passenger.Online.totalNetSales
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>{data.shipName}</td>
                    <td>{data.passengers && data.passengers[0]?.teller}</td>
                    <td>CARGO INCOME</td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(
                        paymentMethod === 'OTC'
                          ? breakdown.vehicle.OTC.totalSales
                          : paymentMethod === 'Agency'
                          ? breakdown.vehicle.Agency.totalSales
                          : paymentMethod === 'Collect'
                          ? breakdown.vehicle.Collect.totalSales
                          : paymentMethod === 'RoundTrip'
                          ? breakdown.vehicle.RoundTrip.totalSales
                          : breakdown.vehicle.Online.totalSales
                      )}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(
                        paymentMethod === 'OTC'
                          ? breakdown.vehicle.OTC.totalRefund
                          : paymentMethod === 'Agency'
                          ? breakdown.vehicle.Agency.totalRefund
                          : paymentMethod === 'Collect'
                          ? breakdown.vehicle.Collect.totalRefund
                          : paymentMethod === 'RoundTrip'
                          ? breakdown.vehicle.RoundTrip.totalRefund
                          : breakdown.vehicle.Online.totalRefund
                      )}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(
                        paymentMethod === 'OTC'
                          ? breakdown.vehicle.OTC.totalNetSales
                          : paymentMethod === 'Agency'
                          ? breakdown.vehicle.Agency.totalNetSales
                          : paymentMethod === 'Collect'
                          ? breakdown.vehicle.Collect.totalNetSales
                          : paymentMethod === 'RoundTrip'
                          ? breakdown.vehicle.RoundTrip.totalNetSales
                          : breakdown.vehicle.Online.totalNetSales
                      )}
                    </td>
                  </tr>
                </tbody>
                <tfoot style={{ backgroundColor: '#ddebf7' }}>
                  <tr style={{ fontWeight: 'bold' }}>
                    <td colSpan={3}>TOTAL SALES</td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(
                        paymentMethod === 'OTC'
                          ? breakdown.passenger.OTC.totalSales +
                              breakdown.vehicle.OTC.totalSales
                          : paymentMethod === 'Agency'
                          ? breakdown.passenger.Agency.totalSales +
                            breakdown.vehicle.Agency.totalSales
                          : paymentMethod === 'Collect'
                          ? breakdown.passenger.Collect.totalSales +
                            breakdown.vehicle.Collect.totalSales
                          : paymentMethod === 'RoundTrip'
                          ? breakdown.passenger.RoundTrip.totalSales +
                            breakdown.vehicle.RoundTrip.totalSales
                          : breakdown.passenger.Online.totalSales +
                            breakdown.vehicle.Online.totalSales
                      )}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(
                        paymentMethod === 'OTC'
                          ? breakdown.passenger.OTC.totalRefund +
                              breakdown.vehicle.OTC.totalRefund
                          : paymentMethod === 'Agency'
                          ? breakdown.passenger.Agency.totalRefund +
                            breakdown.vehicle.Agency.totalRefund
                          : paymentMethod === 'Collect'
                          ? breakdown.passenger.Collect.totalRefund +
                            breakdown.vehicle.Collect.totalRefund
                          : paymentMethod === 'RoundTrip'
                          ? breakdown.passenger.RoundTrip.totalRefund +
                            breakdown.vehicle.RoundTrip.totalRefund
                          : breakdown.passenger.Online.totalRefund +
                            breakdown.vehicle.Online.totalRefund
                      )}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(
                        paymentMethod === 'OTC'
                          ? breakdown.passenger.OTC.totalNetSales +
                              breakdown.vehicle.OTC.totalNetSales
                          : paymentMethod === 'Agency'
                          ? breakdown.passenger.Agency.totalNetSales +
                            breakdown.vehicle.Agency.totalNetSales
                          : paymentMethod === 'Collect'
                          ? breakdown.passenger.Collect.totalNetSales +
                            breakdown.vehicle.Collect.totalNetSales
                          : paymentMethod === 'RoundTrip'
                          ? breakdown.passenger.RoundTrip.totalNetSales +
                            breakdown.vehicle.RoundTrip.totalNetSales
                          : breakdown.passenger.Online.totalNetSales +
                            breakdown.vehicle.Online.totalNetSales
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}

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
              tableLayout: 'fixed',
            }}
          >
            <caption style={{ textAlign: 'left' }}>DISBURSEMENT</caption>
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <th>Date</th>
                <th>Teller</th>
                <th>Official Receipt</th>
                <th>Paid To</th>
                <th>Description</th>
                <th>Purpose</th>
                <th style={{ textAlign: 'left' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.disbursements?.map((disbursement) => {
                totalExpenses += disbursement.amount;
                return (
                  <tr>
                    <td>
                      {dayjs(disbursement.dateIso)
                        .tz('Asia/Shanghai')
                        .format('MM/DD/YYYY')}
                    </td>
                    <td>{disbursement.createdByAccount?.email}</td>
                    <td className={styles['td-text-wrap']}>
                      {disbursement.officialReceipt}
                    </td>
                    <td className={styles['td-text-wrap']}>
                      {disbursement.paidTo}
                    </td>
                    <td className={styles['td-text-wrap']}>
                      {
                        OPERATION_COSTS[
                          disbursement.description as keyof typeof OPERATION_COSTS
                        ]
                      }
                    </td>
                    <td className={styles['td-text-wrap']}>
                      {disbursement.purpose}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(disbursement.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <td colSpan={6}>TOTAL EXPENSES</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalExpenses)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div
          className={`${styles['center-div']} ${styles['font-style']}`}
          style={{ marginTop: 10 }}
        >
          <table
            style={{
              width: '60%',
              borderCollapse: 'collapse',
              fontSize: 8,
            }}
          >
            <caption style={{ textAlign: 'left', fontWeight: 'bold' }}>
              SUMMARY
            </caption>
            <tbody>
              {paymentMethods.map((paymentMethod) => {
                return (
                  <tr>
                    <td>{paymentMethod} Total Sales</td>
                    <td></td>
                    <td style={{ textAlign: 'right' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(
                        paymentMethod === 'OTC'
                          ? breakdown.passenger.OTC.totalSales +
                              breakdown.vehicle.OTC.totalSales
                          : paymentMethod === 'Agency'
                          ? breakdown.passenger.Agency.totalSales +
                            breakdown.vehicle.Agency.totalSales
                          : paymentMethod === 'Collect'
                          ? breakdown.passenger.Collect.totalSales +
                            breakdown.vehicle.Collect.totalSales
                          : paymentMethod === 'RoundTrip'
                          ? breakdown.passenger.RoundTrip.totalSales +
                            breakdown.vehicle.RoundTrip.totalSales
                          : breakdown.passenger.Online.totalSales +
                            breakdown.vehicle.Online.totalSales
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td>TOTAL SALES</td>
                <td>
                  {data.srcPort.code}-{data.destPort.code}/WT:&nbsp;
                  {dayjs(data.departureDate)
                    .tz('Asia/Shanghai')
                    .format('MMMM D, YYYY [at] h:mm A')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    totalPassengerSales + totalVehicleSales
                  )}
                </td>
              </tr>
              <tr>
                <td>LESS: Refund</td>
                <td></td>
                <td style={{ textAlign: 'right' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    totalPassengerRefund + totalVehicleRefund
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ verticalAlign: 'top' }}>EXPENSES</td>
                {Object.keys(expenses).map((expense) => {
                  return (
                    <td style={two_columns_grid}>
                      <div>
                        {
                          OPERATION_COSTS[
                            expense as keyof typeof OPERATION_COSTS
                          ]
                        }
                      </div>
                      <div style={{ textAlign: 'right', maxWidth: 50 }}>
                        PHP&nbsp;
                        {roundToTwoDecimalPlacesAndAddCommas(expenses[expense])}
                      </div>
                    </td>
                  );
                })}
                <td style={{ verticalAlign: 'top', textAlign: 'right' }}>
                  PHP&nbsp;{roundToTwoDecimalPlacesAndAddCommas(totalExpenses)}
                </td>
              </tr>
              <tr>
                <td>NET SALES</td>
                <td>
                  {data.srcPort.code}-{data.destPort.code}/WT:&nbsp;
                  {dayjs(data.departureDate)
                    .tz('Asia/Shanghai')
                    .format('MMMM D, YYYY [at] h:mm A')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    totalPassengerNetSales +
                      totalVehicleNetSales -
                      totalExpenses
                  )}
                </td>
              </tr>
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

export default ProfitAndLossStatement;
