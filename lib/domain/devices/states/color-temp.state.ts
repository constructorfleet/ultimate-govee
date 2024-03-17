import { Optional, isBetween, isTypeOf } from '~ultimate-govee-common';
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
  protected parseOption: ParseOption = 'state';
  constructor(
    device: DeviceModel,
    opType: Optional<number> = undefined,
    ...identifier: number[]
  ) {
    super({ opType, identifier }, device, ColorTempStateName, {});
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
    const { min, max } =
      nextState?.range ?? this.stateValue.getValue()?.range ?? {};
    if (isTypeOf(min, 'number') && isTypeOf(max, 'number')) {
      if (!isBetween(nextState.current, min, max)) {
        this.logger.warn(
          'Invalid or missing color temperature, ignoring command',
        );
        return undefined;
      }
    } else {
      if (!isTypeOf(nextState.current, 'number')) {
        this.logger.warn(
          'Invalid or missing color temperature, ignoring command',
        );
        return undefined;
      }
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
