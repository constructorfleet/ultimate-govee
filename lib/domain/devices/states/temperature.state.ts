import { Ignorable, Optional } from '~ultimate-govee-common';
import { Measurement } from '~ultimate-govee-data';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';
import { MeasurementData, ParseOption } from './states.types';

export const TemperatureStateName: 'temperature' = 'temperature' as const;
export type TemperatureStateName = typeof TemperatureStateName;

export type TemperatureDataType = {
  state?: {
    temperature?: Measurement;
  };
};

export class TemperatureState extends DeviceOpState<
  TemperatureStateName,
  MeasurementData
> {
  constructor(
    device: DeviceModel,
    opType: Ignorable<Optional<number>> = undefined,
    parseOption: ParseOption = ParseOption.state,
    ...identifier: number[]
  ) {
    super(
      { opType, identifier },
      device,
      TemperatureStateName,
      {},
      parseOption,
    );
  }

  parseState(data: TemperatureDataType) {
    const previous = this.stateValue.getValue();
    if (data?.state?.temperature !== undefined) {
      let calibration100 = data?.state?.temperature?.calibration;
      if (calibration100 !== undefined && calibration100 > 100) {
        calibration100 /= 100;
      }
      const calibration = calibration100 ?? previous.calibration;
      let current100 = data?.state?.temperature?.current;
      if (current100 !== undefined && current100 > 100) {
        current100 /= 100;
      }
      const current = current100 ?? previous.current;
      if (current === undefined) {
        return;
      }
      let raw: Optional<number>;
      if (current !== undefined && calibration !== undefined) {
        raw = current - calibration;
      } else {
        raw = current;
      }
      const min = data?.state?.temperature?.min ?? previous.range?.min;
      const max = data?.state?.temperature?.max ?? previous.range?.max;
      const range =
        min !== undefined && max !== undefined
          ? {
              min,
              max,
            }
          : undefined;
      if (
        (min !== undefined && current < min) ||
        (max !== undefined && current > max)
      ) {
        return undefined;
      }
      this.stateValue.next({
        calibration,
        range: range,
        current,
        raw,
      });
    }
  }
}
