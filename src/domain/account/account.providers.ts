import { FactoryProvider, Inject } from '@nestjs/common';
import { AccountState } from '@govee/data';
import { AccountService } from './account.service';

export const AccountStateKey = 'State.Account';
export const InjectAccountState = Inject(AccountStateKey);

export type AccountStateProvider = () => AccountState | undefined;

export const AccountStateProvider: FactoryProvider = {
  provide: AccountStateKey,
  inject: [AccountService],
  useFactory: (service: AccountService): AccountStateProvider =>
    service.accountState,
};
