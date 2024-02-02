import { Optional } from '@govee/common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';

export const LightEffectStateName: 'lightEffect' = 'lightEffect' as const;
export type LightEffectStateName = typeof LightEffectStateName;

export type LightEffects = {
  commands: number[][];
};

export class LightEffectState extends DeviceOpState<
  LightEffectStateName,
  LightEffects
> {
  constructor(
    device: DeviceModel,
    opType: Optional<number> = 0xa3,
    identifier: Optional<number> = undefined,
  ) {
    super({ opType, identifier }, device, LightEffectStateName, {
      commands: [],
    });
  }

  parseOpCommandmandmandmand(opCommand: number[]) {
    if (opCommand[0] === 0x00) {
      this.stateValue.next({
        commands: [],
      });
    }
    this.stateValue.next({
      commands: [...this.value.commands, opCommand],
    });
  }
}
