import { FactoryProvider, Inject } from '@nestjs/common';
import { Optional } from '@govee/common';
import { AccountState } from '@govee/data';
import { AccountService } from './account.service';

export const AccountStateKey = 'State.Account';
export const InjectAccountState = Inject(AccountStateKey);

export type AccountStateProvider = () => Optional<AccountState>;

export const AccountStateProvider: FactoryProvider = {
  provide: AccountStateKey,
  inject: [AccountService],
  useFactory: (service: AccountService): AccountStateProvider =>
    service.accountState,
};
