import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import admin from 'firebase-admin';
import { AccountMapper } from '@/account/account.mapper';
import { CryptoService } from '@/crypto/crypto.service';
import { IAccount } from '@ayahay/models';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly accountMapper: AccountMapper,
    private readonly cryptoService: CryptoService,
    private readonly prisma: PrismaService
  ) {}

  async setUserClaims({
    token,
    role,
    emailConsent,
    shippingLineId,
    travelAgencyId,
  }): Promise<void> {
    const claims = await admin.auth().verifyIdToken(token);

    // Verify user is eligible for additional privileges.
    if (typeof claims.email !== 'undefined') {
      await admin
        .auth()
        .setCustomUserClaims(claims.sub, {
          role,
          emailConsent,
          shippingLineId,
          travelAgencyId,
        })
        .catch((error) => {
          this.logger.error(`Set claims error: ${error}`);
          throw new Error(error);
        });
    } else {
      this.logger.error(`Ineligible to set claims`);
      throw new Error('Ineligible to set claims');
    }
  }

  checkUserClaims(uid: string): Promise<{
    [key: string]: any;
  }> {
    return admin
      .auth()
      .getUser(uid)
      .then((userRecord) => userRecord.customClaims);
  }

  public async removeUserClaims(token: string): Promise<void> {
    const claims = await admin.auth().verifyIdToken(token);

    // Verify user is eligible for additional privileges.
    if (typeof claims.email !== 'undefined') {
      await admin
        .auth()
        .setCustomUserClaims(claims.sub, null)
        .catch((error) => {
          this.logger.error(`Remove claims error: ${error}`);
          throw new Error(error);
        });
    } else {
      this.logger.error(`Ineligible to remove claims`);
      throw new Error('Ineligible to remove claims');
    }
  }

  async authenticate(request: any): Promise<IAccount> {
    const authorizationHeader = request?.headers?.authorization;
    if (!authorizationHeader) {
      throw new UnauthorizedException();
    }

    const [type, token] = authorizationHeader.split(' ') ?? [];
    switch (type) {
      case 'Bearer':
        request.token = token;
        return this.verifyJwt(token);
      case 'API-Key':
        return this.verifyApiKey(token);
    }

    throw new UnauthorizedException();
  }

  private async verifyJwt(token: string): Promise<IAccount> {
    const decoded = await admin.auth().verifyIdToken(token);
    return {
      id: decoded.uid,
      role: decoded.role,
      email: decoded.email,
      emailConsent: decoded.emailConsent,
      shippingLineId: decoded.shippingLineId,
      travelAgencyId: decoded.travelAgencyId,
      isEmailVerified: decoded.email_verified,
    };
  }

  private async verifyApiKey(apiKey: string): Promise<IAccount> {
    const [signatureStr, accountId] = apiKey.split('__');
    await this.verifyApiKeyWithoutDb(signatureStr, accountId);

    const account = await this.prisma.account.findUnique({
      where: {
        id: accountId,
      },
    });
    if (account?.apiKey !== apiKey) {
      throw new UnauthorizedException();
    }

    return this.accountMapper.convertAccountToDto(account);
  }

  async verifyApiKeyWithoutDb(
    signatureStr: string | undefined,
    accountId: string | undefined
  ): Promise<void> {
    if (!signatureStr || !accountId) {
      throw new UnauthorizedException();
    }
    const verified = await this.cryptoService.verifyAyahaySignature(
      Buffer.from(signatureStr, 'base64'),
      Buffer.from(accountId)
    );
    if (!verified) {
      throw new UnauthorizedException();
    }
  }

  /**
   * This function does not check if the account is a third-party
   * account or if this third party is partnered with the shipping line,
   * because in general, third-party partners only have access
   * to a select number of shipping line restricted entities
   *
   * to check if a third party is partnered with the shipping line,
   * use the verifyThirdPartyIsPartneredWithShippingLine method.
   */
  verifyAccountHasAccessToShippingLineRestrictedEntity(
    shippingLineRestrictedEntity: { shippingLineId: number },
    loggedInAccount: IAccount
  ): void {
    if (loggedInAccount.role === 'SuperAdmin') {
      return;
    }
    if (
      loggedInAccount.shippingLineId !==
      shippingLineRestrictedEntity.shippingLineId
    ) {
      throw new ForbiddenException();
    }
  }

  async verifyThirdPartyIsPartneredWithShippingLine(
    thirdPartyAccount: IAccount,
    shippingLineId: number
  ): Promise<void> {
    if (this.isTravelAgencyAccount(thirdPartyAccount)) {
      return this.verifyTravelAgencyIsPartneredWithShippingLine(
        thirdPartyAccount.travelAgencyId,
        shippingLineId
      );
    } else if (this.isClientAccount(thirdPartyAccount)) {
      // TODO: add clientShippingLine table
      return;
    }
  }

  async verifyTravelAgencyIsPartneredWithShippingLine(
    travelAgencyId: number,
    shippingLineId: number
  ): Promise<void> {
    const partnerShippingLineIds =
      await this.prisma.travelAgencyShippingLine.findMany({
        where: { travelAgencyId },
        select: {
          shippingLineId: true,
        },
      });

    const isPartneredWithShippingLineOfBooking = partnerShippingLineIds.some(
      (partner) => partner.shippingLineId === shippingLineId
    );
    if (!isPartneredWithShippingLineOfBooking) {
      throw new ForbiddenException();
    }
  }

  verifyAccountHasAccessToTravelAgencyRestrictedEntity(
    travelAgencyRestrictedEntity: { travelAgencyId: number },
    loggedInAccount: IAccount
  ): void {
    if (loggedInAccount.role === 'SuperAdmin') {
      return;
    }
    if (
      loggedInAccount.travelAgencyId !==
      travelAgencyRestrictedEntity.travelAgencyId
    ) {
      throw new ForbiddenException();
    }
  }

  hasPrivilegedAccess(loggedInAccount?: IAccount): boolean {
    if (loggedInAccount === undefined) {
      return false;
    }

    const privilegedAccessRoles = [
      'ShippingLineStaff',
      'ShippingLineAdmin',
      'TravelAgencyStaff',
      'TravelAgencyAdmin',
      'SuperAdmin',
    ];
    return privilegedAccessRoles.includes(loggedInAccount.role);
  }

  isPassengerAccount(loggedInAccount?: IAccount): boolean {
    return loggedInAccount === null || loggedInAccount?.role === 'Passenger';
  }

  isTravelAgencyAccount(loggedInAccount?: IAccount): boolean {
    return (
      loggedInAccount?.role === 'TravelAgencyStaff' ||
      loggedInAccount?.role === 'TravelAgencyAdmin'
    );
  }

  isClientAccount(loggedInAccount?: IAccount): boolean {
    return (
      loggedInAccount?.role === 'ClientStaff' ||
      loggedInAccount?.role === 'ClientAdmin'
    );
  }

  isShippingLineAccount(loggedInAccount?: IAccount): boolean {
    return (
      loggedInAccount?.role === 'ShippingLineScanner' ||
      loggedInAccount?.role === 'ShippingLineStaff' ||
      loggedInAccount?.role === 'ShippingLineAdmin'
    );
  }

  isThirdPartyAccount(loggedInAccount?: IAccount): boolean {
    return (
      this.isTravelAgencyAccount(loggedInAccount) ||
      this.isClientAccount(loggedInAccount)
    );
  }
}
