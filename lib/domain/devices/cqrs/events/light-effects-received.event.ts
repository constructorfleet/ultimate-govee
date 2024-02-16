import { DeviceId, Labelled } from '@constructorfleet/ultimate-govee/common';
import { Effect } from '@constructorfleet/ultimate-govee/data';

export class LightEffectsReceivedEvent implements Labelled {
  label = () => `Received Effects for ${this.deviceId}`;

  constructor(
    readonly deviceId: DeviceId,
    readonly effects: Effect[],
  ) {}
}
