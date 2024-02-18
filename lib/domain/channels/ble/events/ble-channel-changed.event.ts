import { Labelled } from '@constructorfleet/ultimate-govee/common';
import { BleChannelConfig } from '../ble-channel.state';

export class BleChannelChangedEvent implements Labelled {
  label = 'BLE channel changed';

  constructor(
    readonly enabled: boolean,
    readonly config: BleChannelConfig,
  ) {}
}
