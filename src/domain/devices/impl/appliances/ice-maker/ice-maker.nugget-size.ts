import { asOpCode } from '@govee/common';
import { DeviceModel } from '../../../devices.model';
import { DeviceOpState } from '../../../states';

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
        identifier: 0x05,
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

  setState(nextState: NuggetSize | undefined) {
    if (nextState === undefined) {
      this.logger.warn('Nugget size is undefined, ignoring command');
      return;
    }

    this.commandBus.next({
      data: {
        command: [
          asOpCode(0x51, this.identifier!, nuggetSizeMap[nextState.toString()]),
        ],
      },
    });
  }
}
