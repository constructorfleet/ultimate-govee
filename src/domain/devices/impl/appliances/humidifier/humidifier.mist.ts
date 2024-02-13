import { Optional } from '@govee/common';
import { Subscription } from 'rxjs';
import { DeviceState } from '../../../states';
import { DeviceModel } from '../../../devices.model';
import {
  AutoModeStateName,
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
  constructor(
    device: DeviceModel,
    readonly active: HumidifierActiveState,
  ) {
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

  setState(nextState: Optional<number>) {
    if (this.active.value === undefined) {
      this.logger.warn('Active state is unknown, ignoring command');
      return;
    }
    if (nextState === undefined) {
      this.logger.warn('Mist level is not specified, igoring command');
      return;
    }
    switch (this.active.value.name) {
      case AutoModeStateName:
        this.logger.warn(
          'Mist level cannot be set when in Auto, changing mode to Manual',
        );
        return this.active.modes
          .find((mode) => mode.name === ManualModeStateName)
          ?.setState(nextState);
      case CustomModeStateName:
        return this.active.value.setState({
          mistLevel: nextState,
        });
      case ManualModeStateName:
        return this.active.value.setState(nextState);
      default:
        return undefined;
    }
  }
}
