import { Optional } from '@govee/common';
import { DeviceModel } from '../devices.model';
import { DeviceState } from './device.state';

export const ColorTempStateName: 'colorTemperature' =
  'colorTemperature' as const;
export type ColorTempStateName = typeof ColorTempStateName;

export type ColorTempData = {
  state?: {
    colorTemperature?: number;
  };
};

export class ColorTempState extends DeviceState<
  ColorTempStateName,
  Optional<number>
> {
  constructor(device: DeviceModel) {
    super(device, ColorTempStateName, undefined);
  }

  parseState(data: ColorTempData) {
    if (data?.state?.colorTemperature !== undefined) {
      this.stateValue.next(data.state.colorTemperature);
    }
  }

  setState(nextState: Optional<number>) {
    if (nextState === undefined) {
      this.logger.warn('Color temperature not provided, ignoring command.');
      return;
    }
    this.commandBus.next({
      command: 'colorTem',
      data: {
        colorTemInKelvin: nextState,
      },
    });
  }
}
