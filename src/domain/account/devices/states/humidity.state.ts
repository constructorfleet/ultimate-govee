import { unpaddedHexToArray } from '../../../../common';
import { Measurement } from '../../../../data';
import { DeviceModel } from '../devices.model';
import { DeviceState } from './device.state';

export const HumidityStateName: 'humidity' = 'humidity' as const;
export type HumidityStateName = typeof HumidityStateName;

export type HumidityType = {
  state?: {
    humidity?: Measurement;
    status?: {
      code?: string;
    };
  };
};

export type Humidity = {
  currentHumidity?: number;
  range: {
    min?: number;
    max?: number;
  };
  calibration?: number;
};

export class HumidityState extends DeviceState<HumidityStateName, Humidity> {
  constructor(device: DeviceModel) {
    super(device, HumidityStateName, {
      currentHumidity: undefined,
      range: {
        min: undefined,
        max: undefined,
      },
      calibration: undefined,
    });
  }

  parseState(data: HumidityType) {
    if (data?.state?.humidity !== undefined) {
      this.stateValue.next({
        currentHumidity: data.state?.humidity?.current,
        calibration: data.state?.humidity?.calibration,
        range: {
          min: data.state?.humidity?.min,
          max: data.state?.humidity?.max,
        },
      });
    } else if (data?.state?.status?.code) {
      const { code } = data.state.status;
      const codes = unpaddedHexToArray(code);
      if (codes !== undefined) {
        const [humdidity] = codes.slice(2, 3);
        this.stateValue.next({
          ...this.stateValue.value,
          currentHumidity: humdidity,
        });
      }
    }
  }
}
