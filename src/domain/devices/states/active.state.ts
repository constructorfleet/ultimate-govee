import { OpType, Optional } from '@govee/common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';

export const ActiveStateName: 'isActive' = 'isActive' as const;
export type ActiveStateName = typeof ActiveStateName;

export class ActiveState extends DeviceOpState<
  ActiveStateName,
  Optional<boolean>
> {
  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    identifier: number[] = [0x01],
  ) {
    super({ opType, identifier }, device, ActiveStateName, undefined);
  }

  parseOpCommand(opCommand: number[]) {
    this.stateValue.next(opCommand[0] === 0x01);
  }
}
