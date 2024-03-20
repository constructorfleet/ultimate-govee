import {
  DeviceOpState,
  ParseOption,
  StateCommandAndStatus,
} from '../../../states';
import { NuggetSize, nuggetSizeMap } from './types';
import {
  Optional,
  asOpCode,
  hexStringToArray,
  total,
  unpaddedHexToArray,
  OpType,
} from '~ultimate-govee-common';
import { DeviceModel } from '../../../devices.model';
import MomentLib from 'moment';

export const ScheduledStartStateName: 'scheduledStart' =
  'scheduledStart' as const;
export type ScheduledStartStateName = typeof ScheduledStartStateName;

export type IceMakerScheduledStartData = {
  enabled?: boolean;
  hourStart?: number;
  minuteStart?: number;
  nuggetSize?: NuggetSize;
};

const getStartTimeUTC = (
  startHour: number,
  startMinute: number,
): MomentLib.Moment => {
  const startTime = MomentLib().hour(startHour).minute(startMinute).second(0);

  if (startTime.isBefore(MomentLib())) {
    startTime.add(1, 'day');
  }
  return startTime.utc();
};

export class IceMakerScheduledStart extends DeviceOpState<
  ScheduledStartStateName,
  IceMakerScheduledStartData
> {
  protected parseOption: ParseOption = 'opCode';

  constructor(device: DeviceModel) {
    super(
      { opType: OpType.REPORT, identifier: [35] },
      device,
      ScheduledStartStateName,
      {},
    );
  }

  parseOpCommand(opCommand: number[]): void {
    if (opCommand[0] === 0x00) {
      this.stateValue.next({
        enabled: false,
        hourStart: undefined,
        minuteStart: undefined,
        nuggetSize: undefined,
      });
      return;
    }
    const timestamp = total(opCommand.slice(3, 7));
    const startDate = new Date(timestamp);
    this.stateValue.next({
      enabled: opCommand[0] === 0x01,
      hourStart: startDate.getHours(),
      minuteStart: startDate.getMinutes(),
      nuggetSize:
        NuggetSize[
          Object.entries(nuggetSizeMap).find(
            ([_, num]) => num === opCommand[7],
          )?.[0] ?? 'SMALL'
        ],
    });
  }

  protected stateToCommand(
    state: IceMakerScheduledStartData,
  ): Optional<StateCommandAndStatus> {
    if (state.enabled === undefined) {
      this.logger.warn(
        'Enabled is not included in the state, ignoring command',
      );
      return;
    }

    if (state.enabled !== true) {
      if (!state.enabled) {
        return {
          command: {
            data: {
              command: [asOpCode(OpType.COMMAND, this.identifier!, 0x00)],
            },
          },
          status: {
            op: {
              command: [[0x00]],
            },
          },
        };
      }
    }

    if (state.hourStart === undefined) {
      this.logger.warn('hourStart not included in the state, ignoring command');
      return;
    }
    if (state.minuteStart === undefined) {
      this.logger.warn(
        'minuteStart not included in the state, ignoring command',
      );
      return;
    }
    if (state.nuggetSize === undefined) {
      this.logger.warn(
        'Nugget size not included in the state, igrnoging command',
      );
      return;
    }

    const startTime = getStartTimeUTC(state.hourStart, state.minuteStart);
    const timestampSec = Math.round(startTime.valueOf() / 1000);
    const minutes = MomentLib.duration(
      startTime.diff(MomentLib().utc()),
    ).asMinutes();

    const opCodes = [
      0x01,
      ...[0x00, ...hexStringToArray(Math.round(minutes).toString(16))].slice(
        -2,
      ),
      ...(unpaddedHexToArray(timestampSec.toString(16)) ?? []),
      nuggetSizeMap[state.nuggetSize.toString()],
    ];

    return {
      command: {
        data: {
          command: [asOpCode(OpType.COMMAND, this.identifier!, opCodes)],
        },
      },
      status: {
        op: {
          command: [opCodes],
        },
      },
    };
  }
}
