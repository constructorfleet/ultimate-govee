import { Labelled } from '~ultimate-govee/common';
import { BleChannelConfig } from '../ble-channel.state';

export class BleChannelConfigReceivedEvent implements Labelled {
  label = 'Received new BLE channel configuration';

  constructor(readonly config: BleChannelConfig) {}
}
