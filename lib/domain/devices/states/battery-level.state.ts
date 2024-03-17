import { Optional, isBetween } from '~ultimate-govee-common';
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
    let battery = data?.battery;
    if (isBetween(battery, 0, 100)) {
      this.stateValue.next(battery);
      return;
    }
    battery = data.state?.battery;
    if (isBetween(battery, 0, 100)) {
      this.stateValue.next(battery);
    }
  }
}
