import { OAuthData } from '@constructorfleet/ultimate-govee/data';
import {
  AccountId,
  ClientId,
  Labelled,
} from '@constructorfleet/ultimate-govee/common';

export class AuthExpiringEvent implements Labelled {
  label = 'Auth Expiring';

  constructor(
    readonly accountId: AccountId,
    readonly clientId: ClientId,
    readonly oauth: OAuthData,
  ) {}
}
