import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';
import { OpType } from '../../../common/op-code';
import { Optional } from '../../../common/types';
import { ParseOption } from './states.types';
import { isBetween } from '~ultimate-govee-common';

export const FilterLifeStateName: 'filterLife' = 'filterLife' as const;
export type FilterLifeStateName = typeof FilterLifeStateName;

export class FilterLifeState extends DeviceOpState<
  FilterLifeStateName,
  Optional<number>
> {
  protected parseOption: ParseOption = 'opCode';

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
