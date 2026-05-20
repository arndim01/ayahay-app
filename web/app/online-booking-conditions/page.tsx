'use client';
import styles from './page.module.scss';
import { Typography } from 'antd';

const { Title } = Typography;

export default function OnlineBookingConditionsPage() {
  return (
    <div id={styles['online-booking-conditions']}>
      <Title level={1}>AYAHAY ONLINE BOOKING CONDITIONS</Title>
      <p>
        Before using this site to book ferry journeys, please read the following
        booking conditions.
      </p>
      <Title level={2}>APPLICATION</Title>
      <p>
        These Booking Conditions apply to all passenger bookings for ferry
        journeys through this site. "You" refers to the person making the
        booking, and each person for whom the booking is made is a "Customer."
      </p>
      <Title level={2}>PARTIES</Title>
      <p>
        These Booking Conditions apply to AYAHAY's services. The contract forms
        with both AYAHAY and the ferry operator. In case of conflict, the
        operator's terms prevail.
      </p>
      <Title level={2}>FARES AND GENERAL INFORMATION</Title>
      <p>
        Fares are based on vessel type, number of passengers, routes, and travel
        dates. Special conditions may apply to promotional rates. Vehicle and
        passenger space are subject to availability. Promotional fares are
        subject to conditions, including potential additional charges for unused
        portions.
      </p>
      <Title level={2}>DEPARTURE SCHEDULES</Title>
      <p>
        Departure/arrival times are estimates. Schedules may be interrupted or
        altered due to weather, tidal conditions, or other circumstances.
        Alternative ships or points of departure may be used.
      </p>
      <Title level={2}>ANIMALS</Title>
      <p>
        Carriage of animals is permitted with prior notification, complying with
        legal requirements, and may incur additional charges.
      </p>
      <Title level={2}>FREIGHT AND COMMERCIAL PASSENGER VEHICLES</Title>
      <p>
        Special conditions apply, and rates vary. Definitions are determined by
        the operator.
      </p>
      <Title level={2}>HAZARDOUS MATERIALS</Title>
      <p>
        Dangerous or hazardous materials are not accepted. Permission, if
        granted, may incur additional charges.
      </p>
      <Title level={2}>CONFIRMATION AND PAYMENT</Title>
      <p>
        Full payment is required at the time of booking, and a confirmation
        advice note will be issued. The contract is formed upon confirmation.
      </p>
      <Title level={2}>CANCELLATION</Title>
      <p>
        Cancellation is subject to fees, and refund availability depends on the
        ticket type. Special offer tickets may be non-refundable.
      </p>
      <Title level={2}>AMENDMENT FEES</Title>
      <p>
        Amendments may be subject to fees and fare differences. Some bookings,
        such as promotional fares, may be non-amendable.
      </p>
      <Title level={2}>CHECK-IN</Title>
      <p>
        Check-in times are stated during the booking process. Special
        requirements or permissions may require earlier check-in. The operator
        has discretion on passenger acceptance.
      </p>
      <Title level={2}>YOUR RESPONSIBILITY</Title>
      <p>
        You are responsible for compliance with these Booking Conditions,
        providing accurate booking information, and ensuring all necessary
        travel documents are obtained.
      </p>
      <Title level={2}>EVENTS BEYOND CONTROL</Title>
      <p>
        Either party can terminate the contract in the event of unforeseen
        circumstances significantly impacting the booked travel.
      </p>
      <Title level={2}>OUR LIABILITY</Title>
      <p>
        We are responsible for selecting and monitoring operators and the
        accuracy of information we provide. We are not liable for information
        not published by us or for the journey itself, which is the operator's
        responsibility.
      </p>
      <Title level={2}>LIMITATION OF LIABILITY</Title>
      <p>
        Our liability is limited to losses directly resulting from gross breach
        of legal duty or these Booking Conditions, not exceedingly twice the
        amount paid for the booking.
      </p>
      <Title level={2}>PRICES</Title>
      <p>
        Prices quoted on the site are subject to change. Changes do not affect
        already accepted bookings.
      </p>
    </div>
  );
}
