import { OAuthData } from '@govee/data';
import { AccountId, ClientId, Labelled } from '@govee/common';

export class AuthenticatedEvent implements Labelled {
  label = () => `Authenticated ${this.accountId}`;

  constructor(
    readonly accountId: AccountId,
    readonly clientId: ClientId,
    readonly oauthData: OAuthData,
  ) {}
}
