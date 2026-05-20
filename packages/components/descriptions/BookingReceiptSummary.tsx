import { QRCode, Typography } from 'antd';
const { Title } = Typography;

interface BookingReceiptSummaryProps {
  bookingId: string;
  passengerName: string[];
  passengerFare: number[];
  vehiclePlateNoAndModelName: string[];
  vehicleFare: number[];
  routes: Set<string>;
  shippingLineName: string;
  numberOfCopies?: number;
}

export default function BookingReceiptSummary({
  bookingId,
  passengerName,
  passengerFare,
  vehiclePlateNoAndModelName,
  vehicleFare,
  routes,
  shippingLineName,
  numberOfCopies,
}: BookingReceiptSummaryProps) {
  const copiesFromStorage = typeof window !== 'undefined' 
    ? parseInt(localStorage.getItem('receipt-copies') || '2')
    : 2;
  
  const actualCopies = numberOfCopies || copiesFromStorage;

  const renderReceipt = (copyNumber: number) => (
    <div style={{ breakBefore: 'page' }}>
      <Title level={1}>Booking Summary</Title>
      <section>
        <QRCode
          value={`${process.env.NEXT_PUBLIC_WEB_URL}/bookings/${bookingId}`}
          size={160}
          viewBox={`0 0 256 256`}
          type='svg'
        />
      </section>
      <section>
        <p style={{ textDecoration: 'underline' }}>{shippingLineName}</p>
      </section>
      <section>
        {Array.from(routes).map((route) => (
          <p>{route}</p>
        ))}
      </section>
      <section>
        <table style={{ tableLayout: 'fixed', width: '100%' }}>
          <tbody>
            {passengerName.map((el, idx) => (
              <tr>
                <td>{el}</td>
                <td>₱{passengerFare[idx]}</td>
              </tr>
            ))}
            {vehiclePlateNoAndModelName.map((el, idx) => (
              <tr>
                <td>{el}</td>
                <td>₱{vehicleFare[idx]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );

  return (
    <>
      {Array.from({ length: actualCopies }, (_, i) => renderReceipt(i + 1))}
    </>
  );
}
