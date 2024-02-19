import { OpType, asOpCode, Optional } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';

export const ControlLockStateName: 'controlLock' = 'controlLock' as const;
export type ControlLockStateName = typeof ControlLockStateName;

export class ControlLockState extends DeviceOpState<
  ControlLockStateName,
  Optional<boolean>
> {
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    ...identifier: number[]
  ) {
    super({ opType, identifier }, device, ControlLockStateName, undefined);
  }

  parseOpCommand(opCommand: number[]) {
    this.stateValue$.next(opCommand[0] === 0x01);
  }

  protected opCommand(nextState: Optional<boolean>): Optional<number[]> {
    if (nextState === undefined) {
      return undefined;
    }
    return asOpCode(OpType.COMMAND, this.identifier!, nextState ? 1 : 0);
  }
}
