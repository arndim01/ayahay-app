import { Injectable } from '@nestjs/common';
import { PortMapper } from '@/port/port.mapper';
import {
  BillOfLading,
  CollectBooking,
  PaxBreakdown,
  PortsByShip,
  TripManifest,
  VoidBookings,
} from '@ayahay/http';
import { ShippingLineMapper } from '@/shipping-line/shipping-line.mapper';
import { VehicleBreakdown } from '@ayahay/http/reporting';

@Injectable()
export class ReportingMapper {
  constructor(
    private readonly portMapper: PortMapper,
    private readonly shippingLineMapper: ShippingLineMapper
  ) {}

  convertTripsForReporting(trip) {
    if (!trip) {
      return;
    }

    return {
      id: trip.id,
      shippingLine: this.shippingLineMapper.convertShippingLineToSimpleDto(
        trip.shippingLine
      ),
      srcPort: this.portMapper.convertPortToDto(trip.srcPort),
      destPort: this.portMapper.convertPortToDto(trip.destPort),
      shipName: trip.ship.name,
      departureDate: trip.departureDate.toISOString(),
      voyageNumber: trip.voyage?.number,
    };
  }

  convertTripPassengersForReporting(
    passengerName,
    teller,
    accommodation,
    discount,
    collect,
    isBookingCancelled,
    roundTrip,
    passengerFare,
    totalPrice,
    discountAmount,
    refundAmount,
    paymentStatus
  ) {
    const isCancelledCollectBooking = collect && isBookingCancelled;
    return {
      passengerName,
      teller,
      accommodation,
      discount,
      collect,
      roundTrip,
      discountAmount: collect ? discountAmount * -1 : discountAmount,
      refundAmount: isCancelledCollectBooking
        ? discountAmount * 0.8
        : refundAmount,
      ticketSale: passengerFare + discountAmount,
      ticketCost: isCancelledCollectBooking
        ? discountAmount * -1 * 0.2
        : collect
        ? discountAmount * -1
        : passengerFare + discountAmount + refundAmount,
      fare: totalPrice,
      paymentStatus,
    };
  }

  convertTripVehiclesForReporting(
    teller,
    referenceNo,
    freightRateReceipt,
    typeOfVehicle,
    plateNo,
    collect,
    isBookingCancelled,
    roundTrip,
    vehicleFare,
    totalPrice,
    discountAmount,
    refundAmount,
    paymentStatus
  ) {
    const isCancelledCollectBooking = collect && isBookingCancelled;
    return {
      teller,
      referenceNo,
      freightRateReceipt,
      typeOfVehicle,
      plateNo,
      collect,
      roundTrip,
      discountAmount: collect ? discountAmount * -1 : discountAmount,
      refundAmount: isCancelledCollectBooking
        ? discountAmount * 0.8
        : refundAmount,
      ticketSale: vehicleFare + discountAmount,
      ticketCost: isCancelledCollectBooking
        ? discountAmount * -1 * 0.2
        : collect
        ? discountAmount * -1
        : vehicleFare + discountAmount + refundAmount,
      fare: totalPrice,
      paymentStatus,
    };
  }

  convertTripPassengersToPassengerBreakdown(
    discountType,
    cabinName,
    collect,
    isCancelled,
    passengerFare,
    discountAmount,
    refundAmount,
    passengerDiscountsBreakdown
  ) {
    const discountedPassengerFare =
      collect && isCancelled
        ? discountAmount * -1 * 0.2
        : collect
        ? discountAmount * -1 + refundAmount
        : passengerFare + discountAmount + refundAmount;
    const index = passengerDiscountsBreakdown.findIndex(
      (passengerBreakdown) =>
        passengerBreakdown.typeOfDiscount === discountType &&
        passengerBreakdown.cabinName === cabinName
    );

    if (index !== -1) {
      passengerDiscountsBreakdown[index] = {
        ...passengerDiscountsBreakdown[index],
        totalBooked: passengerDiscountsBreakdown[index].totalBooked + 1,
        totalSales: !collect
          ? passengerDiscountsBreakdown[index].totalSales +
            discountedPassengerFare
          : passengerDiscountsBreakdown[index].totalSales,
        totalCollectSales: collect
          ? passengerDiscountsBreakdown[index].totalCollectSales +
            discountedPassengerFare
          : passengerDiscountsBreakdown[index].totalCollectSales,
      };
    } else {
      passengerDiscountsBreakdown.push({
        typeOfDiscount: discountType,
        cabinName,
        totalBooked: 1,
        totalSales: !collect ? discountedPassengerFare : 0,
        totalCollectSales: collect ? discountedPassengerFare : 0,
      });
    }

    return passengerDiscountsBreakdown;
  }

  convertTripVehiclesToVehicleBreakdown(
    vehicleDescription,
    collect,
    isCancelled,
    vehicleFare,
    discountAmount,
    refundAmount,
    vehicleTypesBreakdown
  ) {
    const discountedVehicleFare =
      collect && isCancelled
        ? discountAmount * -1 * 0.2
        : collect
        ? discountAmount * -1 + refundAmount
        : vehicleFare + discountAmount + refundAmount;
    const index = vehicleTypesBreakdown.findIndex(
      (vehicleBreakdown) =>
        vehicleBreakdown.typeOfVehicle === vehicleDescription
    );

    if (index !== -1) {
      vehicleTypesBreakdown[index] = {
        ...vehicleTypesBreakdown[index],
        totalBooked: vehicleTypesBreakdown[index].totalBooked + 1,
        totalSales: !collect
          ? vehicleTypesBreakdown[index].totalSales + discountedVehicleFare
          : vehicleTypesBreakdown[index].totalSales,
        totalCollectSales: collect
          ? vehicleTypesBreakdown[index].totalCollectSales +
            discountedVehicleFare
          : vehicleTypesBreakdown[index].totalCollectSales,
      };
    } else {
      vehicleTypesBreakdown.push({
        typeOfVehicle: vehicleDescription,
        totalBooked: 1,
        totalSales: !collect ? discountedVehicleFare : 0,
        totalCollectSales: collect ? discountedVehicleFare : 0,
      });
    }

    return vehicleTypesBreakdown;
  }

  convertTripPassengersToRoundTripPassengers(
    bookingTripPassenger,
    tripId,
    isOriginTrip
  ) {
    let roundTripPassengers = {};

    bookingTripPassenger.forEach((passenger) => {
      const passengerId = passenger.passengerId;
      const passengerRecordToRetrieve = tripId === passenger.tripId;

      const voucherDiscount =
        passenger.bookingPaymentItems.find(
          ({ type }) => type === 'VoucherDiscount'
        )?.price ?? 0;
      const refundAmount =
        passenger.bookingPaymentItems.find(
          ({ type }) => type === 'CancellationRefund'
        )?.price ?? 0;

      if (roundTripPassengers.hasOwnProperty(passengerId)) {
        roundTripPassengers = {
          ...roundTripPassengers,
          [passengerId]: {
            ...roundTripPassengers[passengerId],
            accommodation:
              passengerRecordToRetrieve &&
              roundTripPassengers[passengerId].accommodation === null
                ? passenger.cabin.cabinType.name
                : roundTripPassengers[passengerId].accommodation,
            isBookingCancelled:
              passengerRecordToRetrieve &&
              roundTripPassengers[passengerId].isBookingCancelled === null
                ? passenger.booking.cancellationType === 'PassengersFault'
                : roundTripPassengers[passengerId].isBookingCancelled,
            passengerFare: isOriginTrip
              ? passenger.bookingPaymentItems.find(
                  ({ type }) => type === 'Fare'
                )?.price + roundTripPassengers[passengerId].passengerFare
              : 0,
            discountAmount: isOriginTrip
              ? voucherDiscount +
                roundTripPassengers[passengerId].discountAmount
              : 0,
            partialRefundAmount: isOriginTrip
              ? refundAmount +
                roundTripPassengers[passengerId].partialRefundAmount
              : 0,
          },
        };
      } else {
        roundTripPassengers[passengerId] = {
          createdByAccountId: passenger.booking.createdByAccount?.id,
          passengerName: `${passenger.passenger.firstName.trim() ?? ''} ${
            passenger.passenger.lastName.trim() ?? ''
          }`,
          teller: passenger.booking.createdByAccount?.email,
          accommodation: passengerRecordToRetrieve
            ? passenger.cabin.cabinType.name
            : null,
          discount: passenger.discountType ?? 'Adult',
          collect: passenger.booking.voucherCode === 'COLLECT_BOOKING',
          isBookingCancelled: passengerRecordToRetrieve
            ? passenger.booking.cancellationType === 'PassengersFault'
            : null,
          passengerFare: isOriginTrip
            ? passenger.bookingPaymentItems.find(({ type }) => type === 'Fare')
                ?.price
            : 0,
          totalPrice: isOriginTrip ? passenger.totalPrice : 0,
          discountAmount: isOriginTrip
            ? passenger.bookingPaymentItems.find(
                ({ type }) => type === 'VoucherDiscount'
              )?.price ?? 0
            : 0,
          partialRefundAmount: isOriginTrip
            ? passenger.bookingPaymentItems.find(
                ({ type }) => type === 'CancellationRefund'
              )?.price ?? 0
            : 0,
          paymentStatus: 'Round Trip',
        };
      }
    });

    return roundTripPassengers;
  }

  convertTripVehiclesToRoundTripVehicles(
    bookingTripVehicle,
    tripId,
    isOriginTrip
  ) {
    let roundTripVehicles = {};

    bookingTripVehicle.forEach((vehicle) => {
      const vehicleId = vehicle.vehicleId;
      const vehicleRecordToRetrieve = tripId === vehicle.tripId;

      const voucherDiscount =
        vehicle.bookingPaymentItems.find(
          ({ type }) => type === 'VoucherDiscount'
        )?.price ?? 0;
      const refundAmount =
        vehicle.bookingPaymentItems.find(
          ({ type }) => type === 'CancellationRefund'
        )?.price ?? 0;

      if (roundTripVehicles.hasOwnProperty(vehicleId)) {
        roundTripVehicles = {
          ...roundTripVehicles,
          [vehicleId]: {
            ...roundTripVehicles[vehicleId],
            isBookingCancelled:
              vehicleRecordToRetrieve &&
              roundTripVehicles[vehicleId].isBookingCancelled === null
                ? vehicle.booking.cancellationType === 'PassengersFault'
                : roundTripVehicles[vehicleId].isBookingCancelled,
            vehicleFare: isOriginTrip
              ? vehicle.bookingPaymentItems.find(({ type }) => type === 'Fare')
                  ?.price + roundTripVehicles[vehicleId].vehicleFare
              : 0,
            discountAmount: isOriginTrip
              ? voucherDiscount + roundTripVehicles[vehicleId].discountAmount
              : 0,
            partialRefundAmount: isOriginTrip
              ? refundAmount + roundTripVehicles[vehicleId].partialRefundAmount
              : 0,
          },
        };
      } else {
        roundTripVehicles[vehicleId] = {
          createdByAccountId: vehicle.booking.createdByAccount?.id,
          teller: vehicle.booking.createdByAccount?.email,
          referenceNo: vehicle.booking.referenceNo,
          freightRateReceipt: vehicle.booking.freightRateReceipt,
          typeOfVehicle: vehicle.vehicle.vehicleType.description,
          plateNo: vehicle.vehicle.plateNo,
          collect: vehicle.booking.voucherCode === 'COLLECT_BOOKING',
          isBookingCancelled: vehicleRecordToRetrieve
            ? vehicle.booking.cancellationType === 'PassengersFault'
            : null,
          vehicleFare: isOriginTrip
            ? vehicle.bookingPaymentItems.find(({ type }) => type === 'Fare')
                ?.price
            : 0,
          totalPrice: isOriginTrip ? vehicle.totalPrice : 0,
          discountAmount: isOriginTrip
            ? vehicle.bookingPaymentItems.find(
                ({ type }) => type === 'VoucherDiscount'
              )?.price ?? 0
            : 0,
          partialRefundAmount: isOriginTrip
            ? vehicle.bookingPaymentItems.find(
                ({ type }) => type === 'CancellationRefund'
              )?.price ?? 0
            : 0,
          paymentStatus: 'Round Trip',
        };
      }
    });
    return roundTripVehicles;
  }

  convertBookingToRoundTripBreakdown(booking, collect) {
    let originPaxBreakdown = [];
    let originVehicleBreakdown = [];
    let originPaxRefundBreakdown = [];
    let originVehicleRefundBreakdown = [];

    let destinationPaxBreakdown = [];
    let destinationVehicleBreakdown = [];
    let destinationPaxRefundBreakdown = [];
    let destinationVehicleRefundBreakdown = [];

    let originTrip;
    let destinationTrip;

    booking.bookingTripPassengers.forEach((tripPassenger) => {
      const isOriginTripPax = booking.firstTripId === tripPassenger.tripId;
      if (isOriginTripPax) {
        // passengers from origin to destination
        originTrip = !originTrip ? tripPassenger.trip : originTrip;
        const cabinName = tripPassenger.cabin.cabinType.name;
        let passengerFare = 0;
        let discountAmount = 0;
        let partialRefundAmount = 0;
        let isPassengerCancelled = false;
        tripPassenger.bookingPaymentItems.forEach((paymentItem) => {
          // multiply by 2 because origin trip has the money of both round trips
          if (paymentItem.type === 'Fare') {
            passengerFare = paymentItem.price * 2;
          } else if (paymentItem.type === 'VoucherDiscount') {
            discountAmount = paymentItem.price * 2;
          } else if (paymentItem.type === 'CancellationRefund') {
            partialRefundAmount = paymentItem.price * 2;
            isPassengerCancelled = true;
          }
        });

        if (!isPassengerCancelled) {
          const passengerBreakdownArr =
            this.convertTripPassengersToPassengerBreakdown(
              tripPassenger.discountType ?? 'Adult',
              cabinName,
              collect,
              isPassengerCancelled,
              passengerFare,
              discountAmount,
              partialRefundAmount,
              originPaxBreakdown
            );
          originPaxBreakdown = passengerBreakdownArr;
        } else {
          const passengerRefundBreakdownArr =
            this.convertTripPassengersToPassengerBreakdown(
              tripPassenger.discountType ?? 'Adult',
              cabinName,
              collect,
              isPassengerCancelled,
              passengerFare,
              discountAmount,
              partialRefundAmount,
              originPaxRefundBreakdown
            );
          originPaxRefundBreakdown = passengerRefundBreakdownArr;
        }
      } else {
        // passengers from destination to origin
        destinationTrip = !destinationTrip
          ? tripPassenger.trip
          : destinationTrip;
        const cabinName = tripPassenger.cabin.cabinType.name;
        let isPassengerCancelled = false;
        tripPassenger.bookingPaymentItems.forEach((paymentItem) => {
          if (paymentItem.type === 'CancellationRefund') {
            isPassengerCancelled = true;
          }
        });

        if (!isPassengerCancelled) {
          const passengerBreakdownArr =
            this.convertTripPassengersToPassengerBreakdown(
              tripPassenger.discountType ?? 'Adult',
              cabinName,
              collect,
              isPassengerCancelled,
              0,
              0,
              0,
              destinationPaxBreakdown
            );
          destinationPaxBreakdown = passengerBreakdownArr;
        } else {
          const passengerRefundBreakdownArr =
            this.convertTripPassengersToPassengerBreakdown(
              tripPassenger.discountType ?? 'Adult',
              cabinName,
              collect,
              isPassengerCancelled,
              0,
              0,
              0,
              destinationPaxRefundBreakdown
            );
          destinationPaxRefundBreakdown = passengerRefundBreakdownArr;
        }
      }
    });

    booking.bookingTripVehicles.forEach((tripVehicle) => {
      const isOriginTripVehicle = booking.firstTripId === tripVehicle.tripId;
      if (isOriginTripVehicle) {
        // vehicles from origin to destination
        originTrip = !originTrip ? tripVehicle.trip : originTrip;
        let vehicleFare = 0;
        let discountAmount = 0;
        let partialRefundAmount = 0;
        let isVehicleCancelled = false;
        tripVehicle.bookingPaymentItems.forEach((paymentItem) => {
          // multiply by 2 because origin trip has the money of both round trips
          if (paymentItem.type === 'Fare') {
            vehicleFare = paymentItem.price * 2;
          } else if (paymentItem.type === 'VoucherDiscount') {
            discountAmount = paymentItem.price * 2;
          } else if (paymentItem.type === 'CancellationRefund') {
            partialRefundAmount = paymentItem.price * 2;
            isVehicleCancelled = true;
          }
        });

        if (!isVehicleCancelled) {
          const vehicleBreakdownArr =
            this.convertTripVehiclesToVehicleBreakdown(
              tripVehicle.vehicle.vehicleType.description,
              collect,
              isVehicleCancelled,
              vehicleFare,
              discountAmount,
              partialRefundAmount,
              originVehicleBreakdown
            );
          originVehicleBreakdown = vehicleBreakdownArr;
        } else {
          const vehicleRefundBreakdownArr =
            this.convertTripVehiclesToVehicleBreakdown(
              tripVehicle.vehicle.vehicleType.description,
              collect,
              isVehicleCancelled,
              vehicleFare,
              discountAmount,
              partialRefundAmount,
              originVehicleRefundBreakdown
            );
          originVehicleRefundBreakdown = vehicleRefundBreakdownArr;
        }
      } else {
        // vehicle from destinaion to origin
        destinationTrip = !destinationTrip ? tripVehicle.trip : destinationTrip;
        let isVehicleCancelled = false;
        tripVehicle.bookingPaymentItems.forEach((paymentItem) => {
          if (paymentItem.type === 'CancellationRefund') {
            isVehicleCancelled = true;
          }
        });

        if (!isVehicleCancelled) {
          const vehicleBreakdownArr =
            this.convertTripVehiclesToVehicleBreakdown(
              tripVehicle.vehicle.vehicleType.description,
              collect,
              isVehicleCancelled,
              0,
              0,
              0,
              destinationVehicleBreakdown
            );
          destinationVehicleBreakdown = vehicleBreakdownArr;
        } else {
          const vehicleRefundBreakdownArr =
            this.convertTripVehiclesToVehicleBreakdown(
              tripVehicle.vehicle.vehicleType.description,
              collect,
              isVehicleCancelled,
              0,
              0,
              0,
              destinationVehicleRefundBreakdown
            );
          destinationVehicleRefundBreakdown = vehicleRefundBreakdownArr;
        }
      }
    });

    return {
      origin: {
        trip: originTrip,
        passengerBreakdown: originPaxBreakdown,
        vehicleBreakdown: originVehicleBreakdown,
        passengerRefundBreakdown: originPaxRefundBreakdown,
        vehicleRefundBreakdown: originVehicleRefundBreakdown,
      },
      destination: {
        trip: destinationTrip,
        passengerBreakdown: destinationPaxBreakdown,
        vehicleBreakdown: destinationVehicleBreakdown,
        passengerRefundBreakdown: destinationPaxRefundBreakdown,
        vehicleRefundBreakdown: destinationVehicleRefundBreakdown,
      },
    };
  }

  combineTripPassengerBreakdownOfTwoArrays(
    singleTripBreakdown: PaxBreakdown[],
    roundTripBreakdown: PaxBreakdown[]
  ) {
    let paxBreakdown = singleTripBreakdown.map((breakdown) => {
      let newPaxBreakdown;
      const idx = roundTripBreakdown.findIndex(
        ({ typeOfDiscount, cabinName }) =>
          breakdown.typeOfDiscount === typeOfDiscount &&
          breakdown.cabinName === cabinName
      );
      if (idx !== -1) {
        newPaxBreakdown = {
          ...breakdown,
          totalBooked:
            breakdown.totalBooked + roundTripBreakdown[idx].totalBooked,
          totalSales: breakdown.totalSales + roundTripBreakdown[idx].totalSales,
          totalCollectSales:
            breakdown.totalCollectSales +
            roundTripBreakdown[idx].totalCollectSales,
        };
        roundTripBreakdown.splice(idx, 1);
      }
      return newPaxBreakdown || breakdown;
    });

    paxBreakdown = [...paxBreakdown, ...roundTripBreakdown];

    return paxBreakdown;
  }

  combineTripVehicleBreakdownOfTwoArrays(
    singleTripBreakdown: VehicleBreakdown[],
    roundTripBreakdown: VehicleBreakdown[]
  ) {
    let vehicleBreakdown = singleTripBreakdown.map((breakdown) => {
      let newVehicleBreakdown;
      const idx = roundTripBreakdown.findIndex(
        ({ typeOfVehicle }) => breakdown.typeOfVehicle === typeOfVehicle
      );
      if (idx !== -1) {
        newVehicleBreakdown = {
          ...breakdown,
          totalBooked:
            breakdown.totalBooked + roundTripBreakdown[idx].totalBooked,
          totalSales: breakdown.totalSales + roundTripBreakdown[idx].totalSales,
          totalCollectSales:
            breakdown.totalCollectSales +
            roundTripBreakdown[idx].totalCollectSales,
        };
        roundTripBreakdown.splice(idx, 1);
      }
      return newVehicleBreakdown || breakdown;
    });

    vehicleBreakdown = [...vehicleBreakdown, ...roundTripBreakdown];

    return vehicleBreakdown;
  }

  convertTripToTripManifest(trip): TripManifest {
    const passengers = trip.bookingTripPassengers.map(({ passenger }) => {
      let age = null;
      let birthDateString = null;

      if (passenger.birthday) {
        const birthDate = new Date(passenger.birthday);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
        birthDateString = passenger.birthday.toISOString();
      }

      return {
        fullName: `${passenger.firstName} ${passenger.lastName}`,
        birthDate: birthDateString,
        age,
        sex: passenger.sex,
        nationality: passenger.nationality,
        address: passenger.address,
      };
    });

    return {
      shipName: trip.ship.name,
      srcPortName: trip.srcPort.name,
      destPortName: trip.destPort.name,
      departureDate: trip.departureDate.toISOString(),
      passengers,
    };
  }

  convertBookingToBillOfLading(booking): BillOfLading {
    const referenceNo = booking.referenceNo;
    const consigneeName = booking.consigneeName;
    const freightRateReceipt = booking.freightRateReceipt;
    const shipName = booking.bookingTripVehicles[0].trip.ship.name;
    const voyageNumber = booking.bookingTripVehicles[0].trip.voyage?.number;
    const shippingLineName =
      booking.bookingTripVehicles[0].trip.shippingLine.name;
    const shippingLineSubsidiary =
      booking.bookingTripVehicles[0].trip.shippingLine.subsidiary;
    const shippingLineAddress =
      booking.bookingTripVehicles[0].trip.shippingLine.address;
    const shippingLineTelephoneNo =
      booking.bookingTripVehicles[0].trip.shippingLine.telephoneNo;
    const shippingLineFaxNo =
      booking.bookingTripVehicles[0].trip.shippingLine.faxNo;

    const isCollectBooking = booking.voucherCode === 'COLLECT_BOOKING';
    const vehicles = booking.bookingTripVehicles.map((vehicle) => {
      const fare = isCollectBooking
        ? booking.bookingPaymentItems.find(
            (paymentItem) =>
              paymentItem.vehicleId === vehicle.vehicleId &&
              paymentItem.type === 'Fare'
          ).price
        : vehicle.totalPrice;

      return {
        destPortName: vehicle.trip.destPort.name,
        departureDateIso: vehicle.trip.departureDate.toISOString(),

        classification: '', //If needed - Add a new column "class" in vehicle_type
        modelName: vehicle.vehicle.modelName,
        plateNo: vehicle.vehicle.plateNo,
        weight: vehicle.vehicle.vehicleType.description
          .toLowerCase()
          .includes('loaded')
          ? 'L'
          : 'E',
        vehicleTypeDesc: vehicle.vehicle.vehicleType.description,
        fare,
      };
    });

    return {
      referenceNo,
      consigneeName,
      freightRateReceipt,
      shipName,
      shippingLineName,
      shippingLineSubsidiary,
      shippingLineAddress,
      shippingLineTelephoneNo,
      shippingLineFaxNo,
      voyageNumber,
      vehicles,
      isCollectBooking,
    };
  }

  convertPortsAndShipToDto(data): PortsByShip {
    return {
      srcPortId: data.srcPortId,
      destPortId: data.destPortId,
      shipId: data.shipId,
      shippingLine: this.shippingLineMapper.convertShippingLineToSimpleDto(
        data.shippingLine
      ),
    };
  }

  convertBookingToVoidBookings(booking): VoidBookings {
    return {
      referenceNo: booking.booking.referenceNo,
      price: booking.bookingPaymentItems[0].price,
      refundType:
        booking.removedReasonType === 'NoFault' ? 'Full Refund' : '80% Refund',
    };
  }

  convertBookingToCollectBooking(booking): CollectBooking {
    const teller = booking.createdByAccount.email;

    return {
      bookingId: booking.id,
      referenceNo: booking.referenceNo,
      consigneeName: booking.consigneeName,
      freightRateReceipt: booking.freightRateReceipt,

      passengers: booking.bookingTripPassengers.map((passenger) =>
        this.convertBookingToCollectBookingPassenger(passenger, teller)
      ),
      vehicles: booking.bookingTripVehicles.map((vehicle) =>
        this.convertBookingToCollectBookingVehicle(vehicle, teller)
      ),
    };
  }

  convertBookingToCollectBookingPassenger(passenger, teller) {
    const passengerFare = passenger.bookingPaymentItems.find(
      ({ type }) => type === 'Fare'
    )?.price;
    const discountAmount =
      passenger.bookingPaymentItems.find(
        ({ type }) => type === 'VoucherDiscount'
      )?.price ?? 0;
    const refundAmount =
      passenger.bookingPaymentItems.find(
        ({ type }) => type === 'CancellationRefund'
      )?.price ?? 0;

    return {
      passengerName: `${passenger.passenger.firstName.trim() ?? ''} ${
        passenger.passenger.lastName.trim() ?? ''
      }`,
      teller,
      accommodation: passenger.cabin.cabinType.name,
      discount: passenger.discountType ?? 'Adult',
      discountAmount,
      refundAmount,
      ticketSale: passengerFare + discountAmount,
      ticketCost: passengerFare + discountAmount + refundAmount,
    };
  }

  convertBookingToCollectBookingVehicle(vehicle, teller) {
    const vehicleFare = vehicle.bookingPaymentItems.find(
      ({ type }) => type === 'Fare'
    )?.price;
    const discountAmount =
      vehicle.bookingPaymentItems.find(({ type }) => type === 'VoucherDiscount')
        ?.price ?? 0;
    const refundAmount =
      vehicle.bookingPaymentItems.find(
        ({ type }) => type === 'CancellationRefund'
      )?.price ?? 0;

    return {
      teller,
      typeOfVehicle: vehicle.vehicle.vehicleType.description,
      plateNo: vehicle.vehicle.plateNo,
      discountAmount,
      refundAmount,
      ticketSale: vehicleFare + discountAmount,
      ticketCost: vehicleFare + discountAmount + refundAmount,
    };
  }
}
