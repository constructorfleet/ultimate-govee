import { OAuthData } from '@govee/data';
import { AccountId, ClientId, Labelled } from '@govee/common';

export class AuthExpiringEvent implements Labelled {
  label = 'Auth Expiring';

  constructor(
    readonly accountId: AccountId,
    readonly clientId: ClientId,
    readonly oauth: OAuthData,
  ) {}
}
