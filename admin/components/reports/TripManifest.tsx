import React from 'react';
import { TripManifest as ITripManifest } from '@ayahay/http';
import dayjs from 'dayjs';
import styles from './TripManifest.module.scss';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(advancedFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

interface TripManifestProps {
  manifest: ITripManifest;
}

const underlined = {
  textDecoration: 'underline',
};

const header = {
  fontSize: '12px',
  fontWeight: '400',
  textAlign: 'center',
};
export default function TripManifest({ manifest }: TripManifestProps) {
  return (
    <table className={styles['manifest']}>
      <thead>
        <tr>
          <td colspan='9'>
            <section className={styles['header']}>
              <p style={{ ...header, maxWidth: '250px', lineHeight: '1.2' }}>
                REPUBLIC OF THE PHILIPPINES DEPARTMENT OF FINANCE BUREAU OF
                CUSTOMS
              </p>
              <h1 style={header}>Philippine Coastwise Passengers Manifest</h1>
              <p>
                A complete list of all passengers taken on board the&nbsp;
                <span style={underlined}>{manifest.shipName}</span>
                &nbsp;sailing from the Port of&nbsp;
                <span style={underlined}>{manifest.srcPortName}</span>
                &nbsp;on the&nbsp;
                <span style={underlined}>
                  {dayjs(manifest.departureDate)
                    .tz('Asia/Shanghai')
                    .format('Do [day of] MMMM[,] YYYY')}
                </span>
                &nbsp;for the Port of&nbsp;
                <span style={underlined}>{manifest.destPortName}</span>
              </p>
            </section>
          </td>
        </tr>
        <tr className={styles['main']}>
          <th>No.</th>
          <th>NAMES</th>
          <th>BIRTH DATE</th>
          <th>AGE</th>
          <th>SEX</th>
          <th>Ticket No.</th>
          <th>Nationality</th>
          <th>Place of Residence in the R.P.</th>
          <th>Class</th>
        </tr>
      </thead>
      <tbody>
        {manifest.passengers.map((passenger, index) => (
          <tr key={index} className={styles['main']}>
            <td>{index + 1}</td>
            <td>{passenger.fullName}</td>
            <td>
              {passenger.birthDate
                ? dayjs(passenger.birthDate)
                    .tz('Asia/Shanghai')
                    .format('MM/DD/YYYY')
                : ''}
            </td>
            <td>{passenger.age}</td>
            <td>{passenger.sex}</td>
            <td></td>
            <td>{passenger.nationality}</td>
            <td>{passenger.address}</td>
            <td></td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colspan='9'>
            <section className={styles['footer']}>
              <p>
                DISTRICT OF <BlankUnderline width='250px' /> )<br />
                Port of <span style={underlined}>{manifest.srcPortName}</span> )
                S.S.
              </p>
              <p>
                I,&nbsp;
                <BlankUnderline width='250px' />, master of the&nbsp;
                <span style={underlined}>{manifest.shipName}</span>, do solemnly
                swear that the foregoing is a full and complete manifest of all
                passengers taken on board said vessel on its present voyage, and
                statements contained therein are true and correct to the best of
                my knowledge and belief.
              </p>

              <div className={styles['signature']}>
                <BlankUnderline width='250px' />
                <p>Master</p>
              </div>
              <p>
                SUBSCRIBED AND SWORN to before me this&nbsp;
                <span style={underlined}>
                  {dayjs()
                    .tz('Asia/Shanghai')
                    .format('Do [day of] MMMM[,] YYYY')}
                </span>
              </p>
              <div className={styles['signature']}>
                <BlankUnderline width='400px' />
                <p style={{ maxWidth: '350px', lineHeight: '1.2' }}>
                  Empowered to Administer oath under the provisions of Section
                  1147 of the Administrative Code
                </p>
              </div>
            </section>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

interface BlankUnderlineProps {
  width: string;
}

function BlankUnderline({ width }: BlankUnderlineProps) {
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
