import { Optional, asOpCode, OpType } from '~ultimate-govee-common';
import { DeviceModel } from '../../../devices.model';
import { DeviceOpState, StateCommandAndStatus } from '../../../states';
import { NuggetSize, nuggetSizeMap } from './types';

export const NuggetSizeStateName = 'nuggetSize' as const;
export type NuggetSizeStateName = typeof NuggetSizeStateName;

export class IceMakerNuggetSizeState extends DeviceOpState<
  NuggetSizeStateName,
  NuggetSize | undefined
> {
  constructor(device: DeviceModel) {
    super(
      {
        opType: OpType.REPORT,
        identifier: [5],
      },
      device,
      NuggetSizeStateName,
      undefined,
    );
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue.next(
      NuggetSize[
        Object.entries(nuggetSizeMap).find(
          ([_, num]) => num === opCommand[0],
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
              OpType.COMMAND,
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
