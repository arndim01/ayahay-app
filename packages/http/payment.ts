export interface PaymentInitiationRequest {
  paymentGateway?: string;
}

export interface PaymentInitiationResponse {
  redirectUrl: string;
  paymentReference: string;
}
