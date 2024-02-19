import { DeviceId, Labelled } from '~ultimate-govee-common';
export class EnableBleClientCommand implements Labelled {
  label = 'Enable BLE Client';

  constructor(readonly deviceIds: DeviceId[]) {}
}
