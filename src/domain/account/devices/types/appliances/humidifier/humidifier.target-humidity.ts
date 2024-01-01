import { DeviceModel, DeviceState } from '../../..';
import { HumidifierActiveState, AutoModeState } from './humidifier.modes';

export type HumiditierHumidity = {
  current?: number;
  target?: number;
};

export class TargetHumidityState extends DeviceState<
  'targetHumidity',
  number | undefined
> {
  constructor(
    device: DeviceModel,
    private activeState: HumidifierActiveState,
  ) {
    super(device, 'targetHumidity', undefined);
    this.activeState.subscribe((event) => {
      if (event?.name === 'modeAuto') {
        this.stateValue.next((event as AutoModeState).value.targetHumidity);
      } else {
        this.stateValue.next(undefined);
      }
    });
  }
}
