import { AccountId, ClientId, Labelled } from '@govee/common';
import { OAuthData } from '@govee/data';

export class RefreshAuthenticationCommand implements Labelled {
  label = 'Refresh Authentication';

  constructor(
    readonly accountId: AccountId,
    readonly clientId: ClientId,
    readonly oauth: OAuthData,
  ) {}
}
