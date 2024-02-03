import { FactoryProvider, Inject } from '@nestjs/common';
import { Optional } from '@govee/common';
import { AccountService } from './accounts.service';
import { AccountState } from './accounts.state';

export const AccountStateKey = 'State.Account';
export const InjectAccountState = Inject(AccountStateKey);

export type AccountStateProvider = () => Optional<AccountState>;

export const AccountStateProvider: FactoryProvider = {
  provide: AccountStateKey,
  inject: [AccountService],
  useFactory: (service: AccountService): AccountStateProvider =>
    service.accountState,
};
