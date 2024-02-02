import { Measurement } from '@govee/data';
import { unpaddedHexToArray, Optional } from '@govee/common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState, ParseOption } from './device.state';

export const HumidityStateName: 'humidity' = 'humidity' as const;
export type HumidityStateName = typeof HumidityStateName;

export type HumidityDataType = {
  state?: {
    humidity?: Measurement;
    status?: {
      code?: string;
    };
  };
};

export type HumidityData = {
  range: {
    min?: number;
    max?: number;
  };
  calibration?: number;
  raw?: number;
  current?: number;
};

export class HumidityState extends DeviceOpState<
  HumidityStateName,
  HumidityData
> {
  constructor(
    device: DeviceModel,
    opType: Optional<number> = undefined,
    identifier: Optional<number> = undefined,
    parseOption: ParseOption = 'state',
  ) {
    super(
      { opType, identifier },
      device,
      HumidityStateName,
      {
        range: {
          min: undefined,
          max: undefined,
        },
        calibration: undefined,
        current: undefined,
      },
      parseOption,
    );
  }

  parseState(data: HumidityDataType) {
    if (data?.state?.humidity !== undefined) {
      const calibration =
        data?.state?.humidity?.calibration ?? this.stateValue.value.calibration;
      const current =
        data?.state?.humidity?.current ?? this.stateValue.value.current;
      let raw: Optional<number>;
      if (current !== undefined && calibration !== undefined) {
        raw = current - calibration;
      } else {
        raw = current;
      }
      this.stateValue.next({
        calibration,
        range: {
          min: data?.state?.humidity?.min ?? this.stateValue.value.range.min,
          max: data?.state?.humidity?.max ?? this.stateValue.value.range.max,
        },
        current,
        raw,
      });
    }
    if (data?.state?.status?.code) {
      const { code } = data.state.status;
      const codes = unpaddedHexToArray(code);
      if (codes !== undefined) {
        const calibration = this.stateValue.value.calibration ?? 0;
        const [humdidity] = codes.slice(2, 3);
        this.stateValue.next({
          ...this.stateValue.value,
          current: humdidity + calibration,
          raw: humdidity,
          calibration,
        });
      }
    }
  }
}
