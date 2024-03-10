import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';
import { OpType } from '../../../common/op-code';

export const UnknownStateName: 'unknown' = 'unknown' as const;
export type UnknownStateName<Identifier extends string> =
  `${typeof UnknownStateName}${Identifier}`;

export type UnknownData = {
  codes?: number[];
};

export class UnknownState extends DeviceOpState<
  UnknownStateName<string>,
  UnknownData
> {
  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    ...identifier: number[]
  ) {
    super(
      { opType, identifier },
      device,
      `${UnknownStateName}-${identifier.join(',')}`,
      {},
    );
  }

  parseOpCommand(opCommand: number[]) {
    this.stateValue.next({
      codes: opCommand,
    });
  }
}
