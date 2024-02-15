import { Optional, asOpCode } from '@govee/common';
import { DeviceModel } from '@govee/domain/devices';
import {
  DeviceOpState,
  StateCommandAndStatus,
} from '@govee/domain/devices/states';
import { IceMakerStatus, statusMap } from './types';

export const IceMakerStatusStateName: 'status' = 'status' as const;
export type IceMakerStatusStatename = typeof IceMakerStatusStateName;

export class IceMakerStatusState extends DeviceOpState<
  IceMakerStatusStatename,
  IceMakerStatus | undefined
> {
  constructor(device: DeviceModel) {
    super(
      { opType: 0xaa, identifier: [0x19] },
      device,
      IceMakerStatusStateName,
      undefined,
      'opCode',
    );
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue.next(
      IceMakerStatus[
        Object.entries(statusMap).find(
          ([size, num]) => num === opCommand[0],
        )?.[0] ?? 'STANDBY'
      ],
    );
  }

  protected stateToCommand(
    state: IceMakerStatus | undefined,
  ): Optional<StateCommandAndStatus> {
    if (state === undefined) {
      this.logger.warn(`State is not included, ignoring command`);
      return;
    }

    return {
      command: {
        data: {
          command: [
            asOpCode(0x33, this.identifier!, statusMap[state.toString()]),
          ],
        },
      },
      status: {
        op: {
          command: [[statusMap[state.toString()]]],
        },
      },
    };
  }
}
