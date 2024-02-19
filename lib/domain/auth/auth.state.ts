import { Credentials, ClientId, AccountId } from '~ultimate-govee/common';
import { OAuthData } from '~ultimate-govee/data';

export type AccountAuthData = {
  clientId: ClientId;
  accountId: AccountId;
  oauth: OAuthData;
};

export type AuthState = {
  credentials?: Credentials;
  accountAuth?: AccountAuthData;
};
