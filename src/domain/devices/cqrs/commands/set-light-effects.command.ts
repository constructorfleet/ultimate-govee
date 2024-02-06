import { DeviceId, Labelled } from '@govee/common';
import { Effect } from '@govee/data';

export class SetLightEffectsCommand implements Labelled {
  label = () => `Set Effects for ${this.deviceId}`;
  constructor(
    readonly deviceId: DeviceId,
    readonly effects: Effect[],
  ) {}
}
