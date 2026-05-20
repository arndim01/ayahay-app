/**
 * Represents a VIP customer/company for a shipping line (e.g. Petron)
 * Usually has marked-up rates for vehicle bookings; defined in
 * RateTableMarkup with non-null values for clientId
 */
export interface IClient {
  id: number;

  name: string;
}
