import { Subscription } from 'rxjs';
import { Optional } from '@govee/common';
import { DeviceState } from '../../../states';
import { DeviceModel } from '../../../devices.model';
import { AutoModeState, HumidifierActiveState } from './humidifier.modes';

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
    this.activeState.subscribe((event) => {
      if (this.subscription !== undefined) {
        this.subscription.unsubscribe();
      }
      if (event?.name === 'modeAuto') {
        this.subscription = event.subscribe((event) => {
          this.stateValue.next((event as AutoModeState).value.targetHumidity);
        });
      } else {
        this.stateValue.next(undefined);
      }
    });
  }
}
