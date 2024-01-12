import { Injectable } from '@nestjs/common';
import { AccountService } from './domain';

@Injectable()
export class AppService {
  constructor(private readonly accountService: AccountService) {}

  async connect() {
    await this.accountService.connect();
  }
}
