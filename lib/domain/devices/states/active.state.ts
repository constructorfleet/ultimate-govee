import { OpType, Optional, asOpCode } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState, StateCommandAndStatus } from './device.state';

export const ActiveStateName: 'isActive' = 'isActive' as const;
export type ActiveStateName = typeof ActiveStateName;

export type ActiveData = {
  state?: {
    isOn?: boolean;
  };
};

export class ActiveState extends DeviceOpState<
  ActiveStateName,
  Optional<boolean>
> {
  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    identifier: number[] = [0x01],
  ) {
    super({ opType, identifier }, device, ActiveStateName, undefined, 'both');
  }

  parseState(data: ActiveData): void {
    if (data.state?.isOn !== undefined) {
      this.stateValue.next(data.state.isOn);
    }
  }

  parseOpCommand(opCommand: number[]) {
    if (![0x00, 0x01].includes(opCommand[0])) {
      return;
    }
    this.stateValue.next(opCommand[0] === 0x01);
  }

  protected stateToCommand(
    state: Optional<boolean>,
  ): Optional<StateCommandAndStatus> {
    if (state === undefined || typeof state !== 'boolean') {
      this.logger.warn('state not provided, skipping command.');
      return undefined;
    }

    return {
      command: {
        data: {
          command: [
            asOpCode(
              OpType.COMMAND,
              this.identifier!,
              state === true ? 0x01 : 0x00,
            ),
          ],
        },
      },
      status: {
        op: {
          command: [[state === true ? 0x01 : 0x00]],
        },
      },
    };
  }
}
