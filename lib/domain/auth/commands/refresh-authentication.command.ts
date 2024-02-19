import { AccountId, ClientId, Labelled } from '~ultimate-govee-common';
import { OAuthData } from '~ultimate-govee-data';

export class RefreshAuthenticationCommand implements Labelled {
  label = 'Refresh Authentication';

  constructor(
    readonly accountId: AccountId,
    readonly clientId: ClientId,
    readonly oauth: OAuthData,
  ) {}
}
