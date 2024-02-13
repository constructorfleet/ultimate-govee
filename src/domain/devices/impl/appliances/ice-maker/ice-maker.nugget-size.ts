import { Optional, asOpCode } from '@govee/common';
import { DeviceModel } from '../../../devices.model';
import { DeviceOpState } from '../../../states';
import { GoveeDeviceStateCommand } from '@govee/data';
import { v4 as uuidv4 } from 'uuid';
import { StateCommandAndStatus } from '../../../states/device.state';
import { Command } from 'nest-commander';

export const NuggetSizeStateName = 'nuggetSize' as const;
export type NuggetSizeStateName = typeof NuggetSizeStateName;

export enum NuggetSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

const nuggetSizeMap = {
  SMALL: 3,
  MEDIUM: 2,
  LARGE: 1,
};
export class IceMakerNuggetSizeState extends DeviceOpState<
  NuggetSizeStateName,
  NuggetSize | undefined
> {
  constructor(device: DeviceModel) {
    super(
      {
        opType: 0xaa,
        identifier: [0x05],
      },
      device,
      NuggetSizeStateName,
      undefined,
      'opCode',
    );
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue.next(
      NuggetSize[
        Object.entries(nuggetSizeMap).find(
          ([size, num]) => num === opCommand[0],
        )?.[0] ?? 'SMALL'
      ],
    );
  }

  protected stateToCommand(
    nextState: NuggetSize | undefined,
  ): Optional<StateCommandAndStatus> {
    if (nextState === undefined) {
      this.logger.warn('Nugget size is undefined, ignoring command');
      return undefined;
    }

    return {
      command: {
        data: {
          command: [
            asOpCode(
              0x51,
              this.identifier!,
              nuggetSizeMap[nextState.toString()],
            ),
          ],
        },
      },
      status: {
        op: {
          command: [[nuggetSizeMap[nextState.toString()]]],
        },
      },
    };
  }
}
