import { Labelled } from '@constructorfleet/ultimate-govee/common';
import { BleChannelConfig } from '../ble-channel.state';

export class ConfigureBleChannelCommand implements Labelled {
  label = 'Configure BLE channel';

  constructor(readonly config: BleChannelConfig) {}
}
