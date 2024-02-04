import { Credentials, ClientId, AccountId } from '@govee/common';
import { OAuthData } from '@govee/data';

export type AccountAuthData = {
  clientId: ClientId;
  accountId: AccountId;
  oauth: OAuthData;
};

export type AuthState = {
  credentials?: Credentials;
  accountAuth?: AccountAuthData;
};
