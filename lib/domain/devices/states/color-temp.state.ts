import { Optional } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';
import {
  MeasurementData,
  ParseOption,
  StateCommandAndStatus,
} from './states.types';
import { Measurement } from '~ultimate-govee-data';

export const ColorTempStateName: 'colorTemperature' =
  'colorTemperature' as const;
export type ColorTempStateName = typeof ColorTempStateName;

export type ColorTempData = {
  state?: {
    colorTemperature?: Measurement;
  };
};

export class ColorTempState extends DeviceOpState<
  ColorTempStateName,
  MeasurementData
> {
  constructor(
    device: DeviceModel,
    parseOption: ParseOption = 'both',
    opType: Optional<number> = undefined,
    ...identifier: number[]
  ) {
    super({ opType, identifier }, device, ColorTempStateName, {}, parseOption);
  }

  parseState(data: ColorTempData) {
    const currentValue = this.stateValue.getValue();
    const colorTemperature = data?.state?.colorTemperature;
    const current = colorTemperature?.current ?? currentValue.current;
    const min = colorTemperature?.min ?? currentValue.range?.min;
    const max = colorTemperature?.max ?? currentValue.range?.max;

    if (current !== undefined) {
      if (min !== undefined && current < min) {
        return;
      }
      if (max !== undefined && current > max) {
        return;
      }
    }
    if (data?.state?.colorTemperature !== undefined) {
      this.stateValue.next(data.state.colorTemperature);
    }
  }

  protected stateToCommand(
    nextState: MeasurementData,
  ): Optional<StateCommandAndStatus> {
    if (
      nextState?.current === undefined ||
      nextState?.current === null ||
      typeof nextState.current !== 'number'
    ) {
      this.logger.warn('Color temperature not provided, ignoring command.');
      return undefined;
    }
    const currentRange = this.value.range;
    if (
      currentRange?.min !== undefined &&
      nextState.current < currentRange.min
    ) {
      this.logger.warn(
        `Color temperature ${nextState.current} is under the minimum ${currentRange.min}, ignoring command`,
      );
      return;
    }
    if (
      currentRange?.max !== undefined &&
      nextState.current > currentRange.max
    ) {
      this.logger.warn(
        `Color temperature ${nextState.current} is above the maximum ${currentRange.max}, ignoring command`,
      );
      return;
    }
    return {
      status: {
        state: {
          colorTemperature: {
            current: nextState.current,
          },
        },
      },
      command: {
        command: 'colorTem',
        data: {
          colorTemInKelvin: nextState.current,
        },
      },
    };
  }
}
