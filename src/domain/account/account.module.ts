import { Module } from '@nestjs/common';
import { GoveeAccountModule } from '../../data';
import { AccountConfig } from './account.config';
import { AccountService } from './account.service';

@Module({
  imports: [GoveeAccountModule],
  providers: [AccountConfig, AccountService],
  exports: [AccountService],
})
export class AccountModule {}
