import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';

export const FilterStateName: 'filter' = 'filter' as const;
export type FilterStateName = typeof FilterStateName;

export type Filter = {
  expired?: boolean;
  filterLife?: number;
};

export type FilterExpiredType = {
  state?: {
    filterExpired?: boolean;
  };
};

export class FilterState extends DeviceOpState<FilterStateName, Filter> {
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    ...identifier: number[]
  ) {
    super({ opType, identifier }, device, FilterStateName, {});
  }

  parseState(data: FilterExpiredType) {
    if (data?.state?.filterExpired !== undefined) {
      this.stateValue.next({
        ...this.stateValue.value,
        expired: data?.state?.filterExpired,
      });
    }
  }

  parseOpCommandmand(opCommand: number[]) {
    const filterLife = opCommand[4];
    const expired = opCommand[2] === 0x01;
    this.stateValue.next({
      expired,
      filterLife,
    });
  }
}
