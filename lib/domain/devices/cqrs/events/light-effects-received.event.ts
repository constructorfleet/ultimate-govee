import { DeviceId, Labelled } from '~ultimate-govee-common';
import { Effect, DiyEffect } from '~ultimate-govee-data';

export class LightEffectsReceivedEvent implements Labelled {
  label = () => `Received Effects for ${this.deviceId}`;

  constructor(
    readonly deviceId: DeviceId,
    readonly effects: Effect[],
    readonly diys: DiyEffect[],
  ) {}
}
