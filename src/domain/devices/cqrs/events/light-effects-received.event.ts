import { DeviceId, Labelled } from '@govee/common';
import { Effect } from '@govee/data';

export class LightEffectsReceivedEvent implements Labelled {
  label = () => `Received Effects for ${this.deviceId}`;

  constructor(
    readonly deviceId: DeviceId,
    readonly effects: Effect[],
  ) {}
}
