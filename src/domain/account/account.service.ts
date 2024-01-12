import { Inject, Injectable, Logger } from '@nestjs/common';
import { AccountConfig } from './account.config';
import { GoveeAccountService, IoTService, AccountClient } from '../../data';
import { DeviceModel, DevicesService, IoTDevice } from './devices';

@Injectable()
export class AccountService {
  private readonly logger: Logger = new Logger(AccountService.name);
  private apiClient: AccountClient | undefined;

  constructor(
    @Inject(AccountConfig.provide) private readonly config: AccountConfig,
    private readonly api: GoveeAccountService,
    private readonly devices: DevicesService,
    private readonly iot: IoTService,
  ) {}

  refreshIoT(device: IoTDevice) {
    this.logger.debug(`Refresh IoT ${device.iotTopic}`);
    if (
      this.apiClient?.iot?.topic === undefined ||
      device.iotTopic === undefined
    ) {
      return;
    }
    this.iot.send(
      device.iotTopic,
      JSON.stringify({
        topic: device.iotTopic,
        msg: {
          accountTopic: this.apiClient.iot.topic,
          cmd: 'status',
          cmdVersion: 0,
          type: 0,
          transaction: `z_${Date.now()}`,
        },
      }),
    );
  }

  async connect() {
    this.apiClient = await this.api.authenticate(this.config);

    if (this.apiClient.iot !== undefined) {
      await this.iot.connect(this.apiClient.iot, (message) =>
        this.devices.onMessage(message),
      );
    }

    await this.devices.loadDevices(
      this.apiClient.oauth,
      (device: DeviceModel) => {
        this.refreshIoT(device as unknown as IoTDevice);
      },
    );
  }
}
