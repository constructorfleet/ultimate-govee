import {
  Credentials,
  ClientId,
  AccountId,
} from '@constructorfleet/ultimate-govee/common';
import { OAuthData } from '@constructorfleet/ultimate-govee/data';

export type AccountAuthData = {
  clientId: ClientId;
  accountId: AccountId;
  oauth: OAuthData;
};

export type AuthState = {
  credentials?: Credentials;
  accountAuth?: AccountAuthData;
};
