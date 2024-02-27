import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';
import { OpType } from '../../../common/op-code';
import { Optional } from '../../../common/types';

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
    super(
      { opType, identifier },
      device,
      FilterLifeStateName,
      undefined,
      'opCode',
    );
  }

  parseOpCommand(opCommand: number[]) {
    const filterLife = opCommand[5];
    if (filterLife < 0 || filterLife > 100) {
      this.logger.warn(`Received invalid value for filter life: ${filterLife}`);
      return;
    }
    this.stateValue$.next(filterLife);
  }
}
