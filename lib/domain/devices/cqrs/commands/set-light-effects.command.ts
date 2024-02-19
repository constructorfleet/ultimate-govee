import { DeviceId, Labelled } from '~ultimate-govee/common';
import { Effect } from '~ultimate-govee/data';

export class SetLightEffectsCommand implements Labelled {
  label = () => `Set Effects for ${this.deviceId}`;
  constructor(
    readonly deviceId: DeviceId,
    readonly effects: Effect[],
  ) {}
}
