import { Labelled } from '~ultimate-govee-common';
import { BleChannelConfig } from '../ble-channel.types';

export class ConfigureBleChannelCommand implements Labelled {
  label = 'Configure BLE channel';

  constructor(
    readonly enabled: boolean,
    readonly config: BleChannelConfig,
  ) {}
}
