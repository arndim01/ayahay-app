import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import styles from './BillOfLadingReport.module.scss';
import { BillOfLading as IBillOfLading } from '@ayahay/http';
import { Button, Form, Input } from 'antd';

dayjs.extend(timezone);
dayjs.extend(utc);

const underlined = {
  textDecoration: 'underline',
};

const header = {
  fontSize: '22px',
  fontWeight: '400',
  textAlign: 'center',
};

const two_columns_grid = {
  display: 'grid',
  gridTemplateColumns: '3fr 1fr',
};

const three_columns_grid = {
  display: 'grid',
  gridAutoRows: '1fr',
  gridTemplateColumns: '1fr 1fr 1fr',
};

interface BillOfLadingProps {
  data: IBillOfLading;
}

export default function BillOfLadingReport({ data }: BillOfLadingProps) {
  let totalCharge = 0;

  return (
    <div style={{ overflow: 'hidden' }}>
      <table className={styles['bol']}>
        <thead>
          <tr>
            <td colSpan={9}>
              <section className={styles['header']}>
                <p
                  style={{
                    ...header,
                    lineHeight: '1.2',
                    fontWeight: 'bold',
                  }}
                >
                  {data.shippingLineSubsidiary ?? data.shippingLineName}
                </p>
                <div
                  style={{
                    lineHeight: '1',
                    textAlign: 'center',
                    fontSize: '10px',
                  }}
                >
                  <p>{data.shippingLineAddress}</p>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-evenly' }}
                  >
                    <p>Tel. No. {data.shippingLineTelephoneNo}</p>
                    {data.shippingLineFaxNo && (
                      <p>Fax No. {data.shippingLineFaxNo}</p>
                    )}
                  </div>
                </div>
                <div style={{ ...two_columns_grid, width: '100%' }}>
                  <div></div>
                  <div>
                    <p
                      style={{
                        lineHeight: '1',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                    >
                      <span>BOL #&nbsp;{data.referenceNo}</span>
                      <br></br>
                      <span>Original</span>
                    </p>
                    <p style={{ paddingTop: '5px', fontSize: '13px' }}>
                      (CONSIGNEE'S COPY)
                    </p>
                    <p style={{ fontSize: '12px', lineHeight: '1.2' }}>
                      To be surrendered at Port destination upon delivery of
                      cargoes.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    ...two_columns_grid,
                    width: '100%',
                    fontSize: '13px',
                    lineHeight: '1.2',
                  }}
                >
                  <div>
                    <p>
                      VESSEL&nbsp;
                      <span style={underlined}>{data.shipName}</span>
                    </p>
                    <p>
                      DATE AT&nbsp;
                      <span style={underlined}>
                        {dayjs(data.vehicles[0].departureDateIso)
                          .tz('Asia/Shanghai')
                          .format('MM-DD')}
                      </span>
                      &nbsp;,20
                      <span style={underlined}>
                        {dayjs(data.vehicles[0].departureDateIso)
                          .tz('Asia/Shanghai')
                          .format('YY')}
                      </span>
                      &nbsp;VGE. No.&nbsp;
                      {data.voyageNumber ? (
                        <span style={underlined}>{data.voyageNumber}</span>
                      ) : (
                        <BlankUnderline width='20px' />
                      )}
                    </p>
                    <p>
                      SHIPPER&nbsp;
                      <BlankUnderline width='100px' />
                    </p>
                    <p>
                      CONSIGNEE&nbsp;
                      <span style={underlined}>{data.consigneeName}</span>
                    </p>
                    <p>
                      DESTINATION&nbsp;
                      <span style={underlined}>
                        {data.vehicles[0].destPortName}
                      </span>
                    </p>
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      paddingTop: '10px',
                    }}
                  >
                    <p>
                      {data.freightRateReceipt ? (
                        <span>FRR:&nbsp;{data.freightRateReceipt}&nbsp;</span>
                      ) : (
                        <span>FRR:&nbsp;</span>
                      )}
                      <Form.Item name='frr' style={{ display: 'inline-block' }}>
                        <Input
                          placeholder='Input FRR'
                          style={{ maxWidth: '200px' }}
                          className='hide-on-print'
                        />
                      </Form.Item>
                      <Button
                        type='primary'
                        htmlType='submit'
                        className='hide-on-print'
                      >
                        Save
                      </Button>
                    </p>
                    {data.isCollectBooking ? <span>COLLECT</span> : null}
                  </div>
                </div>
              </section>
            </td>
          </tr>
        </thead>
      </table>
      <div style={{ display: 'flex', fontSize: '9px' }}>
        <div
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(-180deg)',
          }}
        >
          RATES, WEIGHT AND/OR MEASUREMENT SUBJECT TO CORRECTION
        </div>
        <div style={{ flexGrow: 1 }}>
          <table className={styles['bol']} style={{ fontSize: '12px' }}>
            <thead>
              <tr className={styles['main']}>
                <th>Marks</th>
                <th>Quantity</th>
                <th>Classification</th>
                <th>DESCRIPTION OF ARTICLES</th>
                <th>Value</th>
                <th>Weight</th>
                <th>Measurement</th>
                <th>Charges</th>
              </tr>
            </thead>
            <tbody style={{ height: '220px' }}>
              {data.vehicles.map((vehicle: any) => {
                totalCharge += vehicle.fare;
                return (
                  <tr className={styles['main']}>
                    <td>1</td>
                    <td>Unit</td>
                    <td>{vehicle.vehicleTypeDesc}</td>
                    <td>
                      {vehicle.modelName} {vehicle.plateNo}
                    </td>
                    <td></td>
                    <td>{vehicle.weight}</td>
                    <td></td>
                    <td>{vehicle.fare}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className={styles['main']}>
                <td colSpan={4}>
                  <div style={three_columns_grid}>
                    <div style={{ textAlign: 'start' }}>
                      Initial of Issuing Clerk:
                    </div>
                    <div style={{ textAlign: 'end' }}>Loaded in Hatch No.</div>
                    <div style={{ textAlign: 'end' }}>TOTAL VALUE</div>
                  </div>
                </td>
                <td></td>
                <td colSpan={2}>Total Charges</td>
                <td>{totalCharge}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(-180deg)',
          }}
        >
          RESPONSIBLE FOR LOSSES AND DAMAGES DUE TO IMPROPER PACKING
        </div>
      </div>
      <div
        style={{
          ...two_columns_grid,
          gridTemplateColumns: '1fr 1fr',
          marginTop: 15,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <div
          style={{ textAlign: 'center', paddingRight: 10, lineHeight: '1.2' }}
        >
          <p>
            Received the merchandise specified herein in good order and
            condition.
          </p>
          <div
            style={{
              borderTop: '1px solid black',
              margin: '50px 40px 20px 40px',
              fontSize: '12px',
            }}
          >
            (CONSIGNEE)
          </div>
          <div style={{ fontSize: '12px' }}>
            Date&nbsp;
            <span style={underlined}>
              {dayjs(data.vehicles[0].departureDateIso)
                .tz('Asia/Shanghai')
                .format('MM-DD')}
            </span>
            &nbsp;,20
            <span style={underlined}>
              {dayjs(data.vehicles[0].departureDateIso)
                .tz('Asia/Shanghai')
                .format('YY')}
            </span>
          </div>
          <div
            style={{
              height: '195px',
              padding: '5px',
              border: '1px solid black',
              display: 'flex',
              flexDirection: 'column',
              marginTop: 40,
            }}
          >
            <p style={{ flexGrow: 1, lineHeight: '1.2', fontSize: '12px' }}>
              The above described merchandise, if properly packed and marked as
              hereby accepted for shipment.
            </p>
            <p>(Space for Stamp & Signature)</p>
          </div>
        </div>
        <div
          style={{
            textAlign: 'justify',
            textIndent: '50px',
            fontSize: '12px',
            paddingLeft: 10,
            lineHeight: '1.2',
          }}
        >
          <p>
            Received of the aforementioned shipment, subject to the rates and
            classification in effect on the date of this bill of lading, the
            merchandise described above for shipment on the aforementioned
            vessel in apparent good order and condition except as noted
            (contents of packages and condition of contents thereof unknown)
            which the carrier agrees to transport to said destination, if on its
            route. Otherwise to deliver with the least possible delay to another
            carrier on the route destination.
          </p>
          <p>
            Carrier is at liberty to deviate and to call at any port or place in
            or out of the customary route, in any order and for any purposes and
            to land cargo into godowns or tranship to a bulk or lighter, if not
            taken delivery as soon as vessel is ready to discharge and with
            liberty to sail with or without pilots and to tow and assist vessels
            in all situations and circumstance and to tranship and forward cargo
            at the discretion of the carrier.
          </p>
          <p>
            It is mutually agreed in consideration or the payment of or
            (agreement to pay) the prescribed freight charges as to each carrier
            of all or any portion of said merchandise, over all or any of said
            route destinations and as to each party at any time interested in
            all of any said merchandise that every service to be performed
            hereunder should be subjected to all conditions wether printed or
            written, contained in this bill of lading.
          </p>
          <div
            style={{
              height: '90px',
              padding: '5px',
              border: '1px solid black',
              marginTop: 10,
              textAlign: 'start',
              textIndent: '0',
              lineHeight: '1.8',
            }}
          >
            <p style={{ textAlign: 'end' }}>
              <BlankUnderline width='100px' />
              ,&nbsp;20&nbsp;
              <BlankUnderline width='40px' />
            </p>
            <p>
              Initial of Quartermaster/Checker <BlankUnderline width='90px' />
            </p>
            <p>
              Verified by <BlankUnderline width='215px' />
            </p>
            <p style={{ textAlign: 'center' }}>Officer on Watch</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BlankUnderlineProps {
  width: string;
}

export function BlankUnderline({ width }: BlankUnderlineProps) {
  return (
    <span
      style={{
        width: width,
        display: 'inline-block',
        borderBottom: '1px solid black',
        lineHeight: '16px',
      }}
    >
      &nbsp;
    </span>
  );
}
