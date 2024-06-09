import { OpType, asOpCode, Optional, isTypeOf } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';
import { StateCommandAndStatus } from './states.types';

export const ControlLockStateName: 'controlLock' = 'controlLock' as const;
export type ControlLockStateName = typeof ControlLockStateName;

export class ControlLockState extends DeviceOpState<
  ControlLockStateName,
  Optional<boolean>
> {
  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    ...identifier: number[]
  ) {
    super({ opType, identifier }, device, ControlLockStateName, undefined);
  }

  parseOpCommand(opCommand: number[]) {
    this.stateValue.next(opCommand[0] === 0x01);
  }

  protected readonly stateToCommand = (
    nextState: Optional<boolean>,
  ): Optional<StateCommandAndStatus> => {
    if (!isTypeOf(nextState, 'boolean')) {
      this.logger.warn('state not provided, skipping command.');
      return;
    }
    return {
      command: {
        data: {
          command: [
            asOpCode(OpType.COMMAND, this.identifier!, nextState ? 1 : 0),
          ],
        },
      },
      status: {
        op: {
          command: [[nextState ? 1 : 0]],
        },
      },
    };
  };
}
