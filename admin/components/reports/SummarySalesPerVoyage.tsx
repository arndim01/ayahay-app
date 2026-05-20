import { forwardRef } from 'react';
import { TripReport as ITripReport } from '@ayahay/http';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Reports.module.scss';
import {
  three_columns_grid,
  two_columns_grid,
} from './PassengerDailySalesReport';
import { MOPBreakdown } from './SummarySalesPerVessel';
import { roundToTwoDecimalPlacesAndAddCommas } from '@/services/reporting.service';
import { sumBy } from 'lodash';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);

interface SummarySalesPerVoyageProps {
  data: ITripReport;
  status: string;
}

const SummarySalesPerVoyage = forwardRef(function (
  { data, status }: SummarySalesPerVoyageProps,
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
  let totalPassengerSales = 0;
  let totalPassengerRefund = 0;
  let totalPassengerNetSales = 0;

  data.passengers?.map((passenger) => {
    const paymentStatus = passenger.paymentStatus;
    totalPassengerSales += passenger.collect
      ? passenger.discountAmount
      : passenger.ticketSale;
    totalPassengerRefund += passenger.refundAmount;
    totalPassengerNetSales += passenger.ticketCost;

    if (paymentStatus === 'Online') {
      mopBreakdown.Online.aggFare += passenger.ticketSale;
    } else if (paymentStatus === 'Agency') {
      mopBreakdown.Agency.aggFare += passenger.ticketSale;
    } else if (passenger.collect) {
      mopBreakdown.Collect.aggFare += passenger.discountAmount;
    } else if (paymentStatus === 'Round Trip') {
      mopBreakdown.RoundTrip.aggFare += passenger.ticketSale;
    } else {
      mopBreakdown.OTC.aggFare += passenger.ticketSale;
    }
  });

  let totalVehicles = data.vehicles?.length;
  let totalVehicleSales = 0;
  let totalVehicleRefund = 0;
  let totalVehicleNetSales = 0;

  data.vehicles?.map((vehicle) => {
    const paymentStatus = vehicle.paymentStatus;
    totalVehicleSales += vehicle.collect
      ? vehicle.discountAmount
      : vehicle.ticketSale;
    totalVehicleRefund += vehicle.refundAmount;
    totalVehicleNetSales += vehicle.ticketCost;

    if (paymentStatus === 'Online') {
      mopBreakdown.Online.aggFare += vehicle.ticketSale;
    } else if (paymentStatus === 'Agency') {
      mopBreakdown.Agency.aggFare += vehicle.ticketSale;
    } else if (vehicle.collect) {
      mopBreakdown.Collect.aggFare += vehicle.discountAmount;
    } else if (paymentStatus === 'Round Trip') {
      mopBreakdown.RoundTrip.aggFare += vehicle.ticketSale;
    } else {
      mopBreakdown.OTC.aggFare += vehicle.ticketSale;
    }
  });

  const totalDisbursements = sumBy(data.disbursements, 'amount');

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
            SUMMARY SALES PER VOYAGE REPORT
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
            <p>STATUS: {status}</p>
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
                <th>Vessel</th>
                <th>Total Passengers</th>
                <th>Total Vehicles</th>
                <th style={{ textAlign: 'left' }}>Total Sales</th>
                <th style={{ textAlign: 'left' }}>Refund</th>
                <th style={{ textAlign: 'left' }}>Net Sales</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{data.shipName}</td>
                <td>{totalPassengers}</td>
                <td></td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalPassengerSales)}
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalPassengerRefund)}
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalPassengerNetSales)}
                </td>
              </tr>
              <tr>
                <td>{data.shipName}</td>
                <td></td>
                <td>{totalVehicles}</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalVehicleSales)}
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalVehicleRefund)}
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalVehicleNetSales)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          className={styles['font-style']}
          style={{ ...two_columns_grid, marginTop: 25, paddingLeft: 22 }}
        >
          <table
            style={{
              borderCollapse: 'collapse',
              textAlign: 'center',
              fontSize: 8,
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
                <th className={styles['header-border']}>Fare</th>
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
                            mopBreakdown[mop as keyof MOPBreakdown].aggFare ?? 0
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
                      {roundToTwoDecimalPlacesAndAddCommas(
                        totalPassengerRefund + totalVehicleRefund
                      )}
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
                        totalPassengerSales +
                          totalVehicleSales +
                          totalPassengerRefund +
                          totalVehicleRefund
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>

          <table
            style={{
              width: '50%',
              borderCollapse: 'collapse',
              fontSize: 8,
              marginLeft: 'auto',
            }}
          >
            <tbody>
              <tr>
                <td style={{ textAlign: 'left', width: '50%' }}>
                  Total Passenger Net Sales
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalPassengerNetSales)}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left', width: '50%' }}>
                  Total Cargo Net Sales
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalVehicleNetSales)}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left', width: '50%' }}>
                  Total Disbursements
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;-
                  {roundToTwoDecimalPlacesAndAddCommas(totalDisbursements)}
                </td>
              </tr>
              <tr style={{ fontWeight: 'bold' }}>
                <td style={{ textAlign: 'left', width: '50%' }}>TOTAL</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    totalPassengerNetSales +
                      totalVehicleNetSales -
                      totalDisbursements
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

export default SummarySalesPerVoyage;
