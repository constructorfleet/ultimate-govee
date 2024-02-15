import {
  DeviceOpState,
  StateCommandAndStatus,
} from '@constructorfleet/ultimate-govee/domain/devices/states';
import { NuggetSize, nuggetSizeMap } from './types';
import {
  Optional,
  asOpCode,
  total,
} from '@constructorfleet/ultimate-govee/common';
import { DeviceModel } from '@constructorfleet/ultimate-govee/domain/devices/devices.model';

export const IceMakerScheduledStartStateName: 'scheduledStart' =
  'scheduledStart' as const;
export type IceMakerScheduledStartStateName =
  typeof IceMakerScheduledStartStateName;

export type IceMakerScheduledStartData = {
  enabled?: boolean;
  hourStart?: number;
  minuteStart?: number;
  nuggetSize?: NuggetSize;
};

export class IceMakerScheduledStart extends DeviceOpState<
  IceMakerScheduledStartStateName,
  IceMakerScheduledStartData
> {
  constructor(device: DeviceModel) {
    super(
      { opType: 0xaa, identifier: [0x23] },
      device,
      IceMakerScheduledStartStateName,
      {},
      'opCode',
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

    this.stateValue.next({
      enabled: opCommand[0] === 0x01,
      hourStart: 0,
      minuteStart: 0,
      nuggetSize:
        NuggetSize[
          Object.entries(nuggetSizeMap).find(
            ([size, num]) => num === opCommand[7],
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
              command: [asOpCode(0x33, this.identifier!, 0x00)],
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

    // if (state.minutesFromNow === undefined) {
    //   this.logger.warn('minutesFromNow is not included in the state, ignoring command');
    //   return;
    // }
    // if (state.hour === undefined) {
    //   this.logger.warn('Hour not included in the state, ignoring command');
    //   return;
    // }
    // if (state.minute === undefined) {
    //   this.logger.warn('Minute not included in the state, ignoring command');
    //   return;
    // }
    if (state.nuggetSize === undefined) {
      this.logger.warn(
        'Nugget size not included in the state, igrnoging command',
      );
      return;
    }

    return {
      command: {
        data: {
          command: [
            asOpCode(
              0x33,
              this.identifier!,
              0x01,
              0,
              0,
              101,
              203,
              0,
              0,
              nuggetSizeMap[state.nuggetSize.toString()],
            ),
          ],
        },
      },
      status: {
        op: {
          command: [[0x01, state.hourStart, state.minuteStart, undefined]],
        },
      },
    };
  }
}

/**
 * object = byteArray
 * j(enable) => a
 * k(BleUtil.n(2, 3) , true) => b
 * l(BleUtil.n(0, 4O), true) => d
 * arrby = TimeUtil.c() * 1000)
 * g(arrby[3]) => c
 * i(arrBy[4]) => e
 * h(ModeCompanion(object[7) = f
 *
 * if(enable) x(reservation)
 *
 * a => enabled
 * b = setMin
 * c = setHour
 * d = timestamp
 * e = minute
 * f = iceMod
 */

/**export type IceMakerScheduledStartData = {
  enabled?: boolean; a
  setMinute?: number;b
  setHour?: number; c
  ttimestampe: d
  minute = 3e
  nuggetSize?: NuggetSize; = f
};*/
