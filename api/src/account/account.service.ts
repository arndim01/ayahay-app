import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma.service';
import { IAccount, IPassenger } from '@ayahay/models';
import { AccountMapper } from './account.mapper';
import { AuthService } from '@/auth/auth.service';
import { isEmpty } from 'lodash';
import { CryptoService } from '@/crypto/crypto.service';

@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountMapper: AccountMapper,
    private readonly authService: AuthService,
    private readonly cryptoService: CryptoService
  ) {}

  async getMyAccountInformation(user, token): Promise<IAccount> {
    if (!user) {
      throw new NotFoundException();
    }

    const { id: loggedInAccountId, email } = user;
    const myAccountEntity = await this.prisma.account.findUnique({
      where: {
        id: loggedInAccountId,
      },
      include: {
        passenger: {
          include: {
            buddies: true,
          },
        },
        shippingLine: true,
        travelAgency: true,
        vehicles: true,
      },
    });

    // TODO: Improve this in the future. Just a temp workaround
    let newAccountEntity: IAccount;
    if (!myAccountEntity) {
      await this.authService.removeUserClaims(token);
      newAccountEntity = await this.createAccount({
        id: loggedInAccountId,
        email,
        role: 'Passenger',
      });
    }

    const userClaims = await this.authService.checkUserClaims(
      loggedInAccountId
    );
    const myAccountEntityRole = myAccountEntity?.role ?? 'Passenger';
    const myAccountEntityEmailConsent = myAccountEntity?.emailConsent ?? false;
    const myAccountEntityShippingLineId =
      myAccountEntity?.shippingLineId ?? null;
    const myAccountEntityTravelAgencyId =
      myAccountEntity?.travelAgencyId ?? null;

    // Set user claims if userClaims is empty OR if there is a mismatch between
    // useClaims and account table role (i.e. a Passenger might have been
    // upgraded to Staff/Admin, so we want to set the new role in FB as well)
    // This is just a workaround, will be removed in the future
    if (
      token &&
      (isEmpty(userClaims) ||
        userClaims.role !== myAccountEntityRole ||
        userClaims.shippingLineId !== myAccountEntityShippingLineId ||
        userClaims.travelAgencyId !== myAccountEntityTravelAgencyId)
    ) {
      // TODO: user claims for Clients
      await this.authService.setUserClaims({
        token,
        emailConsent: myAccountEntityEmailConsent,
        role: myAccountEntityRole,
        shippingLineId: myAccountEntityShippingLineId,
        travelAgencyId: myAccountEntityTravelAgencyId,
      });
    }

    return this.accountMapper.convertAccountToDto(
      myAccountEntity || newAccountEntity
    );
  }

  async getAccountById(accountId: string): Promise<IAccount> {
    const accountEntity = await this.prisma.account.findUnique({
      where: {
        id: accountId,
      },
      include: {
        passenger: true,
      },
    });

    return accountEntity
      ? this.accountMapper.convertAccountToDto(accountEntity)
      : null;
  }

  async unsubscribeEmail(user): Promise<void> {        
    await this.prisma.account.update({ where: { id: user.id }, data: { emailConsent: false }});
  }

  async createAccount(data: Prisma.AccountCreateInput): Promise<IAccount> {
    try {
      const loggedInAccount: IAccount = await this.getAccountById(data.id);
      if (loggedInAccount && loggedInAccount.role === 'Passenger') {
        return loggedInAccount;
      }

      return (await this.prisma.account.create({
        data,
      })) as IAccount;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async createPassengerAccount(
    loggedInAccount: any,
    passenger: IPassenger
  ): Promise<void> {
    if (loggedInAccount === undefined) {
      return;
    }

    loggedInAccount.passenger = passenger;
    loggedInAccount.role = 'Passenger';

    const accountEntity =
      this.accountMapper.convertAccountToEntityForCreation(loggedInAccount);
    await this.prisma.account.create({ data: accountEntity });

    return;
  }

  async getMyApiKey({ id }: IAccount): Promise<string> {
    const account = await this.prisma.account.findUnique({
      where: {
        id,
      },
    });
    if (account === null) {
      throw new NotFoundException();
    }

    return account.apiKey;
  }

  /**
   * An account API key will be generated as:
   * {signature}__{id}
   *
   * where id is the account ID (used for DB-less verification)
   * and signature is basically the signed account ID, generated as:
   * 1. Sign account ID with Ayahay private key
   * 2. Base 64 encode the signed account ID (for a shorter key basically)
   * @param id
   */
  async generateApiKeyForAccount({ id }: IAccount): Promise<string> {
    const accountIdBuf = Buffer.from(id);
    const signatureBuf = await this.cryptoService.signWithAyahay(accountIdBuf);
    const signatureStr = signatureBuf.toString('base64');
    const apiKey = `${signatureStr}__${id}`;

    // sanity check, ensure API key works
    try {
      await this.authService.verifyApiKeyWithoutDb(signatureStr, id);
    } catch {
      throw new InternalServerErrorException();
    }

    await this.prisma.account.update({
      where: {
        id,
      },
      data: {
        apiKey,
      },
    });
    return apiKey;
  }

  /**
   * This method will just update emailConsent for now.
   * Update this method if we want to update other account fields
   */
  async updateAccount({ id }: IAccount, data: any): Promise<void> {
    const { emailConsent } = data;

    const where: Prisma.AccountWhereUniqueInput = { id };
    const account = await this.prisma.account.findUnique({ where });

    if (account === null) {
      throw new NotFoundException();
    }

    await this.prisma.account.update({ where, data: { emailConsent } });
  }
}
