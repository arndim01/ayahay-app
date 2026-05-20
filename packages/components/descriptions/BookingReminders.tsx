import React from 'react';
import { Typography } from 'antd';
const { Title } = Typography;

interface BookingRemindersProps {
  shippingLineName: string | undefined;
  titleLevel: 1 | 2 | 3 | 4 | 5;
  fontSize?: number;
}

export default function BookingReminders({
  shippingLineName,
  titleLevel,
  fontSize,
}: BookingRemindersProps) {
  return (
    <section id='reminders'>
      <Title level={titleLevel}>Booking Reminders</Title>
      <ul style={{ paddingLeft: 20, fontSize: fontSize }}>
        <li>
          Please make sure to print the e-ticket. A copy of the ticket will also
          be sent to your email.
        </li>
        <li>
          Passengers are advised to be at the terminal at least 1 hour before
          the indicated departure time to avoid inconvenience.
        </li>
        <li>
          For passengers with rolling cargo, please print 3 copies of your bill
          of lading (BOL) as well.
        </li>
        <li>
          <span>
            Passengers listed on this itinerary should present valid IDs with
            their names on it. Failure to do so may result in refusal of entry.
          </span>
          <p>List of Valid IDs:</p>
          <ul style={{ paddingLeft: 20 }}>
            <li>
              Government issued photo IDs (National ID, SSS, GSIS, Voter's,
              Postal, Driver's license, PRC, etc)
            </li>
            <li>
              OSCA Id (This ID is required when you have availed of the senior
              citizen discount.)
            </li>
            <li>
              Company ID or Student ID (must have the signature/stamp for the
              current school term.)
            </li>
          </ul>
        </li>
        <li>
          To request a refund or reschedule, please visit the ticketing
          office/website where you originally purchased your tickets. Service
          Fee is non-refundable.
        </li>
        <li>
          Sailing schedule of the vessel may be changed or cancelled without
          prior notice.
        </li>
        <li>
          This ticket is subject to the terms and conditions stated on the
          Ayahay website, and is also subject to the terms and conditions of
          the&nbsp;
          {shippingLineName ? shippingLineName : 'shipping line'}
        </li>
        <li>Ticket is valid for one month from the scheduled trip date.</li>
      </ul>
    </section>
  );
}
