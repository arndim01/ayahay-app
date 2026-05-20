import { Injectable } from '@nestjs/common';
import { IDisbursement } from '@ayahay/models';
import { OPERATION_COSTS } from '@ayahay/constants';
import { DisbursementsPerTeller } from '@ayahay/http';

@Injectable()
export class DisbursementMapper {
  constructor() {}

  convertDisbursementToDto(disbursement: any): IDisbursement {
    return {
      id: disbursement.id,
      createdByAccountId: disbursement.createdByAccountId,
      createdByAccount: disbursement.createdByAccount,
      dateIso: disbursement.date.toISOString(),
      description: disbursement.description as OPERATION_COSTS,
      officialReceipt: disbursement.officialReceipt,
      paidTo: disbursement.paidTo,
      purpose: disbursement.purpose,
      amount: disbursement.amount,
    };
  }

  convertDisbursementToDisbursementsPerTeller(
    disbursement: any
  ): DisbursementsPerTeller {
    return {
      id: disbursement.id,
      amount: disbursement.amount,
      dateIso: disbursement.date.toISOString(),
      description: disbursement.description as OPERATION_COSTS,
      officialReceipt: disbursement.officialReceipt,
      paidTo: disbursement.paidTo,
      purpose: disbursement.purpose,
      tripId: disbursement.trip.id,
      srcPortCode: disbursement.trip.srcPort.code,
      destPortCode: disbursement.trip.destPort.code,
      departureDateIso: disbursement.trip.departureDate.toISOString(),
    };
  }
}
