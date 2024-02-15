import { OAuthData } from '@constructorfleet/ultimate-govee/data';
import {
  AccountId,
  ClientId,
  Labelled,
} from '@constructorfleet/ultimate-govee/common';

export class AuthenticatedEvent implements Labelled {
  label = () => `Authenticated ${this.accountId}`;

  constructor(
    readonly accountId: AccountId,
    readonly clientId: ClientId,
    readonly oauthData: OAuthData,
  ) {}
}
