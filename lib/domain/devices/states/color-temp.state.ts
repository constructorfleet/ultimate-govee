import { Optional } from '@constructorfleet/ultimate-govee/common';
import { DeviceModel } from '../devices.model';
import { DeviceState, StateCommandAndStatus } from './device.state';

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
      this.stateValue$.next(data.state.colorTemperature);
    }
  }

  protected stateToCommand(
    nextState: Optional<number>,
  ): Optional<StateCommandAndStatus> {
    if (nextState === undefined) {
      this.logger.warn('Color temperature not provided, ignoring command.');
      return undefined;
    }
    return {
      status: {
        state: {
          colorTemperature: nextState,
        },
      },
      command: {
        command: 'colorTem',
        data: {
          colorTemInKelvin: nextState,
        },
      },
    };
  }
}
