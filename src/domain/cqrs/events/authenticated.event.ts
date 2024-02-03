import { OAuthData } from '@govee/data';
import { AccountId, ClientId } from '../../accounts/accounts.state';

export class AuthenticatedEvent {
  constructor(
    readonly accountId: AccountId,
    readonly clientId: ClientId,
    readonly oauthData: OAuthData,
  ) { }
}
