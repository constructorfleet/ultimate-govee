import { Injectable, Logger } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthExpiringEvent, CredentialsChangedEvent } from './events';
import { AuthenticateCommand, RefreshAuthenticationCommand } from './commands';

@Injectable()
export class AuthSagas {
  private readonly logger: Logger = new Logger(AuthSagas.name);

  @Saga()
  authenticationFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(CredentialsChangedEvent),
      map(
        (event) =>
          new AuthenticateCommand(
            event.credentials.username,
            event.credentials.password,
            event.credentials.clientId,
          ),
      ),
      catchError((err, caught) => {
        this.logger.error('authenticationFlow', err, caught);
        return of();
      }),
    );

  @Saga()
  refreshAuthorizationFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(AuthExpiringEvent),
      map(
        (event) =>
          new RefreshAuthenticationCommand(
            event.accountId,
            event.clientId,
            event.oauth,
          ),
      ),
      catchError((err, caught) => {
        this.logger.error('refreshAuthorizationFlow', err, caught);
        return of();
      }),
    );
}
