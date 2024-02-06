import { Ignorable, Optional } from '@govee/common';
import { Measurement } from '@govee/data';
import { DeviceModel } from '../devices.model';
import { DeviceOpState, ParseOption } from './device.state';

export const TemperatureStateName: 'temperatureData' =
  'temperatureData' as const;
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
    identifier: Ignorable<Optional<number>> = undefined,
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
    if (data?.state?.temperature !== undefined) {
      const calibration =
        data?.state?.temperature?.calibration ??
        this.stateValue.value.calibration;
      const current =
        data?.state?.temperature?.current ?? this.stateValue.value.current;
      let raw: Optional<number>;
      if (current !== undefined && calibration !== undefined) {
        raw = current - calibration;
      } else {
        raw = current;
      }
      this.stateValue.next({
        calibration,
        range: {
          min: data?.state?.temperature?.min ?? this.stateValue.value.range.min,
          max: data?.state?.temperature?.max ?? this.stateValue.value.range.max,
        },
        current,
        raw,
      });
    }
  }
}
