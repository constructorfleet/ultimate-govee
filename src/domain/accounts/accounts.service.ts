import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  GoveeAccountService,
  IoTService,
  OAuthData,
  IoTData,
} from '@govee/data';
import { CommandBus, EventBus, ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, map, tap, timer } from 'rxjs';
import { AuthenticatedEvent, RefreshAuthenticationCommand } from '../cqrs';
import { AccountConfig } from './accounts.config';
import { DeviceModel, DevicesService, IoTDevice } from '../devices';
import {
  Account,
  AccountId,
  AccountState,
  ClientId,
  Password,
  Username,
} from './accounts.state';
import { InjectPersisted, PersistResult } from 'persist';
import { join } from 'path';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Optional } from '@govee/common';

@Injectable()
export class AccountService {
  private readonly logger: Logger = new Logger(AccountService.name);

  @PersistResult({
    path: 'persisted',
    filename: 'accountState.json',
    transform: (data) => instanceToPlain(data),
  })
  setAccount(data: {
    username: Username;
    password: Password;
    clientId: ClientId;
    accountId: AccountId;
    oauth?: OAuthData | undefined;
    iot?: IoTData | undefined;
  }): Account {
    if (this.account === undefined) {
      return new Account(
        data.username,
        data.password,
        data.clientId,
        data.accountId,
        data.oauth,
        data.iot,
      );
    }
    return this.account.update(data);
  }

  accountState(): Optional<AccountState> {
    return this.account;
  }

  constructor(
    @Inject(AccountConfig.provide) private readonly config: AccountConfig,
    @InjectPersisted({
      filename: join('persisted', 'accountState.json'),
      transform: (data) => plainToInstance(Account, data),
    })
    private account: Account | undefined,
    private readonly api: GoveeAccountService,
    private readonly devices: DevicesService,
    private readonly iot: IoTService,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) { }

  refreshIoT(device: IoTDevice) {
    this.logger.debug(`Refreshing device ${ device.iotTopic } via IoT Core`);
    if (
      this.account?.iot?.topic === undefined ||
      device.iotTopic === undefined
    ) {
      return;
    }

    this.iot.send(
      device.iotTopic,
      JSON.stringify({
        topic: device.iotTopic,
        msg: {
          accountTopic: this.account.iot.topic,
          cmd: 'status',
          cmdVersion: 0,
          type: 0,
          transaction: `z_${ Date.now() }`,
        },
      }),
    );
  }

  async refreshToken(): Promise<Optional<AccountState>> {
    if (!this.account?.oauth) {
      this.logger.log('refreshToken() - no oauth');
      return;
    }
    this.logger.log('refreshToken() - refreshing token');
    this.account.update({ oauth: await this.api.refresh(this.account.oauth) });
    return this.account;
  }

  async authenticate(
    username: Username,
    password: Password,
    clientId: ClientId,
  ): Promise<Optional<AccountState>> {
    this.logger.log(`authenticate() - ${ this.account?.accountId }`);
    if (
      !this.account?.oauth?.accessToken ||
      !this.api.isTokenValid(this.account.oauth.accessToken)
    ) {
      this.logger.log(`authenticate() - Authenticating with API`);
      const state = await this.api.authenticate({
        username,
        password,
        clientId,
      });
      this.setAccount({
        username,
        password,
        clientId,
        accountId: state.accountId,
        oauth: state.oauth,
        iot: state.iot,
      });
    }
    this.logger.log(`authenticate() - has OAuth? ${ this.account?.oauth }`);
    if (!this.account?.oauth) {
      return;
    }

    await this.connect();
    return this.account;
  }

  async connect() {
    this.logger.debug('connect()');
    if (this.account?.iot !== undefined) {
      this.logger.log('Connecting to IoT Core');
      await this.iot.connect(this.account.iot, (message) =>
        this.devices.onDeviceStatus(message),
      );
    }

    if (this.account?.oauth === undefined) {
      return;
    }

    this.logger.log('Refreshing device list');
    await this.devices.refreshDeviceList(
      this.account.oauth,
      (device: DeviceModel) => {
        this.refreshIoT(device as unknown as IoTDevice);
      },
    );
  }
}
