import React from 'react';
import { Typography } from 'antd';
const { Title } = Typography;

interface BookingTermsAndConditionsProps {
  TermsAndConditions?: string;
}

export default function BookingTermsAndConditions({ TermsAndConditions }: BookingTermsAndConditionsProps) {
  if (TermsAndConditions && TermsAndConditions.trim() !== '') {
    // Split on newline characters
    const lines = TermsAndConditions
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return (
      <section style={{ marginTop: 10, padding: '0 25px' }}>
        <Title level={1} style={{ fontSize: 11 }}>
          Terms and Conditions
        </Title>
        <ul style={{ fontSize: 11 }}>
          {lines.map((line, index) => {
            // Append period if not already present
            const formattedLine = line.endsWith('.') ? line : `${line}.`;
            return <li key={index}>{formattedLine}</li>;
          })}
        </ul>
      </section>
    );
  }

  return (
    <section style={{ marginTop: 10, padding: '0 25px', textWrap: 'wrap' }}>
      <Title level={1} style={{ fontSize: 11 }}>
        Terms and Conditions
      </Title>
      <ul style={{ fontSize: 9 }}>
        <li>This ticket is valid for one voyage only.</li>
        <li>
          Any rebooking or cancellation initiated by the passenger will be subject to 20% surcharge.
        </li>
        <li>Refunds will be processed within 30 business days.</li>
        <li>Service fee is NON REFUNDABLE.</li>
        <li>Ticket lost are not entitled for refund.</li>
        <li>
          Passengers are advised to be at the terminal at least 1 hour before the indicated departure.
        </li>
      </ul>
    </section>
  );
}
