import { Inject, Injectable, Logger } from '@nestjs/common';
import { Optional } from '@govee/common';
import { GoveeAccountService, IoTService, AccountState } from '@govee/data';
import { AccountConfig } from './account.config';
import { DeviceModel, DevicesService, IoTDevice } from './devices';

@Injectable()
export class AccountService {
  private readonly logger: Logger = new Logger(AccountService.name);
  private apiState: Optional<AccountState>;

  constructor(
    @Inject(AccountConfig.provide) private readonly config: AccountConfig,
    private readonly api: GoveeAccountService,
    private readonly devices: DevicesService,
    private readonly iot: IoTService,
  ) {}

  accountState(): Optional<AccountState> {
    return this.apiState;
  }

  refreshIoT(device: IoTDevice) {
    this.logger.debug(`Refresh IoT ${device.iotTopic}`);
    if (
      this.apiState?.iot?.topic === undefined ||
      device.iotTopic === undefined
    ) {
      return;
    }
    this.iot.send(
      device.iotTopic,
      JSON.stringify({
        topic: device.iotTopic,
        msg: {
          accountTopic: this.apiState.iot.topic,
          cmd: 'status',
          cmdVersion: 0,
          type: 0,
          transaction: `z_${Date.now()}`,
        },
      }),
    );
  }

  async connect() {
    this.apiState = await this.api.authenticate(this.config);

    if (this.apiState.iot !== undefined) {
      await this.iot.connect(this.apiState.iot, (message) =>
        this.devices.onMessage(message),
      );
    }

    await this.devices.loadDevices(
      this.apiState.oauth,
      (device: DeviceModel) => {
        this.refreshIoT(device as unknown as IoTDevice);
      },
    );
  }
}
