import { DeviceId, Labelled } from '@govee/common';
import { EffectScene } from '@govee/data';

export class SetLightEffectsCommand implements Labelled {
  label = () => `Set Effects foR ${this.deviceId}`;
  constructor(
    readonly deviceId: DeviceId,
    readonly effects: EffectScene[],
  ) {}
}
