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
  number | undefined
> {
  constructor(device: DeviceModel) {
    super(device, BatteryLevelStateName, undefined);
  }

  parseState(data: BatteryType) {
    if (data?.battery !== undefined) {
      this.stateValue.next(data.battery);
    } else if (data?.state?.battery !== undefined) {
      this.stateValue.next(data.state.battery);
    }
  }
}
