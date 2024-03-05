import { Optional } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceState } from './device.state';

export const BatteryLevelStateName: 'batteryLevel' = 'batteryLevel' as const;
export type BatteryLevelStateName = typeof BatteryLevelStateName;

export type BatteryType = {
  battery?: number;
  state?: {
    battery?: number;
  };
};

export class BatteryLevelState extends DeviceState<
  BatteryLevelStateName,
  Optional<number>
> {
  constructor(device: DeviceModel) {
    super(device, BatteryLevelStateName, undefined);
  }

  parseState(data: BatteryType) {
    if (data?.battery !== undefined) {
      if (data.battery < 0 || data.battery > 100) {
        return;
      }
      this.stateValue.next(data.battery);
    } else if (data?.state?.battery !== undefined) {
      if (data.state.battery < 0 || data.state.battery > 100) {
        return;
      }
      this.stateValue.next(data.state.battery);
    }
  }
}
