import { instanceToPlain } from 'class-transformer';
import { IoTData, OAuthData } from "data";
import { PersistResult } from 'persist';

export type Username = string;
export type Password = string;
export type ClientId = string;
export type AccountId = string;

export type AccountState = {
  username: Username;
  password: Password;
  clientId: ClientId;
  accountId: AccountId;
  oauth?: OAuthData;
  iot?: IoTData;
};

export type AccountStateUpdate = Partial<AccountState>;

export class Account implements AccountState {

  constructor(public username: Username, public password: Password, public clientId: ClientId, public accountId: AccountId, public oauth: OAuthData | undefined = undefined, public iot: IoTData | undefined = undefined) { }

  @PersistResult({
    path: 'persisted',
    filename: 'accountState.json',
    transform: (data) => instanceToPlain(data)
  })
  update(update: AccountStateUpdate): Account {
    Object.assign(this, update);
    return this;
  }
}