import { Measurement } from '~ultimate-govee/data';
import { unpaddedHexToArray, Optional } from '~ultimate-govee/common';
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
    identifier: Optional<number[]> = undefined,
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
      let calibration100 = data?.state?.humidity?.calibration;
      if (calibration100 !== undefined && calibration100 > 100) {
        calibration100 /= 100;
      }
      const calibration =
        calibration100 ?? this.stateValue$.getValue().calibration;
      let current100 = data?.state?.humidity?.current;
      if (current100 !== undefined && current100 > 100) {
        current100 /= 100;
      }
      const current = current100 ?? this.stateValue$.getValue().current;
      let raw: Optional<number>;
      if (current !== undefined && calibration !== undefined) {
        raw = current - calibration;
      } else {
        raw = current;
      }
      this.stateValue$.next({
        calibration,
        range: {
          min:
            data?.state?.humidity?.min ?? this.stateValue$.getValue().range.min,
          max:
            data?.state?.humidity?.max ?? this.stateValue$.getValue().range.max,
        },
        current,
        raw,
      });
    }
    if (data?.state?.status?.code) {
      const { code } = data.state.status;
      const codes = unpaddedHexToArray(code);
      if (codes !== undefined) {
        const calibration = this.stateValue$.getValue().calibration ?? 0;
        const [humdidity] = codes.slice(2, 3);
        this.stateValue$.next({
          ...this.stateValue$.getValue(),
          current: humdidity + calibration,
          raw: humdidity,
          calibration,
        });
      }
    }
  }
}
