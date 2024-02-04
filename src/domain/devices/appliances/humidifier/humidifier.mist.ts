import { Optional } from '@govee/common';
import { Subscription } from 'rxjs';
import { DeviceState } from '../../states';
import { DeviceModel } from '../../devices.model';
import {
  CustomMode,
  CustomModeStateName,
  HumidifierActiveState,
  ManualModeStateName,
} from './humidifier.modes';

export const mistLevel: 'mistLevel' = 'mistLevel' as const;
export type MistLevelStateName = typeof mistLevel;

export type MistLevel = {
  mistLevel?: number;
};

export class MistLevelState extends DeviceState<
  MistLevelStateName,
  Optional<number>
> {
  private subscription: Optional<Subscription>;
  constructor(device: DeviceModel, active: HumidifierActiveState) {
    super(device, mistLevel, undefined);
    active?.subscribe((event) => {
      if (this.subscription !== undefined) {
        this.subscription.unsubscribe();
      }
      switch (event?.name) {
        case CustomModeStateName:
          this.subscription = event?.subscribe((event) => {
            this.stateValue.next(
              (event as CustomMode)?.currentProgram?.mistLevel,
            );
          });
          break;
        case ManualModeStateName:
          this.subscription = event?.subscribe((event) => {
            this.stateValue.next(event as Optional<number>);
          });
          break;
        default:
          this.stateValue.next(undefined);
          break;
      }
    });
  }
}
