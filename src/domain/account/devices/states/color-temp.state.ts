import { DeviceModel } from '../devices.model';
import { DeviceState } from './device.state';

export const ColorTempStateName: 'colorTemperature' =
  'colorTemperature' as const;
export type ColorTempStateName = typeof ColorTempStateName;

export type ColorTempData = {
  state?: {
    colorTemInKelvin?: number;
  };
};

export class ColorTempState extends DeviceState<
  ColorTempStateName,
  number | undefined
> {
  constructor(device: DeviceModel) {
    super(device, ColorTempStateName, undefined);
  }

  parseState(data: ColorTempData) {
    if (data?.state?.colorTemInKelvin !== undefined) {
      this.stateValue.next(data.state.colorTemInKelvin);
    }
  }
}
