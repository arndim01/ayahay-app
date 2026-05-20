import {
  Controller,
  Param,
  Post,
  Body,
  Request,
  UseGuards,
  Query,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { PaymentService } from './payment.service';
import {
  PaymentInitiationRequest,
  PaymentInitiationResponse,
} from '@ayahay/http';
import { AllowUnauthenticated } from '@/decorator/authenticated.decorator';
import { AuthGuard } from '@/auth/auth.guard';
import { PayMongoCheckoutPaidPostbackRequest } from './payment.types';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ConfirmBookingResponse } from '@/specs/booking.specs';

@Controller('pay')
@ApiTags('Payments')
@ApiBearerAuth()
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('bookings/:tempBookingId')
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  @ApiCreatedResponse({ type: ConfirmBookingResponse })
  @ApiParam({
    schema: { type: 'number' },
    name: 'tempBookingId',
    description: 'The temporary ID of the booking created from POST /bookings.',
  })
  async payBooking(
    @Request() req,
    @Param('tempBookingId')
    tempBookingId: number,
    @Body() body: PaymentInitiationRequest = {}
  ): Promise<PaymentInitiationResponse> {
    return this.paymentService.startPaymentFlow(tempBookingId, body, req.user);
  }

  @Post('bookings/requests/:bookingId')
  @UseGuards(AuthGuard)
  @AllowUnauthenticated()
  @ApiExcludeEndpoint()
  async payBookingRequest(
    @Param('bookingId') bookingId: string
  ): Promise<PaymentInitiationResponse> {
    return this.paymentService.startPaymentFlowForBookingRequest(bookingId);
  }

  @Post('postback/dpay')
  @ApiExcludeEndpoint()
  async dragonpayPostback(
    @Body('txnid') transactionId: string,
    @Body('refno') referenceNo: string,
    @Body('status') status: string,
    @Body('message') message: string,
    @Body('amount') amount: number,
    @Body('ccy') currency: string,
    @Body('procid') processorId: string,
    @Body('digest') digest: string
  ): Promise<string> {
    return this.paymentService.handleDragonpayPostback(
      transactionId,
      referenceNo,
      status,
      message,
      amount,
      currency,
      processorId,
      digest
    );
  }

  @Post('postback/paymongo/checkout-paid')
  @ApiExcludeEndpoint()
  async payMongoCheckoutPaidPostback(
    @Req() request: RawBodyRequest<FastifyRequest>,
    @Headers() headers: Record<string, string>,
    @Body() postback: { data: PayMongoCheckoutPaidPostbackRequest }
  ): Promise<void> {
    return this.paymentService.handlePayMongoCheckoutPaidPostback(
      request.rawBody,
      headers,
      postback.data
    );
  }
}
