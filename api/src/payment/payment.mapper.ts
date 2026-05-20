import { Injectable } from '@nestjs/common';
import { IBookingPaymentItem } from '@ayahay/models';

@Injectable()
export class PaymentMapper {
  convertPaymentItemToDto(paymentItem: any): IBookingPaymentItem {
    return {
      id: paymentItem.id,
      bookingId: paymentItem.bookingId,

      price: paymentItem.price,
      description: paymentItem.description,
      type: paymentItem.type,
    };
  }
}
