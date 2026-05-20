import { forwardRef } from 'react';
import { SalesPerTellerReport } from '@ayahay/http';
import { getFullDate } from '@ayahay/services/date.service';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Reports.module.scss';
import {
  three_columns_grid,
  two_columns_grid,
} from './PassengerDailySalesReport';
import { first, sum } from 'lodash';
import { roundToTwoDecimalPlacesAndAddCommas } from '@/services/reporting.service';
import { OPERATION_COSTS } from '@ayahay/constants';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);

interface SalesPerTellerProps {
  data: SalesPerTellerReport;
  startDate: string;
  endDate: string;
}

const SalesPerTeller = forwardRef(function (
  { data, startDate, endDate }: SalesPerTellerProps,
  ref
) {
  const BASE_URL = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_URL;
  const SHIPPING_LINE_LOGO = `${BASE_URL}/shipping_line_logo/`;
  const { loggedInAccount } = useAuth();
  const user = loggedInAccount?.email;
  const date = dayjs().tz('Asia/Shanghai').format('MMMM D, YYYY');

  let totalPaxSales = 0;
  let totalPaxCollectSales = 0;
  let totalPaxBooked = 0;
  let totalPaxRefunds = 0;
  let totalPaxCollectRefunds = 0;
  let totalPaxRefundsBooked = 0;

  let totalVehicleSales = 0;
  let totalVehicleCollectSales = 0;
  let totalVehicleBooked = 0;
  let totalVehicleRefunds = 0;
  let totalVehicleCollectRefunds = 0;
  let totalVehicleRefundBooked = 0;

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
              src={`${SHIPPING_LINE_LOGO}${
                first(data.bookingTripsBreakdown)?.shippingLine?.logoFilename
              }`}
              height={50}
            />
            <span style={{ fontWeight: 'bold' }}>
              {first(data.bookingTripsBreakdown)?.shippingLine.name}
            </span>
          </div>
          <span className={styles['center-div']} style={{ fontWeight: 'bold' }}>
            SALES REPORT
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
            <p>
              Date Range: {getFullDate(startDate, true)} to&nbsp;
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
            <caption style={{ textAlign: 'left' }}>PASSENGER SALES</caption>
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <th>Voyage</th>
                <th></th>
                <th>Accommodation</th>
                <th>Discounts</th>
                <th style={{ textAlign: 'left' }}>Count</th>
                <th style={{ textAlign: 'left' }}>Total Cash</th>
                <th style={{ textAlign: 'left' }}>Total Collect</th>
              </tr>
            </thead>
            <tbody>
              {data.bookingTripsBreakdown?.map((tripData) => {
                if (tripData.passengerBreakdown.length === 0) {
                  return;
                }

                let bookedCount = 0;
                const voyage = `${dayjs(tripData.departureDate)
                  .tz('Asia/Shanghai')
                  .format('MMM D, YYYY [at] h:mm A')} (Voyage: ${
                  tripData.voyageNumber ?? '__'
                })`;
                let paxSales = 0;
                let paxCollectSales = 0;

                const passengerBreakdown: any = tripData.passengerBreakdown.map(
                  (passengerDiscount, idx) => {
                    paxSales += passengerDiscount.totalSales;
                    paxCollectSales += passengerDiscount.totalCollectSales ?? 0;
                    bookedCount += passengerDiscount.totalBooked;
                    return (
                      <tr>
                        {idx === 0 ? (
                          <td>{`${tripData.srcPort.code} to ${tripData.destPort.code} ${voyage}`}</td>
                        ) : (
                          <td></td>
                        )}
                        <td></td>
                        <td>{passengerDiscount.cabinName}</td>
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
                        <td style={{ textAlign: 'left' }}>
                          PHP&nbsp;
                          {roundToTwoDecimalPlacesAndAddCommas(
                            passengerDiscount.totalCollectSales ?? 0
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
                    <td></td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(paxSales)}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(paxCollectSales)}
                    </td>
                  </tr>
                );

                totalPaxBooked += bookedCount;
                totalPaxSales += paxSales;
                totalPaxCollectSales += paxCollectSales;

                return [...passengerBreakdown, subTotalRow];
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <td colSpan={4}>TOTAL</td>
                <td style={{ textAlign: 'left' }}>{totalPaxBooked}</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalPaxSales)}
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalPaxCollectSales)}
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
            <caption style={{ textAlign: 'left' }}>PASSENGER REFUNDS</caption>
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <th>Voyage</th>
                <th></th>
                <th>Accommodation</th>
                <th>Discounts</th>
                <th style={{ textAlign: 'left' }}>Count</th>
                <th style={{ textAlign: 'left' }}>Total Cash</th>
                <th style={{ textAlign: 'left' }}>Total Collect</th>
              </tr>
            </thead>
            <tbody>
              {data.bookingTripsBreakdown?.map((tripData) => {
                if (tripData.passengerRefundBreakdown.length === 0) {
                  return;
                }

                let refundCount = 0;
                const voyage = `${dayjs(tripData.departureDate)
                  .tz('Asia/Shanghai')
                  .format('MMM D, YYYY [at] h:mm A')} (Voyage: ${
                  tripData.voyageNumber ?? '__'
                })`;
                let paxRefunds = 0;
                let paxCollectRefunds = 0;

                const passengerRefundBreakdown: any =
                  tripData.passengerRefundBreakdown.map(
                    (passengerDiscount, idx) => {
                      paxRefunds += passengerDiscount.totalSales;
                      paxCollectRefunds +=
                        passengerDiscount.totalCollectSales ?? 0;
                      refundCount += passengerDiscount.totalBooked;
                      return (
                        <tr>
                          {idx === 0 ? (
                            <td>{`${tripData.srcPort.code} to ${tripData.destPort.code} ${voyage}`}</td>
                          ) : (
                            <td></td>
                          )}
                          <td></td>
                          <td>{passengerDiscount.cabinName}</td>
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
                          <td style={{ textAlign: 'left' }}>
                            PHP&nbsp;
                            {roundToTwoDecimalPlacesAndAddCommas(
                              passengerDiscount.totalCollectSales ?? 0
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
                    <td></td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(paxRefunds)}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(paxCollectRefunds)}
                    </td>
                  </tr>
                );

                totalPaxRefundsBooked += refundCount;
                totalPaxRefunds += paxRefunds;
                totalPaxCollectRefunds += paxCollectRefunds;

                return [...passengerRefundBreakdown, subTotalRow];
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <td colSpan={4}>TOTAL</td>
                <td style={{ textAlign: 'left' }}>{totalPaxRefundsBooked}</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalPaxRefunds)}
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalPaxCollectRefunds)}
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
            <caption style={{ textAlign: 'left' }}>CARGO SALES</caption>
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <th>Voyage</th>
                <th></th>
                <th>Vehicle Type</th>
                <th style={{ textAlign: 'left' }}>Count</th>
                <th style={{ textAlign: 'left' }}>Total Cash</th>
                <th style={{ textAlign: 'left' }}>Total Collect</th>
              </tr>
            </thead>
            <tbody>
              {data.bookingTripsBreakdown?.map((tripData) => {
                if (tripData.vehicleBreakdown.length === 0) {
                  return;
                }

                let bookedCount = 0;
                const voyage = `${dayjs(tripData.departureDate)
                  .tz('Asia/Shanghai')
                  .format('MMM D, YYYY [at] h:mm A')} (Voyage: ${
                  tripData.voyageNumber ?? '__'
                })`;
                let vehicleSales = 0;
                let vehicleCollectSales = 0;

                const vehicleBreakdown: any = tripData.vehicleBreakdown.map(
                  (vehicle, idx) => {
                    vehicleSales += vehicle.totalSales;
                    vehicleCollectSales += vehicle.totalCollectSales ?? 0;
                    bookedCount += vehicle.totalBooked;
                    return (
                      <tr>
                        {idx === 0 ? (
                          <td>{`${tripData.srcPort.code} to ${tripData.destPort.code} ${voyage}`}</td>
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
                        <td style={{ textAlign: 'left' }}>
                          PHP&nbsp;
                          {roundToTwoDecimalPlacesAndAddCommas(
                            vehicle.totalCollectSales ?? 0
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
                      {roundToTwoDecimalPlacesAndAddCommas(vehicleSales)}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(vehicleCollectSales)}
                    </td>
                  </tr>
                );

                totalVehicleBooked += bookedCount;
                totalVehicleSales += vehicleSales;
                totalVehicleCollectSales += vehicleCollectSales;

                return [...vehicleBreakdown, subTotalRow];
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
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    totalVehicleCollectSales
                  )}
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
            <caption style={{ textAlign: 'left' }}>CARGO REFUNDS</caption>
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <th>Voyage</th>
                <th></th>
                <th>Vehicle Type</th>
                <th style={{ textAlign: 'left' }}>Count</th>
                <th style={{ textAlign: 'left' }}>Total Cash</th>
                <th style={{ textAlign: 'left' }}>Total Collect</th>
              </tr>
            </thead>
            <tbody>
              {data.bookingTripsBreakdown?.map((tripData) => {
                if (tripData.vehicleRefundBreakdown.length === 0) {
                  return;
                }

                let refundCount = 0;
                const voyage = `${dayjs(tripData.departureDate)
                  .tz('Asia/Shanghai')
                  .format('MMM D, YYYY [at] h:mm A')} (Voyage: ${
                  tripData.voyageNumber ?? '__'
                })`;
                let vehicleRefunds = 0;
                let vehicleCollectRefunds = 0;

                const vehicleRefundBreakdown: any =
                  tripData.vehicleRefundBreakdown.map((vehicle, idx) => {
                    vehicleRefunds += vehicle.totalSales;
                    vehicleCollectRefunds += vehicle.totalCollectSales ?? 0;
                    refundCount += vehicle.totalBooked;
                    return (
                      <tr>
                        {idx === 0 ? (
                          <td>{`${tripData.srcPort.code} to ${tripData.destPort.code} ${voyage}`}</td>
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
                        <td style={{ textAlign: 'left' }}>
                          PHP&nbsp;
                          {roundToTwoDecimalPlacesAndAddCommas(
                            vehicle.totalCollectSales ?? 0
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
                      {roundToTwoDecimalPlacesAndAddCommas(vehicleRefunds)}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(
                        vehicleCollectRefunds
                      )}
                    </td>
                  </tr>
                );

                totalVehicleRefundBooked += refundCount;
                totalVehicleRefunds += vehicleRefunds;
                totalVehicleCollectRefunds += vehicleCollectRefunds;

                return [...vehicleRefundBreakdown, subTotalRow];
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <td colSpan={3}>TOTAL</td>
                <td style={{ textAlign: 'left' }}>
                  {totalVehicleRefundBooked}
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalVehicleRefunds)}
                </td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    totalVehicleCollectRefunds
                  )}
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
            <caption style={{ textAlign: 'left' }}>DISBURSEMENT</caption>
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <th>Voyage</th>
                <th></th>
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
              {Object.entries(data.disbursements).map(
                ([_tripId, disbursements]) => {
                  if (disbursements.length === 0) {
                    return;
                  }

                  let disbursementsSum = 0;

                  const disbursementRow: any = disbursements.map(
                    (disbursement, idx) => {
                      disbursementsSum += disbursement.amount;

                      const voyage = dayjs(disbursement.departureDateIso)
                        .tz('Asia/Shanghai')
                        .format('MMM D, YYYY [at] h:mm A');

                      return (
                        <tr>
                          {idx === 0 ? (
                            <td>{`${disbursement.srcPortCode} to ${disbursement.destPortCode} ${voyage}`}</td>
                          ) : (
                            <td></td>
                          )}
                          <td></td>
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
                            {roundToTwoDecimalPlacesAndAddCommas(
                              disbursement.amount
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
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td style={{ textAlign: 'left' }}>
                        PHP&nbsp;
                        {roundToTwoDecimalPlacesAndAddCommas(disbursementsSum)}
                      </td>
                    </tr>
                  );

                  totalDisbursements += disbursementsSum;

                  return [...disbursementRow, subTotalRow];
                }
              )}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <td colSpan={8}>TOTAL EXPENSES</td>
                <td style={{ textAlign: 'left' }}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(totalDisbursements)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div
          className={styles['font-style']}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
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
              width: '50%',
            }}
          >
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <th
                  className={styles['header-border']}
                  style={{ borderLeft: '0.001px solid black' }}
                >
                  Cash On Hand Summary
                </th>
                <th className={styles['header-border']}>Amount</th>
              </tr>
            </thead>
            <tbody style={{ borderLeft: '0.001px solid black' }}>
              <tr>
                <td className={styles['cell-border']}>SALES</td>
                <td className={styles['cell-border']}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    totalPaxSales + totalVehicleSales
                  )}
                </td>
              </tr>
              <tr>
                <td className={styles['cell-border']}>REFUNDS</td>
                <td className={styles['cell-border']}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    totalPaxRefunds + totalVehicleRefunds
                  )}
                </td>
              </tr>
              <tr>
                <td className={styles['cell-border']}>DISBURSEMENTS</td>
                <td className={styles['cell-border']}>
                  PHP&nbsp;-
                  {roundToTwoDecimalPlacesAndAddCommas(totalDisbursements)}
                </td>
              </tr>
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <td
                  className={styles['cell-border']}
                  style={{ borderLeft: '0.001px solid black' }}
                >
                  CASH ON HAND
                </td>
                <td className={styles['cell-border']}>
                  <div className={styles['wrap']}>
                    <div style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(
                        sum([
                          totalPaxSales,
                          totalPaxRefunds,
                          totalVehicleSales,
                          totalVehicleRefunds,
                          -totalDisbursements,
                        ])
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>

          <table
            style={{
              borderCollapse: 'collapse',
              textAlign: 'center',
              fontSize: 8,
              width: '30%',
            }}
          >
            <thead style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <th
                  className={styles['header-border']}
                  style={{ borderLeft: '0.001px solid black' }}
                >
                  Collect Summary
                </th>
                <th className={styles['header-border']}>Amount</th>
              </tr>
            </thead>
            <tbody style={{ borderLeft: '0.001px solid black' }}>
              <tr>
                <td className={styles['cell-border']}>SALES</td>
                <td className={styles['cell-border']}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    totalPaxCollectSales + totalVehicleCollectSales
                  )}
                </td>
              </tr>
              <tr>
                <td className={styles['cell-border']}>REFUNDS</td>
                <td className={styles['cell-border']}>
                  PHP&nbsp;
                  {roundToTwoDecimalPlacesAndAddCommas(
                    totalPaxCollectRefunds + totalVehicleCollectRefunds
                  )}
                </td>
              </tr>
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr style={{ fontWeight: 'bold' }}>
                <td
                  className={styles['cell-border']}
                  style={{ borderLeft: '0.001px solid black' }}
                >
                  TOTAL COLLECT
                </td>
                <td className={styles['cell-border']}>
                  <div className={styles['wrap']}>
                    <div style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(
                        sum([
                          totalPaxCollectSales,
                          totalPaxCollectRefunds,
                          totalVehicleCollectSales,
                          totalVehicleCollectRefunds,
                        ])
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
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

export default SalesPerTeller;
