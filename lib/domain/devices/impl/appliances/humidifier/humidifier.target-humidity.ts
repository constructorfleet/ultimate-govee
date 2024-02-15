import { Subscription } from 'rxjs';
import { Optional } from '@constructorfleet/ultimate-govee/common';
import { DeviceState } from '../../../states';
import { DeviceModel } from '../../../devices.model';
import {
  AutoModeState,
  AutoModeStateName,
  HumidifierActiveState,
} from './humidifier.modes';

export type HumiditierHumidity = {
  current?: number;
  target?: number;
};

export class TargetHumidityState extends DeviceState<
  'targetHumidity',
  Optional<number>
> {
  private subscription: Subscription | undefined;
  constructor(
    device: DeviceModel,
    private activeState: HumidifierActiveState,
  ) {
    super(device, 'targetHumidity', undefined);
    this.activeState?.subscribe((event) => {
      if (this.subscription !== undefined) {
        this.subscription.unsubscribe();
      }
      if (event?.name === 'modeAuto') {
        this.subscription = event?.subscribe((event) => {
          this.stateValue.next((event as AutoModeState).value.targetHumidity);
        });
      } else {
        this.stateValue.next(undefined);
      }
    });
  }

  setState(nextState: Optional<number>) {
    if (nextState === undefined) {
      this.logger.warn('Target humidity not specified, ignoring command');
      return undefined;
    }
    if (this.activeState.value?.name !== AutoModeStateName) {
      this.logger.log(
        'Target humidtiy can only be set in Auto, changing to to Auto',
      );
      return this.activeState.modes
        .find((m) => m.name === AutoModeStateName)
        ?.setState(nextState);
    } else {
      return this.activeState.value.setState(nextState);
    }
  }
}
