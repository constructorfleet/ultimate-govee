import { DeviceModel } from '../devices.model';
import { DeviceState } from './device.state';
import { Optional, isTypeOf } from '~ultimate-govee-common';

export const FilterExpiredStateName: 'filterExpired' = 'filterExpired' as const;
export type FilterExpiredStateName = typeof FilterExpiredStateName;

export type FilterExpiredType = {
  state?: {
    filterExpired?: boolean;
  };
};

export class FilterExpiredState extends DeviceState<
  FilterExpiredStateName,
  Optional<boolean>
> {
  constructor(device: DeviceModel) {
    super(device, FilterExpiredStateName, undefined);
  }

  parseState(data: FilterExpiredType) {
    if (!isTypeOf(data?.state?.filterExpired, 'boolean')) {
      return undefined;
    }

    this.stateValue.next(data.state.filterExpired);
  }
}
