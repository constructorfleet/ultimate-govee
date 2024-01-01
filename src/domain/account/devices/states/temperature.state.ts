import { Measurement } from '../../../../data';
import { DeviceModel } from '../devices.model';
import { DeviceState } from './device.state';

export const TemperatureStateName: 'temperature' = 'temperature' as const;
export type TemperatureStateName = typeof TemperatureStateName;

export type TemperatureType = {
  state?: {
    temperature?: Measurement;
  };
};

export type Temperature = {
  currentTemperature?: number;
  range: {
    min?: number;
    max?: number;
  };
  calibration?: number;
};

export class TemperatureState extends DeviceState<
  TemperatureStateName,
  Temperature
> {
  constructor(device: DeviceModel) {
    super(device, TemperatureStateName, {
      currentTemperature: undefined,
      range: {
        min: undefined,
        max: undefined,
      },
      calibration: undefined,
    });
  }

  parseState(data: TemperatureType) {
    if (data?.state?.temperature !== undefined) {
      this.stateValue.next({
        currentTemperature: data?.state?.temperature?.current,
        calibration: data?.state?.temperature?.calibration,
        range: {
          min: data?.state?.temperature?.min,
          max: data?.state?.temperature?.max,
        },
      });
    }
  }
}
