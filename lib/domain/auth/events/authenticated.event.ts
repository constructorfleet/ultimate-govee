import { OAuthData } from '~ultimate-govee/data';
import { AccountId, ClientId, Labelled } from '~ultimate-govee/common';

export class AuthenticatedEvent implements Labelled {
  label = () => `Authenticated ${this.accountId}`;

  constructor(
    readonly accountId: AccountId,
    readonly clientId: ClientId,
    readonly oauthData: OAuthData,
  ) {}
}
