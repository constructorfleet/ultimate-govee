import { DeviceModel } from '../devices.model';
import { DeviceState } from './device.state';

export const ColorRGBStateName: 'colorRGB' = 'colorRGB' as const;
export type ColorRGBStateName = typeof ColorRGBStateName;

export type ColorRGBData = {
  state?: {
    color?: {
      r?: number;
      g?: number;
      b?: number;
    };
  };
};

export type ColorRGB = {
  red?: number;
  green?: number;
  blue?: number;
};

export class ColorRGBState extends DeviceState<ColorRGBStateName, ColorRGB> {
  constructor(device: DeviceModel) {
    super(device, ColorRGBStateName, {
      red: undefined,
      green: undefined,
      blue: undefined,
    });
  }

  parseState(data: ColorRGBData) {
    if (data?.state?.color) {
      this.stateValue.next({
        red: data.state.color.r,
        green: data.state.color.g,
        blue: data.state.color.b,
      });
    }
  }
}
