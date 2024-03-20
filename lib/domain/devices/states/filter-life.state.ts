import { DeviceModel } from '../devices.model';
import { isBetween, OpType, Optional } from '~ultimate-govee-common';
import { DeviceOpState } from './device.state';

export const FilterLifeStateName: 'filterLife' = 'filterLife' as const;
export type FilterLifeStateName = typeof FilterLifeStateName;

export class FilterLifeState extends DeviceOpState<
  FilterLifeStateName,
  Optional<number>
> {
  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    ...identifier: number[]
  ) {
    super({ opType, identifier }, device, FilterLifeStateName, undefined);
  }

  parseOpCommand(opCommand: number[]) {
    const filterLife = opCommand[5];
    if (!isBetween(filterLife, 0, 100)) {
      this.logger.warn(`Received invalid value for filter life: ${filterLife}`);
      return;
    }
    this.stateValue.next(filterLife);
  }
}
