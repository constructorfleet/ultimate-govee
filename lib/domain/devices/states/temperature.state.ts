import { Ignorable, Optional } from '@constructorfleet/ultimate-govee/common';
import { Measurement } from '@constructorfleet/ultimate-govee/data';
import { DeviceModel } from '../devices.model';
import { DeviceOpState, ParseOption } from './device.state';

export const TemperatureStateName: 'temperature' = 'temperature' as const;
export type TemperatureStateName = typeof TemperatureStateName;

export type TemperatureDataType = {
  state?: {
    temperature?: Measurement;
  };
};

export type TemperatureData = {
  range: {
    min?: number;
    max?: number;
  };
  calibration?: number;
  raw?: number;
  current?: number;
};

export class TemperatureState extends DeviceOpState<
  TemperatureStateName,
  TemperatureData
> {
  constructor(
    device: DeviceModel,
    opType: Ignorable<Optional<number>> = undefined,
    identifier: Ignorable<Optional<number[]>> = undefined,
    parseOption: ParseOption = 'state',
  ) {
    super(
      { opType, identifier },
      device,
      TemperatureStateName,
      {
        range: {
          min: undefined,
          max: undefined,
        },
        calibration: undefined,
      },
      parseOption,
    );
  }

  parseState(data: TemperatureDataType) {
    const previous = this.stateValue$.getValue();
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
      let raw: Optional<number>;
      if (current !== undefined && calibration !== undefined) {
        raw = current - calibration;
      } else {
        raw = current;
      }
      this.stateValue$.next({
        calibration,
        range: {
          min: data?.state?.temperature?.min ?? previous.range.min,
          max: data?.state?.temperature?.max ?? previous.range.max,
        },
        current,
        raw,
      });
    }
  }
}
