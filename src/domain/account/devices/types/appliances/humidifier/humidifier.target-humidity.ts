import { DeviceState } from '../../../states';
import { DeviceModel } from '../../../devices.model';
import { AutoModeState } from './humidifier.modes';

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
    private activeState: DeviceState<string, any>,
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
