import { DeviceState, DeviceModel } from '../../..';
import {
  CustomMode,
  CustomModeStateName,
  HumidifierActiveState as HumiditierActiveState,
  ManualModeStateName,
} from './humidifier.modes';

export const mistLevel: 'mistLevel' = 'mistLevel' as const;
export type MistLevelStateName = typeof mistLevel;

export type MistLevel = {
  mistLevel?: number;
};

export class MistLevelState extends DeviceState<
  MistLevelStateName,
  number | undefined
> {
  constructor(device: DeviceModel, active: HumiditierActiveState) {
    super(device, mistLevel, undefined);
    active.subscribe((event) => {
      switch (event?.name) {
        case CustomModeStateName:
          this.stateValue.next(
            (event.value as CustomMode)?.currentProgram?.mistLevel,
          );
          break;
        case ManualModeStateName:
          this.stateValue.next(event.value as number | undefined);
          break;
        default:
          this.stateValue.next(undefined);
          break;
      }
    });
  }
}
