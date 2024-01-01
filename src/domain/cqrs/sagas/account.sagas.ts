import { Inject, Injectable, Logger } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, delay, map, mergeMap, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { PluginStartedEvent } from '../events/plugin-started.event';
import { AuthenticateAccountCommand } from '../commands/account/authenticate-account.command';
import { AccountAuthenticatedEvent } from '../events/account/account-authenticated.event';
import { JWTPayload } from './models/jwt-payload.model';
import { RefreshTokenCommand } from '../commands/account/refresh-token.command';
import { TokenRefreshedEvent } from '../events/account/token-refreshed.event';
import { AccountConfig } from '../../account';

@Injectable()
export class AccountSagas {
  private readonly logger: Logger = new Logger(AccountSagas.name);

  constructor(
    @Inject(AccountConfig.provide)
    private readonly accountConfig: AccountConfig,
  ) {}

  private decodeJWT(token?: string): JWTPayload | undefined {
    if (!token) {
      return undefined;
    }
    try {
      return jwtDecode<JWTPayload>(token, {});
    } catch (error) {
      this.logger.error('decodeJWT', error);
    }
    return undefined;
  }

  private isTokenValid(token?: string): boolean {
    const jwt = this.decodeJWT(token);
    try {
      if (!jwt?.exp || !jwt?.iat) {
        return false;
      }
      const expirationDateUTC = new Date(1970, 1, 1).setSeconds(jwt.exp);
      const nowUTC = new Date().getTime();
      this.logger.debug('isTokenValid', expirationDateUTC, nowUTC);
      return nowUTC < expirationDateUTC;
    } catch (error) {
      this.logger.error('isTokenValid', error);
    }

    return false;
  }

  private getTokenRefreshDelay(token: string): number {
    const jwt = this.decodeJWT(token);
    try {
      if (!jwt?.exp || !jwt?.iat) {
        return 0;
      }
      const expirationDateUTC = new Date(1970, 1, 1).setSeconds(jwt.exp);
      const nowUTC = new Date().getTime();
      this.logger.debug('isTokenValid', expirationDateUTC, nowUTC);
      return nowUTC - expirationDateUTC;
    } catch (error) {
      this.logger.error('isTokenValid', error);
    }

    return 0;
  }

  @Saga()
  authenticate(events$: Observable<any>): Observable<ICommand> {
    return events$.pipe(
      ofType(PluginStartedEvent),
      map(
        () =>
          new AuthenticateAccountCommand(
            this.accountConfig.username,
            this.accountConfig.password,
            this.accountConfig.clientId,
          ),
      ),
    );
  }

  @Saga()
  tokenLifecycle(events$: Observable<any>): Observable<ICommand> {
    return events$.pipe(
      ofType(AccountAuthenticatedEvent, TokenRefreshedEvent),
      mergeMap((event) =>
        of(event).pipe(
          delay(this.getTokenRefreshDelay(event.accessToken) - 60),
          map((event) => new RefreshTokenCommand(event.accessToken)),
        ),
      ),
    );
  }
}
