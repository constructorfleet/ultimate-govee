import { Labelled } from '~ultimate-govee-common';
import { BleChannelConfig } from '../ble-channel.types';

export class BleChannelChangedEvent implements Labelled {
  label = 'BLE channel changed';

  constructor(
    readonly enabled: boolean,
    readonly config: BleChannelConfig,
  ) {}
}
