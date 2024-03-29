import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Subject, map, switchMap, timer, tap, filter } from 'rxjs';
import { ClientId, Credentials } from '~ultimate-govee-common';
import { Md5 } from 'ts-md5';
import { v4 as uuidv4 } from 'uuid';
import { AccountAuthData, AuthState } from './auth.state';
import { InjectRefreshMargin } from './auth.providers';
import {
  AuthExpiringEvent,
  AuthenticatedEvent,
  CredentialsChangedEvent,
} from './events';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  private readonly authState: AuthState = {};
  private readonly credentials: Subject<Credentials | undefined> =
    new Subject();
  private readonly authData: Subject<AccountAuthData> = new Subject();

  constructor(
    private eventBus: EventBus,
    @InjectRefreshMargin
    private readonly refreshMargin: number,
  ) {
    this.credentials
      .pipe(
        filter((creds) => creds !== undefined),
        map(
          (creds) =>
            ({
              ...creds!,
              clientId: creds?.clientId ?? this.newClientId,
            }) as Required<Credentials>,
        ),
        map((creds) => new CredentialsChangedEvent(creds)),
      )
      .subscribe((event) => {
        this.eventBus.publish(event);
      });
    this.authData
      .pipe(
        filter((value) => value !== undefined),
        map((value) => value!),
        tap((authData) => {
          this.authState.accountAuth = authData;
        }),
        tap((authData) =>
          this.eventBus.publish(
            new AuthenticatedEvent(
              authData.accountId,
              authData.clientId,
              authData.oauth,
            ),
          ),
        ),
        switchMap((authData) =>
          timer(
            Math.max(
              0,
              authData.oauth.expiresAt - this.refreshMargin - Date.now(),
            ),
          ).pipe(
            map(
              () =>
                new AuthExpiringEvent(
                  authData.accountId,
                  authData.clientId,
                  authData.oauth,
                ),
            ),
          ),
        ),
      )
      .subscribe((event) => this.eventBus.publish(event));
  }

  private get newClientId(): ClientId {
    return Md5.hashStr(
      Buffer.from(uuidv4() + new Date().getMilliseconds().toString()).toString(
        'utf8',
      ),
      false,
    );
  }

  private get isAuthExpired(): boolean {
    if (!this.state.accountAuth?.oauth?.expiresAt) {
      return true;
    }

    return this.expiresAt < Date.now();
  }

  private get expiresAt(): number {
    return this.state.accountAuth?.oauth?.expiresAt ?? Date.now();
  }

  private get state(): AuthState {
    return this.authState;
  }

  get accountAuth(): AccountAuthData | undefined {
    return this.state.accountAuth;
  }

  setCredentials(credentials: Credentials) {
    this.credentials.next(credentials);
  }

  setAuthData(authData: AccountAuthData) {
    this.authData.next(authData);
  }
}
