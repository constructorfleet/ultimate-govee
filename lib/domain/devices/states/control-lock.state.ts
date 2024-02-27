import { OpType, asOpCode, Optional } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState, StateCommandAndStatus } from './device.state';

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
    this.stateValue$.next(opCommand[0] === 0x01);
  }

  protected stateToCommand(
    nextState: Optional<boolean>,
  ): Optional<StateCommandAndStatus> {
    if (nextState === undefined) {
      this.logger.warn('state not provided, skipping command.');
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
  }
}
