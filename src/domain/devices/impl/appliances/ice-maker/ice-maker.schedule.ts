import { asOpCode } from '@govee/common';
import { DeviceModel } from '../../../devices.model';
import { DeviceOpState } from '../../../states';

export const IceMakerScheduleStateName = 'scheduleStart' as const;
export type IceMakerScheduleStateName = typeof IceMakerScheduleStateName;

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

export type IceMakerSchedule = {
  on?: boolean;
  startHour?: number;
  startMinute?: number;
  nuggetSize?: NuggetSize;
};
/*

        170,
        35,
        1,
        0,
        70,
        101,
        198,
        47,
        228,
        2,
*/
export class IceMakerScheduleState extends DeviceOpState<
  IceMakerScheduleStateName,
  IceMakerSchedule
> {
  constructor(device: DeviceModel) {
    super(
      {
        opType: 0xaa,
        identifier: 35,
      },
      device,
      IceMakerScheduleStateName,
      {},
      'both',
    );
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue.next({
      nuggetSize:
        NuggetSize[
          Object.entries(nuggetSizeMap).find(
            ([size, num]) => num === opCommand[7],
          )?.[0] ?? 'SMALL'
        ],
      startMinute: opCommand[1],
      startHour: opCommand[2],
    });
  }

  setState(nextState: IceMakerSchedule | undefined) {
    if (nextState?.nuggetSize === undefined) {
      this.logger.warn('Nugget size is undefined, ignoring command');
      return;
    }

    if (nextState?.startHour === undefined) {
      this.logger.warn('StartHour is undefined, ignoring command');
      return;
    }
    if (nextState?.startMinute === undefined) {
      this.logger.warn('StartMinute is undefined, ignoring command');
      return;
    }
    if (nextState?.on === undefined) {
      this.logger.warn('Schedule on is undefined, ignoring command');
      return;
    }

    this.commandBus.next({
      data: {
        command: [
          asOpCode(
            0x51,
            this.identifier!,
            nuggetSizeMap[nextState.toString()],
            nextState.startMinute,
            nextState.startHour,
          ),
        ],
      },
    });
  }
}
