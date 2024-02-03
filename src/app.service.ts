import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { AccountConfig, AccountService, CredentialsConfig } from './domain';
import { CommandBus } from '@nestjs/cqrs';
import { AuthenticateCommand } from 'domain/cqrs';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly logger: Logger = new Logger(AppService.name);

  constructor(
    @Inject(AccountConfig.provide)
    private readonly accountConfig: AccountConfig,
    private readonly commandBus: CommandBus,
  ) { }

  async connect() {
    this.logger.log('Issuing authenticate command');
    const result = await this.commandBus.execute(new AuthenticateCommand(this.accountConfig.username, this.accountConfig.password, this.accountConfig.clientId));
    this.logger.log(`Result ${ result }`);
  }
}
