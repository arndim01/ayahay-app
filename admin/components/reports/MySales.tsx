import { forwardRef } from 'react';
import { TripReport as ITripReport } from '@ayahay/http';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Reports.module.scss';
import {
  three_columns_grid,
  two_columns_grid,
} from './PassengerDailySalesReport';
import { sum } from 'lodash';
import { roundToTwoDecimalPlacesAndAddCommas } from '@/services/reporting.service';
import { OPERATION_COSTS } from '@ayahay/constants';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(timezone);
dayjs.extend(utc);

interface MySalesProps {
  data: ITripReport;
}

const MySalesReport = forwardRef(function ({ data }: MySalesProps, ref) {
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
              src={`${SHIPPING_LINE_LOGO}${data.shippingLine?.logoFilename}`}
              height={50}
            />
            <span style={{ fontWeight: 'bold' }}>{data.shippingLine.name}</span>
          </div>
          <span className={styles['center-div']} style={{ fontWeight: 'bold' }}>
            MY SALES REPORT
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
              Route: {data.srcPort.name} to {data.destPort.name}
            </p>
            <p>
              Schedule:&nbsp;
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
                <th>Accommodation</th>
                <th>Discounts</th>
                <th style={{ textAlign: 'left' }}>Count</th>
                <th style={{ textAlign: 'left' }}>Total Cash</th>
                <th style={{ textAlign: 'left' }}>Total Collect</th>
              </tr>
            </thead>
            <tbody>
              {data.passengerBreakdown?.map((passengerDiscount) => {
                totalPaxSales += passengerDiscount.totalSales;
                totalPaxCollectSales +=
                  passengerDiscount.totalCollectSales ?? 0;
                totalPaxBooked += passengerDiscount.totalBooked;
                return (
                  <tr>
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
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <td colSpan={2}>TOTAL</td>
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
                <th>Accommodation</th>
                <th>Discounts</th>
                <th style={{ textAlign: 'left' }}>Count</th>
                <th style={{ textAlign: 'left' }}>Total Cash</th>
                <th style={{ textAlign: 'left' }}>Total Collect</th>
              </tr>
            </thead>
            <tbody>
              {data.passengerRefundBreakdown?.map((passengerDiscount) => {
                totalPaxRefunds += passengerDiscount.totalSales;
                totalPaxCollectRefunds +=
                  passengerDiscount.totalCollectSales ?? 0;
                totalPaxRefundsBooked += passengerDiscount.totalBooked;
                return (
                  <tr>
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
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <td colSpan={2}>TOTAL</td>
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
                <th>Vehicle Type</th>
                <th style={{ textAlign: 'left' }}>Count</th>
                <th style={{ textAlign: 'left' }}>Total Cash</th>
                <th style={{ textAlign: 'left' }}>Total Collect</th>
              </tr>
            </thead>
            <tbody>
              {data.vehicleBreakdown?.map((vehicle) => {
                totalVehicleSales += vehicle.totalSales;
                totalVehicleCollectSales += vehicle.totalCollectSales ?? 0;
                totalVehicleBooked += vehicle.totalBooked;
                return (
                  <tr>
                    <td>{vehicle.typeOfVehicle}</td>
                    <td style={{ textAlign: 'left' }}>{vehicle.totalBooked}</td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(vehicle.totalSales)}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(
                        vehicle.totalCollectSales ?? 0
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <td colSpan={1}>TOTAL</td>
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
                <th>Vehicle Type</th>
                <th style={{ textAlign: 'left' }}>Count</th>
                <th style={{ textAlign: 'left' }}>Total Cash</th>
                <th style={{ textAlign: 'left' }}>Total Collect</th>
              </tr>
            </thead>
            <tbody>
              {data.vehicleRefundBreakdown?.map((vehicle) => {
                totalVehicleRefunds += vehicle.totalSales;
                totalVehicleCollectRefunds += vehicle.totalCollectSales ?? 0;
                totalVehicleRefundBooked += vehicle.totalBooked;
                return (
                  <tr>
                    <td>{vehicle.typeOfVehicle}</td>
                    <td style={{ textAlign: 'left' }}>{vehicle.totalBooked}</td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(vehicle.totalSales)}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      PHP&nbsp;
                      {roundToTwoDecimalPlacesAndAddCommas(
                        vehicle.totalCollectSales ?? 0
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#ddebf7' }}>
              <tr>
                <td colSpan={1}>TOTAL</td>
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
                // only show disbursements inputted by logged in user
                if (loggedInAccount?.id !== disbursement.createdByAccountId) {
                  return;
                }

                totalDisbursements += disbursement.amount;

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
              <tr>
                <td colSpan={6}>TOTAL EXPENSES</td>
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

export default MySalesReport;
