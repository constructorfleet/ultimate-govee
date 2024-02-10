import { Labelled } from '@govee/common';
import { BleChannelConfig } from '../ble-channel.state';

export class BleChannelChangedEvent implements Labelled {
  label = 'BLE channel changed';

  constructor(readonly config: BleChannelConfig) {}
}
