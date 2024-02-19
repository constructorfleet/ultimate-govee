import { Optional, asOpCode } from '~ultimate-govee/common';
import { DeviceOpState } from '../../../states';
import { DeviceModel } from '../../../devices.model';
import { StateCommandAndStatus } from '../../../states/device.state';

export const UVCStateName: 'isUVCActive' = 'isUVCActive' as const;
export type UVCStateName = typeof UVCStateName;

export class HumidiferUVCState extends DeviceOpState<
  UVCStateName,
  Optional<boolean>
> {
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    identifier: number[] = [0x1a],
  ) {
    super({ opType, identifier }, device, UVCStateName, undefined);
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue$.next(opCommand[0] === 0x01);
  }

  protected stateToCommand(
    state: Optional<boolean>,
  ): Optional<StateCommandAndStatus> {
    return {
      command: {
        data: {
          command: [asOpCode(0x33, this.identifier!, state ? 0x01 : 0x00)],
        },
      },
      status: {
        op: {
          command: [[state ? 0x01 : 0x00]],
        },
      },
    };
  }
}
