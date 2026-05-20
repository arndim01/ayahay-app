import { forwardRef } from 'react';
import { PerVesselReport as IPerVesselReport } from '@ayahay/http';
import { getFullDate } from '@ayahay/services/date.service';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Reports.module.scss';
import {
  three_columns_grid,
  two_columns_grid,
} from './PassengerDailySalesReport';
import { first, sum } from 'lodash';
import { roundToTwoDecimalPlacesAndAddCommas } from '@/services/reporting.service';
import { IShippingLine } from '@ayahay/models';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);

interface SummarySalesPerVoyageProps {
  data: IPerVesselReport[];
  shippingLine: IShippingLine;
  startDate: string;
  endDate: string;
  reportType?: string;
}

export interface MOPBreakdown {
  OTC: {
    aggFare: number;
  };
  Agency: {
    aggFare: number;
  };
  Online: {
    aggFare: number;
  };
  Collect: {
    aggFare: number;
  };
  RoundTrip: {
    aggFare: number;
  };
}

const SummarySalesPerVessel = forwardRef(function (
  {
    data,
    shippingLine,
    startDate,
    endDate,
    reportType,
  }: SummarySalesPerVoyageProps,
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

  let totalPaxSales = 0;
  let totalPaxBooked = 0;
  let totalPaxFare = 0;

  let totalVehicleSales = 0;
  let totalVehicleBooked = 0;
  let totalVehicleFare = 0;

  let totalDisbursements = 0;

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
            {reportType === undefined
              ? 'SUMMARY SALES PER TRIP REPORT'
              : 'SUMMARY SALES PER VESSEL REPORT'}
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
            <p>VESSEL NAME: {first(data)?.shipName}</p>
            {reportType === undefined && (
              <p>
                ROUTE: {first(data)?.srcPort.name} to&nbsp;
                {first(data)?.destPort.name}
              </p>
            )}
            <p>
              SCHEDULE: {getFullDate(startDate, true)} to&nbsp;
              {getFullDate(endDate, true)}
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
            <caption style={{ textAlign: 'left' }}>PASSENGERS</caption>
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <th>Voyage</th>
                <th></th>
                <th>Discount Type</th>
                <th style={{ textAlign: 'left' }}>Total</th>
                <th style={{ textAlign: 'left' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((shipData) => {
                if (
                  shipData.passengers?.length === 0 &&
                  shipData.passengerDiscountsBreakdown?.length === 0
                ) {
                  return;
                }

                let bookedCount = 0;

                shipData.passengers?.map((passenger: any) => {
                  totalPaxFare += passenger.ticketCost;
                  if (passenger.paymentStatus === 'Online') {
                    mopBreakdown.Online.aggFare += passenger.ticketCost;
                  } else if (passenger.paymentStatus === 'Agency') {
                    mopBreakdown.Agency.aggFare += passenger.ticketCost;
                  } else if (passenger.collect) {
                    mopBreakdown.Collect.aggFare += passenger.discountAmount;
                  } else if (passenger.paymentStatus === 'Round Trip') {
                    mopBreakdown.RoundTrip.aggFare += passenger.ticketCost;
                  } else {
                    mopBreakdown.OTC.aggFare += passenger.ticketCost;
                  }
                });

                totalDisbursements += shipData.totalDisbursements;
                const voyage = `${dayjs(shipData.departureDate)
                  .tz('Asia/Shanghai')
                  .format('MMM D, YYYY [at] h:mm A')} (Voyage: ${
                  shipData.voyageNumber ?? '__'
                })`;
                let paxSales = 0;

                const discountTypeBreakdown: any =
                  shipData.passengerDiscountsBreakdown?.map(
                    (passengerDiscount, idx) => {
                      paxSales += passengerDiscount.totalSales;
                      bookedCount += passengerDiscount.totalBooked;
                      return (
                        <tr>
                          {idx === 0 ? (
                            <td>
                              {reportType === undefined
                                ? voyage
                                : `${shipData.srcPort.code} to ${shipData.destPort.code} ${voyage}`}
                            </td>
                          ) : (
                            <td></td>
                          )}
                          <td></td>
                          <td>{passengerDiscount.typeOfDiscount}</td>
                          <td style={{ textAlign: 'left' }}>
                            {passengerDiscount.totalBooked}
                          </td>
                          <td style={{ textAlign: 'left' }}>
                            PHP&nbsp;
                            {roundToTwoDecimalPlacesAndAddCommas(
                              passengerDiscount.totalSales
                            )}
                          </td>
                        </tr>
                      );
                    }
                  );

                const subTotalRow = (
                  <tr style={{ fontWeight: 'bold' }}>
                    <td></td>
                    <td>Sub-total</td>
                    <td></td>
                    <td></td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(paxSales)}
                    </td>
                  </tr>
                );

                totalPaxBooked += bookedCount;
                totalPaxSales += paxSales;

                return [...discountTypeBreakdown, subTotalRow];
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <td colSpan={3}>TOTAL</td>
                <td style={{ textAlign: 'left' }}>{totalPaxBooked}</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalPaxSales)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

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
            <caption style={{ textAlign: 'left' }}>CARGOES</caption>
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <th>Voyage</th>
                <th></th>
                <th>Vehicle Type</th>
                <th style={{ textAlign: 'left' }}>Total</th>
                <th style={{ textAlign: 'left' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((shipData) => {
                if (
                  shipData.vehicles?.length === 0 &&
                  shipData.vehicleTypesBreakdown?.length === 0
                ) {
                  return;
                }

                let bookedCount = 0;

                shipData.vehicles?.map((vehicle: any) => {
                  totalVehicleFare += vehicle.ticketCost;
                  if (vehicle.paymentStatus === 'Online') {
                    mopBreakdown.Online.aggFare += vehicle.ticketCost;
                  } else if (vehicle.paymentStatus === 'Agency') {
                    mopBreakdown.Agency.aggFare += vehicle.ticketCost;
                  } else {
                    mopBreakdown.OTC.aggFare += vehicle.ticketCost;
                  }
                });

                const voyage = `${dayjs(shipData.departureDate)
                  .tz('Asia/Shanghai')
                  .format('MMM D, YYYY [at] h:mm A')} (Voyage: ${
                  shipData.voyageNumber ?? '__'
                })`;
                let vehicleSales = 0;

                const vehicleTypeBreakdown: any =
                  shipData.vehicleTypesBreakdown?.map((vehicle, idx) => {
                    vehicleSales += vehicle.totalSales;
                    bookedCount += vehicle.totalBooked;
                    return (
                      <tr>
                        {idx === 0 ? (
                          <td>
                            {reportType === undefined
                              ? voyage
                              : `${shipData.srcPort.code} to ${shipData.destPort.code} ${voyage}`}
                          </td>
                        ) : (
                          <td></td>
                        )}
                        <td></td>
                        <td>{vehicle.typeOfVehicle}</td>
                        <td style={{ textAlign: 'left' }}>
                          {vehicle.totalBooked}
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          PHP&nbsp;
                          {roundToTwoDecimalPlacesAndAddCommas(
                            vehicle.totalSales
                          )}
                        </td>
                      </tr>
                    );
                  });

                const subTotalRow = (
                  <tr style={{ fontWeight: 'bold' }}>
                    <td></td>
                    <td>Sub-total</td>
                    <td></td>
                    <td></td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(vehicleSales)}
                    </td>
                  </tr>
                );

                totalVehicleBooked += bookedCount;
                totalVehicleSales += vehicleSales;

                return [...vehicleTypeBreakdown, subTotalRow];
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <td colSpan={3}>TOTAL</td>
                <td style={{ textAlign: 'left' }}>{totalVehicleBooked}</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalVehicleSales)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div
          className={styles['font-style']}
          style={{
            ...two_columns_grid,
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
                        sum([totalPaxFare, totalVehicleFare])
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
              marginRight: 4,
            }}
          >
            <tbody>
              <tr>
                <td style={{ textAlign: 'left', width: '50%' }}>
                  Total Passenger Sales
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalPaxSales)}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left', width: '50%' }}>
                  Total Cargo Sales
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalVehicleSales)}
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
                <td style={{ textAlign: 'left', width: '50%' }}>TOTAL SALES</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    sum([totalPaxSales, totalVehicleSales, -totalDisbursements])
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

export default SummarySalesPerVessel;
