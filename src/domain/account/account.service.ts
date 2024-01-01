import { Injectable, OnModuleInit } from '@nestjs/common';
import { AccountConfig } from './account.config';
import { GoveeAccountService, IoTService } from '../../data';
import { DevicesService } from './devices';

@Injectable()
export class AccountService implements OnModuleInit {
  constructor(
    private readonly config: AccountConfig,
    private readonly api: GoveeAccountService,
    private readonly devices: DevicesService,
    private readonly iot: IoTService,
  ) {}

  async onModuleInit() {
    const apiClient = await this.api.authenticate(this.config);
    if (apiClient.iot) {
      await this.iot.connect(apiClient.iot, this.devices.onMessage);
    }
  }
}
