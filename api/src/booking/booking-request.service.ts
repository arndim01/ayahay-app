import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { PaginatedRequest, PaginatedResponse } from '@ayahay/http';
import { IAccount, IBooking } from '@ayahay/models';
import { BookingMapper } from '@/booking/booking.mapper';
import { BookingReservationService } from '@/booking/booking-reservation.service';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingMapper: BookingMapper,
    private readonly bookingReservationService: BookingReservationService
  ) {}

  async getBookingRequestById(
    tempBookingId: number,
    loggedInAccount?: IAccount
  ): Promise<IBooking> {
    const bookingRequestEntity = await this.prisma.tempBooking.findUnique({
      where: {
        id: tempBookingId,
      },
    });

    if (bookingRequestEntity === null) {
      throw new NotFoundException();
    }

    if (
      loggedInAccount === undefined &&
      bookingRequestEntity.createdByAccountId !== null
    ) {
      throw new ForbiddenException();
    }

    if (
      bookingRequestEntity.createdByAccountId !== null &&
      loggedInAccount !== undefined &&
      loggedInAccount.role === 'Passenger' &&
      bookingRequestEntity.createdByAccountId !== loggedInAccount.id
    ) {
      throw new ForbiddenException();
    }

    const bookingRequest =
      this.bookingMapper.convertTempBookingToBooking(bookingRequestEntity);

    if (bookingRequest.approvedByAccountId !== null) {
      // we say this booking request has a confirmed booking ID
      bookingRequest.id = bookingRequestEntity.paymentReference;
    }

    // TODO: populate booking trip passengers & vehicles
    bookingRequest.bookingPaymentItems.sort(
      (paymentItemA, paymentItemB) => paymentItemA.id - paymentItemB.id
    );

    return bookingRequest;
  }

  async getBookingRequestsForApproval(
    pagination: PaginatedRequest,
    loggedInAccount: IAccount
  ): Promise<PaginatedResponse<IBooking>> {
    const itemsPerPage = 10;
    const skip = (pagination.page - 1) * itemsPerPage;

    const where: Prisma.TempBookingWhereInput = {
      isBookingRequest: true,
      // filter out rejected booking requests
      failureCancellationRemarks: null,
      // filter out approved booking requests
      approvedByAccountId: null,
    };

    if (loggedInAccount.role !== 'SuperAdmin') {
      where.shippingLineId = loggedInAccount.shippingLineId;
    }

    const bookingRequestEntities = await this.prisma.tempBooking.findMany({
      where,
      orderBy: {
        // early booking requests get shown first
        createdAt: 'asc',
      },
      take: itemsPerPage,
      skip,
    });

    const bookingRequestCount = await this.prisma.tempBooking.count({
      where,
    });

    const bookingRequests = bookingRequestEntities.map((bookingEntity) =>
      this.bookingMapper.convertBookingRequestToAdminDto(bookingEntity)
    );

    return {
      total: bookingRequestCount,
      data: bookingRequests,
    };
  }

  /**
   * we're not exactly "creating" a booking request,
   * we're just marking this temporary booking as a request
   */
  async createBookingRequest(
    tempBookingId: number,
    email?: string,
    loggedInAccount?: IAccount
  ): Promise<IBooking> {
    const tempBooking = await this.prisma.tempBooking.findUnique({
      where: {
        id: tempBookingId,
      },
    });
    if (tempBooking === null) {
      throw new NotFoundException(
        'This booking session has expired. Please create another booking.'
      );
    }

    if (tempBooking.isBookingRequest) {
      throw new BadRequestException('The booking is already a booking request');
    }

    const booking = this.bookingMapper.convertTempBookingToBooking(tempBooking);
    if (!this.isRequestBookingFlow(booking, loggedInAccount)) {
      throw new BadRequestException(
        'The booking is not eligible for request booking'
      );
    }

    await this.prisma.tempBooking.update({
      where: {
        id: tempBookingId,
      },
      data: {
        isBookingRequest: true,
        contactEmail: email,
      },
    });
    return booking;
  }

  isRequestBookingFlow(booking: IBooking, loggedInAccount?: IAccount): boolean {
    return false;
  }

  async approveBookingRequest(
    tempBookingId: number,
    loggedInAccount: IAccount
  ): Promise<void> {
    const bookingRequestEntity = await this.prisma.tempBooking.findUnique({
      where: {
        id: tempBookingId,
      },
    });

    if (bookingRequestEntity === null) {
      throw new NotFoundException();
    }

    if (!bookingRequestEntity.isBookingRequest) {
      throw new BadRequestException(
        'Bookings without a requested status cannot be approved'
      );
    }

    const bookingToCreate =
      this.bookingMapper.convertTempBookingToBooking(bookingRequestEntity);

    bookingToCreate.id = uuidv4();
    bookingToCreate.referenceNo = bookingToCreate.id
      .substring(0, 6)
      .toUpperCase();
    bookingToCreate.bookingStatus = 'Confirmed';
    bookingToCreate.paymentStatus = 'None';
    bookingToCreate.createdAtIso = new Date().toISOString();
    bookingToCreate.approvedByAccountId = loggedInAccount.id;

    await this.prisma.$transaction(async (transactionContext) => {
      await this.bookingReservationService.saveConfirmedBooking(
        bookingToCreate,
        transactionContext as any
      );
      await transactionContext.tempBooking.update({
        where: {
          id: tempBookingId,
        },
        data: {
          approvedByAccountId: loggedInAccount.id,
          paymentReference: bookingToCreate.id,
        },
      });
    });
  }

  async rejectBookingRequest(tempBookingId: number): Promise<void> {
    const bookingRequestEntity = await this.prisma.tempBooking.findUnique({
      where: {
        id: tempBookingId,
      },
    });

    if (bookingRequestEntity === null) {
      throw new NotFoundException();
    }

    if (!bookingRequestEntity.isBookingRequest) {
      throw new BadRequestException(
        'Bookings without a requested status cannot be approved'
      );
    }

    await this.prisma.tempBooking.update({
      where: {
        id: tempBookingId,
      },
      data: {
        failureCancellationRemarks: 'Rejected',
      },
    });
  }
}
