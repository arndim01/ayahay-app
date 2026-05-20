import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { includes } from 'lodash';
import { ACCOUNT_ROLE } from '@ayahay/constants';
import { ROLES_KEY } from '@/decorator/roles.decorator';
import { AUTHENTICATED_KEY } from '@/decorator/authenticated.decorator';
import { VERIFIED_KEY } from '@/decorator/verified.decorator';
import { IAccount } from '@ayahay/models';
import { AuthService } from '@/auth/auth.service';

/**
 * Sets request.user to the logged-in account making the request
 *
 * If the request does not have a valid Authorization token, then we
 * return a 401 Unauthorized response.
 *
 * If the request has a valid Authorization token but the email
 * associated with the account is not verified, then we return
 * a 403 Forbidden response.
 *
 * At this point, by default we allow the request, but if the
 * endpoint/method has a @Roles decorator, then we verify that
 * the role of the logged-in account is any of the roles provided
 * the decorator.
 *
 * If the endpoint/method has a @AllowUnauthenticated decorator,
 * we will not return a 401 or a 403 response. If the request has a
 * valid Authorization token, then we just set the request.user
 * to the logged-in account. In any other scenario, we allow the
 * request.
 **/
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const shouldBeAuthenticated =
      this.reflector.getAllAndOverride<boolean>(AUTHENTICATED_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? true;
    const shouldBeVerified =
      this.reflector.getAllAndOverride<boolean>(VERIFIED_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? true;

    let loggedInAccount: IAccount | undefined;

    try {
      loggedInAccount = await this.authService.authenticate(request);
    } catch (e) {
      this.logger.error('Authentication Error: ', e);
      if (shouldBeAuthenticated) {
        throw new UnauthorizedException();
      }
    }

    request.user = loggedInAccount;

    if (!shouldBeAuthenticated) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<ACCOUNT_ROLE[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (requiredRoles && !includes(requiredRoles, loggedInAccount.role)) {
      throw new ForbiddenException('Insufficient access');
    }

    if (shouldBeVerified === false) {
      return true;
    }

    if (
      loggedInAccount.role === 'Passenger' &&
      !loggedInAccount.isEmailVerified
    ) {
      throw new ForbiddenException('Unverified email');
    }

    return true;
  }
}
